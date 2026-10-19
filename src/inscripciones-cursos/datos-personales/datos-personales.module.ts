import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { Cargo } from '../../cargos/entities/cargo.entity';
import { DatoPersonal } from './entities/dato-personal.entity';
import { DatosPersonalesController } from './datos-personales.controller';
import { DatosPersonalesService } from './datos-personales.service';

@Module({
  imports: [TypeOrmModule.forFeature([DatoPersonal, Cargo]), AuthModule],
  controllers: [DatosPersonalesController],
  providers: [DatosPersonalesService],
  exports: [DatosPersonalesService],
})
export class DatosPersonalesModule {}
