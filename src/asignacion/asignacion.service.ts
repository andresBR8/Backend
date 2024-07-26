import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Asignacion, Prisma } from '@prisma/client';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { UpdateAsignacionDto } from './dto/update-asignacion.dto';
import { NotificationsService } from '../notificaciones/notificaciones.service';

@Injectable()
export class AsignacionService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async createAsignacion(createAsignacionDto: CreateAsignacionDto): Promise<Asignacion> {
    const { fkUsuario, fkPersonal, fechaAsignacion, detalle, activosUnidades } = createAsignacionDto;

    const asignacion = await this.prisma.asignacion.create({
        data: {
            fkUsuario,
            fkPersonal,
            fechaAsignacion: new Date(fechaAsignacion),
            detalle,
        },
    });

    for (const activoUnidad of activosUnidades) {
        const { activoModeloId, unidades } = activoUnidad;

        for (const unidadId of unidades) {
            const unidad = await this.prisma.activoUnidad.findUnique({
                where: { id: unidadId },
            });

            if (!unidad) {
                throw new BadRequestException(`No se encontró la unidad de activo con ID ${unidadId}`);
            }

            if (unidad.asignado) {
                throw new BadRequestException(`La unidad de activo con ID ${unidadId} ya está asignada`);
            }

            await this.prisma.activoUnidad.update({
                where: { id: unidadId },
                data: { asignado: true },
            });

            await this.prisma.asignacionActivoUnidad.create({
                data: {
                    fkAsignacion: asignacion.id,
                    fkActivoUnidad: unidadId,
                },
            });

            await this.prisma.activoModelo.update({
                where: { id: activoModeloId },
                data: {
                    cantidad: { decrement: 1 },
                },
            });
        }
    }

    // Enviar notificación en tiempo real
    this.notificationsService.sendNotification('asignacion-creada', asignacion);

    return asignacion;
}

  
  async getAsignaciones(): Promise<Asignacion[]> {
    return this.prisma.asignacion.findMany({
      include: { 
        usuario: true, 
        personal: {
          select: {
            nombre: true,
            ci: true,
            cargo: {
              select: {
                nombre: true
              }
            },
            unidad: {
              select: {
                nombre: true
              }
            }
          }
        },
        asignacionActivos: { 
          include: { 
            activoUnidad: true 
          } 
        } 
      },
    });
  }
  async getAsignacionById(id: number): Promise<Asignacion | null> {
    return this.prisma.asignacion.findUnique({
      where: { id },
      include: { 
        usuario: true, 
        personal: {
          select: {
            nombre: true,
            ci: true,
            cargo: {
              select: {
                nombre: true
              }
            },
            unidad: {
              select: {
                nombre: true
              }
            }
          }
        },
        asignacionActivos: { 
          include: { 
            activoUnidad: true 
          } 
        } 
      },
    });
  }

  async updateAsignacion(id: number, updateAsignacionDto: UpdateAsignacionDto): Promise<Asignacion> {
    try {
      const asignacion = await this.prisma.asignacion.update({
        where: { id },
        data: updateAsignacionDto,
      });

      // Enviar notificación en tiempo real
      this.notificationsService.sendNotification('asignacion-actualizada', asignacion);

      return asignacion;
    } catch (error) {
      throw new BadRequestException(`Error al actualizar la asignación: ${error.message}`);
    }
  }

  async deleteAsignacion(id: number): Promise<Asignacion> {
    try {
      const asignacion = await this.prisma.asignacion.delete({
        where: { id },
      });

      // Enviar notificación en tiempo real
      this.notificationsService.sendNotification('asignacion-eliminada', asignacion);

      return asignacion;
    } catch (error) {
      throw new NotFoundException('Error al eliminar la asignación');
    }
  }
}
