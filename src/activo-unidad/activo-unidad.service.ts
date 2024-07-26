import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ActivoUnidad, Prisma } from '@prisma/client';
import { CreateActivoUnidadDto } from './dto/create-activo-unidad.dto';
import { UpdateActivoUnidadDto } from './dto/update-activo-unidad.dto';

@Injectable()
export class ActivoUnidadService {
  constructor(private prisma: PrismaService) {}

  async createActivoUnidad(createActivoUnidadDto: CreateActivoUnidadDto): Promise<ActivoUnidad> {
    const { fkActivoModelo, codigo, asignado } = createActivoUnidadDto;
    try {
      return this.prisma.activoUnidad.create({
        data: {
          fkActivoModelo,
          codigo,
          asignado,
        },
      });
    } catch (error) {
      throw new BadRequestException(`Error creating activo unidad: ${error.message}`);
    }
  }

  async getActivosUnidad(): Promise<ActivoUnidad[]> {
    return this.prisma.activoUnidad.findMany({
      include: { activoModelo: true, asignacionActivos: true, mantenimientos: true, bajas: true, depreciaciones: true },
    });
  }

  async getActivoUnidadById(id: number): Promise<ActivoUnidad | null> {
    return this.prisma.activoUnidad.findUnique({
      where: { id },
      include: { activoModelo: true, asignacionActivos: true, mantenimientos: true, bajas: true, depreciaciones: true },
    });
  }

  async updateActivoUnidad(id: number, updateActivoUnidadDto: UpdateActivoUnidadDto): Promise<ActivoUnidad> {
    try {
      return this.prisma.activoUnidad.update({
        where: { id },
        data: updateActivoUnidadDto,
      });
    } catch (error) {
      throw new BadRequestException(`Error updating activo unidad: ${error.message}`);
    }
  }

  async deleteActivoUnidad(id: number): Promise<ActivoUnidad> {
    try {
      return this.prisma.activoUnidad.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException('Error deleting activo unidad');
    }
  }
}
