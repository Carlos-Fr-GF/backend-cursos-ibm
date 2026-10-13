import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateDatoPersonalDto } from './dto/create-dato-personal.dto';
import { UpdateDatoPersonalDto } from './dto/update-dato-personal.dto';
import { DatoPersonal } from './entities/dato-personal.entity';

@Injectable()
export class DatosPersonalesService {
  constructor(
    @InjectRepository(DatoPersonal)
    private readonly datoPersonalRepository: Repository<DatoPersonal>,
  ) {}

  findAll(): Promise<DatoPersonal[]> {
    return this.datoPersonalRepository.find();
  }

  async findOne(curp: string): Promise<DatoPersonal> {
    return this.findOneOrFail(curp);
  }

  async create(data: CreateDatoPersonalDto): Promise<DatoPersonal> {
    const datoPersonal = this.datoPersonalRepository.create({
      curp: data.curp.trim().toUpperCase(),
      cct: this.normalizarOpcional(data.cct),
      escuela: this.normalizarOpcional(data.escuela),
      nombre: this.normalizarOpcional(data.nombre),
      apPaterno: this.normalizarOpcional(data.apPaterno),
      amMaterno: this.normalizarOpcional(data.amMaterno),
      correo: this.normalizarOpcional(data.correo),
    });
    return this.datoPersonalRepository.save(datoPersonal);
  }

  async update(
    curp: string,
    data: UpdateDatoPersonalDto,
  ): Promise<DatoPersonal> {
    const datoPersonal = await this.findOneOrFail(curp);

    if (data.cct !== undefined) {
      datoPersonal.cct = this.normalizarOpcional(data.cct);
    }
    if (data.escuela !== undefined) {
      datoPersonal.escuela = this.normalizarOpcional(data.escuela);
    }
    if (data.nombre !== undefined) {
      datoPersonal.nombre = this.normalizarOpcional(data.nombre);
    }
    if (data.apPaterno !== undefined) {
      datoPersonal.apPaterno = this.normalizarOpcional(data.apPaterno);
    }
    if (data.amMaterno !== undefined) {
      datoPersonal.amMaterno = this.normalizarOpcional(data.amMaterno);
    }
    if (data.correo !== undefined) {
      datoPersonal.correo = this.normalizarOpcional(data.correo);
    }

    return this.datoPersonalRepository.save(datoPersonal);
  }

  async remove(curp: string): Promise<void> {
    const datoPersonal = await this.findOneOrFail(curp);
    await this.datoPersonalRepository.remove(datoPersonal);
  }

  private async findOneOrFail(curp: string): Promise<DatoPersonal> {
    const datoPersonal = await this.datoPersonalRepository.findOneBy({
      curp: curp.toUpperCase(),
    });
    if (!datoPersonal) {
      throw new NotFoundException(
        `No se encontraron datos personales para CURP ${curp}`,
      );
    }
    return datoPersonal;
  }

  private normalizarOpcional(value?: string | null): string | null {
    if (value == null) {
      return null;
    }
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }
}
