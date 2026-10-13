import type { Request } from 'express';

export interface AuthenticatedUser {
  sub: number;
  correo: string | null;
  nombre: string | null;
  apPaterno: string | null;
  apMaterno: string | null;
  idRol: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}
