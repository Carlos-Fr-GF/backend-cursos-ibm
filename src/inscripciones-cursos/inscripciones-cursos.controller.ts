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
import { CreateInscripcionCursoDto } from './dto/create-inscripcion-curso.dto';
import { UpdateInscripcionCursoDto } from './dto/update-inscripcion-curso.dto';
import { InscripcionesCursosService } from './inscripciones-cursos.service';

@Controller('inscripciones-cursos')
export class InscripcionesCursosController {
  constructor(
    private readonly inscripcionesCursosService: InscripcionesCursosService,
  ) {}

  // @UseGuards( JwtCookieGuard, RolesGuard)
  // @Roles(0)
  @Get()
  findAll() {
    return this.inscripcionesCursosService.findAll();
  }

  // @UseGuards(JwtCookieGuard, RolesGuard)
  // @Roles(0)
  @Get('vista')
  findAllVista() {
    return this.inscripcionesCursosService.findAllVista();
  }

  // @UseGuards( JwtCookieGuard, RolesGuard)
  // @Roles(0)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.inscripcionesCursosService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateInscripcionCursoDto) {
    return this.inscripcionesCursosService.create(data);
  }

  // @UseGuards( JwtCookieGuard, RolesGuard)
  // @Roles(0)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateInscripcionCursoDto,
  ) {
    return this.inscripcionesCursosService.update(id, data);
  }

  // @UseGuards( JwtCookieGuard, RolesGuard)
  // @Roles(0)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.inscripcionesCursosService.remove(id);
  }
}
