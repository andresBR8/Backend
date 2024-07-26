import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Baja, Prisma } from '@prisma/client';
import { CreateBajaDto } from './dto/create-baja.dto';
import { UpdateBajaDto } from './dto/update-baja.dto';

@Injectable()
export class BajaService {
  constructor(private prisma: PrismaService) {}

  async createBaja(createBajaDto: CreateBajaDto): Promise<Baja> {
    const { fkActivoUnidad, fecha, motivo } = createBajaDto;
    try {
      const baja = await this.prisma.baja.create({
        data: {
          fkActivoUnidad,
          fecha: new Date(fecha),
          motivo,
        },
      });

      await this.prisma.activoUnidad.update({
        where: { id: fkActivoUnidad },
        data: { asignado: false },
      });

      return baja;
    } catch (error) {
      throw new BadRequestException(`Error al crear la baja: ${error.message}`);
    }
  }

  async getBajas(): Promise<Baja[]> {
    return this.prisma.baja.findMany({
      include: { activoUnidad: true },
    });
  }

  async getBajaById(id: number): Promise<Baja | null> {
    return this.prisma.baja.findUnique({
      where: { id },
      include: { activoUnidad: true },
    });
  }

  async updateBaja(id: number, updateBajaDto: UpdateBajaDto): Promise<Baja> {
    try {
      return this.prisma.baja.update({
        where: { id },
        data: updateBajaDto,
      });
    } catch (error) {
      throw new BadRequestException(`Error al actualizar la baja: ${error.message}`);
    }
  }

  async deleteBaja(id: number): Promise<Baja> {
    try {
      return this.prisma.baja.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException('Error al eliminar la baja');
    }
  }
}
