import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AsignacionCurso } from '../asignaciones-cursos/entities/asignacion-curso.entity';
import { CreateCursoDto } from './dto/create-curso.dto';
import { UpdateCursoDto } from './dto/update-curso.dto';
import { Curso } from './entities/curso.entity';

@Injectable()
export class CursosService {
  constructor(
    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,
  ) {}

  findAll(): Promise<Curso[]> {
    return this.cursoRepository.find();
  }

  async findOne(id: number): Promise<Curso> {
    return this.findOneOrFail(id);
  }

  async create(data: CreateCursoDto): Promise<Curso> {
    const curso = this.cursoRepository.create({
      nombre: data.nombre.trim(),
      fechaInicioInscripcion: data.fechaInicioInscripcion ?? null,
      fechaFinInscripcion: data.fechaFinInscripcion ?? null,
      fechaInicioCurso: data.fechaInicioCurso ?? null,
      fechaFinCurso: data.fechaFinCurso ?? null,
      cuposMax: data.cuposMax,
    });
    return this.cursoRepository.save(curso);
  }

  async update(id: number, data: UpdateCursoDto): Promise<Curso> {
    return this.cursoRepository.manager.transaction(async (manager) => {
      const cursoRepository = manager.getRepository(Curso);
      const asignacionRepository = manager.getRepository(AsignacionCurso);
      const curso = await cursoRepository.findOne({
        where: { idCurso: id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!curso) {
        throw new NotFoundException(`No se encontro el curso con ID ${id}`);
      }

      if (data.cuposMax !== undefined) {
        const consultaCuposBase = asignacionRepository
          .createQueryBuilder('asignacion')
          .select('COALESCE(SUM(asignacion.cupo), 0)', 'totalCupo')
          .where('asignacion.idCurso = :id', { id })
          .andWhere('asignacion.subnivel IS NULL')
          .andWhere('asignacion.dependencias IS NULL');
        const resultado = await consultaCuposBase.getRawOne<{
          totalCupo: string | number;
        }>();
        const totalCupoAsignado = Number(resultado?.totalCupo ?? 0);
        if (totalCupoAsignado > data.cuposMax) {
          throw new ConflictException(
            `El cupo maximo del curso no puede ser menor que la suma de cupos base asignados (${totalCupoAsignado})`,
          );
        }

        const asignacionSobreMaximo = await asignacionRepository
          .createQueryBuilder('asignacion')
          .where('asignacion.idCurso = :id', { id })
          .andWhere('asignacion.cupo > :cuposMax', {
            cuposMax: data.cuposMax,
          })
          .getOne();
        if (asignacionSobreMaximo) {
          throw new ConflictException(
            `El cupo maximo del curso no puede ser menor que el cupo de una asignacion existente (${asignacionSobreMaximo.cupo})`,
          );
        }
        curso.cuposMax = data.cuposMax;
      }

      if (data.nombre !== undefined) {
        curso.nombre = data.nombre.trim();
      }
      if (data.fechaInicioInscripcion !== undefined) {
        curso.fechaInicioInscripcion = data.fechaInicioInscripcion;
      }
      if (data.fechaFinInscripcion !== undefined) {
        curso.fechaFinInscripcion = data.fechaFinInscripcion;
      }
      if (data.fechaInicioCurso !== undefined) {
        curso.fechaInicioCurso = data.fechaInicioCurso;
      }
      if (data.fechaFinCurso !== undefined) {
        curso.fechaFinCurso = data.fechaFinCurso;
      }

      return cursoRepository.save(curso);
    });
  }

  async remove(id: number): Promise<void> {
    const curso = await this.findOneOrFail(id);
    await this.cursoRepository.remove(curso);
  }

  private async findOneOrFail(id: number): Promise<Curso> {
    const curso = await this.cursoRepository.findOneBy({ idCurso: id });
    if (!curso) {
      throw new NotFoundException(`No se encontro el curso con ID ${id}`);
    }
    return curso;
  }
}
