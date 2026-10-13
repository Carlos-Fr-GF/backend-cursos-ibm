import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions } from '@nestjs/jwt';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CookieOptions } from 'express';

const DEFAULT_PORT = 3000;
const DEFAULT_FRONTEND_ORIGIN = 'http://localhost:4173';
const DEFAULT_JWT_EXPIRES_IN = '20m';
const DEFAULT_JWT_COOKIE_MAX_AGE_MS = 20 * 60 * 1000;
const DEFAULT_JWT_COOKIE_NAME = 'jwt';
const DEFAULT_CSRF_COOKIE_NAME = 'csrf_token';
type JwtExpiresIn = NonNullable<JwtModuleOptions['signOptions']>['expiresIn'];

export function getDatabaseConfig(
  configService: ConfigService,
): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    host: configService.getOrThrow<string>('DB_HOST'),
    port: Number(configService.get<string>('DB_PORT') ?? 3306),
    username: configService.getOrThrow<string>('DB_USERNAME'),
    password: configService.getOrThrow<string>('DB_PASSWORD'),
    database: configService.getOrThrow<string>('DB_DATABASE'),
    autoLoadEntities: true,
    synchronize: false,
  };
}

export function getJwtModuleConfig(
  configService: ConfigService,
): JwtModuleOptions {
  const expiresIn =
    configService.get<string>('JWT_EXPIRES_IN') ?? DEFAULT_JWT_EXPIRES_IN;

  return {
    secret: configService.getOrThrow<string>('JWT_SECRET'),
    signOptions: {
      expiresIn: expiresIn as JwtExpiresIn,
    },
  };
}

export function getJwtCookieName(configService: ConfigService): string {
  return (
    configService.get<string>('JWT_COOKIE_NAME') ?? DEFAULT_JWT_COOKIE_NAME
  );
}

export function getJwtCookieOptions(
  configService: ConfigService,
): CookieOptions {
  return {
    httpOnly: true,
    secure: configService.get<string>('NODE_ENV') === 'production',
    sameSite:
      configService.get<CookieOptions['sameSite']>('JWT_COOKIE_SAME_SITE') ??
      'lax',
    maxAge: Number(
      configService.get<string>('JWT_COOKIE_MAX_AGE_MS') ??
        DEFAULT_JWT_COOKIE_MAX_AGE_MS,
    ),
  };
}

export function getCsrfCookieName(configService: ConfigService): string {
  return (
    configService.get<string>('CSRF_COOKIE_NAME') ?? DEFAULT_CSRF_COOKIE_NAME
  );
}

export function getCsrfCookieOptions(
  configService: ConfigService,
): CookieOptions {
  return {
    httpOnly: false,
    secure: configService.get<string>('NODE_ENV') === 'production',
    sameSite:
      configService.get<CookieOptions['sameSite']>('JWT_COOKIE_SAME_SITE') ??
      'lax',
    maxAge: Number(
      configService.get<string>('CSRF_COOKIE_MAX_AGE_MS') ??
        DEFAULT_JWT_COOKIE_MAX_AGE_MS,
    ),
  };
}

export function getRecaptchaSecretKey(
  configService: ConfigService,
): string | null {
  return configService.get<string>('RECAPTCHA_SECRET_KEY') ?? null;
}

export function getRecaptchaToken(configService: ConfigService): string {
  return configService.get<string>('RECAPTCHA_TOKEN') ?? '';
}

export function getAppPort(configService: ConfigService): number {
  return Number(configService.get<string>('PORT') ?? DEFAULT_PORT);
}

export function getFrontendOrigin(configService: ConfigService): string {
  return configService.get<string>('CORS_ORIGIN') ?? DEFAULT_FRONTEND_ORIGIN;
}
