import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatoPersonal } from './entities/dato-personal.entity';
import { DatosPersonalesController } from './datos-personales.controller';
import { DatosPersonalesService } from './datos-personales.service';

@Module({
  imports: [TypeOrmModule.forFeature([DatoPersonal])],
  controllers: [DatosPersonalesController],
  providers: [DatosPersonalesService],
  exports: [DatosPersonalesService],
})
export class DatosPersonalesModule {}
