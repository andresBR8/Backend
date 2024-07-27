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
      // Verificar si el activo ya está dado de baja
      const activo = await this.prisma.activoUnidad.findUnique({
        where: { id: fkActivoUnidad },
      });

      if (!activo) {
        throw new NotFoundException('Activo no encontrado');
      }

      if (activo.asignado === false) {
        throw new BadRequestException('El activo ya está dado de baja');
      }

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
    const baja = await this.prisma.baja.findUnique({
      where: { id },
      include: { activoUnidad: true },
    });

    if (!baja) {
      throw new NotFoundException('Baja no encontrada');
    }

    return baja;
  }

  async updateBaja(id: number, updateBajaDto: UpdateBajaDto): Promise<Baja> {
    try {
      const bajaExistente = await this.prisma.baja.findUnique({
        where: { id },
      });

      if (!bajaExistente) {
        throw new NotFoundException('Baja no encontrada');
      }

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
      const bajaExistente = await this.prisma.baja.findUnique({
        where: { id },
      });

      if (!bajaExistente) {
        throw new NotFoundException('Baja no encontrada');
      }

      const baja = await this.prisma.baja.delete({
        where: { id },
      });

      // Restaurar el estado del activo
      await this.prisma.activoUnidad.update({
        where: { id: baja.fkActivoUnidad },
        data: { asignado: true },
      });

      return baja;
    } catch (error) {
      throw new NotFoundException('Error al eliminar la baja');
    }
  }

  // Nueva funcionalidad: Restaurar un activo dado de baja
  async restaurarBaja(id: number): Promise<Baja> {
    try {
      const baja = await this.prisma.baja.findUnique({
        where: { id },
      });

      if (!baja) {
        throw new NotFoundException('Baja no encontrada');
      }

      // Actualizar el estado del activo a asignado
      await this.prisma.activoUnidad.update({
        where: { id: baja.fkActivoUnidad },
        data: { asignado: true },
      });

      // Eliminar el registro de baja
      return this.prisma.baja.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException(`Error al restaurar la baja: ${error.message}`);
    }
  }
}
