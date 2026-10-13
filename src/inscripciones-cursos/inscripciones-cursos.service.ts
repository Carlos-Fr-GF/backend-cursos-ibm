import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { AsignacionCurso } from '../asignaciones-cursos/entities/asignacion-curso.entity';
import { Cargo } from '../cargos/entities/cargo.entity';
import { Subnivel } from '../subniveles/entities/subnivel.entity';
import { Curso } from '../cursos/entities/curso.entity';
import { DatoPersonal } from './datos-personales/entities/dato-personal.entity';
import { Nivel } from '../niveles/entities/nivel.entity';
import { CreateInscripcionCursoDto } from './dto/create-inscripcion-curso.dto';
import { UpdateInscripcionCursoDto } from './dto/update-inscripcion-curso.dto';
import { InscripcionCurso } from './entities/inscripcion-curso.entity';

interface InscripcionCursoVistaRow {
  idInscripcion: number;
  idCurso: number;
  idDatosPersonales: number;
  idNivel: number;
  subnivel: number | null;
  dependencia: number | null;
  fechaRegistro: string;
  nombreCurso: string;
  nombreNivel: string;
  cargoId: number | null;
  cargoNombre: string | null;
  cct: string | null;
  escuela: string | null;
  nombre: string | null;
  apPaterno: string | null;
  amMaterno: string | null;
  correo: string | null;
}

export interface InscripcionCursoVista {
  idInscripcion: number;
  idCurso: number;
  idDatosPersonales: number;
  nivel: number;
  subnivel: number | null;
  dependencia: number | null;
  fechaRegistro: string;
  curso: { idCurso: number; nombre: string };
  nivelInfo: { idNivel: number; nombre: string };
  datosPersonales: {
    idDatosPersonales: number;
    cct: string | null;
    escuela: string | null;
    nombre: string | null;
    apPaterno: string | null;
    amMaterno: string | null;
    correo: string | null;
    cargo: { idCargo: number; nombre: string | null } | null;
  };
}

@Injectable()
export class InscripcionesCursosService {
  constructor(
    @InjectRepository(InscripcionCurso)
    private readonly inscripcionRepository: Repository<InscripcionCurso>,
    @InjectRepository(Curso)
    private readonly cursoRepository: Repository<Curso>,
    @InjectRepository(Nivel)
    private readonly nivelRepository: Repository<Nivel>,
  ) {}

  findAll(): Promise<InscripcionCurso[]> {
    return this.inscripcionRepository.find();
  }

  async findAllVista(): Promise<InscripcionCursoVista[]> {
    const rows = await this.inscripcionRepository.manager
      .createQueryBuilder()
      .select('vista.id_inscripcion', 'idInscripcion')
      .addSelect('vista.id_curso', 'idCurso')
      .addSelect('vista.id_datos_personales', 'idDatosPersonales')
      .addSelect('vista.id_nivel', 'idNivel')
      .addSelect('vista.subnivel', 'subnivel')
      .addSelect('vista.dependencia', 'dependencia')
      .addSelect('vista.fecha_registro', 'fechaRegistro')
      .addSelect('vista.nombre_curso', 'nombreCurso')
      .addSelect('vista.nombre_nivel', 'nombreNivel')
      .addSelect('vista.id_cargo', 'cargoId')
      .addSelect('vista.nombre_cargo', 'cargoNombre')
      .addSelect('vista.cct', 'cct')
      .addSelect('vista.escuela', 'escuela')
      .addSelect('vista.nombre_persona', 'nombre')
      .addSelect('vista.ap_paterno', 'apPaterno')
      .addSelect('vista.am_materno', 'amMaterno')
      .addSelect('vista.correo', 'correo')
      .from('vista_inscripciones_cursos', 'vista')
      .orderBy('vista.fecha_registro', 'DESC')
      .addOrderBy('vista.id_inscripcion', 'DESC')
      .getRawMany<InscripcionCursoVistaRow>();

    return rows.map((row) => ({
      idInscripcion: row.idInscripcion,
      idCurso: row.idCurso,
      idDatosPersonales: row.idDatosPersonales,
      nivel: row.idNivel,
      subnivel: row.subnivel,
      dependencia: row.dependencia,
      fechaRegistro: row.fechaRegistro,
      curso: { idCurso: row.idCurso, nombre: row.nombreCurso },
      nivelInfo: { idNivel: row.idNivel, nombre: row.nombreNivel },
      datosPersonales: {
        idDatosPersonales: row.idDatosPersonales,
        cct: row.cct,
        escuela: row.escuela,
        nombre: row.nombre,
        apPaterno: row.apPaterno,
        amMaterno: row.amMaterno,
        correo: row.correo,
        cargo:
          row.cargoId === null
            ? null
            : { idCargo: row.cargoId, nombre: row.cargoNombre },
      },
    }));
  }

