import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { AsignacionCurso } from '../asignaciones-cursos/entities/asignacion-curso.entity';
import { InscripcionCurso } from '../inscripciones-cursos/entities/inscripcion-curso.entity';
import { Nivel } from '../niveles/entities/nivel.entity';
import { Subnivel } from './entities/subnivel.entity';
import { SubnivelesController } from './subniveles.controller';
import { SubnivelesService } from './subniveles.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Subnivel,
      Nivel,
      AsignacionCurso,
      InscripcionCurso,
    ]),
    AuthModule,
  ],
  controllers: [SubnivelesController],
  providers: [SubnivelesService],
  exports: [SubnivelesService],
})
export class SubnivelesModule {}
