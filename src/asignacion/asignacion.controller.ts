import { Controller, Get, Post, Body, Param, Res, HttpStatus, BadRequestException, NotFoundException, UsePipes, ValidationPipe } from '@nestjs/common';
import { AsignacionService } from './asignacion.service';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
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
      await this.asignacionService.createAsignacion(createAsignacionDto);
      return res.status(HttpStatus.CREATED).json({
        message: 'Asignación creada exitosamente',
      });
    } catch (error) {
      throw new BadRequestException(`Error al crear la asignación: ${error.message}`);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las asignaciones' })
  @ApiResponse({ status: 200, description: 'Lista de todas las asignaciones' })
  async findAll(@Res() res: Response) {
    try {
      const asignaciones = await this.asignacionService.getAsignaciones();
      return res.status(HttpStatus.OK).json({
        message: 'Asignaciones obtenidas exitosamente',
        data: asignaciones,
      });
    } catch (error) {
      throw new BadRequestException(`Error al obtener las asignaciones: ${error.message}`);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una asignación por ID' })
  @ApiResponse({ status: 200, description: 'La asignación' })
  @ApiResponse({ status: 404, description: 'Asignación no encontrada' })
  async findOne(@Param('id') id: string, @Res() res: Response) {
    try {
      const asignacion = await this.asignacionService.getAsignacionById(+id);
      if (!asignacion) {
        throw new NotFoundException('Asignación no encontrada');
      }
      return res.status(HttpStatus.OK).json({
        message: 'Asignación obtenida exitosamente',
        data: asignacion,
      });
    } catch (error) {
      throw new BadRequestException(`Error al obtener la asignación: ${error.message}`);
    }
  }
}
