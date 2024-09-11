import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { EstadoActivoService } from './estado-activo.service';
import { CreateEstadoActivoDto } from './dto/create-estado-activo.dto';
import { EstadoActivo } from '@prisma/client';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('estado-activo')
@Controller('estado-activo')
export class EstadoActivoController {
  constructor(private readonly estadoActivoService: EstadoActivoService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar un cambio en el estado de condición de un activo' })
  @ApiResponse({ status: 201, description: 'El cambio de estado ha sido registrado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Solicitud incorrecta.' })
  async create(@Body() createEstadoActivoDto: CreateEstadoActivoDto): Promise<EstadoActivo> {
    return this.estadoActivoService.createEstadoActivo(createEstadoActivoDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un estado activo por su ID' })
  @ApiResponse({ status: 200, description: 'Estado activo obtenido exitosamente.' })
  @ApiResponse({ status: 404, description: 'Estado activo no encontrado.' })
  async getEstadoActivoById(@Param('id') id: number): Promise<EstadoActivo | null> {
    return this.estadoActivoService.getEstadoActivoById(id);
  }

  @Get('activo-unidad/:fkActivoUnidad')
  @ApiOperation({ summary: 'Obtener todos los estados de un activo por su ID' })
  @ApiResponse({ status: 200, description: 'Estados obtenidos exitosamente.' })
  async getEstadosActivosByActivoUnidad(@Param('fkActivoUnidad') fkActivoUnidad: number): Promise<EstadoActivo[]> {
    return this.estadoActivoService.getEstadosActivosByActivoUnidad(fkActivoUnidad);
  }
}
