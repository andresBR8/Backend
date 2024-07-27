import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Depreciacion, Prisma } from '@prisma/client';
import { CreateDepreciacionDto } from './dto/create-depreciacion.dto';
import { UpdateDepreciacionDto } from './dto/update-depreciacion.dto';

@Injectable()
export class DepreciacionService {
  constructor(private prisma: PrismaService) {}

  // Crear una nueva depreciación
  async createDepreciacion(createDepreciacionDto: CreateDepreciacionDto): Promise<Depreciacion> {
    const { fkActivoUnidad, fecha, valor } = createDepreciacionDto;
    try {
      return this.prisma.depreciacion.create({
        data: {
          fkActivoUnidad,
          fecha: new Date(fecha).toISOString(),
          valor,
        },
      });
    } catch (error) {
      throw new BadRequestException(`Error al crear la depreciación: ${error.message}`);
    }
  }

  // Obtener todas las depreciaciones
  async getDepreciaciones(): Promise<Depreciacion[]> {
    return this.prisma.depreciacion.findMany({
      include: { activoUnidad: true },
    });
  }

  // Obtener una depreciación por su ID
  async getDepreciacionById(id: number): Promise<Depreciacion | null> {
    const depreciacion = await this.prisma.depreciacion.findUnique({
      where: { id },
      include: { activoUnidad: true },
    });
    if (!depreciacion) {
      throw new NotFoundException('Depreciación no encontrada');
    }
    return depreciacion;
  }

  // Actualizar una depreciación existente
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

  // Eliminar una depreciación por su ID
  async deleteDepreciacion(id: number): Promise<Depreciacion> {
    try {
      const depreciacion = await this.prisma.depreciacion.delete({
        where: { id },
      });
      if (!depreciacion) {
        throw new NotFoundException('Depreciación no encontrada');
      }
      return depreciacion;
    } catch (error) {
      throw new NotFoundException('Error al eliminar la depreciación');
    }
  }

  // Depreciar todas las unidades de un modelo de activo
  async depreciarPorModelo(fkActivoModelo: number, fecha: string, valor: number): Promise<Depreciacion[]> {
    try {
      const unidades = await this.prisma.activoUnidad.findMany({
        where: { fkActivoModelo },
      });

      if (unidades.length === 0) {
        throw new NotFoundException('No se encontraron unidades para el modelo de activo especificado');
      }

      const depreciaciones: Depreciacion[] = [];
      for (const unidad of unidades) {
        const depreciacion = await this.prisma.depreciacion.create({
          data: {
            fkActivoUnidad: unidad.id,
            fecha: new Date(fecha).toISOString(),
            valor,
          },
        });
        depreciaciones.push(depreciacion);
      }

      return depreciaciones;
    } catch (error) {
      throw new BadRequestException(`Error al depreciar por modelo: ${error.message}`);
    }
  }

  // Depreciar todos los activos automáticamente
  async depreciarTodosActivos(): Promise<void> {
    try {
      const activos = await this.prisma.activoUnidad.findMany({
        include: {
          activoModelo: {
            include: {
              partida: true,
            },
          },
        },
      });

      const ahora = new Date().toISOString();
      for (const activo of activos) {
        const { activoModelo } = activo;
        const { partida } = activoModelo;
        const valorDepreciacion = (activoModelo.costo * partida.porcentajeDepreciacion) / 100;

        await this.prisma.depreciacion.create({
          data: {
            fkActivoUnidad: activo.id,
            fecha: ahora,
            valor: valorDepreciacion,
          },
        });
      }
    } catch (error) {
      throw new BadRequestException(`Error al depreciar todos los activos: ${error.message}`);
    }
  }

  // Obtener reportes de depreciación
  async getReporteDepreciacion(): Promise<any> {
    try {
      const depreciaciones = await this.prisma.depreciacion.findMany({
        include: {
          activoUnidad: {
            include: {
              activoModelo: {
                include: {
                  partida: true,
                },
              },
            },
          },
        },
      });

      const reporte = depreciaciones.map((dep) => ({
        id: dep.id,
        activoUnidad: dep.activoUnidad.codigo,
        descripcion: dep.activoUnidad.activoModelo.descripcion,
        fecha: dep.fecha,
        valor: dep.valor,
        partida: dep.activoUnidad.activoModelo.partida.nombre,
      }));

      return reporte;
    } catch (error) {
      throw new BadRequestException(`Error al generar el reporte de depreciación: ${error.message}`);
    }
  }
}
