import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, BadRequestException, NotFoundException, UsePipes, ValidationPipe } from '@nestjs/common';
import { ActivoUnidadService } from './activo-unidad.service';
import { CreateActivoUnidadDto } from './dto/create-activo-unidad.dto';
import { UpdateActivoUnidadDto } from './dto/update-activo-unidad.dto';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('activo-unidad')
@Controller('activo-unidad')
export class ActivoUnidadController {
  constructor(private readonly activoUnidadService: ActivoUnidadService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Create a new activo unidad' })
  @ApiResponse({ status: 201, description: 'The activo unidad has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async create(@Body() createActivoUnidadDto: CreateActivoUnidadDto, @Res() res: Response) {
    try {
      const activoUnidad = await this.activoUnidadService.createActivoUnidad(createActivoUnidadDto);
      return res.status(HttpStatus.CREATED).json({
        message: 'Activo Unidad created successfully',
        data: activoUnidad,
      });
    } catch (error) {
      throw new BadRequestException(`Error creating activo unidad: ${error.message}`);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all activos unidad' })
  @ApiResponse({ status: 200, description: 'List of all activos unidad' })
  async findAll(@Res() res: Response) {
    const activosUnidad = await this.activoUnidadService.getActivosUnidad();
    return res.status(HttpStatus.OK).json({
      message: 'Activos Unidad retrieved successfully',
      data: activosUnidad,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an activo unidad by ID' })
  @ApiResponse({ status: 200, description: 'The activo unidad' })
  @ApiResponse({ status: 404, description: 'Activo unidad not found' })
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const activoUnidad = await this.activoUnidadService.getActivoUnidadById(+id);
    if (!activoUnidad) {
      throw new NotFoundException('Activo unidad not found');
    }
    return res.status(HttpStatus.OK).json({
      message: 'Activo Unidad retrieved successfully',
      data: activoUnidad,
    });
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Update an activo unidad' })
  @ApiResponse({ status: 200, description: 'The activo unidad has been successfully updated' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  async update(@Param('id') id: string, @Body() updateActivoUnidadDto: UpdateActivoUnidadDto, @Res() res: Response) {
    try {
      const activoUnidad = await this.activoUnidadService.updateActivoUnidad(+id, updateActivoUnidadDto);
      return res.status(HttpStatus.OK).json({
        message: 'Activo Unidad updated successfully',
        data: activoUnidad,
      });
    } catch (error) {
      throw new BadRequestException(`Error updating activo unidad: ${error.message}`);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an activo unidad' })
  @ApiResponse({ status: 200, description: 'The activo unidad has been successfully deleted' })
  @ApiResponse({ status: 404, description: 'Activo unidad not found' })
  async remove(@Param('id') id: string, @Res() res: Response) {
    try {
      const activoUnidad = await this.activoUnidadService.deleteActivoUnidad(+id);
      return res.status(HttpStatus.OK).json({
        message: 'Activo Unidad deleted successfully',
        data: activoUnidad,
      });
    } catch (error) {
      throw new NotFoundException('Error deleting activo unidad');
    }
  }
}
