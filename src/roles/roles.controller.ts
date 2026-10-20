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
import { Roles as AllowRoles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { CreateRolDto } from './dto/create-rol.dto';
import { UpdateRolDto } from './dto/update-rol.dto';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @UseGuards(JwtCookieGuard, RolesGuard)
  @AllowRoles(0)
  @Post()
  create(@Body() data: CreateRolDto) {
    return this.rolesService.create(data);
  }

  @UseGuards(JwtCookieGuard, RolesGuard)
  @AllowRoles(0)
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateRolDto) {
    return this.rolesService.update(id, data);
  }

  @UseGuards(JwtCookieGuard, RolesGuard)
  @AllowRoles(0)
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }
}
