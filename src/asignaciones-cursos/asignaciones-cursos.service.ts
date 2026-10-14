import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Curso } from '../cursos/entities/curso.entity';
import { Nivel } from '../niveles/entities/nivel.entity';
import { Subnivel } from '../subniveles/entities/subnivel.entity';
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
    @InjectRepository(Subnivel)
    private readonly subnivelRepository: Repository<Subnivel>,
  ) {}

  findAll(): Promise<AsignacionCurso[]> {
    return this.asignacionRepository.find();
  }

  async findOne(id: number): Promise<AsignacionCurso> {
    return this.findOneOrFail(id);
  }

  async create(data: CreateAsignacionCursoDto): Promise<AsignacionCurso> {
    return this.asignacionRepository.manager.transaction(async (manager) => {
      const asignacionRepository = manager.getRepository(AsignacionCurso);
      const cursoRepository = manager.getRepository(Curso);
      const nivelRepository = manager.getRepository(Nivel);
      const subnivelRepository = manager.getRepository(Subnivel);

      const curso = await this.findCursoOrFail(
        data.idCurso,
        cursoRepository,
        true,
      );
      await this.findNivelOrFail(data.idNivel, nivelRepository);
      const subnivel = data.subnivel ?? null;
      const dependencias = data.dependencias ?? null;
      await this.findSubnivelOrFail(subnivel, data.idNivel, subnivelRepository);
      const asignacionesExistentes = await asignacionRepository.find({
        where: {
          idCurso: data.idCurso,
          idNivel: data.idNivel,
          subnivel: subnivel ?? IsNull(),
          dependencias: dependencias ?? IsNull(),
        },
        lock: { mode: 'pessimistic_write' },
      });
      if (asignacionesExistentes.length > 1) {
        throw new ConflictException(
          'Ya existen varias asignaciones con los mismos curso, nivel y opcion; corrige los duplicados antes de continuar',
        );
      }
      const asignacionExistente = asignacionesExistentes[0];
      if (asignacionExistente) {
        throw new ConflictException(
          'Ya existe una asignacion con ese curso, nivel y opcion; no se modifico el cupo',
        );
      }
      await this.ensureAsignacionesWithinCourseLimit(
        data.idCurso,
        data.cupo,
        curso.cuposMax,
        asignacionRepository,
        data.idNivel,
        subnivel,
        dependencias,
      );
      await this.ensureSubnivelWithinLevelLimit(
        data.idCurso,
        data.idNivel,
        subnivel,
        dependencias,
        data.cupo,
        asignacionRepository,
      );

      const asignacion = asignacionRepository.create({
        idCurso: data.idCurso,
        idNivel: data.idNivel,
        subnivel,
        dependencias,
        cupo: data.cupo,
      });
      return asignacionRepository.save(asignacion);
    });
  }

  async update(
    id: number,
    data: UpdateAsignacionCursoDto,
  ): Promise<AsignacionCurso> {
    return this.asignacionRepository.manager.transaction(async (manager) => {
      const asignacionRepository = manager.getRepository(AsignacionCurso);
      const cursoRepository = manager.getRepository(Curso);
      const nivelRepository = manager.getRepository(Nivel);
      const subnivelRepository = manager.getRepository(Subnivel);
      const asignacionInicial = await this.findOneOrFail(
        id,
        asignacionRepository,
      );
      const idCurso = data.idCurso ?? asignacionInicial.idCurso;
      const idsCursos = [...new Set([asignacionInicial.idCurso, idCurso])].sort(
        (a, b) => a - b,
      );
      const cursos = new Map<number, Curso>();

      for (const idCursoBloqueado of idsCursos) {
        cursos.set(
          idCursoBloqueado,
          await this.findCursoOrFail(idCursoBloqueado, cursoRepository, true),
        );
      }

      const asignacion = await asignacionRepository.findOne({
        where: { idAsignacion: id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!asignacion) {
        throw new NotFoundException(
          `No se encontro la asignacion con ID ${id}`,
        );
      }
      if (asignacion.idCurso !== asignacionInicial.idCurso) {
        throw new ConflictException(
          'La asignacion cambio durante la actualizacion; vuelve a intentarlo',
        );
      }

      const curso = cursos.get(idCurso);
      if (!curso) {
        throw new NotFoundException(
          `No se encontro el curso con ID ${idCurso}`,
        );
      }
      const idNivel = data.idNivel ?? asignacion.idNivel;
      if (idNivel !== asignacion.idNivel) {
        await this.findNivelOrFail(idNivel, nivelRepository);
      }

      const cupo = data.cupo ?? asignacion.cupo;
      const subnivel =
        data.subnivel !== undefined ? data.subnivel : asignacion.subnivel;
      const dependencias =
        data.dependencias !== undefined
          ? data.dependencias
          : asignacion.dependencias;
      await this.findSubnivelOrFail(subnivel, idNivel, subnivelRepository);
      const asignacionBaseAnterior =
        asignacion.subnivel === null && asignacion.dependencias === null;
      const asignacionSigueComoBase =
        subnivel === null &&
        dependencias === null &&
        idCurso === asignacion.idCurso &&
        idNivel === asignacion.idNivel;

      if (asignacionBaseAnterior && !asignacionSigueComoBase) {
        const tieneSubnivelesAsignados = await this.hasSubnivelAsignaciones(
          asignacion.idCurso,
          asignacion.idNivel,
          asignacionRepository,
          id,
        );
        if (tieneSubnivelesAsignados) {
          throw new ConflictException(
            'No se puede mover o convertir la asignacion base mientras tenga cupos asignados a subniveles',
          );
        }
      }

      await this.ensureAsignacionesWithinCourseLimit(
        idCurso,
        cupo,
        curso.cuposMax,
        asignacionRepository,
        idNivel,
        subnivel,
        dependencias,
        id,
      );
      await this.ensureSubnivelWithinLevelLimit(
        idCurso,
        idNivel,
        subnivel,
        dependencias,
        cupo,
        asignacionRepository,
        id,
      );

      asignacion.idCurso = idCurso;
      asignacion.idNivel = idNivel;
      asignacion.subnivel = subnivel;
      asignacion.dependencias = dependencias;
      asignacion.cupo = cupo;

      return asignacionRepository.save(asignacion);
    });
  }

  async remove(id: number): Promise<void> {
    const asignacion = await this.findOneOrFail(id);
    await this.asignacionRepository.remove(asignacion);
  }

  private async findOneOrFail(
    id: number,
    repository: Repository<AsignacionCurso> = this.asignacionRepository,
  ): Promise<AsignacionCurso> {
    const asignacion = await repository.findOneBy({
      idAsignacion: id,
    });
    if (!asignacion) {
      throw new NotFoundException(`No se encontro la asignacion con ID ${id}`);
    }
    return asignacion;
  }

  private async findCursoOrFail(
    id: number,
    repository: Repository<Curso> = this.cursoRepository,
    lock = false,
  ): Promise<Curso> {
    const curso = lock
      ? await repository.findOne({
          where: { idCurso: id },
          lock: { mode: 'pessimistic_write' },
        })
      : await repository.findOneBy({ idCurso: id });
    if (!curso) {
      throw new NotFoundException(`No se encontro el curso con ID ${id}`);
    }
    return curso;
  }

  private async findNivelOrFail(
    id: number,
    repository: Repository<Nivel> = this.nivelRepository,
  ): Promise<Nivel> {
    const nivel = await repository.findOneBy({ idNivel: id });
    if (!nivel) {
      throw new NotFoundException(`No se encontro el nivel con ID ${id}`);
    }
    return nivel;
  }

  private async findSubnivelOrFail(
    idSubnivel: number | null,
    idNivel: number,
    repository: Repository<Subnivel>,
  ): Promise<void> {
    if (idSubnivel === null) {
      return;
    }
    const subnivel = await repository.findOneBy({ idSubnivel });
    if (!subnivel) {
      throw new NotFoundException(
        `No se encontro el subnivel con ID ${idSubnivel}`,
      );
    }
    if (subnivel.idNivel !== idNivel) {
      throw new ConflictException(
        `El subnivel ${idSubnivel} no pertenece al nivel ${idNivel}`,
      );
    }
  }

  private async ensureAsignacionesWithinCourseLimit(
    idCurso: number,
    cupoNuevo: number,
    cupoMaximoCurso: number,
    repository: Repository<AsignacionCurso>,
    idNivel: number,
    subnivel: number | null,
    dependencias: number | null,
    excludeId?: number,
  ): Promise<void> {
    if (cupoNuevo > cupoMaximoCurso) {
      throw new ConflictException(
        `El cupo de la asignacion no puede superar el cupo maximo del curso (${cupoMaximoCurso})`,
      );
    }

    const query = repository
      .createQueryBuilder('asignacion')
      .select('COALESCE(SUM(asignacion.cupo), 0)', 'totalCupo')
      .where('asignacion.idCurso = :idCurso', { idCurso })
      .andWhere('asignacion.subnivel IS NULL')
      .andWhere('asignacion.dependencias IS NULL');

    if (excludeId !== undefined) {
      query.andWhere('asignacion.idAsignacion != :excludeId', { excludeId });
    }

    const resultado = await query.getRawOne<{ totalCupo: string | number }>();
    const totalCupoAsignado = Number(resultado?.totalCupo ?? 0);
    const cupoBaseNuevo =
      subnivel === null && dependencias === null ? cupoNuevo : 0;
    if (totalCupoAsignado + cupoBaseNuevo > cupoMaximoCurso) {
      throw new ConflictException(
        `La suma de cupos base asignados (${totalCupoAsignado + cupoBaseNuevo}) no puede superar el cupo maximo del curso (${cupoMaximoCurso})`,
      );
    }
  }

  private async ensureSubnivelWithinLevelLimit(
    idCurso: number,
    idNivel: number,
    subnivel: number | null,
    dependencias: number | null,
    cupoNuevo: number,
    repository: Repository<AsignacionCurso>,
    excludeId?: number,
  ): Promise<void> {
    if (subnivel === null && dependencias === null) {
      const totalSubnivel = await this.sumSubnivelCupos(
        idCurso,
        idNivel,
        repository,
        excludeId,
      );
      if (totalSubnivel > cupoNuevo) {
        throw new ConflictException(
          `El cupo base del nivel (${cupoNuevo}) no puede ser menor que la suma de cupos asignados a sus subniveles (${totalSubnivel})`,
        );
      }
      return;
    }

    if (subnivel === null) {
      return;
    }

    const query = repository
      .createQueryBuilder('asignacion')
      .where('asignacion.idCurso = :idCurso', { idCurso })
      .andWhere('asignacion.idNivel = :idNivel', { idNivel })
      .andWhere('asignacion.subnivel IS NULL')
      .andWhere('asignacion.dependencias IS NULL');
    if (excludeId !== undefined) {
      query.andWhere('asignacion.idAsignacion != :excludeId', { excludeId });
    }
    const asignacionBase = await query.getOne();
    if (!asignacionBase) {
      throw new ConflictException(
        'Debe existir la asignacion base del nivel antes de asignar cupos a sus subniveles',
      );
    }

    const totalSubnivelActual = await this.sumSubnivelCupos(
      idCurso,
      idNivel,
      repository,
      excludeId,
    );
    if (totalSubnivelActual + cupoNuevo > asignacionBase.cupo) {
      throw new ConflictException(
        `La suma de cupos de subnivel (${totalSubnivelActual + cupoNuevo}) no puede superar el cupo del nivel (${asignacionBase.cupo})`,
      );
    }
  }

  private async sumSubnivelCupos(
    idCurso: number,
    idNivel: number,
    repository: Repository<AsignacionCurso>,
    excludeId?: number,
  ): Promise<number> {
    const query = repository
      .createQueryBuilder('asignacion')
      .select('COALESCE(SUM(asignacion.cupo), 0)', 'totalCupo')
      .where('asignacion.idCurso = :idCurso', { idCurso })
      .andWhere('asignacion.idNivel = :idNivel', { idNivel })
      .andWhere('asignacion.subnivel IS NOT NULL');

    if (excludeId !== undefined) {
      query.andWhere('asignacion.idAsignacion != :excludeId', { excludeId });
    }

    const resultado = await query.getRawOne<{ totalCupo: string | number }>();
    return Number(resultado?.totalCupo ?? 0);
  }

  private async hasSubnivelAsignaciones(
    idCurso: number,
    idNivel: number,
    repository: Repository<AsignacionCurso>,
    excludeId?: number,
  ): Promise<boolean> {
    const query = repository
      .createQueryBuilder('asignacion')
      .where('asignacion.idCurso = :idCurso', { idCurso })
      .andWhere('asignacion.idNivel = :idNivel', { idNivel })
      .andWhere('asignacion.subnivel IS NOT NULL');

    if (excludeId !== undefined) {
      query.andWhere('asignacion.idAsignacion != :excludeId', { excludeId });
    }

    return (await query.getCount()) > 0;
  }
}
