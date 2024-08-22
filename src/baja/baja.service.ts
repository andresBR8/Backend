import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Baja, BajaEstado } from '@prisma/client';
import { CreateBajaDto } from './dto/create-baja.dto';
import { UpdateBajaDto } from './dto/update-baja.dto';

@Injectable()
export class BajaService {
  constructor(private prisma: PrismaService) {}

  // Crear una nueva baja
  async createBaja(createBajaDto: CreateBajaDto, userId: string): Promise<Baja> {
    const { fkActivoUnidad, fecha, motivo } = createBajaDto;

    // Verificar si el activo ya está dado de baja o no existe
    const activo = await this.prisma.activoUnidad.findUnique({
      where: { id: fkActivoUnidad },
    });

    if (!activo) {
      throw new NotFoundException('Activo no encontrado');
    }

    if (activo.asignado === false) {
      throw new BadRequestException('El activo ya está dado de baja');
    }

    let estadoFinal: BajaEstado;

    // Determinar si la baja requiere aprobación o no
    if (userId === 'clzkl7aco00008bsngg4b1dcw') {
      estadoFinal = BajaEstado.APROBADA;
    } else if (userId === 'clzkl88g000018bsn923vxe84') {
      estadoFinal = BajaEstado.PENDIENTE;
    } else {
      throw new ForbiddenException('No tiene permisos para realizar esta acción');
    }

    // Crear la baja
    const baja = await this.prisma.baja.create({
      data: {
        fkActivoUnidad,
        fecha: new Date(fecha),
        motivo,
        estado: estadoFinal,
        creadoPor: userId,
      },
    });

    // Si la baja está aprobada automáticamente, marcar el activo como no asignado
    if (estadoFinal === BajaEstado.APROBADA) {
      await this.prisma.activoUnidad.update({
        where: { id: fkActivoUnidad },
        data: { asignado: false },
      });
    }

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

  // Actualizar una baja
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

  // Eliminar una baja y restaurar el estado del activo
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

      // Restaurar el estado del activo a asignado
      await this.prisma.activoUnidad.update({
        where: { id: baja.fkActivoUnidad },
        data: { asignado: true },
      });

      return baja;
    } catch (error) {
      throw new NotFoundException('Error al eliminar la baja');
    }
  }

  // Aprobar una baja pendiente
  async aprobarBaja(id: number, userId: string, aprobar: boolean): Promise<Baja> {
    try {
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
      if (userId !== 'clzkl7aco00008bsngg4b1dcw') {
        throw new ForbiddenException('No tiene permisos para aprobar esta baja');
      }

      // Aprobar o rechazar la baja
      const estadoFinal = aprobar ? BajaEstado.APROBADA : BajaEstado.RECHAZADA;

      const bajaActualizada = await this.prisma.baja.update({
        where: { id },
        data: {
          estado: estadoFinal,
        },
      });

      if (estadoFinal === BajaEstado.APROBADA) {
        await this.prisma.activoUnidad.update({
          where: { id: baja.fkActivoUnidad },
          data: { asignado: false },
        });
      }

      return bajaActualizada;
    } catch (error) {
      throw new BadRequestException(`Error al procesar la baja: ${error.message}`);
    }
  }
}
