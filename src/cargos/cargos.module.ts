import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Cargo } from './entities/cargo.entity';
import { CargosController } from './cargos.controller';
import { CargosService } from './cargos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cargo]), AuthModule],
  controllers: [CargosController],
  providers: [CargosService],
  exports: [CargosService],
})
export class CargosModule {}
