import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { Usuario } from './entities/usuarios.entity';

const BCRYPT_ROUNDS = 12;
type UsuarioPublico = Omit<Usuario, 'passwordHash'>;

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async create(data: CreateUsuarioDto): Promise<UsuarioPublico> {
    const correo = this.normalizarTexto(data.correo, true);
    if (correo) {
      await this.ensureCorreoDisponible(correo);
    }

    const passwordHash = data.password
      ? await bcrypt.hash(data.password, BCRYPT_ROUNDS)
      : null;

    const usuario = this.usuarioRepository.create({
      idRol: data.idRol,
      nombre: this.normalizarTexto(data.nombre),
      apPaterno: this.normalizarTexto(data.apPaterno),
      apMaterno: this.normalizarTexto(data.apMaterno),
      correo: correo ?? null,
      passwordHash,
      activo: true,
      ultimoAcceso: null,
    });

    return this.toPublicUsuario(await this.usuarioRepository.save(usuario));
  }

  async update(
    id: number,
    data: UpdateUsuarioDto,
    usuarioActualId: number,
  ): Promise<UsuarioPublico> {
    if (id === usuarioActualId) {
      throw new ForbiddenException(
        'No puedes modificar tu propia información mientras estás logueado.',
      );
    }

    const usuario = await this.findOneOrFail(id);
    const correo = this.normalizarTexto(data.correo, true);

    if (correo) {
      await this.ensureCorreoDisponible(correo, id);
    }

    Object.assign(usuario, {
      ...(data.idRol !== undefined && { idRol: data.idRol }),
      ...(data.nombre !== undefined && {
        nombre: this.normalizarTexto(data.nombre) ?? null,
      }),
      ...(data.apPaterno !== undefined && {
        apPaterno: this.normalizarTexto(data.apPaterno) ?? null,
      }),
      ...(data.apMaterno !== undefined && {
        apMaterno: this.normalizarTexto(data.apMaterno) ?? null,
      }),
      ...(data.correo !== undefined && { correo: correo ?? null }),
    });

    if (data.password !== undefined) {
      usuario.passwordHash = await bcrypt.hash(data.password, BCRYPT_ROUNDS);
    }

    return this.toPublicUsuario(await this.usuarioRepository.save(usuario));
  }

  async activate(id: number): Promise<UsuarioPublico> {
    return this.setActiveStatus(id, true);
  }

  async deactivate(
    id: number,
    usuarioActualId: number,
  ): Promise<UsuarioPublico> {
    if (id === usuarioActualId) {
      throw new ForbiddenException(
        'No puedes modificar tu propia información mientras estás logueado.',
      );
    }

    return this.setActiveStatus(id, false);
  }

  async remove(id: number): Promise<void> {
    const usuario = await this.findOneOrFail(id);
    await this.usuarioRepository.remove(usuario);
  }

  async findAll(): Promise<UsuarioPublico[]> {
    const usuarios = await this.usuarioRepository.find();
    return usuarios.map((usuario) => this.toPublicUsuario(usuario));
  }

  async findByCorreo(correo: string): Promise<UsuarioPublico | null> {
    const correoNormalizado = this.normalizarTexto(correo, true);
    if (!correoNormalizado) {
      return null;
    }

    const usuario = await this.usuarioRepository.findOne({
      where: {
        correo: correoNormalizado,
      },
    });

    return usuario ? this.toPublicUsuario(usuario) : null;
  }

  private async setActiveStatus(
    id: number,
    activo: boolean,
  ): Promise<UsuarioPublico> {
    const usuario = await this.findOneOrFail(id);
    usuario.activo = activo;
    return this.toPublicUsuario(await this.usuarioRepository.save(usuario));
  }

  private async findOneOrFail(id: number): Promise<Usuario> {
    const usuario = await this.usuarioRepository.findOne({
      where: {
        idUsuario: id,
      },
    });

    if (!usuario) {
      throw new NotFoundException(`No se encontro el usuario con ID ${id}`);
    }

    return usuario;
  }

  private normalizarTexto(
    valor?: string | null,
    lowercase = false,
  ): string | null | undefined {
    if (valor === undefined || valor === null) {
      return valor;
    }

    const limpio = valor.trim();
    if (!limpio) {
      return null;
    }

    return lowercase ? limpio.toLowerCase() : limpio;
  }

  private async ensureCorreoDisponible(
    correo: string,
    idUsuarioActual?: number,
  ): Promise<void> {
    const usuarioConMismoCorreo = await this.usuarioRepository.findOne({
      where: {
        correo,
      },
    });

    if (
      usuarioConMismoCorreo &&
      usuarioConMismoCorreo.idUsuario !== idUsuarioActual
    ) {
      throw new ConflictException(
        `El correo '${correo}' ya está registrado en otro usuario.`,
      );
    }
  }

  private toPublicUsuario(usuario: Usuario): UsuarioPublico {
    const { passwordHash, ...usuarioPublico } = usuario;
    void passwordHash;
    return usuarioPublico;
  }
}
