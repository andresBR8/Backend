import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ActivoModelo, Prisma } from '@prisma/client';
import { CreateActivoModeloDto } from './dto/create-activo-modelo.dto';
import { UpdateActivoModeloDto } from './dto/update-activo-modelo.dto';
import { NotificationsService } from 'src/notificaciones/notificaciones.service';

@Injectable()
export class ActivoModeloService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  async createActivosModelos(createActivoModeloDtos: CreateActivoModeloDto[]): Promise<{ message: string }> {
    // Batch creation of ActivoModelos
    for (const createActivoModeloDto of createActivoModeloDtos) {
      await this.createActivoModelo(createActivoModeloDto);
    }

    return { message: 'Modelos de activos creados correctamente' };
  }

  async createActivoModelo(createActivoModeloDto: CreateActivoModeloDto): Promise<void> {
    const {
      fkPartida,
      nombre,
      descripcion,
      fechaIngreso,
      costo,
      estado,
      codigoAnterior,
      codigoNuevo,
      ordenCompra,
      createdBy,
      updatedBy,
      cantidad
    } = createActivoModeloDto;
  
    const data: Prisma.ActivoModeloCreateInput = {
      nombre,
      descripcion,
      fechaIngreso: new Date(fechaIngreso),
      costo,
      estado,
      codigoAnterior: codigoAnterior || undefined,
      codigoNuevo,
      ordenCompra: ordenCompra || undefined,
      createdBy,
      updatedBy: updatedBy || undefined,
      partida: {
        connect: {
          id: fkPartida,
        },
      },
      cantidad,
    };
  
    const activoModelo = await this.prisma.activoModelo.create({
      data,
    });
  
    const unidades = Array.from({ length: cantidad }, (_, i) => ({
      fkActivoModelo: activoModelo.id,
      codigo: `${codigoNuevo}-${i + 1}`,
      asignado: false,
      costoActual: costo,
      estadoActual: estado,
      estadoCondicion: 'REGISTRADO',
    }));
  
    const unidadesCreadas = await this.prisma.activoUnidad.createMany({
      data: unidades,
    });
  
    // Obtener las unidades creadas para registrar el historial
    const unidadesIds = await this.prisma.activoUnidad.findMany({
      where: {
        fkActivoModelo: activoModelo.id,
      },
      select: {
        id: true,
      },
    });
  
    // Registrar el historial para cada unidad creada
    for (const unidad of unidadesIds) {
      await this.prisma.historialCambio.create({
        data: {
          fkActivoUnidad: unidad.id,
          tipoCambio: 'EN ALMACEN',
          detalle: `Unidad creada para el modelo ${nombre}`,
          fechaCambio: new Date(),
        },
      });
    }
  
    this.notificationsService.sendNotification('activo-modelo-changed', activoModelo);
  }
  

  async getActivosModelos(): Promise<ActivoModelo[]> {
    return this.prisma.activoModelo.findMany({
      include: {
        partida: {
          select: {
            vidaUtil: true,
            porcentajeDepreciacion: true,
          },
        },
        activoUnidades: {
          select: {
            id: true,
            codigo: true,
            asignado: true,
            costoActual: true,
            estadoActual: true,
            estadoCondicion: true,
          },
        },
      },
    });
  }

  async getActivoModeloById(id: number): Promise<ActivoModelo | null> {
    return this.prisma.activoModelo.findUnique({
      where: { id },
      include: {
        partida: {
          select: {
            vidaUtil: true,
            porcentajeDepreciacion: true,
          },
        },
        activoUnidades: {
          select: {
            id: true,
            codigo: true,
            asignado: true,
            costoActual: true,
            estadoActual: true,
            estadoCondicion: true,
          },
        },
      },
    });
  }

  async updateActivoModelo(id: number, data: UpdateActivoModeloDto): Promise<{ message: string }> {
    const activoModelo = await this.prisma.activoModelo.findUnique({
      where: { id },
    });

    if (!activoModelo) {
      throw new BadRequestException('Activo Modelo no encontrado');
    }

    const unidadesAsignadas = await this.prisma.activoUnidad.findMany({
      where: { fkActivoModelo: id, asignado: true },
    });

    if (unidadesAsignadas.length > 0) {
      throw new BadRequestException('No se puede editar un modelo con unidades asignadas');
    }

    await this.prisma.activoModelo.update({
      where: { id },
      data,
    });

    this.notificationsService.sendNotification('activo-modelo-changed', { id });

    return { message: 'Modelo de activo actualizado correctamente' };
  }

  async deleteActivoModelo(id: number): Promise<{ message: string }> {
    const activoModelo = await this.prisma.activoModelo.findUnique({
      where: { id },
      include: { activoUnidades: true },
    });

    if (!activoModelo) {
      throw new BadRequestException('Activo Modelo no encontrado');
    }

    const unidadesAsignadas = activoModelo.activoUnidades.filter(unidad => unidad.asignado);

    if (unidadesAsignadas.length > 0) {
      throw new BadRequestException('No se puede eliminar un modelo con unidades asignadas');
    }

    await this.prisma.activoUnidad.deleteMany({
      where: { fkActivoModelo: id },
    });

    await this.prisma.activoModelo.delete({
      where: { id },
    });

    this.notificationsService.sendNotification('activo-modelo-changed', { id });

    return { message: 'Modelo de activo eliminado correctamente' };
  }
}