  async findOne(id: number): Promise<InscripcionCurso> {
    return this.findOneOrFail(id);
  }

  async create(data: CreateInscripcionCursoDto): Promise<InscripcionCurso> {
    const correo = data.correo.trim().toLowerCase();
    return this.inscripcionRepository.manager.transaction(async (manager) => {
      const inscripcionRepository = manager.getRepository(InscripcionCurso);
      const cursoRepository = manager.getRepository(Curso);
      const nivelRepository = manager.getRepository(Nivel);
      const datoPersonalRepository = manager.getRepository(DatoPersonal);
      const asignacionRepository = manager.getRepository(AsignacionCurso);
      const cargoRepository = manager.getRepository(Cargo);
      const subnivelRepository = manager.getRepository(Subnivel);

      const curso = await this.findCursoOrFail(
        data.idCurso,
        cursoRepository,
        true,
      );
      await this.findNivelOrFail(data.nivel, nivelRepository);
      this.ensureSingleSelection(data.subnivel, data.dependencia);
      await this.findCargoOrFail(data.idCargo, cargoRepository);
      await this.findSubnivelOrFail(
        data.subnivel ?? null,
        data.nivel,
        subnivelRepository,
      );

      const datoExistente = await this.findDatoPersonalByCorreo(
        correo,
        datoPersonalRepository,
      );
      const datoPersonal =
        datoExistente ??
        datoPersonalRepository.create({
          cct: data.cct ?? null,
          escuela: data.escuela ?? null,
          nombre: data.nombre ?? null,
          apPaterno: data.apPaterno ?? null,
          amMaterno: data.amMaterno ?? null,
          correo,
          idCargo: data.idCargo ?? null,
        });

      await this.ensureCapacity(
        curso,
        data.nivel,
        data.subnivel ?? null,
        data.dependencia ?? null,
        inscripcionRepository,
        asignacionRepository,
      );
      await this.ensureNoDuplicateInscription(
        data.idCurso,
        correo,
        undefined,
        inscripcionRepository,
      );

      if (!datoExistente) {
        await datoPersonalRepository.save(datoPersonal);
      }

      const inscripcion = inscripcionRepository.create({
        idCurso: data.idCurso,
        nivel: data.nivel,
        idDatosPersonales: datoPersonal.idDatosPersonales,
        subnivel: data.subnivel ?? null,
        dependencia: data.dependencia ?? null,
      });
      return inscripcionRepository.save(inscripcion);
    });
  }

