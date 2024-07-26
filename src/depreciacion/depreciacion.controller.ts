import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, BadRequestException, NotFoundException, UsePipes, ValidationPipe } from '@nestjs/common';
import { DepreciacionService } from './depreciacion.service';
import { CreateDepreciacionDto } from './dto/create-depreciacion.dto';
import { UpdateDepreciacionDto } from './dto/update-depreciacion.dto';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('depreciacion')
@Controller('depreciacion')
export class DepreciacionController {
  constructor(private readonly depreciacionService: DepreciacionService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Crear una nueva depreciación' })
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

  @Get()
  @ApiOperation({ summary: 'Obtener todas las depreciaciones' })
  @ApiResponse({ status: 200, description: 'Lista de todas las depreciaciones' })
  async findAll(@Res() res: Response) {
    const depreciaciones = await this.depreciacionService.getDepreciaciones();
    return res.status(HttpStatus.OK).json({
      message: 'Depreciaciones obtenidas exitosamente',
      data: depreciaciones,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una depreciación por ID' })
  @ApiResponse({ status: 200, description: 'La depreciación' })
  @ApiResponse({ status: 404, description: 'Depreciación no encontrada' })
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const depreciacion = await this.depreciacionService.getDepreciacionById(+id);
    if (!depreciacion) {
      throw new NotFoundException('Depreciación no encontrada');
    }
    return res.status(HttpStatus.OK).json({
      message: 'Depreciación obtenida exitosamente',
      data: depreciacion,
    });
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Actualizar una depreciación' })
  @ApiResponse({ status: 200, description: 'La depreciación ha sido actualizada exitosamente' })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  async update(@Param('id') id: string, @Body() updateDepreciacionDto: UpdateDepreciacionDto, @Res() res: Response) {
    try {
      const depreciacion = await this.depreciacionService.updateDepreciacion(+id, updateDepreciacionDto);
      return res.status(HttpStatus.OK).json({
        message: 'Depreciación actualizada exitosamente',
        data: depreciacion,
      });
    } catch (error) {
      throw new BadRequestException(`Error al actualizar la depreciación: ${error.message}`);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una depreciación' })
  @ApiResponse({ status: 200, description: 'La depreciación ha sido eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Depreciación no encontrada' })
  async remove(@Param('id') id: string, @Res() res: Response) {
    try {
      const depreciacion = await this.depreciacionService.deleteDepreciacion(+id);
      return res.status(HttpStatus.OK).json({
        message: 'Depreciación eliminada exitosamente',
        data: depreciacion,
      });
    } catch (error) {
      throw new NotFoundException('Error al eliminar la depreciación');
    }
  }
}
