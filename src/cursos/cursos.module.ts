import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AsignacionCurso } from '../asignaciones-cursos/entities/asignacion-curso.entity';
import { Curso } from './entities/curso.entity';
import { CursosController } from './cursos.controller';
import { CursosService } from './cursos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Curso, AsignacionCurso]), AuthModule],
  controllers: [CursosController],
  providers: [CursosService],
  exports: [CursosService],
})
export class CursosModule {}
