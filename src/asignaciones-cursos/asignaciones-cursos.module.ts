import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Curso } from '../cursos/entities/curso.entity';
import { Nivel } from '../niveles/entities/nivel.entity';
import { Subnivel } from '../subniveles/entities/subnivel.entity';
import { AsignacionesCursosController } from './asignaciones-cursos.controller';
import { AsignacionesCursosService } from './asignaciones-cursos.service';
import { AsignacionCurso } from './entities/asignacion-curso.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([AsignacionCurso, Curso, Nivel, Subnivel]),
    AuthModule,
  ],
  controllers: [AsignacionesCursosController],
  providers: [AsignacionesCursosService],
  exports: [AsignacionesCursosService],
})
export class AsignacionesCursosModule {}
