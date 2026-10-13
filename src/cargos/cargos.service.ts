import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';
import { Cargo } from './entities/cargo.entity';

@Injectable()
export class CargosService {
  constructor(
    @InjectRepository(Cargo)
    private readonly cargoRepository: Repository<Cargo>,
  ) {}

  findAll(): Promise<Cargo[]> {
    return this.cargoRepository.find();
  }

  async findOne(id: number): Promise<Cargo> {
    return this.findOneOrFail(id);
  }

  async create(data: CreateCargoDto): Promise<Cargo> {
    const cargo = this.cargoRepository.create({ cargo: data.cargo.trim() });
    return this.cargoRepository.save(cargo);
  }

  async update(id: number, data: UpdateCargoDto): Promise<Cargo> {
    const cargo = await this.findOneOrFail(id);
    if (data.cargo !== undefined) {
      cargo.cargo = data.cargo.trim();
    }
    return this.cargoRepository.save(cargo);
  }

  async remove(id: number): Promise<void> {
    const cargo = await this.findOneOrFail(id);
    await this.cargoRepository.remove(cargo);
  }

  private async findOneOrFail(id: number): Promise<Cargo> {
    const cargo = await this.cargoRepository.findOneBy({ idCargo: id });
    if (!cargo) {
      throw new NotFoundException(`No se encontro el cargo con ID ${id}`);
    }
    return cargo;
  }
}