  async update(
    id: number,
    data: UpdateInscripcionCursoDto,
  ): Promise<InscripcionCurso> {
    return this.inscripcionRepository.manager.transaction(async (manager) => {
      const inscripcionRepository = manager.getRepository(InscripcionCurso);
      const cursoRepository = manager.getRepository(Curso);
      const nivelRepository = manager.getRepository(Nivel);
      const datoPersonalRepository = manager.getRepository(DatoPersonal);
      const asignacionRepository = manager.getRepository(AsignacionCurso);
      const subnivelRepository = manager.getRepository(Subnivel);
      const inscripcion = await inscripcionRepository.findOne({
        where: { idInscripcion: id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!inscripcion) {
        throw new NotFoundException(
          `No se encontro la inscripcion con ID ${id}`,
        );
      }

      const idCurso = data.idCurso ?? inscripcion.idCurso;
      const nivel = data.nivel ?? inscripcion.nivel;
      const subnivel =
        data.subnivel !== undefined ? data.subnivel : inscripcion.subnivel;
      const dependencia =
        data.dependencia !== undefined
          ? data.dependencia
          : inscripcion.dependencia;

      const curso = await this.findCursoOrFail(idCurso, cursoRepository, true);
      if (nivel !== inscripcion.nivel) {
        await this.findNivelOrFail(nivel, nivelRepository);
      }
      this.ensureSingleSelection(subnivel, dependencia);
      await this.findSubnivelOrFail(subnivel, nivel, subnivelRepository);
      const datoPersonal = await datoPersonalRepository.findOneBy({
        idDatosPersonales: inscripcion.idDatosPersonales,
      });
      if (!datoPersonal) {
        throw new NotFoundException(
          `No se encontraron datos personales con ID ${inscripcion.idDatosPersonales}`,
        );
      }
      await this.ensureNoDuplicateInscription(
        idCurso,
        datoPersonal.correo,
        id,
        inscripcionRepository,
      );
      await this.ensureCapacity(
        curso,
        nivel,
        subnivel,
        dependencia,
        inscripcionRepository,
        asignacionRepository,
        id,
      );

      inscripcion.idCurso = idCurso;
      inscripcion.nivel = nivel;
      inscripcion.subnivel = subnivel;
      inscripcion.dependencia = dependencia;

      return inscripcionRepository.save(inscripcion);
    });
  }

  async remove(id: number): Promise<void> {
    const inscripcion = await this.findOneOrFail(id);
    await this.inscripcionRepository.remove(inscripcion);
  }

  private async findOneOrFail(id: number): Promise<InscripcionCurso> {
    const inscripcion = await this.inscripcionRepository.findOneBy({
      idInscripcion: id,
    });
    if (!inscripcion) {
      throw new NotFoundException(`No se encontro la inscripcion con ID ${id}`);
    }
    return inscripcion;
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

  private async findDatoPersonalByCorreo(
    correo: string,
    repository: Repository<DatoPersonal>,
  ): Promise<DatoPersonal | null> {
    const registros = await repository
      .createQueryBuilder('persona')
      .where('LOWER(persona.correo) = :correo', { correo })
      .take(2)
      .getMany();

    if (registros.length > 1) {
      throw new ConflictException(
        'Hay varios registros personales con ese correo; debe corregirse la duplicidad antes de inscribir',
      );
    }

    return registros[0] ?? null;
  }

  private async findCargoOrFail(
    id: number | null | undefined,
    repository: Repository<Cargo>,
  ): Promise<void> {
    if (id == null) {
      return;
    }

    const cargo = await repository.findOneBy({ idCargo: id });
    if (!cargo) {
      throw new NotFoundException(`No se encontro el cargo con ID ${id}`);
    }
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

  private async ensureNoDuplicateInscription(
    idCurso: number,
    correo: string | null,
    excludeId?: number,
    repository: Repository<InscripcionCurso> = this.inscripcionRepository,
  ): Promise<void> {
    const query = repository
      .createQueryBuilder('inscripcion')
      .leftJoin(
        DatoPersonal,
        'persona',
        'persona.id_datos_personales = inscripcion.id_datos_personales',
      )
      .where('inscripcion.idCurso = :idCurso', { idCurso })
      .andWhere('LOWER(persona.correo) = LOWER(:correo)', { correo });

    if (excludeId !== undefined) {
      query.andWhere('inscripcion.idInscripcion != :excludeId', { excludeId });
    }

    if (await query.getOne()) {
      throw new ConflictException(
        'alguien ya esta inscrito con el correo proporcionado',
      );
    }
  }

  private ensureSingleSelection(
    subnivel: number | null | undefined,
    dependencia: number | null | undefined,
  ): void {
    if (subnivel != null && dependencia != null) {
      throw new BadRequestException(
        'La inscripcion solo puede indicar un subnivel o una dependencia, no ambos',
      );
    }
  }

  private async ensureCapacity(
    curso: Curso,
    nivel: number,
    subnivel: number | null,
    dependencia: number | null,
    inscripcionRepository: Repository<InscripcionCurso>,
    asignacionRepository: Repository<AsignacionCurso>,
    excludeId?: number,
  ): Promise<void> {
    const inscripcionesCurso = await this.countInscripciones(
      inscripcionRepository,
      { idCurso: curso.idCurso },
      excludeId,
    );
    if (inscripcionesCurso >= curso.cuposMax) {
      throw new ConflictException('El curso ya no tiene cupos disponibles');
    }

    const asignacionesNivel = await asignacionRepository.find({
      where: {
        idCurso: curso.idCurso,
        idNivel: nivel,
        subnivel: IsNull(),
        dependencias: IsNull(),
      },
      lock: { mode: 'pessimistic_write' },
    });
    if (asignacionesNivel.length === 0) {
      throw new ConflictException(
        'El nivel no tiene una asignacion base para este curso',
      );
    }
    if (asignacionesNivel.length > 1) {
      throw new ConflictException(
        'Hay mas de una asignacion base para este curso y nivel',
      );
    }

    const inscripcionesNivel = await this.countInscripciones(
      inscripcionRepository,
      { idCurso: curso.idCurso, nivel },
      excludeId,
    );
    if (inscripcionesNivel >= asignacionesNivel[0].cupo) {
      throw new ConflictException('El nivel ya no tiene cupos disponibles');
    }

    if (subnivel === null && dependencia === null) {
      const cuposEspecificos = await this.sumSpecificAssignmentCapacity(
        curso.idCurso,
        nivel,
        asignacionRepository,
      );
      const cuposGenerales = asignacionesNivel[0].cupo - cuposEspecificos;
      const inscripcionesGenerales = await this.countInscripciones(
        inscripcionRepository,
        { idCurso: curso.idCurso, nivel, subnivel: null, dependencia: null },
        excludeId,
      );
      if (inscripcionesGenerales >= cuposGenerales) {
        throw new ConflictException(
          `Los cupos generales del nivel estan agotados; hay ${cuposEspecificos} cupos reservados para subniveles o dependencias`,
        );
      }
    }

    if (subnivel !== null) {
      await this.ensureSpecificCapacity(
        curso.idCurso,
        nivel,
        subnivel,
        null,
        inscripcionRepository,
        asignacionRepository,
        excludeId,
      );
    } else if (dependencia !== null) {
      await this.ensureSpecificCapacity(
        curso.idCurso,
        nivel,
        null,
        dependencia,
        inscripcionRepository,
        asignacionRepository,
        excludeId,
      );
    }
  }

  private async sumSpecificAssignmentCapacity(
    idCurso: number,
    nivel: number,
    repository: Repository<AsignacionCurso>,
  ): Promise<number> {
    const result = await repository
      .createQueryBuilder('asignacion')
      .select('COALESCE(SUM(asignacion.cupo), 0)', 'totalCupo')
      .where('asignacion.idCurso = :idCurso', { idCurso })
      .andWhere('asignacion.idNivel = :nivel', { nivel })
      .andWhere(
        '(asignacion.subnivel IS NOT NULL OR asignacion.dependencias IS NOT NULL)',
      )
      .getRawOne<{ totalCupo: string | number }>();

    return Number(result?.totalCupo ?? 0);
  }

  private async ensureSpecificCapacity(
    idCurso: number,
    nivel: number,
    subnivel: number | null,
    dependencia: number | null,
    inscripcionRepository: Repository<InscripcionCurso>,
    asignacionRepository: Repository<AsignacionCurso>,
    excludeId?: number,
  ): Promise<void> {
    const asignaciones = await asignacionRepository.find({
      where: {
        idCurso,
        idNivel: nivel,
        subnivel: subnivel ?? IsNull(),
        dependencias: dependencia ?? IsNull(),
      },
      lock: { mode: 'pessimistic_write' },
    });

    if (asignaciones.length > 1) {
      throw new ConflictException(
        'Hay mas de una asignacion para la opcion seleccionada',
      );
    }

    const asignacion = asignaciones[0];
    if (!asignacion) {
      return;
    }

    const condiciones: {
      idCurso: number;
      nivel: number;
      subnivel?: number | null;
      dependencia?: number | null;
    } = { idCurso, nivel };
    if (subnivel !== null) {
      condiciones.subnivel = subnivel;
      condiciones.dependencia = null;
    } else {
      condiciones.subnivel = null;
      condiciones.dependencia = dependencia;
    }

    const inscripcionesOpcion = await this.countInscripciones(
      inscripcionRepository,
      condiciones,
      excludeId,
    );
    if (inscripcionesOpcion >= asignacion.cupo) {
      throw new ConflictException(
        'La opcion seleccionada ya no tiene cupos disponibles',
      );
    }
  }

  private async countInscripciones(
    repository: Repository<InscripcionCurso>,
    conditions: {
      idCurso: number;
      nivel?: number;
      subnivel?: number | null;
      dependencia?: number | null;
    },
    excludeId?: number,
  ): Promise<number> {
    const query = repository
      .createQueryBuilder('inscripcion')
      .where('inscripcion.idCurso = :idCurso', {
        idCurso: conditions.idCurso,
      });

    if (conditions.nivel !== undefined) {
      query.andWhere('inscripcion.nivel = :nivel', {
        nivel: conditions.nivel,
      });
    }
    if (conditions.subnivel !== undefined) {
      if (conditions.subnivel === null) {
        query.andWhere('inscripcion.subnivel IS NULL');
      } else {
        query.andWhere('inscripcion.subnivel = :subnivel', {
          subnivel: conditions.subnivel,
        });
      }
    }
    if (conditions.dependencia !== undefined) {
      if (conditions.dependencia === null) {
        query.andWhere('inscripcion.dependencia IS NULL');
      } else {
        query.andWhere('inscripcion.dependencia = :dependencia', {
          dependencia: conditions.dependencia,
        });
      }
    }
    if (excludeId !== undefined) {
      query.andWhere('inscripcion.idInscripcion != :excludeId', {
        excludeId,
      });
    }

    return query.getCount();
  }
}
