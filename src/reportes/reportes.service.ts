import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ActivoUnidad, Baja, Depreciacion, Mantenimiento } from '@prisma/client';
import { createObjectCsvWriter } from 'csv-writer';
import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs';

@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  // Reporte de activos por modelo
  async getActivosPorModelo(fkActivoModelo: number): Promise<ActivoUnidad[]> {
    try {
      const activos = await this.prisma.activoUnidad.findMany({
        where: { fkActivoModelo },
        include: { activoModelo: true },
      });
      if (!activos || activos.length === 0) {
        throw new BadRequestException('No se encontraron activos para el modelo especificado');
      }
      return activos;
    } catch (error) {
      throw new BadRequestException(`Error al obtener los activos por modelo: ${error.message}`);
    }
  }

  // Reporte de activos por partida
  async getActivosPorPartida(fkPartida: number): Promise<ActivoUnidad[]> {
    try {
      if (isNaN(fkPartida)) {
        throw new BadRequestException('El id de la partida no es válido');
      }

      const activos = await this.prisma.activoUnidad.findMany({
        where: {
          activoModelo: {
            fkPartida: fkPartida,
          },
        },
        include: { activoModelo: true },
      });

      if (!activos || activos.length === 0) {
        throw new BadRequestException('No se encontraron activos para la partida especificada');
      }

      return activos;
    } catch (error) {
      throw new BadRequestException(`Error al obtener los activos por partida: ${error.message}`);
    }
  }

  // Reporte de depreciaciones en un rango de fechas
  async getDepreciacionesPorRangoFechas(fechaInicio: string, fechaFin: string): Promise<Depreciacion[]> {
    try {
      const depreciaciones = await this.prisma.depreciacion.findMany({
        where: {
          fecha: {
            gte: new Date(fechaInicio),
            lte: new Date(fechaFin),
          },
        },
        include: { activoUnidad: true },
      });
      if (!depreciaciones || depreciaciones.length === 0) {
        throw new BadRequestException('No se encontraron depreciaciones en el rango de fechas especificado');
      }
      return depreciaciones;
    } catch (error) {
      throw new BadRequestException(`Error al obtener las depreciaciones: ${error.message}`);
    }
  }

  // Reporte de bajas en un rango de fechas
  async getBajasPorRangoFechas(fechaInicio: string, fechaFin: string): Promise<Baja[]> {
    try {
      const bajas = await this.prisma.baja.findMany({
        where: {
          fecha: {
            gte: new Date(fechaInicio),
            lte: new Date(fechaFin),
          },
        },
        include: { activoUnidad: true },
      });
      if (!bajas || bajas.length === 0) {
        throw new BadRequestException('No se encontraron bajas en el rango de fechas especificado');
      }
      return bajas;
    } catch (error) {
      throw new BadRequestException(`Error al obtener las bajas: ${error.message}`);
    }
  }

  // Reporte de mantenimientos en un rango de fechas
  async getMantenimientosPorRangoFechas(fechaInicio: string, fechaFin: string): Promise<Mantenimiento[]> {
    try {
      const mantenimientos = await this.prisma.mantenimiento.findMany({
        where: {
          fecha: {
            gte: new Date(fechaInicio),
            lte: new Date(fechaFin),
          },
        },
        include: { activoUnidad: true },
      });
      if (!mantenimientos || mantenimientos.length === 0) {
        throw new BadRequestException('No se encontraron mantenimientos en el rango de fechas especificado');
      }
      return mantenimientos;
    } catch (error) {
      throw new BadRequestException(`Error al obtener los mantenimientos: ${error.message}`);
    }
  }

  // Reporte de activos por estado
  async getActivosPorEstado(estado: string): Promise<ActivoUnidad[]> {
    try {
      const activos = await this.prisma.activoUnidad.findMany({
        where: {
          activoModelo: {
            estado,
          },
        },
        include: { activoModelo: true },
      });
      if (!activos || activos.length === 0) {
        throw new BadRequestException('No se encontraron activos con el estado especificado');
      }
      return activos;
    } catch (error) {
      throw new BadRequestException(`Error al obtener los activos por estado: ${error.message}`);
    }
  }

  // Reporte general de activos
  async getReporteGeneralActivos(): Promise<any> {
    try {
      const activos = await this.prisma.activoUnidad.findMany({
        include: {
          activoModelo: {
            include: {
              partida: true,
            },
          },
        },
      });
      if (!activos || activos.length === 0) {
        throw new BadRequestException('No se encontraron activos en el reporte general');
      }
      return activos.map((activo) => ({
        id: activo.id,
        codigo: activo.codigo,
        modelo: activo.activoModelo.nombre,
        descripcion: activo.activoModelo.descripcion,
        partida: activo.activoModelo.partida.nombre,
        estado: activo.activoModelo.estado,
        costo: activo.activoModelo.costo,
      }));
    } catch (error) {
      throw new BadRequestException(`Error al obtener el reporte general de activos: ${error.message}`);
    }
  }

  // Exportar reporte a CSV
  async exportReporteCSV(data: any[], path: string): Promise<void> {
    if (data.length === 0) {
      throw new BadRequestException('No hay datos para exportar');
    }

    const csvWriter = createObjectCsvWriter({
      path,
      header: Object.keys(data[0]).map(key => ({ id: key, title: key })),
    });

    await csvWriter.writeRecords(data);
  }

  // Exportar reporte a PDF
  async exportReportePDF(data: any[], path: string): Promise<void> {
    if (data.length === 0) {
      throw new BadRequestException('No hay datos para exportar');
    }

    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const fontSize = 12;

    data.forEach((item, index) => {
      page.drawText(JSON.stringify(item), {
        x: 50,
        y: height - fontSize * (index + 2),
        size: fontSize,
      });
    });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(path, pdfBytes);
  }

  // Reporte de activos inactivos por un período
  async getActivosInactivos(fechaInicio: string, fechaFin: string): Promise<ActivoUnidad[]> {
    try {
      const bajas = await this.prisma.baja.findMany({
        where: {
          fecha: {
            gte: new Date(fechaInicio),
            lte: new Date(fechaFin),
          },
        },
        include: { activoUnidad: true },
      });

      const activosInactivos = bajas.map(baja => baja.activoUnidad);

      if (!activosInactivos || activosInactivos.length === 0) {
        throw new BadRequestException('No se encontraron activos inactivos en el rango de fechas especificado');
      }

      return activosInactivos;
    } catch (error) {
      throw new BadRequestException(`Error al obtener los activos inactivos: ${error.message}`);
    }
  }

  // Generar reportes automatizados
  async generarReporteAutomatizado(): Promise<void> {
    try {
      const ahora = new Date();
      const fechaInicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString();
      const fechaFin = ahora.toISOString();

      const depreciaciones = await this.getDepreciacionesPorRangoFechas(fechaInicio, fechaFin);
      const bajas = await this.getBajasPorRangoFechas(fechaInicio, fechaFin);
      const mantenimientos = await this.getMantenimientosPorRangoFechas(fechaInicio, fechaFin);

      const pathCSV = 'reporte_automatizado.csv';
      const pathPDF = 'reporte_automatizado.pdf';

      await this.exportReporteCSV([...depreciaciones, ...bajas, ...mantenimientos], pathCSV);
      await this.exportReportePDF([...depreciaciones, ...bajas, ...mantenimientos], pathPDF);
    } catch (error) {
      throw new BadRequestException(`Error al generar el reporte automatizado: ${error.message}`);
    }
  }
}
