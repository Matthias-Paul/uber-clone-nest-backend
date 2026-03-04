import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { TokenEntity } from './entity/token.entity';
import { HashingProvider } from './provider/hashing.provider';
import { BcryptProvider } from './provider/bcrypt.provider';
import { EmailModule } from 'src/email/email.module';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: HashingProvider,
      useClass: BcryptProvider,
    },
  ],
  imports: [TypeOrmModule.forFeature([User, TokenEntity]), EmailModule],
  exports: [AuthService, HashingProvider],
})
export class AuthModule {}
