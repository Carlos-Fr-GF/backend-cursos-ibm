import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateCargoDto } from './dto/create-cargo.dto';
import { UpdateCargoDto } from './dto/update-cargo.dto';
import { CargosService } from './cargos.service';
import { JwtCookieGuard } from '../auth/jwt-cookie.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('cargos')
export class CargosController {
  constructor(private readonly cargosService: CargosService) {}

  @Get()
  findAll() {
    return this.cargosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cargosService.findOne(id);
  }

  @UseGuards(JwtCookieGuard, RolesGuard)
  @Roles(0)
  @Post()
  create(@Body() data: CreateCargoDto) {
    return this.cargosService.create(data);
  }

  @UseGuards(JwtCookieGuard, RolesGuard)
  @Roles(0)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateCargoDto) {
    return this.cargosService.update(id, data);
  }

  @UseGuards(JwtCookieGuard, RolesGuard)
  @Roles(0)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cargosService.remove(id);
  }
}
