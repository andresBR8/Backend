import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Res,
  HttpStatus,
  BadRequestException,
  NotFoundException,
  UsePipes,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { DevolucionService } from './devolucion.service';
import { CreateDevolucionDto } from './dto/create-devolucion.dto';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('devolucion')
@Controller('devolucion')
export class DevolucionController {
  constructor(private readonly devolucionService: DevolucionService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOperation({ summary: 'Crear una nueva devolución' })
  @ApiResponse({
    status: 201,
    description: 'La devolución ha sido creada exitosamente.',
  })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta' })
  async create(
    @Body() createDevolucionDto: CreateDevolucionDto,
    @Res() res: Response,
  ) {
    try {
      await this.devolucionService.createDevolucion(createDevolucionDto);
      return res.status(HttpStatus.CREATED).json({
        message: 'Devolución creada exitosamente',
      });
    } catch (error) {
      throw new BadRequestException(
        `Error al crear la devolución: ${error.message}`,
      );
    }
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las devoluciones' })
  @ApiResponse({ status: 200, description: 'Lista de todas las devoluciones' })
  async findAll(@Res() res: Response) {
    try {
      const devoluciones = await this.devolucionService.getDevoluciones();
      return res.status(HttpStatus.OK).json({
        message: 'Devoluciones obtenidas exitosamente',
        data: devoluciones,
      });
    } catch (error) {
      throw new BadRequestException(
        `Error al obtener las devoluciones: ${error.message}`,
      );
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una devolución por ID' })
  @ApiResponse({ status: 200, description: 'La devolución' })
  @ApiResponse({ status: 404, description: 'Devolución no encontrada' })
  async findOne(@Param('id') id: string, @Res() res: Response) {
    try {
      const devolucion = await this.devolucionService.getDevolucionById(+id);
      if (!devolucion) {
        throw new NotFoundException('Devolución no encontrada');
      }
      return res.status(HttpStatus.OK).json({
        message: 'Devolución obtenida exitosamente',
        data: devolucion,
      });
    } catch (error) {
      throw new BadRequestException(
        `Error al obtener la devolución: ${error.message}`,
      );
    }
  }

  @Get('activos/:fkPersonal')
  @ApiOperation({
    summary: 'Obtener activos actualmente asignados a un personal',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de activos actualmente asignados al personal',
  })
  async getActivosByPersonal(
    @Param('fkPersonal') fkPersonal: number,
    @Res() res: Response,
  ) {
    try {
      const activos =
        await this.devolucionService.getActivosByPersonal(fkPersonal);
      return res.status(HttpStatus.OK).json({
        message: 'Activos obtenidos exitosamente',
        data: activos,
      });
    } catch (error) {
      throw new BadRequestException(
        `Error al obtener los activos: ${error.message}`,
      );
    }
  }
}
