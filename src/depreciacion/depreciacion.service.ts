import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MetodoDepreciacion } from '@prisma/client';

@Injectable()
export class DepreciacionService {
  constructor(private prisma: PrismaService) {}

  private calcularDepreciacion(costoInicial: number, porcentajeDepreciacion: number, metodo: MetodoDepreciacion, fechaInicio: Date, fechaFin: Date): number {
    const añosTranscurridos = this.calcularAñosTranscurridos(fechaInicio, fechaFin);
    
    if (metodo === MetodoDepreciacion.LINEA_RECTA) {
      return (costoInicial * (porcentajeDepreciacion / 100)) * añosTranscurridos;
    } else if (metodo === MetodoDepreciacion.SALDOS_DECRECIENTES) {
      return costoInicial * (1 - Math.pow((1 - (porcentajeDepreciacion / 100)), añosTranscurridos));
    }
    throw new BadRequestException('Método de depreciación no válido');
  }

  private calcularAñosTranscurridos(fechaInicio: Date, fechaFin: Date): number {
    const diferenciaMilisegundos = fechaFin.getTime() - fechaInicio.getTime();
    return diferenciaMilisegundos / (1000 * 60 * 60 * 24 * 365.25);
  }

  async getDepreciationComparison(años: number[]): Promise<{ comparison: any[] }> {
    if (!años || años.length === 0) {
      throw new BadRequestException('Se debe proporcionar al menos un año para la comparación.');
    }

    const activos = await this.prisma.activoUnidad.findMany({
      where: { costoActual: { gt: 0 } },
      include: { 
        activoModelo: { 
          include: { 
            partida: true 
          } 
        } 
      },
    });

    if (activos.length === 0) {
      throw new NotFoundException('No se encontraron activos con costo válido.');
    }

    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const comparison = años.reduce((acc, año) => {
      acc[año] = meses.map((mes) => ({
        month: mes,
        lineaRecta: 0,
        saldosDecrecientes: 0,
      }));
      return acc;
    }, {});

    activos.forEach(activo => {
      const { activoModelo } = activo;
      const { partida, fechaIngreso, costo } = activoModelo;

      if (!partida) {
        console.warn(`El activo con ID ${activo.id} no tiene partida asociada. Se omitirá de los cálculos.`);
        return;
      }

      años.forEach((año) => {
        const fechaFin = new Date(año, 11, 31);
        if (fechaIngreso <= fechaFin) {
          const valorLineaRecta = this.calcularDepreciacion(costo, partida.porcentajeDepreciacion, MetodoDepreciacion.LINEA_RECTA, fechaIngreso, fechaFin);
          const valorSaldosDecrecientes = this.calcularDepreciacion(costo, partida.porcentajeDepreciacion, MetodoDepreciacion.SALDOS_DECRECIENTES, fechaIngreso, fechaFin);

          comparison[año].forEach((mesComparacion, index) => {
            const fechaMes = new Date(año, index, 1);
            if (fechaIngreso <= fechaMes) {
              mesComparacion.lineaRecta += valorLineaRecta / 12;
              mesComparacion.saldosDecrecientes += valorSaldosDecrecientes / 12;
            }
          });
        }
      });
    });

    const comparisonArray = años.map(año => comparison[año]);
    return { comparison: comparisonArray };    
  }

  async obtenerDepreciacionPorAñoYMetodo(año: number, metodo: MetodoDepreciacion) {
    if (!año || isNaN(año)) {
      throw new BadRequestException('El año proporcionado no es válido.');
    }
  
    if (!Object.values(MetodoDepreciacion).includes(metodo)) {
      throw new BadRequestException('Método de depreciación no válido.');
    }
  
    const activos = await this.prisma.activoUnidad.findMany({
      where: { costoActual: { gt: 0 } },
      include: { 
        activoModelo: { 
          include: { 
            partida: true 
          } 
        } 
      },
    });
  
    if (activos.length === 0) {
      throw new NotFoundException('No se encontraron activos con costo válido.');
    }
  
    const fechaFin = new Date(año, 11, 31);
  
    const resultados = activos.map(activo => {
      const { activoModelo } = activo;
      const { partida } = activoModelo;
  
      // Extraemos los campos adicionales que deseas
      const {
        nombre,
        fechaIngreso,
        costo,
        codigoAnterior,
        codigoNuevo,
      } = activoModelo;
  
      if (!partida || fechaIngreso > fechaFin) {
        return null;
      }
  
      const valorDepreciacion = this.calcularDepreciacion(
        costo,
        partida.porcentajeDepreciacion,
        metodo,
        fechaIngreso,
        fechaFin
      );
      const nuevoCosto = costo - valorDepreciacion;
  
      return {
        id: activo.id,
        codigo: activo.codigo,
        costoInicial: costo,
        valorDepreciacion,
        nuevoCosto,
        metodo,
        periodo: año,
        // Información adicional del ActivoModelo
        nombre,
        fechaIngreso,
        costo,
        codigoAnterior,
        codigoNuevo,
        // Información adicional de la Partida
        partidaNombre: partida.nombre,
        vidaUtil: partida.vidaUtil,
        porcentajeDepreciacion: partida.porcentajeDepreciacion,
      };
    }).filter(result => result !== null);
  
    if (resultados.length === 0) {
      throw new NotFoundException('No se encontraron activos válidos para el año y método seleccionados.');
    }
  
    return resultados;
  }
  

  async obtenerDepreciacionAñoActual() {
    const añoActual = new Date().getFullYear();
    const fechaActual = new Date();

    const activos = await this.prisma.activoUnidad.findMany({
      where: { costoActual: { gt: 0 } },
      include: { 
        activoModelo: { 
          include: { 
            partida: true 
          } 
        } 
      },
    });

    if (activos.length === 0) {
      throw new NotFoundException('No se encontraron activos con costo válido.');
    }

    const resultados = activos.map(activo => {
      const { activoModelo } = activo;
      const { partida, fechaIngreso, costo } = activoModelo;

      if (!partida || fechaIngreso > fechaActual) {
        return null;
      }

      const valorLineaRecta = this.calcularDepreciacion(costo, partida.porcentajeDepreciacion, MetodoDepreciacion.LINEA_RECTA, fechaIngreso, fechaActual);
      const valorSaldosDecrecientes = this.calcularDepreciacion(costo, partida.porcentajeDepreciacion, MetodoDepreciacion.SALDOS_DECRECIENTES, fechaIngreso, fechaActual);

      return {
        id: activo.id,
        codigo: activo.codigo,
        costoInicial: costo,
        valorLineaRecta,
        valorSaldosDecrecientes,
        nuevoCostoLineaRecta: costo - valorLineaRecta,
        nuevoCostoSaldosDecrecientes: costo - valorSaldosDecrecientes,
        periodo: añoActual,
      };
    }).filter(result => result !== null);

    if (resultados.length === 0) {
      throw new NotFoundException('No se encontraron activos válidos para el año actual.');
    }

    return resultados;
  }
}