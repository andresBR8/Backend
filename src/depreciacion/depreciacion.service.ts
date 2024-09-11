import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Depreciacion, MetodoDepreciacion } from '@prisma/client';
import { CreateDepreciacionDto } from './dto/create-depreciacion.dto';
import { NotificationsService } from '../notificaciones/notificaciones.service';

@Injectable()
export class DepreciacionService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // Método que se ejecuta al iniciar la aplicación
  async onModuleInit() {
    const añoActual = new Date().getFullYear();
    
    // Comprobar si existe depreciación anual
    const depreciacionExistente = await this.prisma.depreciacion.findFirst({
      where: {
        periodo: `${añoActual}`,
        metodo: MetodoDepreciacion.LINEA_RECTA,
      },
    });

    // Si no existe, realizar depreciación anual automáticamente
    if (!depreciacionExistente) {
      await this.depreciarTodosActivosAnualmente();
    }

    // Limpiar depreciaciones y registros de historial de años anteriores
    await this.limpiarDepreciacionesAnteriores();
  }

  // Crear una nueva depreciación unitaria para un activo específico
  async createDepreciacion(createDepreciacionDto: CreateDepreciacionDto): Promise<Depreciacion> {
    const { fkActivoUnidad, fecha, metodo, causaEspecial } = createDepreciacionDto;

    const activoUnidad = await this.prisma.activoUnidad.findUnique({
      where: { id: fkActivoUnidad },
      include: {
        activoModelo: {
          include: { partida: true },
        },
      },
    });

    if (!activoUnidad) {
      throw new NotFoundException(`Activo con ID ${fkActivoUnidad} no encontrado`);
    }

    const { activoModelo, costoActual } = activoUnidad;
    const { partida } = activoModelo;

    if (!partida) {
      throw new BadRequestException(`El modelo de activo con ID ${activoModelo.id} no tiene una partida asociada.`);
    }

    const valorDepreciacion = metodo === MetodoDepreciacion.LINEA_RECTA
      ? (costoActual * (partida.porcentajeDepreciacion / 100)) / 12
      : costoActual * Math.pow((1 - (partida.porcentajeDepreciacion / 100)), 1 / 12);

    const nuevoCostoActual = costoActual - valorDepreciacion;
    const fechaActual = new Date(fecha).toISOString();

    const depreciacion = await this.prisma.$transaction(async (prisma) => {
      // Crear nueva depreciación
      const nuevaDepreciacion = await prisma.depreciacion.create({
        data: {
          fkActivoUnidad,
          fecha: fechaActual,
          valor: valorDepreciacion,
          valorNeto: nuevoCostoActual,
          periodo: `${new Date(fecha).getFullYear()}`,
          metodo,
          causaEspecial,
        },
      });

      // Actualizar el costo actual del activo
      await prisma.activoUnidad.update({
        where: { id: fkActivoUnidad },
        data: { costoActual: nuevoCostoActual },
      });

      // Registrar el cambio en el historial de cambios
      await prisma.historialCambio.create({
        data: {
          fkActivoUnidad,
          tipoCambio: 'DEPRECIACION',
          fkDepreciacion: nuevaDepreciacion.id,
          detalle: `Depreciación aplicada con método ${metodo}. Nuevo costo: ${nuevoCostoActual}`,
          fechaCambio: new Date(),
        },
      });

      return nuevaDepreciacion;
    });

    // Enviar notificación
    this.notificationsService.sendNotification('depreciacion-create', {
      message: `Se ha realizado la depreciación del activo con ID ${fkActivoUnidad}`,
    }, ['Administrador', 'Encargado']);

    return depreciacion;
  }

  // Depreciar todos los activos automáticamente al final del año
  async depreciarTodosActivosAnualmente(): Promise<void> {
    const añoActual = new Date().getFullYear();

    const activos = await this.prisma.activoUnidad.findMany({
      include: {
        activoModelo: {
          include: {
            partida: true,
          },
        },
      },
    });
    // Enviar notificación
    this.notificationsService.sendNotification('depreciacion-anual-create', {
      message: `Se ha realizado la depreciación anual para el año ${añoActual}`,
    }, ['Administrador', 'Encargado']);
  }

  // Limpiar depreciaciones y registros de años anteriores
  async limpiarDepreciacionesAnteriores(): Promise<void> {
    const añoActual = new Date().getFullYear();
    const primerDiaDelAño = new Date(`${añoActual}-01-01`).toISOString();

    await this.prisma.$transaction(async (prisma) => {
      // Eliminar depreciaciones de años anteriores excepto las más recientes
      await prisma.depreciacion.deleteMany({
        where: {
          fecha: {
            lt: primerDiaDelAño,
          },
          metodo: MetodoDepreciacion.LINEA_RECTA,
        },
      });

      // Eliminar registros en el historial relacionados con esas depreciaciones
      await prisma.historialCambio.deleteMany({
        where: {
          tipoCambio: 'DEPRECIACION_ANUAL',
          fechaCambio: {
            lt: primerDiaDelAño,
          },
        },
      });
    });
  }

  // Depreciar todos los activos de forma manual para un año específico
  async depreciarTodosActivosManual(año: number): Promise<void> {
    const primerDiaDelAño = new Date(`${año}-01-01`).toISOString();

    // Eliminar las depreciaciones anteriores para este año
    await this.prisma.depreciacion.deleteMany({
      where: {
        periodo: `Manual_${año}`,
      },
    });

    const activos = await this.prisma.activoUnidad.findMany({
      include: {
        activoModelo: {
          include: {
            partida: true,
          },
        },
      },
    });

    await this.prisma.$transaction(async (prisma) => {
      for (const activo of activos) {
        const valorDepreciacion = (activo.costoActual * activo.activoModelo.partida.porcentajeDepreciacion) / 100;
        const nuevoCostoActual = activo.costoActual - valorDepreciacion;

        const depreciacion = await prisma.depreciacion.create({
          data: {
            fkActivoUnidad: activo.id,
            fecha: primerDiaDelAño,
            valor: valorDepreciacion,
            valorNeto: nuevoCostoActual,
            periodo: `Manual_${año}`,
            metodo: MetodoDepreciacion.LINEA_RECTA,
          },
        });

        // Actualizar el costo actual del activo
        await prisma.activoUnidad.update({
          where: { id: activo.id },
          data: { costoActual: nuevoCostoActual },
        });
      }
    });
  }

  // Obtener depreciaciones de un año específico
  async obtenerDepreciacionesPorAño(año: number): Promise<Depreciacion[]> {
    return this.prisma.depreciacion.findMany({
      where: {
        periodo: {
          contains: `${año}`,
        },
      },
      include: {
        activoUnidad: true,
      },
    });
  }
}
