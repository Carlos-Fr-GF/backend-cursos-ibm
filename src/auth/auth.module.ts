import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtCookieGuard } from './jwt-cookie.guard';
import { RolesGuard } from './roles.guard';
import { AuthController } from './auth.controller';
import { getJwtModuleConfig } from '../config/app.config';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => getJwtModuleConfig(configService),
    }),
  ],
  controllers: [AuthController],
  providers: [JwtCookieGuard, RolesGuard],
  exports: [JwtCookieGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
