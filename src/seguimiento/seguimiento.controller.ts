import { Controller, Get, Param } from '@nestjs/common';
import { SeguimientoService } from './seguimiento.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('seguimiento')
@Controller('seguimiento')
export class SeguimientoController {
  constructor(private readonly seguimientoService: SeguimientoService) {}

  @Get(':fkActivoUnidad')
  @ApiOperation({ summary: 'Obtener el seguimiento completo de un activo' })
  @ApiResponse({ status: 200, description: 'Seguimiento obtenido exitosamente.' })
  @ApiResponse({ status: 404, description: 'Activo no encontrado.' })
  async obtenerSeguimientoActivo(@Param('fkActivoUnidad') fkActivoUnidad: number) {
    return this.seguimientoService.obtenerSeguimientoActivo(fkActivoUnidad);
  }
}
