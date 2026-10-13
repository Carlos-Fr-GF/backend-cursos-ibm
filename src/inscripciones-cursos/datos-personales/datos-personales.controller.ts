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

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.datosPersonalesService.findOne(id);
  }

  @Post()
  create(@Body() data: CreateDatoPersonalDto) {
    return this.datosPersonalesService.create(data);
  }

  // @UseGuards( JwtCookieGuard, RolesGuard)
  // @Roles(0)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateDatoPersonalDto,
  ) {
    return this.datosPersonalesService.update(id, data);
  }

  // @UseGuards( JwtCookieGuard, RolesGuard)
  // @Roles(0)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.datosPersonalesService.remove(id);
  }
}
