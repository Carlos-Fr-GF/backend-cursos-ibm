import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Nivel } from '../niveles/entities/nivel.entity';
import { Dependencia } from './entities/dependencia.entity';
import { DependenciasController } from './dependencias.controller';
import { DependenciasService } from './dependencias.service';

@Module({
  imports: [TypeOrmModule.forFeature([Dependencia, Nivel]), AuthModule],
  controllers: [DependenciasController],
  providers: [DependenciasService],
  exports: [DependenciasService],
})
export class DependenciasModule {}
