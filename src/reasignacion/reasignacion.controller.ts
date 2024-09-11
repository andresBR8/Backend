import { Controller, Get, Post, Body, Param, Delete, HttpCode, HttpStatus, BadRequestException, NotFoundException } from '@nestjs/common';
import { ReasignacionService } from './reasignacion.service';
import { CreateReasignacionDto } from './dto/create-reasignacion.dto';
import { UpdateReasignacionDto } from './dto/update-reasignacion.dto';

@Controller('reasignacion')
export class ReasignacionController {
  constructor(private readonly reasignacionService: ReasignacionService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createReasignacionDto: CreateReasignacionDto) {
    try {
      await this.reasignacionService.reasignarActivo(createReasignacionDto);
      return { message: 'Reasignación creada exitosamente.' };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Error al crear la reasignación.');
    }
  }

  @Get()
  async findAll() {
    const reasignaciones = await this.reasignacionService.getReasignaciones();
    return { message: 'Lista de reasignaciones obtenida exitosamente.', data: reasignaciones };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const reasignacion = await this.reasignacionService.getReasignacionById(+id);
      return { message: `Reasignación con ID ${id} obtenida exitosamente.`, data: reasignacion };
    } catch (error) {
      throw new NotFoundException(`Reasignación con ID ${id} no encontrada.`);
    }
  }

  @Get('ultima-asignacion/:fkActivoUnidad')
  async findUltimaAsignacion(@Param('fkActivoUnidad') fkActivoUnidad: number) {
    try {
      const ultimaAsignacion = await this.reasignacionService.getUltimaAsignacion(fkActivoUnidad);
      return { message: 'Última asignación obtenida exitosamente.', data: ultimaAsignacion };
    } catch (error) {
      throw new NotFoundException(`No se encontró una asignación anterior para la unidad de activo con ID ${fkActivoUnidad}.`);
    }
  }

  
}
