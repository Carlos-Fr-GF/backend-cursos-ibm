import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cargo } from '../cargos/entities/cargo.entity';
import { Subnivel } from '../subniveles/entities/subnivel.entity';
import { AsignacionCurso } from '../asignaciones-cursos/entities/asignacion-curso.entity';
import { Curso } from '../cursos/entities/curso.entity';
import { DatosPersonalesModule } from './datos-personales/datos-personales.module';
import { DatoPersonal } from './datos-personales/entities/dato-personal.entity';
import { Nivel } from '../niveles/entities/nivel.entity';
import { InscripcionesCursosController } from './inscripciones-cursos.controller';
import { InscripcionesCursosService } from './inscripciones-cursos.service';
import { InscripcionCurso } from './entities/inscripcion-curso.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InscripcionCurso,
      Curso,
      Nivel,
      DatoPersonal,
      AsignacionCurso,
      Cargo,
      Subnivel,
    ]),
    DatosPersonalesModule,
  ],
  controllers: [InscripcionesCursosController],
  providers: [InscripcionesCursosService],
  exports: [InscripcionesCursosService],
})
export class InscripcionesCursosModule {}
