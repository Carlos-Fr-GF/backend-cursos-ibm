import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { JwtCookieGuard } from '../../auth/jwt-cookie.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { CreateDatoPersonalDto } from './dto/create-dato-personal.dto';
import { UpdateDatoPersonalDto } from './dto/update-dato-personal.dto';
import { DatosPersonalesService } from './datos-personales.service';

@Controller('datos-personales')
export class DatosPersonalesController {
  constructor(
    private readonly datosPersonalesService: DatosPersonalesService,
  ) {}

  @Get()
  findAll() {
    return this.datosPersonalesService.findAll();
  }

  @Get(':curp')
  findOne(@Param('curp') curp: string) {
    return this.datosPersonalesService.findOne(curp);
  }

  @Post()
  create(@Body() data: CreateDatoPersonalDto) {
    return this.datosPersonalesService.create(data);
  }

  // @UseGuards( JwtCookieGuard, RolesGuard)
  // @Roles(0)
  @Patch(':curp')
  update(@Param('curp') curp: string, @Body() data: UpdateDatoPersonalDto) {
    return this.datosPersonalesService.update(curp, data);
  }

  // @UseGuards( JwtCookieGuard, RolesGuard)
  // @Roles(0)
  @Delete(':curp')
  remove(@Param('curp') curp: string) {
    return this.datosPersonalesService.remove(curp);
  }
}
