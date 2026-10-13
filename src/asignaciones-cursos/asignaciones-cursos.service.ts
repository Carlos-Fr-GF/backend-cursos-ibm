import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Curso } from '../cursos/entities/curso.entity';
import { Nivel } from '../niveles/entities/nivel.entity';
import { CreateAsignacionCursoDto } from './dto/create-asignacion-curso.dto';
import { UpdateAsignacionCursoDto } from './dto/update-asignacion-curso.dto';
import { AsignacionCurso } from './entities/asignacion-curso.entity';

@Injectable()
export class AsignacionesCursosService {
  constructor(
    @InjectRepository(AsignacionCurso)
    private readonly asignacionRepository: Repository<AsignacionCurso>,
    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,
    @InjectRepository(Nivel)
    private readonly nivelRepository: Repository<Nivel>,
  ) {}

  findAll(): Promise<AsignacionCurso[]> {
    return this.asignacionRepository.find();
  }

  async findOne(id: number): Promise<AsignacionCurso> {
    return this.findOneOrFail(id);
  }

  async create(data: CreateAsignacionCursoDto): Promise<AsignacionCurso> {
    await this.findCursoOrFail(data.idCurso);
    await this.findNivelOrFail(data.idNivel);

    const asignacion = this.asignacionRepository.create({
      idCurso: data.idCurso,
      idNivel: data.idNivel,
      subnivel: data.subnivel ?? null,
      dependencias: data.dependencias ?? null,
      cupo: data.cupo,
    });
    return this.asignacionRepository.save(asignacion);
  }

  async update(
    id: number,
    data: UpdateAsignacionCursoDto,
  ): Promise<AsignacionCurso> {
    const asignacion = await this.findOneOrFail(id);

    if (data.idCurso !== undefined && data.idCurso !== asignacion.idCurso) {
      await this.findCursoOrFail(data.idCurso);
      asignacion.idCurso = data.idCurso;
    }
    if (data.idNivel !== undefined && data.idNivel !== asignacion.idNivel) {
      await this.findNivelOrFail(data.idNivel);
      asignacion.idNivel = data.idNivel;
    }
    if (data.subnivel !== undefined) {
      asignacion.subnivel = data.subnivel;
    }
    if (data.dependencias !== undefined) {
      asignacion.dependencias = data.dependencias;
    }
    if (data.cupo !== undefined) {
      asignacion.cupo = data.cupo;
    }

    return this.asignacionRepository.save(asignacion);
  }

  async remove(id: number): Promise<void> {
    const asignacion = await this.findOneOrFail(id);
    await this.asignacionRepository.remove(asignacion);
  }

  private async findOneOrFail(id: number): Promise<AsignacionCurso> {
    const asignacion = await this.asignacionRepository.findOneBy({
      idAsignacion: id,
    });
    if (!asignacion) {
      throw new NotFoundException(`No se encontro la asignacion con ID ${id}`);
    }
    return asignacion;
  }

  private async findCursoOrFail(id: number): Promise<Curso> {
    const curso = await this.cursoRepository.findOneBy({ idCurso: id });
    if (!curso) {
      throw new NotFoundException(`No se encontro el curso con ID ${id}`);
    }
    return curso;
  }

  private async findNivelOrFail(id: number): Promise<Nivel> {
    const nivel = await this.nivelRepository.findOneBy({ idNivel: id });
    if (!nivel) {
      throw new NotFoundException(`No se encontro el nivel con ID ${id}`);
    }
    return nivel;
  }
}
