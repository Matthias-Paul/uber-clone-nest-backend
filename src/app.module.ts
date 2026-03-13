import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import authConfig from './auth/config/auth.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { DriverModule } from './driver/driver.module';
import { RideModule } from './ride/ride.module';
import databaseConfig from './config/database.config';
import { AuthorizeGuard } from './auth/guards/authorized.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [databaseConfig],
    }),
    ConfigModule.forFeature(authConfig),
    JwtModule.registerAsync(authConfig.asProvider()),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>('database.url');
        const baseConfig = {
          type: 'postgres' as const,
          synchronize: configService.get<boolean>('database.synchronize'),
          autoLoadEntities: configService.get<boolean>(
            'database.autoLoadEntities',
          ),
        };

        if (url) {
          return {
            ...baseConfig,
            url,
            ssl: { rejectUnauthorized: false },
          };
        }

        return {
          ...baseConfig,
          host: configService.get<string>('database.host'),
          port: configService.get<number>('database.port'),
          username: configService.get<string>('database.username'),
          password: configService.get<string>('database.password') || '',
          database: configService.get<string>('database.name'),
        };
      },
    }),
    DriverModule,
    RideModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthorizeGuard,
    },
  ],
})
export class AppModule {}
