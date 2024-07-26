import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ActivoModelo, Prisma } from '@prisma/client';
import { CreateActivoModeloDto } from './dto/create-activo-modelo.dto';
import { UpdateActivoModeloDto } from './dto/update-activo-modelo.dto';

@Injectable()
export class ActivoModeloService {
  constructor(private prisma: PrismaService) {}

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

    for (let i = 1; i <= cantidad; i++) {
      const codigoUnidad = `${codigoNuevo}-${i}`;

      await this.prisma.activoUnidad.create({
        data: {
          fkActivoModelo: activoModelo.id,
          codigo: codigoUnidad,
          asignado: false,
        },
      });
    }

    return activoModelo;
  }

  async getActivosModelos(): Promise<ActivoModelo[]> {
    return this.prisma.activoModelo.findMany({
      include: { partida: true, activoUnidades: true },
    });
  }

  async getActivoModeloById(id: number): Promise<ActivoModelo | null> {
    return this.prisma.activoModelo.findUnique({
      where: { id },
      include: { partida: true, activoUnidades: true },
    });
  }

  async updateActivoModelo(id: number, data: UpdateActivoModeloDto): Promise<ActivoModelo> {
    return this.prisma.activoModelo.update({
      where: { id },
      data,
    });
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

      // Delete the activoModelo
      return this.prisma.activoModelo.delete({
        where: { id },
      });
    } else {
      throw new BadRequestException('No se puede borrar el modelo porque existe al menos una unidad asignada');
    }
  }
}
