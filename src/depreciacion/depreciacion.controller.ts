import { Controller, Get, Post, Body, Param, Res, HttpStatus, BadRequestException, UsePipes, ValidationPipe, NotFoundException } from '@nestjs/common';
import { DepreciacionService } from './depreciacion.service';
import { CreateDepreciacionDto } from './dto/create-depreciacion.dto';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('depreciacion')
@Controller('depreciacion')
export class DepreciacionController {
  constructor(private readonly depreciacionService: DepreciacionService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Crear una nueva depreciación específica' })
  @ApiResponse({ status: 201, description: 'La depreciación ha sido creada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  async create(@Body() createDepreciacionDto: CreateDepreciacionDto, @Res() res: Response) {
    try {
      const depreciacion = await this.depreciacionService.createDepreciacion(createDepreciacionDto);
      return res.status(HttpStatus.CREATED).json({
        message: 'Depreciación creada exitosamente',
        data: depreciacion,
      });
    } catch (error) {
      throw new BadRequestException(`Error al crear la depreciación: ${error.message}`);
    }
  }

  @Post('depreciar-todos-anual')
  @ApiOperation({ summary: 'Depreciar todos los activos automáticamente al final del año' })
  @ApiResponse({ status: 201, description: 'Depreciación anual realizada exitosamente.' })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  async depreciarTodosAnual(@Res() res: Response) {
    try {
      await this.depreciacionService.depreciarTodosActivosAnualmente();
      return res.status(HttpStatus.CREATED).json({
        message: 'Depreciación anual realizada exitosamente.',
      });
    } catch (error) {
      throw new BadRequestException(`Error al realizar la depreciación anual: ${error.message}`);
    }
  }

  @Get('por-ano/:año')
  @ApiOperation({ summary: 'Obtener depreciaciones para un año específico' })
  @ApiResponse({ status: 200, description: 'Depreciaciones obtenidas exitosamente.' })
  @ApiResponse({ status: 404, description: 'Depreciaciones no encontradas.' })
  async obtenerDepreciacionesPorAño(@Param('año') año: number, @Res() res: Response) {
    try {
      const depreciaciones = await this.depreciacionService.obtenerDepreciacionesPorAño(año);
      if (!depreciaciones || depreciaciones.length === 0) {
        throw new NotFoundException(`No se encontraron depreciaciones para el año ${año}`);
      }
      return res.status(HttpStatus.OK).json({
        message: `Depreciaciones para el año ${año} obtenidas exitosamente`,
        data: depreciaciones,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(`Error al obtener las depreciaciones: ${error.message}`);
    }
  }
}
