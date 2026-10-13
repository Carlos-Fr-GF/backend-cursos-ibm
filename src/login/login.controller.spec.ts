import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginController } from './login.controller';
import { LoginService } from './login.service';

describe('LoginController', () => {
  let controller: LoginController;
  let loginService: {
    login: jest.Mock;
  };
  let jwtService: {
    sign: jest.Mock;
  };

  beforeEach(async () => {
    loginService = {
      login: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoginController],
      providers: [
        {
          provide: LoginService,
          useValue: loginService,
        },
        {
          provide: JwtService,
          useValue: jwtService,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const values: Record<string, string> = {
                JWT_COOKIE_NAME: 'jwt',
                JWT_COOKIE_MAX_AGE_MS: String(20 * 60 * 1000),
                JWT_COOKIE_SAME_SITE: 'lax',
              };
              return values[key];
            }),
            getOrThrow: jest.fn((key: string) => key),
          },
        },
      ],
    }).compile();

    controller = module.get<LoginController>(LoginController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('includes user identity and role in the JWT cookie payload', async () => {
    loginService.login.mockResolvedValue({
      idUsuario: 7,
      idRol: 0,
      correo: 'carlos@example.com',
      nombre: 'Carlos',
      apPaterno: 'García',
      apMaterno: null,
    });

    const response = {
      cookie: jest.fn(),
    } as any;

    const result = await controller.login(
      {
        correo: 'carlos@example.com',
        password: 'secreta',
      } as any,
      response,
    );

    expect(jwtService.sign).toHaveBeenCalledWith({
      sub: 7,
      correo: 'carlos@example.com',
      nombre: 'Carlos',
      apPaterno: 'García',
      apMaterno: null,
      idRol: 0,
    });
    expect(response.cookie).toHaveBeenCalledWith(
      'jwt',
      'jwt-token',
      expect.objectContaining({
        httpOnly: true,
      }),
    );
    expect(response.cookie).toHaveBeenCalledWith(
      'csrf_token',
      expect.any(String),
      expect.objectContaining({
        httpOnly: false,
      }),
    );
    expect(result).toEqual({
      mensaje: 'Login exitoso',
      correo: 'carlos@example.com',
      nombre: 'Carlos',
      csrfToken: expect.any(String),
    });
  });

  it('clears both jwt and csrf cookies on logout', () => {
    const response = {
      clearCookie: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as any;

    controller.logout(response);

    expect(response.clearCookie).toHaveBeenCalledWith(
      'jwt',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(response.clearCookie).toHaveBeenCalledWith(
      'csrf_token',
      expect.objectContaining({ httpOnly: false }),
    );
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      mensaje: 'Logout exitoso',
    });
  });
});
