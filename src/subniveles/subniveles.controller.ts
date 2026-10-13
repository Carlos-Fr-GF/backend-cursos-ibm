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
import { CreateSubnivelDto } from './dto/create-subnivel.dto';
import { UpdateSubnivelDto } from './dto/update-subnivel.dto';
import { SubnivelesService } from './subniveles.service';

@Controller('subniveles')
export class SubnivelesController {
  constructor(private readonly subnivelesService: SubnivelesService) {}

  @Get()
  findAll() {
    return this.subnivelesService.findAll();
  }

  @Get('nivel/:idNivel')
  findByNivelVista(@Param('idNivel', ParseIntPipe) idNivel: number) {
    return this.subnivelesService.findByNivelVista(idNivel);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.subnivelesService.findOne(id);
  }

  // @UseGuards(JwtCookieGuard, RolesGuard)
  // @Roles(0)
  @Post()
  create(@Body() data: CreateSubnivelDto) {
    return this.subnivelesService.create(data);
  }

  // @UseGuards(JwtCookieGuard, RolesGuard)
  // @Roles(0)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateSubnivelDto,
  ) {
    return this.subnivelesService.update(id, data);
  }

  // @UseGuards(JwtCookieGuard, RolesGuard)
  // @Roles(0)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.subnivelesService.remove(id);
  }
}
