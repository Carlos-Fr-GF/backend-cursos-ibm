import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser = require('cookie-parser');
import express from 'express';
import helmet from 'helmet';
import { join } from 'node:path';
import { getAppPort, getFrontendOrigin } from './config/app.config';
import { csrfMiddleware } from './auth/csrf.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const allowedOrigin = getFrontendOrigin(configService);

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: false,
        directives: {
          defaultSrc: ["'none'"],
          frameAncestors: ["'self'", allowedOrigin],
        },
      },
      frameguard: false,
      crossOriginResourcePolicy: { policy: 'same-site' },
    }),
  );

  app.use((req, res, next) => {
    const requestOrigin = req.headers.origin;

    if (requestOrigin === allowedOrigin || !requestOrigin) {
      res.header('Access-Control-Allow-Origin', requestOrigin || allowedOrigin);
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header(
        'Access-Control-Allow-Methods',
        'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      );
      res.header(
        'Access-Control-Allow-Headers',
        'Content-Type, Accept, Authorization, X-Requested-With, Set-Cookie, X-CSRF-Token',
      );
    }

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    next();
  });

  app.use(cookieParser());
  // app.use(csrfMiddleware(configService));

  app.enableCors({
    origin: allowedOrigin,
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders:
      'Content-Type, Accept, Authorization, X-Requested-With, Set-Cookie, X-CSRF-Token',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  await app.listen(getAppPort(configService), '0.0.0.0');
}

bootstrap();
