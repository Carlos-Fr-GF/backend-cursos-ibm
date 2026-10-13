import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Nivel } from './entities/nivel.entity';
import { NivelesController } from './niveles.controller';
import { NivelesService } from './niveles.service';

@Module({
  imports: [TypeOrmModule.forFeature([Nivel]), AuthModule],
  controllers: [NivelesController],
  providers: [NivelesService],
  exports: [NivelesService],
})
export class NivelesModule {}
