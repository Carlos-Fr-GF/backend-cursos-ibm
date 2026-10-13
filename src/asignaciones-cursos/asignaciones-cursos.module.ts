import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Curso } from '../cursos/entities/curso.entity';
import { Nivel } from '../niveles/entities/nivel.entity';
import { AsignacionesCursosController } from './asignaciones-cursos.controller';
import { AsignacionesCursosService } from './asignaciones-cursos.service';
import { AsignacionCurso } from './entities/asignacion-curso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AsignacionCurso, Curso, Nivel])],
  controllers: [AsignacionesCursosController],
  providers: [AsignacionesCursosService],
  exports: [AsignacionesCursosService],
})
export class AsignacionesCursosModule {}
