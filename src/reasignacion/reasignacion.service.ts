import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateReasignacionDto } from './dto/create-reasignacion.dto';
import { UpdateReasignacionDto } from './dto/update-reasignacion.dto';

@Injectable()
export class ReasignacionService {
  constructor(private prisma: PrismaService) {}

  async reasignarActivo(createReasignacionDto: CreateReasignacionDto): Promise<void> {
    const { fkActivoUnidad, fkUsuarioAnterior, fkUsuarioNuevo, fkPersonalAnterior, fkPersonalNuevo, detalle } = createReasignacionDto;

    return this.prisma.$transaction(async (prisma) => {
      const asignacionActual = await prisma.asignacion.findFirst({
        where: {
          fkUsuario: fkUsuarioAnterior,
          asignacionActivos: {
            some: {
              fkActivoUnidad,
            },
          },
        },
        include: {
          asignacionActivos: true,
        },
      });

      if (!asignacionActual) {
        throw new NotFoundException('Asignación anterior no encontrada.');
      }

      await prisma.asignacionActivoUnidad.deleteMany({
        where: {
          fkAsignacion: asignacionActual.id,
          fkActivoUnidad,
        },
      });

      await prisma.activoUnidad.update({
        where: { id: fkActivoUnidad },
        data: { asignado: false },
      });

      const nuevaAsignacion = await prisma.asignacion.create({
        data: {
          fkUsuario: fkUsuarioNuevo,
          fkPersonal: fkPersonalNuevo,
          fechaAsignacion: new Date(),
          detalle,
        },
      });

      await prisma.asignacionActivoUnidad.create({
        data: {
          fkAsignacion: nuevaAsignacion.id,
          fkActivoUnidad,
        },
      });

      await prisma.activoUnidad.update({
        where: { id: fkActivoUnidad },
        data: { asignado: true },
      });

      await prisma.asignacionHistorial.create({
        data: {
          fkActivoUnidad,
          fkUsuario: fkUsuarioNuevo,
          fkPersonal: fkPersonalNuevo,
          fechaAsignacion: new Date(),
          detalle,
        },
      });

      await prisma.reasignacion.create({
        data: {
          fkActivoUnidad,
          fkUsuarioAnterior,
          fkUsuarioNuevo,
          fkPersonalAnterior,
          fkPersonalNuevo,
          fechaReasignacion: new Date(),
          detalle,
        },
      });
    });
  }

  async getUltimaAsignacion(fkActivoUnidad: number): Promise<any> {
    const ultimaAsignacion = await this.prisma.asignacionHistorial.findFirst({
      where: { fkActivoUnidad },
      orderBy: { fechaAsignacion: 'desc' },
      include: {
        usuario: true,
        personal: true,
      },
    });

    if (!ultimaAsignacion) {
      throw new NotFoundException('No se encontró una asignación anterior para este activo.');
    }

    return ultimaAsignacion;
  }

  async getReasignaciones(): Promise<any[]> {
    return this.prisma.reasignacion.findMany({
      include: {
        activoUnidad: true,
        usuarioAnterior: true,
        usuarioNuevo: true,
        personalAnterior: true,
        personalNuevo: true,
      },
    });
  }

  async getReasignacionById(id: number): Promise<any> {
    const reasignacion = await this.prisma.reasignacion.findUnique({
      where: { id },
      include: {
        activoUnidad: true,
        usuarioAnterior: true,
        usuarioNuevo: true,
        personalAnterior: true,
        personalNuevo: true,
      },
    });

    if (!reasignacion) {
      throw new NotFoundException(`Reasignación con ID ${id} no encontrada.`);
    }

    return reasignacion;
  }

  async updateReasignacion(id: number, updateReasignacionDto: UpdateReasignacionDto): Promise<any> {
    try {
      return this.prisma.reasignacion.update({
        where: { id },
        data: updateReasignacionDto,
      });
    } catch (error) {
      throw new BadRequestException(`Error al actualizar la reasignación: ${error.message}`);
    }
  }

  async deleteReasignacion(id: number): Promise<any> {
    try {
      return this.prisma.reasignacion.delete({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException(`Error al eliminar la reasignación con ID ${id}`);
    }
  }
}
