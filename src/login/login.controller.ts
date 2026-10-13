import {
  Body,
  Controller,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'node:crypto';

import { LoginService } from './login.service';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import type { Response } from 'express';
import {
  getJwtCookieName,
  getJwtCookieOptions,
  getCsrfCookieName,
  getCsrfCookieOptions,
  getRecaptchaSecretKey,
  getRecaptchaToken,
} from '../config/app.config';

@Controller('login')
export class LoginController {
  constructor(
    private readonly loginService: LoginService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private async validateCaptcha(captchaToken?: string): Promise<void> {
    const secretKey = getRecaptchaSecretKey(this.configService);
    const token = captchaToken ?? getRecaptchaToken(this.configService);

    if (!secretKey) {
      return;
    }

    if (!token) {
      throw new UnauthorizedException('Captcha requerido');
    }

    const response = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
        }).toString(),
      },
    );

    const payload = (await response.json()) as { success?: boolean };

    if (!response.ok || !payload.success) {
      throw new UnauthorizedException('Captcha inválido');
    }
  }

  @Post()
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const captchaToken = loginDto.captcha ?? loginDto.recaptchaToken;
    await this.validateCaptcha(captchaToken);

    const usuario = await this.loginService.login(
      loginDto.correo,
      loginDto.password,
    );

    const payload = {
      sub: usuario.idUsuario,
      correo: usuario.correo,
      nombre: usuario.nombre,
      apPaterno: usuario.apPaterno,
      apMaterno: usuario.apMaterno,
      idRol: usuario.idRol,
    };
    const token = this.jwtService.sign(payload);

    res.cookie(
      getJwtCookieName(this.configService),
      token,
      getJwtCookieOptions(this.configService),
    );

    const csrfToken = randomBytes(32).toString('hex');
    res.cookie(
      getCsrfCookieName(this.configService),
      csrfToken,
      getCsrfCookieOptions(this.configService),
    );

    return {
      mensaje: 'Login exitoso',
      correo: usuario.correo,
      nombre: usuario.nombre,
      csrfToken,
    };
  }

  @Post('logout')
  logout(@Res() res: Response) {
    res.clearCookie(
      getJwtCookieName(this.configService),
      getJwtCookieOptions(this.configService),
    );
    res.clearCookie(
      getCsrfCookieName(this.configService),
      getCsrfCookieOptions(this.configService),
    );
    return res.status(200).json({ mensaje: 'Logout exitoso' });
  }
}
