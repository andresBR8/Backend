import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, BadRequestException, NotFoundException, UsePipes, ValidationPipe } from '@nestjs/common';
import { AsignacionService } from './asignacion.service';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { UpdateAsignacionDto } from './dto/update-asignacion.dto';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('asignacion')
@Controller('asignacion')
export class AsignacionController {
  constructor(private readonly asignacionService: AsignacionService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Crear una nueva asignación' })
  @ApiResponse({ status: 201, description: 'La asignación ha sido creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  async create(@Body() createAsignacionDto: CreateAsignacionDto, @Res() res: Response) {
    try {
      const asignacion = await this.asignacionService.createAsignacion(createAsignacionDto);
      return res.status(HttpStatus.CREATED).json({
        message: 'Asignación creada exitosamente',
        data: asignacion,
      });
    } catch (error) {
      throw new BadRequestException(`Error al crear la asignación: ${error.message}`);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las asignaciones' })
  @ApiResponse({ status: 200, description: 'Lista de todas las asignaciones' })
  async findAll(@Res() res: Response) {
    const asignaciones = await this.asignacionService.getAsignaciones();
    return res.status(HttpStatus.OK).json({
      message: 'Asignaciones obtenidas exitosamente',
      data: asignaciones,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una asignación por ID' })
  @ApiResponse({ status: 200, description: 'La asignación' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const asignacion = await this.asignacionService.getAsignacionById(+id);
    if (!asignacion) {
      throw new NotFoundException('Asignación no encontrada');
    }
    return res.status(HttpStatus.OK).json({
      message: 'Asignación obtenida exitosamente',
      data: asignacion,
    });
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Actualizar una asignación' })
  @ApiResponse({ status: 200, description: 'La asignación ha sido actualizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  async update(@Param('id') id: string, @Body() updateAsignacionDto: UpdateAsignacionDto, @Res() res: Response) {
    try {
      const asignacion = await this.asignacionService.updateAsignacion(+id, updateAsignacionDto);
      return res.status(HttpStatus.OK).json({
        message: 'Asignación actualizada exitosamente',
        data: asignacion,
      });
    } catch (error) {
      throw new BadRequestException(`Error al actualizar la asignación: ${error.message}`);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una asignación' })
  @ApiResponse({ status: 200, description: 'La asignación ha sido eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  async remove(@Param('id') id: string, @Res() res: Response) {
    try {
      const asignacion = await this.asignacionService.deleteAsignacion(+id);
      return res.status(HttpStatus.OK).json({
        message: 'Asignación eliminada exitosamente',
        data: asignacion,
      });
    } catch (error) {
      throw new NotFoundException('Error al eliminar la asignación');
    }
  }
}
