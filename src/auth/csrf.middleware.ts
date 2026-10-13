import { timingSafeEqual } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { ForbiddenException } from '@nestjs/common';
import { getCsrfCookieName } from '../config/app.config';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const TOKEN_HEADER = 'x-csrf-token';

export function csrfMiddleware(configService: ConfigService) {
  const cookieName = getCsrfCookieName(configService);

  return (req: Request, res: Response, next: NextFunction) => {
    if (
      (req.path === '/csrf-token' && req.method === 'GET') ||
      (req.path === '/login' && req.method === 'POST') ||
      (req.path === '/login/logout' && req.method === 'POST')
    ) {
      next();
      return;
    }

    if (SAFE_METHODS.has(req.method)) {
      next();
      return;
    }

    const cookies = req.cookies as Record<string, string> | undefined;
    const cookieToken = cookies?.[cookieName];
    const headerToken = req.header(TOKEN_HEADER);
    if (
      !cookieToken ||
      !headerToken ||
      !tokensMatch(cookieToken, headerToken)
    ) {
      next(new ForbiddenException('Token CSRF inválido o ausente'));
      return;
    }

    next();
  };
}

function tokensMatch(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}
