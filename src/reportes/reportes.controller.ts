import { Controller, Get, Query, Res, HttpStatus, BadRequestException, Param } from '@nestjs/common';
import { ReportService } from './reportes.service';
import { Response } from 'express';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('reportes')
@Controller('reportes')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}
  
  // Endpoint para obtener el seguimiento completo de una unidad de activo por ID
  @Get('seguimiento-activo/:id')
  @ApiOperation({ summary: 'Obtener el seguimiento completo de una unidad de activo' })
  @ApiResponse({ status: 200, description: 'Seguimiento completo de la unidad de activo' })
  async getSeguimientoActivo(@Param('id') id: number, @Res() res: Response) {
    try {
      if (isNaN(id)) {
        throw new BadRequestException('El id de la unidad de activo no es válido');
      }

      const seguimiento = await this.reportService.getSeguimientoActivo(id);
      return res.status(HttpStatus.OK).json({
        message: 'Seguimiento de activo obtenido exitosamente',
        data: seguimiento,
      });
    } catch (error) {
      throw new BadRequestException(`Error al obtener el seguimiento del activo: ${error.message}`);
    }
  }

  @Get('activos-por-modelo')
  @ApiOperation({ summary: 'Obtener activos por modelo' })
  @ApiResponse({ status: 200, description: 'Lista de activos por modelo' })
  async getActivosPorModelo(@Query('fkActivoModelo') fkActivoModelo: number, @Res() res: Response) {
    try {
      const activos = await this.reportService.getActivosPorModelo(fkActivoModelo);
      return res.status(HttpStatus.OK).json({
        message: 'Activos por modelo obtenidos exitosamente',
        data: activos,
      });
    } catch (error) {
      throw new BadRequestException(`Error al obtener los activos por modelo: ${error.message}`);
    }
  }

  @Get('activos-por-partida')
  @ApiOperation({ summary: 'Obtener activos por partida' })
  @ApiResponse({ status: 200, description: 'Lista de activos por partida' })
  async getActivosPorPartida(@Query('fkPartida') fkPartida: number, @Res() res: Response) {
    try {
      if (isNaN(fkPartida)) {
        throw new BadRequestException('El id de la partida no es válido');
      }

      const activos = await this.reportService.getActivosPorPartida(fkPartida);
      return res.status(HttpStatus.OK).json({
        message: 'Activos por partida obtenidos exitosamente',
        data: activos,
      });
    } catch (error) {
      throw new BadRequestException(`Error al obtener los activos por partida: ${error.message}`);
    }
  }

  @Get('depreciaciones-por-rango-fechas')
  @ApiOperation({ summary: 'Obtener depreciaciones por rango de fechas' })
  @ApiResponse({ status: 200, description: 'Lista de depreciaciones por rango de fechas' })
  async getDepreciacionesPorRangoFechas(@Query('fechaInicio') fechaInicio: string, @Query('fechaFin') fechaFin: string, @Res() res: Response) {
    try {
      const depreciaciones = await this.reportService.getDepreciacionesPorRangoFechas(fechaInicio, fechaFin);
      return res.status(HttpStatus.OK).json({
        message: 'Depreciaciones obtenidas exitosamente',
        data: depreciaciones,
      });
    } catch (error) {
      throw new BadRequestException(`Error al obtener las depreciaciones: ${error.message}`);
    }
  }

  @Get('bajas-por-rango-fechas')
  @ApiOperation({ summary: 'Obtener bajas por rango de fechas' })
  @ApiResponse({ status: 200, description: 'Lista de bajas por rango de fechas' })
  async getBajasPorRangoFechas(@Query('fechaInicio') fechaInicio: string, @Query('fechaFin') fechaFin: string, @Res() res: Response) {
    try {
      const bajas = await this.reportService.getBajasPorRangoFechas(fechaInicio, fechaFin);
      return res.status(HttpStatus.OK).json({
        message: 'Bajas obtenidas exitosamente',
        data: bajas,
      });
    } catch (error) {
      throw new BadRequestException(`Error al obtener las bajas: ${error.message}`);
    }
  }

  @Get('mantenimientos-por-rango-fechas')
  @ApiOperation({ summary: 'Obtener mantenimientos por rango de fechas' })
  @ApiResponse({ status: 200, description: 'Lista de mantenimientos por rango de fechas' })
  async getMantenimientosPorRangoFechas(@Query('fechaInicio') fechaInicio: string, @Query('fechaFin') fechaFin: string, @Res() res: Response) {
    try {
      const mantenimientos = await this.reportService.getMantenimientosPorRangoFechas(fechaInicio, fechaFin);
      return res.status(HttpStatus.OK).json({
        message: 'Mantenimientos obtenidos exitosamente',
        data: mantenimientos,
      });
    } catch (error) {
      throw new BadRequestException(`Error al obtener los mantenimientos: ${error.message}`);
    }
  }

  @Get('activos-por-estado')
  @ApiOperation({ summary: 'Obtener activos por estado' })
  @ApiResponse({ status: 200, description: 'Lista de activos por estado' })
  async getActivosPorEstado(@Query('estado') estado: string, @Res() res: Response) {
    try {
      const activos = await this.reportService.getActivosPorEstado(estado);
      return res.status(HttpStatus.OK).json({
        message: 'Activos por estado obtenidos exitosamente',
        data: activos,
      });
    } catch (error) {
      throw new BadRequestException(`Error al obtener los activos por estado: ${error.message}`);
    }
  }

  @Get('reporte-general-activos')
  @ApiOperation({ summary: 'Obtener reporte general de activos' })
  @ApiResponse({ status: 200, description: 'Reporte general de activos' })
  async getReporteGeneralActivos(@Res() res: Response) {
    try {
      const reporte = await this.reportService.getReporteGeneralActivos();
      return res.status(HttpStatus.OK).json({
        message: 'Reporte general de activos obtenido exitosamente',
        data: reporte,
      });
    } catch (error) {
      throw new BadRequestException(`Error al obtener el reporte general de activos: ${error.message}`);
    }
  }

  @Get('export-csv')
  @ApiOperation({ summary: 'Exportar reporte a CSV' })
  @ApiResponse({ status: 200, description: 'Reporte exportado a CSV' })
  async exportReporteCSV(@Query() query: any, @Res() res: Response) {
    try {
      let data;
      switch (query.tipo) {
        case 'activos-por-modelo':
          data = await this.reportService.getActivosPorModelo(Number(query.fkActivoModelo));
          break;
        case 'activos-por-partida':
          data = await this.reportService.getActivosPorPartida(Number(query.fkPartida));
          break;
        case 'depreciaciones-por-rango-fechas':
          data = await this.reportService.getDepreciacionesPorRangoFechas(query.fechaInicio, query.fechaFin);
          break;
        case 'bajas-por-rango-fechas':
          data = await this.reportService.getBajasPorRangoFechas(query.fechaInicio, query.fechaFin);
          break;
        case 'mantenimientos-por-rango-fechas':
          data = await this.reportService.getMantenimientosPorRangoFechas(query.fechaInicio, query.fechaFin);
          break;
        case 'activos-por-estado':
          data = await this.reportService.getActivosPorEstado(query.estado);
          break;
        case 'reporte-general-activos':
          data = await this.reportService.getReporteGeneralActivos();
          break;
        default:
          throw new BadRequestException('Tipo de reporte no válido');
      }

      await this.reportService.exportReporteCSV(data, 'reporte.csv');
      res.download('reporte.csv');
    } catch (error) {
      throw new BadRequestException(`Error al exportar el reporte: ${error.message}`);
    }
  }

  @Get('export-pdf')
  @ApiOperation({ summary: 'Exportar reporte a PDF' })
  @ApiResponse({ status: 200, description: 'Reporte exportado a PDF' })
  async exportReportePDF(@Query() query: any, @Res() res: Response) {
    try {
      let data;
      switch (query.tipo) {
        case 'activos-por-modelo':
          data = await this.reportService.getActivosPorModelo(Number(query.fkActivoModelo));
          break;
        case 'activos-por-partida':
          data = await this.reportService.getActivosPorPartida(Number(query.fkPartida));
          break;
        case 'depreciaciones-por-rango-fechas':
          data = await this.reportService.getDepreciacionesPorRangoFechas(query.fechaInicio, query.fechaFin);
          break;
        case 'bajas-por-rango-fechas':
          data = await this.reportService.getBajasPorRangoFechas(query.fechaInicio, query.fechaFin);
          break;
        case 'mantenimientos-por-rango-fechas':
          data = await this.reportService.getMantenimientosPorRangoFechas(query.fechaInicio, query.fechaFin);
          break;
        case 'activos-por-estado':
          data = await this.reportService.getActivosPorEstado(query.estado);
          break;
        case 'reporte-general-activos':
          data = await this.reportService.getReporteGeneralActivos();
          break;
        default:
          throw new BadRequestException('Tipo de reporte no válido');
      }

      await this.reportService.exportReportePDF(data, 'reporte.pdf');
      res.download('reporte.pdf');
    } catch (error) {
      throw new BadRequestException(`Error al exportar el reporte: ${error.message}`);
    }
  }

  @Get('activos-inactivos')
  @ApiOperation({ summary: 'Obtener activos inactivos en un rango de fechas' })
  @ApiResponse({ status: 200, description: 'Lista de activos inactivos' })
  async getActivosInactivos(@Query('fechaInicio') fechaInicio: string, @Query('fechaFin') fechaFin: string, @Res() res: Response) {
    try {
      const activos = await this.reportService.getActivosInactivos(fechaInicio, fechaFin);
      return res.status(HttpStatus.OK).json({
        message: 'Activos inactivos obtenidos exitosamente',
        data: activos,
      });
    } catch (error) {
      throw new BadRequestException(`Error al obtener los activos inactivos: ${error.message}`);
    }
  }

  @Get('generar-reporte-automatizado')
  @ApiOperation({ summary: 'Generar un reporte automatizado' })
  @ApiResponse({ status: 200, description: 'Reporte automatizado generado' })
  async generarReporteAutomatizado(@Res() res: Response) {
    try {
      await this.reportService.generarReporteAutomatizado();
      return res.status(HttpStatus.OK).json({
        message: 'Reporte automatizado generado exitosamente',
      });
    } catch (error) {
      throw new BadRequestException(`Error al generar el reporte automatizado: ${error.message}`);
    }
  }
}
