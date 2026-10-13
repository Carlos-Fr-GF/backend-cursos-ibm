import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsignacionCurso } from '../asignaciones-cursos/entities/asignacion-curso.entity';
import { InscripcionCurso } from '../inscripciones-cursos/entities/inscripcion-curso.entity';
import { Nivel } from '../niveles/entities/nivel.entity';
import { CreateSubnivelDto } from './dto/create-subnivel.dto';
import { UpdateSubnivelDto } from './dto/update-subnivel.dto';
import { Subnivel } from './entities/subnivel.entity';

export interface SubnivelVista {
  idSubnivel: number;
  idNivel: number;
  nivel: string;
  subnivel: string | null;
  fechaRegistro: Date;
}

@Injectable()
export class SubnivelesService {
  constructor(
    @InjectRepository(Subnivel)
    private readonly subnivelRepository: Repository<Subnivel>,
    @InjectRepository(Nivel)
    private readonly nivelRepository: Repository<Nivel>,
    @InjectRepository(AsignacionCurso)
    private readonly asignacionRepository: Repository<AsignacionCurso>,
    @InjectRepository(InscripcionCurso)
    private readonly inscripcionRepository: Repository<InscripcionCurso>,
  ) {}

  findAll(): Promise<Subnivel[]> {
    return this.subnivelRepository.find({ order: { idSubnivel: 'ASC' } });
  }

  async findByNivelVista(idNivel: number): Promise<SubnivelVista[]> {
    await this.findNivelOrFail(idNivel);
    return this.subnivelRepository.manager
      .createQueryBuilder()
      .select('vista.id_subnivel', 'idSubnivel')
      .addSelect('vista.id_nivel', 'idNivel')
      .addSelect('vista.nivel', 'nivel')
      .addSelect('vista.subnivel', 'subnivel')
      .addSelect('vista.fecha_registro', 'fechaRegistro')
      .from('v_niveles_subniveles', 'vista')
      .where('vista.id_nivel = :idNivel', { idNivel })
      .orderBy('vista.id_subnivel', 'ASC')
      .getRawMany<SubnivelVista>();
  }

  async findOne(id: number): Promise<Subnivel> {
    return this.findOneOrFail(id);
  }

  async create(data: CreateSubnivelDto): Promise<Subnivel> {
    await this.findNivelOrFail(data.idNivel);
    const subnivel = this.subnivelRepository.create({
      idSubnivel: data.idSubnivel,
      idNivel: data.idNivel,
      subnivel: this.normalizarOpcional(data.subnivel),
    });
    return this.subnivelRepository.save(subnivel);
  }

  async update(id: number, data: UpdateSubnivelDto): Promise<Subnivel> {
    const subnivel = await this.findOneOrFail(id);
    if (data.idNivel !== undefined) {
      await this.findNivelOrFail(data.idNivel);
      const estaEnUso = await this.isSubnivelInUse(id);
      if (estaEnUso && data.idNivel !== subnivel.idNivel) {
        throw new ConflictException(
          'No se puede cambiar el nivel de un subnivel que ya esta en asignaciones o inscripciones',
        );
      }
      subnivel.idNivel = data.idNivel;
    }
    if (data.subnivel !== undefined) {
      subnivel.subnivel = this.normalizarOpcional(data.subnivel);
    }
    return this.subnivelRepository.save(subnivel);
  }

  async remove(id: number): Promise<void> {
    const subnivel = await this.findOneOrFail(id);
    if (await this.isSubnivelInUse(id)) {
      throw new ConflictException(
        'No se puede eliminar un subnivel que ya esta en asignaciones o inscripciones',
      );
    }
    await this.subnivelRepository.remove(subnivel);
  }

  private async findOneOrFail(id: number): Promise<Subnivel> {
    const subnivel = await this.subnivelRepository.findOneBy({
      idSubnivel: id,
    });
    if (!subnivel) {
      throw new NotFoundException(`No se encontro el subnivel con ID ${id}`);
    }
    return subnivel;
  }

  private async findNivelOrFail(id: number): Promise<void> {
    const nivel = await this.nivelRepository.findOneBy({ idNivel: id });
    if (!nivel) {
      throw new NotFoundException(`No se encontro el nivel con ID ${id}`);
    }
  }

  private async isSubnivelInUse(id: number): Promise<boolean> {
    const [asignacion, inscripcion] = await Promise.all([
      this.asignacionRepository.findOneBy({ subnivel: id }),
      this.inscripcionRepository.findOneBy({ subnivel: id }),
    ]);
    return asignacion !== null || inscripcion !== null;
  }

  private normalizarOpcional(value?: string | null): string | null {
    if (value == null) {
      return null;
    }
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }
}
