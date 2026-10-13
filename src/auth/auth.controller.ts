import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { randomBytes } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import { JwtCookieGuard } from './jwt-cookie.guard';
import { getCsrfCookieName, getCsrfCookieOptions } from '../config/app.config';
import type { AuthenticatedRequest } from './request-user';

@Controller()
export class AuthController {
  constructor(private readonly configService: ConfigService) {}

  @Get('csrf-token')
  csrfToken(@Res({ passthrough: true }) response: Response) {
    const token = randomBytes(32).toString('hex');
    response.cookie(
      getCsrfCookieName(this.configService),
      token,
      getCsrfCookieOptions(this.configService),
    );
    return { csrfToken: token };
  }

  @Get('me')
  @UseGuards(JwtCookieGuard)
  me(@Req() req: AuthenticatedRequest) {
    const user = req.user;
    return {
      idUsuario: user?.sub,
      idRol: user?.idRol,
      nombre: user?.nombre,
      apPaterno: user?.apPaterno,
      apMaterno: user?.apMaterno,
      correo: user?.correo,
    };
  }
}
