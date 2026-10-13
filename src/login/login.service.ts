import {
  Injectable,
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { Usuario } from '../usuarios/entities/usuarios.entity';

@Injectable()
export class LoginService {
  private readonly failedAttempts = new Map<
    string,
    { count: number; firstAttempt: number }
  >();
  private readonly maxAttempts = 5;
  private readonly windowMs = 3 * 60 * 1000;

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
  ) {}

  async login(correo: string, password: string) {
    const correoNormalizado = correo.trim().toLowerCase();
    this.ensureNotRateLimited(correoNormalizado);

    const usuarioEntity = await this.usuarioRepository
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.correo = :correo', { correo: correoNormalizado })
      .getOne();

    if (!usuarioEntity) {
      this.registerFailedAttempt(correoNormalizado);
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    if (!usuarioEntity.passwordHash) {
      this.registerFailedAttempt(correoNormalizado);
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const passwordValido = await bcrypt.compare(
      password,
      usuarioEntity.passwordHash,
    );
    if (!passwordValido) {
      this.registerFailedAttempt(correoNormalizado);
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    if (!usuarioEntity.activo) {
      throw new UnauthorizedException(
        'Usuario desactivado. Contacte al administrador.',
      );
    }

    this.failedAttempts.delete(correoNormalizado);
    const ultimoAcceso = new Date();
    await this.usuarioRepository.update(
      { idUsuario: usuarioEntity.idUsuario },
      { ultimoAcceso },
    );
    usuarioEntity.ultimoAcceso = ultimoAcceso;
    return usuarioEntity;
  }

  private ensureNotRateLimited(correo: string): void {
    const attempt = this.failedAttempts.get(correo);
    if (!attempt) return;
    const elapsed = Date.now() - attempt.firstAttempt;
    if (elapsed >= this.windowMs) {
      this.failedAttempts.delete(correo);
      return;
    }
    if (attempt.count >= this.maxAttempts) {
      const remainingMs = this.windowMs - elapsed;
      const tiempoRestante = this.formatearTiempoRestante(remainingMs);
      throw new HttpException(
        `Demasiados intentos. Intente nuevamente en ${tiempoRestante}.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private formatearTiempoRestante(ms: number): string {
    const totalSegundos = Math.max(1, Math.ceil(ms / 1000));
    const minutos = Math.floor(totalSegundos / 60);
    const segundos = totalSegundos % 60;

    if (minutos > 0 && segundos > 0) {
      return `${minutos} minuto${minutos === 1 ? '' : 's'} y ${segundos} segundo${segundos === 1 ? '' : 's'}`;
    }
    if (minutos > 0) {
      return `${minutos} minuto${minutos === 1 ? '' : 's'}`;
    }
    return `${segundos} segundo${segundos === 1 ? '' : 's'}`;
  }

  private registerFailedAttempt(correo: string): void {
    const now = Date.now();
    const attempt = this.failedAttempts.get(correo);
    if (!attempt || now - attempt.firstAttempt >= this.windowMs) {
      this.failedAttempts.set(correo, { count: 1, firstAttempt: now });
      return;
    }
    attempt.count += 1;
  }
}
