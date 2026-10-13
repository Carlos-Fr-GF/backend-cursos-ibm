import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  NotFoundException,
  UseGuards,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { UsuariosService } from './usuarios.service';
import { JwtCookieGuard } from '../auth/jwt-cookie.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import type { AuthenticatedRequest } from '../auth/request-user';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

// @UseGuards(JwtCookieGuard)
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  // @UseGuards(JwtCookieGuard, RolesGuard)
  // @Roles(0)
  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  // @UseGuards(JwtCookieGuard, RolesGuard)
  // @Roles(0)
  @Get('correo/:correo')
  async findByCorreo(@Param('correo') correo: string) {
    const usuario = await this.usuariosService.findByCorreo(correo);
    if (!usuario) {
      throw new NotFoundException(
        `Usuario con el correo '${correo}' no encontrado`,
      );
    }
    return usuario;
  }

  // @UseGuards(JwtCookieGuard, RolesGuard)
  // @Roles(0)
  @Post()
  create(@Body() data: CreateUsuarioDto) {
    return this.usuariosService.create(data);
  }

  // @UseGuards(JwtCookieGuard, RolesGuard)
  // @Roles(0)
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateUsuarioDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.usuariosService.update(id, data, req.user!.sub);
  }

  // @UseGuards(JwtCookieGuard, RolesGuard)
  // @Roles(0)
  @Patch(':id/activar')
  activate(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.activate(id);
  }

  // @UseGuards(JwtCookieGuard, RolesGuard)
  // @Roles(0)
  @Patch(':id/desactivar')
  deactivate(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.usuariosService.deactivate(id, req.user!.sub);
  }

  // @UseGuards(JwtCookieGuard, RolesGuard)
  // @Roles(0)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.remove(id);
  }
}
