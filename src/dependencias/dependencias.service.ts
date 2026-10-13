import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Nivel } from '../niveles/entities/nivel.entity';
import { CreateDependenciaDto } from './dto/create-dependencia.dto';
import { UpdateDependenciaDto } from './dto/update-dependencia.dto';
import { Dependencia } from './entities/dependencia.entity';

@Injectable()
export class DependenciasService {
  constructor(
    @InjectRepository(Dependencia)
    private readonly dependenciaRepository: Repository<Dependencia>,
    @InjectRepository(Nivel)
    private readonly nivelRepository: Repository<Nivel>,
  ) {}

  findAll(): Promise<Dependencia[]> {
    return this.dependenciaRepository.find();
  }

  async findOne(id: number): Promise<Dependencia> {
    return this.findOneOrFail(id);
  }

  async create(data: CreateDependenciaDto): Promise<Dependencia> {
    await this.findNivelOrFail(data.idNivel);
    const dependencia = this.dependenciaRepository.create({
      idNivel: data.idNivel,
      dependencia: data.dependencia.trim(),
    });
    return this.dependenciaRepository.save(dependencia);
  }

  async update(id: number, data: UpdateDependenciaDto): Promise<Dependencia> {
    const dependencia = await this.findOneOrFail(id);
    if (data.idNivel !== undefined && data.idNivel !== dependencia.idNivel) {
      await this.findNivelOrFail(data.idNivel);
      dependencia.idNivel = data.idNivel;
    }
    if (data.dependencia !== undefined) {
      dependencia.dependencia = data.dependencia.trim();
    }
    return this.dependenciaRepository.save(dependencia);
  }

  async remove(id: number): Promise<void> {
    const dependencia = await this.findOneOrFail(id);
    await this.dependenciaRepository.remove(dependencia);
  }

  private async findOneOrFail(id: number): Promise<Dependencia> {
    const dependencia = await this.dependenciaRepository.findOneBy({
      idDependencias: id,
    });
    if (!dependencia) {
      throw new NotFoundException(`No se encontro la dependencia con ID ${id}`);
    }
    return dependencia;
  }

  private async findNivelOrFail(id: number): Promise<Nivel> {
    const nivel = await this.nivelRepository.findOneBy({ idNivel: id });
    if (!nivel) {
      throw new NotFoundException(`No se encontro el nivel con ID ${id}`);
    }
    return nivel;
  }
}
