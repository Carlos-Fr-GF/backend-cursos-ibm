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
import { CreateNivelDto } from './dto/create-nivel.dto';
import { UpdateNivelDto } from './dto/update-nivel.dto';
import { NivelesService } from './niveles.service';

@Controller('niveles')
export class NivelesController {
  constructor(private readonly nivelesService: NivelesService) {}

  @Get()
  findAll() {
    return this.nivelesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.nivelesService.findOne(id);
  }

  @UseGuards( JwtCookieGuard, RolesGuard)
  @Roles(0)
  @Post()
  create(@Body() data: CreateNivelDto) {
    return this.nivelesService.create(data);
  }

  @UseGuards( JwtCookieGuard, RolesGuard)
  @Roles(0)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateNivelDto) {
    return this.nivelesService.update(id, data);
  }

  @UseGuards( JwtCookieGuard, RolesGuard)
  @Roles(0)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.nivelesService.remove(id);
  }
}
