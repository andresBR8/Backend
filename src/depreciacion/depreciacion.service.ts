import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Depreciacion, Prisma } from '@prisma/client';
import { CreateDepreciacionDto } from './dto/create-depreciacion.dto';
import { UpdateDepreciacionDto } from './dto/update-depreciacion.dto';

@Injectable()
export class DepreciacionService {
  constructor(private prisma: PrismaService) {}

  async createDepreciacion(createDepreciacionDto: CreateDepreciacionDto): Promise<Depreciacion> {
    const { fkActivoUnidad, fecha, valor } = createDepreciacionDto;
    try {
      return this.prisma.depreciacion.create({
        data: {
          fkActivoUnidad,
          fecha: new Date(fecha),
          valor,
        },
      });
    } catch (error) {
      throw new BadRequestException(`Error al crear la depreciación: ${error.message}`);
    }
  }

  async getDepreciaciones(): Promise<Depreciacion[]> {
    return this.prisma.depreciacion.findMany({
      include: { activoUnidad: true },
    });
  }

  async getDepreciacionById(id: number): Promise<Depreciacion | null> {
    return this.prisma.depreciacion.findUnique({
      where: { id },
      include: { activoUnidad: true },
    });
  }

  async updateDepreciacion(id: number, updateDepreciacionDto: UpdateDepreciacionDto): Promise<Depreciacion> {
    try {
      return this.prisma.depreciacion.update({
        where: { id },
        data: updateDepreciacionDto,
      });
    } catch (error) {
      throw new BadRequestException(`Error al actualizar la depreciación: ${error.message}`);
    }
  }

  async deleteDepreciacion(id: number): Promise<Depreciacion> {
    try {
      return this.prisma.depreciacion.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException('Error al eliminar la depreciación');
    }
  }
}
