import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { LoginService } from './login.service';
import { Usuario } from '../usuarios/entities/usuarios.entity';

describe('LoginService', () => {
  let service: LoginService;
  let usuarioRepository: {
    createQueryBuilder: jest.Mock;
    update: jest.Mock;
  };

  const buildQueryBuilder = (result: Partial<Usuario> | null) => ({
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn().mockResolvedValue(result),
  });

  beforeEach(async () => {
    usuarioRepository = {
      createQueryBuilder: jest.fn(),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: usuarioRepository,
        },
      ],
    }).compile();

    service = module.get<LoginService>(LoginService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('rejects unknown users', async () => {
    usuarioRepository.createQueryBuilder.mockReturnValue(
      buildQueryBuilder(null),
    );

    await expect(service.login('noexiste', 'secret')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rejects wrong password', async () => {
    const hash = await bcrypt.hash('correcta', 10);
    usuarioRepository.createQueryBuilder.mockReturnValue(
      buildQueryBuilder({
        correo: 'demo@example.com',
        passwordHash: hash,
        activo: true,
      }),
    );

    await expect(
      service.login('demo@example.com', 'incorrecta'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('rejects disabled users even with valid credentials', async () => {
    const hash = await bcrypt.hash('secret', 10);
    usuarioRepository.createQueryBuilder.mockReturnValue(
      buildQueryBuilder({
        correo: 'demo@example.com',
        passwordHash: hash,
        activo: false,
      }),
    );

    await expect(
      service.login('demo@example.com', 'secret'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns the user on successful login', async () => {
    const hash = await bcrypt.hash('secret', 10);
    const mockUser = {
      idUsuario: 1,
      idRol: 2,
      correo: 'demo@example.com',
      passwordHash: hash,
      activo: true,
      ultimoAcceso: null,
    };
    usuarioRepository.createQueryBuilder.mockReturnValue(
      buildQueryBuilder(mockUser),
    );

    const usuario = await service.login(' DEMO@EXAMPLE.COM ', 'secret');

    expect(usuario.correo).toBe('demo@example.com');
    expect(usuario.ultimoAcceso).toBeInstanceOf(Date);
    expect(usuarioRepository.update).toHaveBeenCalledWith(
      { idUsuario: usuario.idUsuario },
      { ultimoAcceso: usuario.ultimoAcceso },
    );
  });

  it('rate limits repeated failed attempts', async () => {
    usuarioRepository.createQueryBuilder.mockImplementation(() =>
      buildQueryBuilder(null),
    );

    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(service.login('bloqueado', 'secret')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    }

    await expect(service.login('bloqueado', 'secret')).rejects.toMatchObject({
      status: 429,
    });
  });
});
