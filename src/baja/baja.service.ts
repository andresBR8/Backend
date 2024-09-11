import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Baja, BajaEstado } from '@prisma/client';
import { CreateBajaDto } from './dto/create-baja.dto';

@Injectable()
export class BajaService {
  constructor(private prisma: PrismaService) {}

  // Crear una nueva baja
  async createBaja(createBajaDto: CreateBajaDto, role: string): Promise<Baja> {
    const { fkActivoUnidad, fecha, motivo } = createBajaDto;

    // Verificar si el activo existe y está asignado
    const activo = await this.prisma.activoUnidad.findUnique({
      where: { id: fkActivoUnidad },
    });

    if (!activo) {
      throw new NotFoundException('Activo no encontrado');
    }

    if (activo.asignado === true) {
      throw new BadRequestException('El activo se encuentra asignado, proceda a devolver');
    }

    let estadoFinal: BajaEstado;
    if (role === 'Administrador') {
      estadoFinal = BajaEstado.APROBADA;
    } else if (role === 'Encargado') {
      estadoFinal = BajaEstado.PENDIENTE;
    } else {
      throw new ForbiddenException('No tiene permisos para realizar esta acción');
    }

    // Crear la baja y manejar transacciones
    const baja = await this.prisma.$transaction(async (prisma) => {
      const nuevaBaja = await prisma.baja.create({
        data: {
          fkActivoUnidad,
          fecha: new Date(fecha),
          motivo,
          estado: estadoFinal,
          creadoPor: role,
          aprobadoPor: estadoFinal === BajaEstado.APROBADA ? role : null,
        },
      });

      if (estadoFinal === BajaEstado.APROBADA) {
        await prisma.activoUnidad.update({
          where: { id: fkActivoUnidad },
          data: { 
            asignado: false,
            estadoCondicion: 'BAJA',
            fkPersonalActual: null,
          },
        });

        await prisma.historialCambio.create({
          data: {
            fkActivoUnidad,
            tipoCambio: 'BAJA',
            detalle: `Activo dado de baja por ${role}`,
            fechaCambio: new Date(),
          },
        });
      } else {
        await prisma.historialCambio.create({
          data: {
            fkActivoUnidad,
            tipoCambio: 'SOLICITUD_BAJA',
            detalle: `Solicitud de baja realizada por ${role}`,
            fechaCambio: new Date(),
          },
        });
      }

      return nuevaBaja;
    });

    return baja;
  }

  // Obtener todas las bajas
  async getBajas(): Promise<Baja[]> {
    return this.prisma.baja.findMany({
      include: { activoUnidad: true },
    });
  }

  // Obtener una baja por su ID
  async getBajaById(id: number): Promise<Baja | null> {
    const baja = await this.prisma.baja.findUnique({
      where: { id },
      include: { activoUnidad: true },
    });

    if (!baja) {
      throw new NotFoundException('Baja no encontrada');
    }

    return baja;
  }

  // Aprobar una baja pendiente
  async aprobarBaja(id: number, role: string, aprobar: boolean): Promise<Baja> {
    const baja = await this.prisma.baja.findUnique({
      where: { id },
    });

    if (!baja) {
      throw new NotFoundException('Baja no encontrada');
    }

    if (baja.estado !== BajaEstado.PENDIENTE) {
      throw new BadRequestException('La baja ya ha sido procesada');
    }

    // Solo el administrador puede aprobar
    if (role !== 'Administrador') {
      throw new ForbiddenException('No tiene permisos para aprobar esta baja');
    }

    const estadoFinal = aprobar ? BajaEstado.APROBADA : BajaEstado.RECHAZADA;

    const bajaActualizada = await this.prisma.baja.update({
      where: { id },
      data: {
        estado: estadoFinal,
        aprobadoPor: estadoFinal === BajaEstado.APROBADA ? role : null,
      },
    });

    if (estadoFinal === BajaEstado.APROBADA) {
      await this.prisma.activoUnidad.update({
        where: { id: baja.fkActivoUnidad },
        data: {
          asignado: false,
          estadoCondicion: 'BAJA',
        },
      });

      // Registrar en el historial de cambios
      await this.prisma.historialCambio.create({
        data: {
          fkActivoUnidad: baja.fkActivoUnidad,
          tipoCambio: 'BAJA',
          detalle: `Baja aprobada y activo marcado como dado de baja`,
          fechaCambio: new Date(),
        },
      });
    } else {
      // Registrar en el historial de cambios en caso de rechazo
      await this.prisma.historialCambio.create({
        data: {
          fkActivoUnidad: baja.fkActivoUnidad,
          tipoCambio: 'BAJA_RECHAZADA',
          detalle: `Baja rechazada por ${role}`,
          fechaCambio: new Date(),
        },
      });
    }

    return bajaActualizada;
  }
}
