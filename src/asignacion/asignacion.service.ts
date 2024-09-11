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

  async createAsignacion(createAsignacionDto: CreateAsignacionDto): Promise<{ message: string }> {
    const { fkUsuario, fkPersonal, fechaAsignacion, detalle, avalAsignacion, activosUnidades } = createAsignacionDto;
  
    // Validar la existencia del usuario y personal
    const usuario = await this.prisma.user.findUnique({ where: { id: fkUsuario } });
    const personal = await this.prisma.personal.findUnique({ where: { id: fkPersonal } });
  
    if (!usuario) throw new NotFoundException(`Usuario con ID ${fkUsuario} no encontrado`);
    if (!personal) throw new NotFoundException(`Personal con ID ${fkPersonal} no encontrado`);
  
    // Validar todas las unidades antes de crear la asignación principal
    for (const activoUnidad of activosUnidades) {
      const { activoModeloId, unidades } = activoUnidad;
  
      const validUnidades = await this.prisma.activoUnidad.findMany({
        where: {
          id: { in: unidades },
          fkActivoModelo: activoModeloId,
          asignado: false,
          estadoCondicion: { not: 'BAJA' },  // Asegurar que no esté en BAJA
        },
      });
  
      if (validUnidades.length !== unidades.length) {
        throw new BadRequestException('Algunas unidades ya están asignadas, están dadas de baja o no existen.');
      }
    }
  
    // Si todas las validaciones fueron exitosas, crear la asignación principal
    const asignacion = await this.prisma.asignacion.create({
      data: {
        fkUsuario,
        fkPersonal,
        avalAsignacion,
        fechaAsignacion: new Date(fechaAsignacion),
        detalle,
      },
    });
  
    // Actualizar cada unidad y registrar en el historial
    for (const activoUnidad of activosUnidades) {
      const { unidades } = activoUnidad;
  
      for (const unidadId of unidades) {
        await this.prisma.activoUnidad.update({
          where: { id: unidadId },
          data: { 
            asignado: true,
            estadoCondicion: 'ASIGNADO',
            fkPersonalActual: fkPersonal,
          },
        });
  
        await this.prisma.asignacionActivoUnidad.create({
          data: {
            fkAsignacion: asignacion.id,
            fkActivoUnidad: unidadId,
          },
        });
  
        // Registrar en el historial de cambios
        await this.prisma.historialCambio.create({
          data: {
            fkActivoUnidad: unidadId,
            fkAsignacion: asignacion.id, // Se añade la relación a la asignación
            tipoCambio: 'ASIGNACION',
            detalle: `Unidad asignada a ${personal.nombre}`,
            fechaCambio: new Date(),
          },
        });
      }
    }
  
    // Notificar la asignación
    this.notificationsService.sendNotification('asignacion-creada', {
      mensaje: `Asignación realizada por ${usuario.name} al personal ${personal.nombre}`,
    });
  
    return { message: 'Asignación realizada correctamente' };
  }
  
  // Función para obtener todas las asignaciones
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

  // Función para obtener una asignación por ID
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

  // Función para actualizar una asignación
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

  // Función para eliminar una asignación
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
