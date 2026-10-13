import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { getJwtCookieName, getJwtCookieOptions } from '../config/app.config';
import { AuthenticatedRequest, AuthenticatedUser } from './request-user';

@Injectable()
export class JwtCookieGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const response = context.switchToHttp().getResponse<Response>();
    const token = request.cookies?.[getJwtCookieName(this.configService)];
    if (!token) throw new UnauthorizedException('No token');
    try {
      const payload = this.jwtService.verify<AuthenticatedUser>(token);
      request.user = payload;
      const { iat, exp, ...renewablePayload } = payload as AuthenticatedUser & {
        iat?: number;
        exp?: number;
      };
      const nuevoToken = this.jwtService.sign(renewablePayload);
      response.cookie(
        getJwtCookieName(this.configService),
        nuevoToken,
        getJwtCookieOptions(this.configService),
      );
      return true;
    } catch (e) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
