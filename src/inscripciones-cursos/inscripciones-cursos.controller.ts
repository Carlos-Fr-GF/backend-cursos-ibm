import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
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

  @Get('vista/curso/:idCurso')
  findVistaByCurso(
    @Param('idCurso', ParseIntPipe) idCurso: number,
  ) {
    return this.inscripcionesCursosService.findVistaByCurso(idCurso);
  }

  @Get('vista/nivel/:nivel')
  findVistaByCursoAndNivel(
    @Param('nivel', ParseIntPipe) nivel: number,
    @Query('idCurso', ParseIntPipe) idCurso: number,
  ) {
    return this.inscripcionesCursosService.findVistaByCursoAndNivel(
      idCurso,
      nivel,
    );
  }

  @Get('conteo')
  countByCursoAndNivel(
    @Query('idCurso', ParseIntPipe) idCurso: number,
    @Query('nivel', ParseIntPipe) nivel: number,
  ) {
    return this.inscripcionesCursosService.countByCursoAndNivel(idCurso, nivel);
  }

  @Get('cupos')
  getCapacityByCursoAndNivel(
    @Query('idCurso', ParseIntPipe) idCurso: number,
    @Query('nivel', ParseIntPipe) nivel: number,
  ) {
    return this.inscripcionesCursosService.getCapacityByCursoAndNivel(
      idCurso,
      nivel,
    );
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
