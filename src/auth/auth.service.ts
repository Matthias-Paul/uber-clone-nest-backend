import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';
import { RegisterUserDto } from './dtos/register-user.dto';
import { HashingProvider } from './provider/hashing.provider';
import { TokenEntity } from './entity/token.entity';
import { TokenType } from 'src/common/enums';
import { randomInt } from 'crypto';
import { EmailEventType } from 'src/email/email.processor';
import { EmailProcessor } from 'src/email/email.processor';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(TokenEntity)
    private tokenRepository: Repository<TokenEntity>,
    @Inject(HashingProvider)
    private readonly hashingProvider: HashingProvider,
    private readonly emailProcessor: EmailProcessor,
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

      await this.emailProcessor.process({
        type: EmailEventType.ACCOUNT_VERIFICATION,
        data: {
          email: savedUser.email,
          name: savedUser.username,
          code: otp,
        },
      });

      return savedUser;
    } catch (error: unknown) {
      if (this.hasCode(error) && error.code === '23505') {
        throw new BadRequestException('User with this email already exists');
      }

      throw new BadRequestException(this.getErrorMessage(error));
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
}
