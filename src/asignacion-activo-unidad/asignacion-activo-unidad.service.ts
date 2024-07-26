import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AsignacionActivoUnidad, Prisma } from '@prisma/client';
import { CreateAsignacionActivoUnidadDto } from './dto/create-asignacion-activo-unidad.dto';
import { UpdateAsignacionActivoUnidadDto } from './dto/update-asignacion-activo-unidad.dto';

@Injectable()
export class AsignacionActivoUnidadService {
  constructor(private prisma: PrismaService) {}

  async createAsignacionActivoUnidad(createAsignacionActivoUnidadDto: CreateAsignacionActivoUnidadDto): Promise<AsignacionActivoUnidad> {
    const { fkAsignacion, fkActivoUnidad } = createAsignacionActivoUnidadDto;

    const activoUnidad = await this.prisma.activoUnidad.findUnique({ where: { id: fkActivoUnidad } });

    if (!activoUnidad) {
      throw new NotFoundException(`ActivoUnidad con ID ${fkActivoUnidad} no encontrado`);
    }

    if (activoUnidad.asignado) {
      throw new BadRequestException(`ActivoUnidad con ID ${fkActivoUnidad} ya está asignado`);
    }

    await this.prisma.activoUnidad.update({
      where: { id: fkActivoUnidad },
      data: { asignado: true },
    });

    return this.prisma.asignacionActivoUnidad.create({
      data: {
        fkAsignacion,
        fkActivoUnidad,
      },
    });
  }

  async getAsignacionesActivoUnidad(): Promise<AsignacionActivoUnidad[]> {
    return this.prisma.asignacionActivoUnidad.findMany({
      include: { asignacion: true, activoUnidad: true },
    });
  }

  async getAsignacionActivoUnidadById(id: number): Promise<AsignacionActivoUnidad | null> {
    return this.prisma.asignacionActivoUnidad.findUnique({
      where: { id },
      include: { asignacion: true, activoUnidad: true },
    });
  }

  async updateAsignacionActivoUnidad(id: number, updateAsignacionActivoUnidadDto: UpdateAsignacionActivoUnidadDto): Promise<AsignacionActivoUnidad> {
    try {
      return this.prisma.asignacionActivoUnidad.update({
        where: { id },
        data: updateAsignacionActivoUnidadDto,
      });
    } catch (error) {
      throw new BadRequestException(`Error al actualizar la asignación de activo unidad: ${error.message}`);
    }
  }

  async deleteAsignacionActivoUnidad(id: number): Promise<AsignacionActivoUnidad> {
    try {
      const asignacionActivoUnidad = await this.prisma.asignacionActivoUnidad.delete({
        where: { id },
      });

      await this.prisma.activoUnidad.update({
        where: { id: asignacionActivoUnidad.fkActivoUnidad },
        data: { asignado: false },
      });

      return asignacionActivoUnidad;
    } catch (error) {
      throw new NotFoundException('Error al eliminar la asignación de activo unidad');
    }
  }
}
