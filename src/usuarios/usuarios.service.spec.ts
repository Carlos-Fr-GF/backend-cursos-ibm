import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsuariosService } from './usuarios.service';
import { Usuario } from './entities/usuarios.entity';

describe('UsuariosService', () => {
  let service: UsuariosService;
  let usuarioRepository: {
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
    find: jest.Mock;
  };

  beforeEach(async () => {
    usuarioRepository = {
      findOne: jest.fn(),
      create: jest.fn((data) => data),
      save: jest.fn(async (usuario) => usuario),
      remove: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuariosService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: usuarioRepository,
        },
      ],
    }).compile();

    service = module.get<UsuariosService>(UsuariosService);
  });

  it('creates superadmin users without a confirmation field', async () => {
    usuarioRepository.findOne.mockResolvedValue(null);

    await expect(
      service.create({
        idRol: 0,
        nombre: 'Admin',
      }),
    ).resolves.toMatchObject({
      idRol: 0,
      nombre: 'Admin',
    });
  });

  it('creates users with the new table fields and hides the password hash', async () => {
    usuarioRepository.findOne.mockResolvedValue(null);

    const usuario = await service.create({
      idRol: 2,
      nombre: '  Ana  ',
      apPaterno: 'López',
      apMaterno: 'Pérez',
      correo: ' ANA@EXAMPLE.COM ',
      password: 'secreta',
    });

    expect(usuarioRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        idRol: 2,
        nombre: 'Ana',
        apPaterno: 'López',
        apMaterno: 'Pérez',
        correo: 'ana@example.com',
        activo: true,
        ultimoAcceso: null,
      }),
    );
    const saved = usuarioRepository.save.mock.calls[0][0];
    await expect(bcrypt.compare('secreta', saved.passwordHash)).resolves.toBe(
      true,
    );
    expect(usuario).not.toHaveProperty('passwordHash');
  });

  it('prevents creating users with an email already registered', async () => {
    usuarioRepository.findOne.mockResolvedValue({
      idUsuario: 99,
      correo: 'duplicado@ihe.com',
    });

    await expect(
      service.create({
        idRol: 2,
        correo: 'duplicado@ihe.com',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('updates schema fields and permits clearing nullable name fields', async () => {
    const usuarioActual = {
      idUsuario: 4,
      idRol: 2,
      nombre: 'Ana',
      apPaterno: 'Lopez',
      apMaterno: 'Perez',
      correo: 'ana@example.com',
      passwordHash: null,
      activo: true,
      ultimoAcceso: null,
      fechaCreacion: new Date(),
    };
    usuarioRepository.findOne.mockImplementation(async ({ where }) => {
      if (where?.idUsuario === 4) return usuarioActual;
      return null;
    });

    const usuario = await service.update(
      4,
      { idRol: 3, nombre: null, correo: ' NUEVO@EXAMPLE.COM ' },
      1,
    );

    expect(usuarioRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        idRol: 3,
        nombre: null,
        correo: 'nuevo@example.com',
      }),
    );
    expect(usuario).not.toHaveProperty('passwordHash');
  });

  it('prevents assigning an email already used by another user', async () => {
    usuarioRepository.findOne.mockImplementation(async ({ where }) => {
      if (where?.idUsuario === 1) {
        return { idUsuario: 1, correo: 'actual@example.com' };
      }
      if (where?.correo === 'duplicado@example.com') {
        return { idUsuario: 77, correo: 'duplicado@example.com' };
      }
      return null;
    });

    await expect(
      service.update(1, { correo: 'duplicado@example.com' }, 9),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('prevents updating the currently authenticated user', async () => {
    await expect(
      service.update(5, { nombre: 'Nuevo' }, 5),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(usuarioRepository.findOne).not.toHaveBeenCalled();
  });

  it('activates and deactivates users using a boolean active flag', async () => {
    const usuario = {
      idUsuario: 6,
      activo: false,
      passwordHash: null,
    };
    usuarioRepository.findOne.mockResolvedValue(usuario);

    await service.activate(6);
    expect(usuarioRepository.save).toHaveBeenLastCalledWith(
      expect.objectContaining({ activo: true }),
    );

    usuarioRepository.findOne.mockResolvedValue({ ...usuario, activo: true });
    await service.deactivate(6, 9);
    expect(usuarioRepository.save).toHaveBeenLastCalledWith(
      expect.objectContaining({ activo: false }),
    );
  });
});
