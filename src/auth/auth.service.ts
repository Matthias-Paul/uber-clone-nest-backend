import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dtos/register-user.dto';
import { HashingProvider } from './provider/hashing.provider';
import { TokenEntity } from './entity/token.entity';
import { TokenType, UserRole } from '../common/enums';
import { randomInt } from 'crypto';
import { EmailEventType } from '../email/email.processor';
import { EmailProcessor } from '../email/email.processor';
import { EmailProcessorJob } from '../email/email.processor';
import { VerifyEmailDto } from './dtos/verify-email.dto';
import { JwtService } from '@nestjs/jwt';
import authConfig from './config/auth.config';
import type { ConfigType } from '@nestjs/config';
import { LoginDto } from './dtos/login.dto';
import { DriverService } from '../driver/driver.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(TokenEntity)
    private tokenRepository: Repository<TokenEntity>,
    @Inject(HashingProvider)
    private readonly hashingProvider: HashingProvider,
    private readonly emailProcessor: EmailProcessor,

    @Inject(authConfig.KEY)
    private readonly authConfiguration: ConfigType<typeof authConfig>,

    private readonly jwtService: JwtService,
    private readonly driverService: DriverService,
  ) {}

  public async registerUser(userDto: RegisterUserDto) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: userDto.email },
      });

      if (existingUser) {
        throw new BadRequestException('User with this email already exists');
      }
  
      const user = this.userRepository.create({
        ...userDto,
        password: await this.hashingProvider.hashPassword(userDto.password),
      });
      const savedUser = await this.userRepository.save(user);
   
      const otp = this.generateNumericOtp();

      let emailToken = await this.tokenRepository.findOne({
        where: {   
          user: { id: savedUser.id },
          type: TokenType.EMAIL_VERIFICATION,
        },
      });

      if (emailToken) {
        emailToken.token = otp;
        await this.tokenRepository.save(emailToken);
      } else {
        emailToken = this.tokenRepository.create({
          user: savedUser,
          type: TokenType.EMAIL_VERIFICATION,
          token: otp,
        });
        await this.tokenRepository.save(emailToken);
      }

      await this.sendEmailSafely({
        type: EmailEventType.ACCOUNT_VERIFICATION,
        data: {
          email: savedUser.email,
          name: savedUser.username,
          code: otp,
        },
      });

      const token = await this.jwtService.signAsync(
        {
          id: savedUser.id,
          email: savedUser.email,
          role: savedUser.role,
        },
        {
          secret: this.authConfiguration.secret,
          expiresIn: this.authConfiguration.expiresIn,
        },
      );

      return {
        data: savedUser,
        token,
        message:
          'Registration successful. Please check your email to verify your account.',
      };
    } catch (error: unknown) {
      if (this.hasCode(error) && error.code === '23505') {
        throw new BadRequestException('User with this email already exists');
      }

      throw new BadRequestException(this.getErrorMessage(error));
    }
  }

  public async verifyToken(verifyEmailDto: VerifyEmailDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { email: verifyEmailDto.email },
      });

      if (!user) {
        throw new BadRequestException('This user does not exist');
      }

      if (user.verify_user) {
        throw new BadRequestException('Email already verified');
      }
      const tokenDoc = await this.tokenRepository.findOne({
        where: {
          user: { id: user.id },
          type: TokenType.EMAIL_VERIFICATION,
        },
      });

      if (!tokenDoc) {
        throw new BadRequestException('Invalid OTP');
      }

      if (tokenDoc.token !== verifyEmailDto.token) {
        throw new BadRequestException('Invalid OTP');
      }

      const expiryTime = tokenDoc.updatedAt.getTime() + 10 * 60 * 1000;

      if (Date.now() > expiryTime) {
        throw new BadRequestException(
          'OTP has expired. Please request a new one',
        );
      }

      user.verify_user = true;
      const verifiedUser = await this.userRepository.save(user);

      if (verifiedUser.role === UserRole.DRIVER) {
        await this.driverService.createDriverForUser(verifiedUser);
      }

      await this.tokenRepository.delete({ id: tokenDoc.id });

      await this.sendEmailSafely({
        type: EmailEventType.ACCOUNT_VERIFIED,
        data: {
          email: verifiedUser.email,
          name: verifiedUser.username,
        },
      });

      return {
        data: verifiedUser,
        message: 'Email verified successfully!',
      };
    } catch (error: unknown) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(this.getErrorMessage(error));
    }
  }

  public async loginUser(loginDto: LoginDto) {
    try {
      const user = await this.userRepository.findOne({
        where: { email: loginDto.email },
      });

      if (!user) {
        throw new BadRequestException('Invalid credentials');
      }

      const isEqual = await this.hashingProvider.comparePassword(
        loginDto.password,
        user.password,
      );
      if (!isEqual) {
        throw new UnauthorizedException('Incorrect credentials');
      }

      if (!user.verify_user) {
        const otp = this.generateNumericOtp();
        let emailToken = await this.tokenRepository.findOne({
          where: {
            user: { id: user.id },
            type: TokenType.EMAIL_VERIFICATION,
          },
        });

        if (emailToken) {
          emailToken.token = otp;
          await this.tokenRepository.save(emailToken);
        } else {
          emailToken = this.tokenRepository.create({
            user,
            type: TokenType.EMAIL_VERIFICATION,
            token: otp,
          });
          await this.tokenRepository.save(emailToken);
        }

        await this.sendEmailSafely({
          type: EmailEventType.ACCOUNT_VERIFICATION,
          data: {
            email: user.email,
            name: user.username,
            code: otp,
          },
        });

        throw new UnauthorizedException(
          'Your email is not verified. A verification code has been sent to your email.',
        );
      }

      const token = await this.jwtService.signAsync(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        {
          secret: this.authConfiguration.secret,
          expiresIn: this.authConfiguration.expiresIn,
        },
      );

      return {
        data: user,
        token,
        message: 'User logged in successfully',
      };
    } catch (error: unknown) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }

      throw new BadRequestException(this.getErrorMessage(error));
    }
  }

  private getErrorMessage(error: unknown): string {
    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof (error as { message: unknown }).message === 'string'
    ) {
      return (error as { message: string }).message;
    }

    return 'An error occurred, please contact support';
  }

  private generateNumericOtp(length = 6): string {
    const maxExclusive = 10 ** length;
    const value = randomInt(0, maxExclusive);
    return value.toString().padStart(length, '0');
  }

  private async sendEmailSafely(job: EmailProcessorJob): Promise<void> {
    try {
      await this.emailProcessor.process(job);
    } catch (error: unknown) {
      this.logger.error(
        `Email send failed for event: ${job.type}`,
        this.getErrorMessage(error),
      );
    }
  }

  private hasCode(error: unknown): error is { code: string } {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof (error as { code: unknown }).code === 'string'
    );
  }
}
