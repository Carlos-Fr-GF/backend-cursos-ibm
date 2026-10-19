import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { JwtCookieGuard } from '../auth/jwt-cookie.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateAsignacionCursoDto } from './dto/create-asignacion-curso.dto';
import { UpdateAsignacionCursoDto } from './dto/update-asignacion-curso.dto';
import { AsignacionesCursosService } from './asignaciones-cursos.service';

@Controller('asignaciones-cursos')
export class AsignacionesCursosController {
  constructor(
    private readonly asignacionesCursosService: AsignacionesCursosService,
  ) {}

  // @UseGuards( JwtCookieGuard, RolesGuard)
  // @Roles(0)
  @Get()
  findAll() {
    return this.asignacionesCursosService.findAll();
  }

  @Get('cupos-por-nivel')
  findCuposPorNivel() {
    return this.asignacionesCursosService.findCuposPorNivel();
  }

  @Get('cupos-por-subnivel')
  findCuposPorSubnivel() {
    return this.asignacionesCursosService.findCuposPorSubnivel();
  }

  // @UseGuards( JwtCookieGuard, RolesGuard)
  // @Roles(0)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.asignacionesCursosService.findOne(id);
  }

  // @UseGuards( JwtCookieGuard, RolesGuard)
  // @Roles(0)
  @Post()
  create(@Body() data: CreateAsignacionCursoDto) {
    return this.asignacionesCursosService.create(data);
  }

  // @UseGuards( JwtCookieGuard, RolesGuard)
  // @Roles(0)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateAsignacionCursoDto,
  ) {
    return this.asignacionesCursosService.update(id, data);
  }

  // @UseGuards( JwtCookieGuard, RolesGuard)
  // @Roles(0)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.asignacionesCursosService.remove(id);
  }
}
