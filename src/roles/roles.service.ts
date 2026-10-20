import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { Rol } from './entities/rol.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Rol)
    private readonly rolRepository: Repository<Rol>,
  ) {}

  findAll(): Promise<Rol[]> {
    return this.rolRepository.find({ order: { idRol: 'ASC' } });
  }

  async findOne(id: number): Promise<Rol> {
    return this.findOneOrFail(id);
  }

  async create(data: CreateRolDto): Promise<Rol> {
    const rol = this.rolRepository.create({
      idRol: data.idRol,
      clave: this.normalizarOpcional(data.clave),
      rol: this.normalizarOpcional(data.rol),
    });
    return this.rolRepository.save(rol);
  }

  async update(id: number, data: UpdateRolDto): Promise<Rol> {
    const rol = await this.findOneOrFail(id);
    if (data.clave !== undefined) {
      rol.clave = this.normalizarOpcional(data.clave);
    }
    if (data.rol !== undefined) {
      rol.rol = this.normalizarOpcional(data.rol);
    }
    return this.rolRepository.save(rol);
  }

  async remove(id: number): Promise<void> {
    const rol = await this.findOneOrFail(id);
    await this.rolRepository.remove(rol);
  }

  private async findOneOrFail(id: number): Promise<Rol> {
    const rol = await this.rolRepository.findOneBy({ idRol: id });
    if (!rol) {
      throw new NotFoundException(`No se encontro el rol con ID ${id}`);
    }
    return rol;
  }

  private normalizarOpcional(value?: string | null): string | null {
    if (value == null) {
      return null;
    }
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }
}
