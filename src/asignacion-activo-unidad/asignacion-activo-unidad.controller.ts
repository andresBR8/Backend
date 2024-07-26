import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, BadRequestException, NotFoundException, UsePipes, ValidationPipe } from '@nestjs/common';
import { AsignacionActivoUnidadService } from './asignacion-activo-unidad.service';
import { CreateAsignacionActivoUnidadDto } from './dto/create-asignacion-activo-unidad.dto';
import { UpdateAsignacionActivoUnidadDto } from './dto/update-asignacion-activo-unidad.dto';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('asignacion-activo-unidad')
@Controller('asignacion-activo-unidad')
export class AsignacionActivoUnidadController {
  constructor(private readonly asignacionActivoUnidadService: AsignacionActivoUnidadService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Crear una nueva asignación de activo unidad' })
  @ApiResponse({ status: 201, description: 'La asignación de activo unidad ha sido creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  async create(@Body() createAsignacionActivoUnidadDto: CreateAsignacionActivoUnidadDto, @Res() res: Response) {
    try {
      const asignacionActivoUnidad = await this.asignacionActivoUnidadService.createAsignacionActivoUnidad(createAsignacionActivoUnidadDto);
      return res.status(HttpStatus.CREATED).json({
        message: 'Asignación de activo unidad creada exitosamente',
        data: asignacionActivoUnidad,
      });
    } catch (error) {
      throw new BadRequestException(`Error al crear la asignación de activo unidad: ${error.message}`);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las asignaciones de activo unidad' })
  @ApiResponse({ status: 200, description: 'Lista de todas las asignaciones de activo unidad' })
  async findAll(@Res() res: Response) {
    const asignacionesActivoUnidad = await this.asignacionActivoUnidadService.getAsignacionesActivoUnidad();
    return res.status(HttpStatus.OK).json({
      message: 'Asignaciones de activo unidad obtenidas exitosamente',
      data: asignacionesActivoUnidad,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una asignación de activo unidad por ID' })
  @ApiResponse({ status: 200, description: 'La asignación de activo unidad' })
  @ApiResponse({ status: 404, description: 'Asignación de activo unidad no encontrada' })
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const asignacionActivoUnidad = await this.asignacionActivoUnidadService.getAsignacionActivoUnidadById(+id);
    if (!asignacionActivoUnidad) {
      throw new NotFoundException('Asignación de activo unidad no encontrada');
    }
    return res.status(HttpStatus.OK).json({
      message: 'Asignación de activo unidad obtenida exitosamente',
      data: asignacionActivoUnidad,
    });
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Actualizar una asignación de activo unidad' })
  @ApiResponse({ status: 200, description: 'La asignación de activo unidad ha sido actualizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  async update(@Param('id') id: string, @Body() updateAsignacionActivoUnidadDto: UpdateAsignacionActivoUnidadDto, @Res() res: Response) {
    try {
      const asignacionActivoUnidad = await this.asignacionActivoUnidadService.updateAsignacionActivoUnidad(+id, updateAsignacionActivoUnidadDto);
      return res.status(HttpStatus.OK).json({
        message: 'Asignación de activo unidad actualizada exitosamente',
        data: asignacionActivoUnidad,
      });
    } catch (error) {
      throw new BadRequestException(`Error al actualizar la asignación de activo unidad: ${error.message}`);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una asignación de activo unidad' })
  @ApiResponse({ status: 200, description: 'La asignación de activo unidad ha sido eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Asignación de activo unidad no encontrada' })
  async remove(@Param('id') id: string, @Res() res: Response) {
    try {
      const asignacionActivoUnidad = await this.asignacionActivoUnidadService.deleteAsignacionActivoUnidad(+id);
      return res.status(HttpStatus.OK).json({
        message: 'Asignación de activo unidad eliminada exitosamente',
        data: asignacionActivoUnidad,
      });
    } catch (error) {
      throw new NotFoundException('Error al eliminar la asignación de activo unidad');
    }
  }
}
