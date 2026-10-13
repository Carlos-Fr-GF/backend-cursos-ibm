import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { JwtCookieGuard } from './jwt-cookie.guard';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: JwtCookieGuard,
          useValue: { canActivate: () => true },
        },
        {
          provide: JwtService,
          useValue: {
            verify: jest.fn(),
            sign: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
            getOrThrow: jest.fn((key: string) => key),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('returns the current user fields from tbl_usuarios', () => {
    const result = controller.me({
      user: {
        sub: 36,
        idRol: 2,
        nombre: 'Carlos',
        apPaterno: 'Garcia',
        apMaterno: 'Lopez',
        correo: 'carlos@example.com',
      },
    } as any);

    expect(result).toEqual({
      idUsuario: 36,
      idRol: 2,
      nombre: 'Carlos',
      apPaterno: 'Garcia',
      apMaterno: 'Lopez',
      correo: 'carlos@example.com',
    });
  });
});
