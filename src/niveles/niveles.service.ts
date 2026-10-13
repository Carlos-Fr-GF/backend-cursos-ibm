import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateNivelDto } from './dto/create-nivel.dto';
import { UpdateNivelDto } from './dto/update-nivel.dto';
import { Nivel } from './entities/nivel.entity';

@Injectable()
export class NivelesService {
  constructor(
    @InjectRepository(Nivel)
    private readonly nivelRepository: Repository<Nivel>,
  ) {}

  findAll(): Promise<Nivel[]> {
    return this.nivelRepository.find();
  }

  async findOne(id: number): Promise<Nivel> {
    return this.findOneOrFail(id);
  }

  async create(data: CreateNivelDto): Promise<Nivel> {
    const nivel = this.nivelRepository.create({ nivel: data.nivel.trim() });
    return this.nivelRepository.save(nivel);
  }

  async update(id: number, data: UpdateNivelDto): Promise<Nivel> {
    const nivel = await this.findOneOrFail(id);
    if (data.nivel !== undefined) {
      nivel.nivel = data.nivel.trim();
    }
    return this.nivelRepository.save(nivel);
  }

  async remove(id: number): Promise<void> {
    const nivel = await this.findOneOrFail(id);
    await this.nivelRepository.remove(nivel);
  }

  private async findOneOrFail(id: number): Promise<Nivel> {
    const nivel = await this.nivelRepository.findOneBy({ idNivel: id });
    if (!nivel) {
      throw new NotFoundException(`No se encontro el nivel con ID ${id}`);
    }
    return nivel;
  }
}
