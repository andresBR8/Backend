import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Asignacion, Prisma } from '@prisma/client';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { UpdateAsignacionDto } from './dto/update-asignacion.dto';
import { NotificationsService } from '../notificaciones/notificaciones.service';
import { NotificationServiceCorreo } from 'src/notificaciones/notificaciones.service.correo';

@Injectable()
export class AsignacionService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private notificationsServiceCorreo: NotificationServiceCorreo
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
  
    // Crear la asignación principal
    const asignacion = await this.prisma.asignacion.create({
      data: {
        fkUsuario,
        fkPersonal,
        avalAsignacion,
        fechaAsignacion: new Date(fechaAsignacion),
        detalle,
      },
      include: {
        usuario: {
          select: {
            id: true,
            username: true,
            email: true,
            name: true,
          },
        },
        personal: {
          select: {
            nombre: true,
            ci: true,
            cargo: {
              select: { nombre: true }
            },
            unidad: {
              select: { nombre: true }
            }
          }
        },
        asignacionActivos: {
          include: {
            activoUnidad: true,
          }
        }
      }
    });
    const activos = [];
  
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
            fkAsignacion: asignacion.id,
            tipoCambio: 'ASIGNACION',
            detalle: `Unidad asignada a ${personal.nombre}`,
            fechaCambio: new Date(),
          },
        });
        // Agregar la información del activo a la variable activos
      const activo = await this.prisma.activoUnidad.findUnique({
        where: { id: unidadId },
        select: {
          id: true,
          codigo: true,
          costoActual: true,
          estadoActual: true,
          estadoCondicion: true,
        }
      });

      activos.push(activo);
      }
    }
  
    // Enviar notificación a los roles 'Administrador' y 'Encargado'
    const notificationData = {
      title: 'Nueva Asignación Realizada',
      message: `Se ha realizado una nueva asignación para ${personal.nombre} por el usuario ${usuario.name}.`,
      asignacionId: asignacion.id,
    };
    this.notificationsService.sendRoleSpecificNotification('nuevaAsignacion', notificationData, ['Administrador', 'Encargado'],);
  
    // Formatear la notificación general con el mismo formato que proporcionaste
    const generalNotificationData = {
      id: asignacion.id,
      fkUsuario: asignacion.usuario.id,
      fkPersonal: asignacion.personal.ci,
      avalAsignacion: asignacion.avalAsignacion,
      fechaAsignacion: asignacion.fechaAsignacion,
      detalle: asignacion.detalle,
      usuario: {
        id: asignacion.usuario.id,
        username: asignacion.usuario.username,
        email: asignacion.usuario.email,
        name: asignacion.usuario.name,
      },
      personal: {
        nombre: asignacion.personal.nombre,
        ci: asignacion.personal.ci,
        cargo: {
          nombre: asignacion.personal.cargo.nombre,
        },
        unidad: {
          nombre: asignacion.personal.unidad.nombre,
        },
      },
      asignacionActivos: asignacion.asignacionActivos.map((activo) => ({
        id: activo.id,
        fkAsignacion: activo.fkAsignacion,
        fkActivoUnidad: activo.fkActivoUnidad,
        activoUnidad: {
          id: activo.activoUnidad.id,
          fkActivoModelo: activo.activoUnidad.fkActivoModelo,
          codigo: activo.activoUnidad.codigo,
          asignado: activo.activoUnidad.asignado,
          costoActual: activo.activoUnidad.costoActual,
          estadoActual: activo.activoUnidad.estadoActual,
          estadoCondicion: activo.activoUnidad.estadoCondicion,
          fkPersonalActual: activo.activoUnidad.fkPersonalActual,
        },
      })),
    };
  
    this.notificationsService.sendGeneralNotification('activo-modelo-changed', generalNotificationData);

  await this.notificationsServiceCorreo.sendAsignacionNotification(personal, asignacion, activos);
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


      return asignacion;
    } catch (error) {
      throw new NotFoundException('Error al eliminar la asignación');
    }
  }
}
