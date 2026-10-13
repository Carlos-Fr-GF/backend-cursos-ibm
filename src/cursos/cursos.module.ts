import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignacionCurso } from '../asignaciones-cursos/entities/asignacion-curso.entity';
import { Curso } from './entities/curso.entity';
import { CursosController } from './cursos.controller';
import { CursosService } from './cursos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Curso, AsignacionCurso])],
  controllers: [CursosController],
  providers: [CursosService],
  exports: [CursosService],
})
export class CursosModule {}
