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
import { JwtCookieGuard } from '../auth/jwt-cookie.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateDependenciaDto } from './dto/create-dependencia.dto';
import { UpdateDependenciaDto } from './dto/update-dependencia.dto';
import { DependenciasService } from './dependencias.service';

@Controller('dependencias')
export class DependenciasController {
  constructor(private readonly dependenciasService: DependenciasService) {}

  @Get()
  findAll() {
    return this.dependenciasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.dependenciasService.findOne(id);
  }

  @UseGuards( JwtCookieGuard, RolesGuard)
  @Roles(0)
  @Post()
  create(@Body() data: CreateDependenciaDto) {
    return this.dependenciasService.create(data);
  }

  @UseGuards( JwtCookieGuard, RolesGuard)
  @Roles(0)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateDependenciaDto,
  ) {
    return this.dependenciasService.update(id, data);
  }

  @UseGuards( JwtCookieGuard, RolesGuard)
  @Roles(0)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.dependenciasService.remove(id);
  }
}
