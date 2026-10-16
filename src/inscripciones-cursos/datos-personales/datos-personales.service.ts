import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cargo } from '../../cargos/entities/cargo.entity';
import { CreateDatoPersonalDto } from './dto/create-dato-personal.dto';
import { UpdateDatoPersonalDto } from './dto/update-dato-personal.dto';
import { DatoPersonal } from './entities/dato-personal.entity';

@Injectable()
export class DatosPersonalesService {
  constructor(
    @InjectRepository(DatoPersonal)
    private readonly datoPersonalRepository: Repository<DatoPersonal>,
    @InjectRepository(Cargo)
    private readonly cargoRepository: Repository<Cargo>,
  ) {}

  findAll(): Promise<DatoPersonal[]> {
    return this.datoPersonalRepository.find({ relations: { cargo: true } });
  }

  async findOne(id: number): Promise<DatoPersonal> {
    return this.findOneOrFail(id);
  }

  async create(data: CreateDatoPersonalDto): Promise<DatoPersonal> {
    await this.findCargoOrFail(data.idCargo);
    const datoPersonal = this.datoPersonalRepository.create({
      cct: this.normalizarOpcional(data.cct),
      institucion: this.normalizarOpcional(data.institucion),
      nombre: this.normalizarOpcional(data.nombre),
      apPaterno: this.normalizarOpcional(data.apPaterno),
      amMaterno: this.normalizarOpcional(data.amMaterno),
      correo: this.normalizarOpcional(data.correo),
      idCargo: data.idCargo ?? null,
    });
    return this.datoPersonalRepository.save(datoPersonal);
  }

  async update(id: number, data: UpdateDatoPersonalDto): Promise<DatoPersonal> {
    const datoPersonal = await this.findOneOrFail(id);

    if (data.idCargo !== undefined) {
      await this.findCargoOrFail(data.idCargo);
      datoPersonal.idCargo = data.idCargo;
    }
    if (data.cct !== undefined) {
      datoPersonal.cct = this.normalizarOpcional(data.cct);
    }
    if (data.institucion !== undefined) {
      datoPersonal.institucion = this.normalizarOpcional(data.institucion);
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

    await this.datoPersonalRepository.save(datoPersonal);
    return this.findOneOrFail(id);
  }

  async remove(id: number): Promise<void> {
    const datoPersonal = await this.findOneOrFail(id);
    await this.datoPersonalRepository.remove(datoPersonal);
  }

  private async findOneOrFail(id: number): Promise<DatoPersonal> {
    const datoPersonal = await this.datoPersonalRepository.findOne({
      where: { idDatosPersonales: id },
      relations: { cargo: true },
    });
    if (!datoPersonal) {
      throw new NotFoundException(
        `No se encontraron datos personales con ID ${id}`,
      );
    }
    return datoPersonal;
  }

  private async findCargoOrFail(id?: number | null): Promise<void> {
    if (id == null) {
      return;
    }
    const cargo = await this.cargoRepository.findOneBy({ idCargo: id });
    if (!cargo) {
      throw new NotFoundException(`No se encontro el cargo con ID ${id}`);
    }
  }

  private normalizarOpcional(value?: string | null): string | null {
    if (value == null) {
      return null;
    }
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }
}
