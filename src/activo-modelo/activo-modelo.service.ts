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

  async createActivosModelos(createActivoModeloDtos: CreateActivoModeloDto[]): Promise<ActivoModelo[]> {
    const activosModelos: ActivoModelo[] = [];
    
    // Recorremos el array de DTOs y procesamos cada uno
    for (const createActivoModeloDto of createActivoModeloDtos) {
      const activoModelo = await this.createActivoModelo(createActivoModeloDto);
      activosModelos.push(activoModelo);
    }

    return activosModelos;
  }

  async createActivoModelo(createActivoModeloDto: CreateActivoModeloDto): Promise<ActivoModelo> {
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

    // Creamos el objeto de datos que se insertará en la base de datos
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

    // Creación del modelo de activo en la base de datos
    const activoModelo = await this.prisma.activoModelo.create({
      data,
    });

    // Creamos las unidades correspondientes según la cantidad
    const unidades = [];
    for (let i = 1; i <= cantidad; i++) {
      const codigoUnidad = `${codigoNuevo}-${i}`;
      unidades.push({
        fkActivoModelo: activoModelo.id,
        codigo: codigoUnidad,
        asignado: false,
      });
    }

    // Inserción masiva de unidades en la base de datos
    await this.prisma.activoUnidad.createMany({
      data: unidades,
    });
    
    // Notificación de que un modelo de activo ha cambiado
    this.notificationsService.sendNotification('activo-modelo-changed', activoModelo);

    return activoModelo;
  }

  async getActivosModelos(): Promise<ActivoModelo[]> {
    return this.prisma.activoModelo.findMany({
      include: {
        partida: {
          select: {
            vidaUtil: true,
            porcentajeDepreciacion: true
          }
        },
        activoUnidades: true
      },
    });
  }

  async getActivoModeloById(id: number): Promise<ActivoModelo | null> {
    return this.prisma.activoModelo.findUnique({
      where: { id },
      include: { partida: true, activoUnidades: true },
    });
  }

  async updateActivoModelo(id: number, data: UpdateActivoModeloDto): Promise<ActivoModelo> {
    const activoModelo = await this.prisma.activoModelo.findUnique({
      where: { id },
    });

    if (!activoModelo) {
      throw new BadRequestException('Activo Modelo no encontrado');
    }

    const updatedActivoModelo = await this.prisma.activoModelo.update({
      where: { id },
      data,
    });

    this.notificationsService.sendNotification('activo-modelo-changed', updatedActivoModelo);

    return updatedActivoModelo;
  }

  async deleteActivoModelo(id: number): Promise<ActivoModelo> {
    const activoModelo = await this.prisma.activoModelo.findUnique({
      where: { id },
      include: { activoUnidades: true },
    });

    if (!activoModelo) {
      throw new BadRequestException('Activo Modelo no encontrado');
    }

    const allUnidadesAsignadas = activoModelo.activoUnidades.every(unidad => unidad.asignado);

    if (!allUnidadesAsignadas) {
      // Delete all related activoUnidades
      await this.prisma.activoUnidad.deleteMany({
        where: { fkActivoModelo: id },
      });
      this.notificationsService.sendNotification('activo-modelo-changed', activoModelo);

      // Delete the activoModelo
      return this.prisma.activoModelo.delete({
        where: { id },
      });
    } else {
      throw new BadRequestException('No se puede borrar el modelo porque existe al menos una unidad asignada');
    }
  }
}
