// src/reasignacion/reasignacion.controller.ts
import { Controller, Get, Post, Body, Param, Put, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { ReasignacionService } from './reasignacion.service';
import { CreateReasignacionDto } from './dto/create-reasignacion.dto';
import { UpdateReasignacionDto } from './dto/update-reasignacion.dto';

@Controller('reasignacion')
export class ReasignacionController {
  constructor(private readonly reasignacionService: ReasignacionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createReasignacionDto: CreateReasignacionDto) {
    await this.reasignacionService.reasignarActivo(createReasignacionDto);
    return { message: 'Reasignación creada exitosamente.' };
  }

  @Get()
  async findAll() {
    const reasignaciones = await this.reasignacionService.getReasignaciones();
    return { message: 'Lista de reasignaciones obtenida exitosamente.', data: reasignaciones };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const reasignacion = await this.reasignacionService.getReasignacionById(+id);
    return { message: `Reasignación con ID ${id} obtenida exitosamente.`, data: reasignacion };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateReasignacionDto: UpdateReasignacionDto) {
    const reasignacion = await this.reasignacionService.updateReasignacion(+id, updateReasignacionDto);
    return { message: `Reasignación con ID ${id} actualizada exitosamente.`, data: reasignacion };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.reasignacionService.deleteReasignacion(+id);
  }
}
