import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/register-user.dto';
import { VerifyEmailDto } from './dtos/verify-email.dto';
import { LoginDto } from './dtos/login.dto';
import { allowAnonymous } from './decorators/allow-anonymous.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @allowAnonymous()
  @Post('register')
  public async register(@Body() registerUserDto: RegisterUserDto) {
    return await this.authService.registerUser(registerUserDto);
  }

  @allowAnonymous()
  @Post('verify-email')
  @HttpCode(HttpStatus.OK)
  public async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return await this.authService.verifyToken(verifyEmailDto);
  }

  @allowAnonymous()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  public async loginUser(@Body() loginDto: LoginDto) {
    return await this.authService.loginUser(loginDto);
  }
}
