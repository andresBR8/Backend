import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateReasignacionDto } from './dto/create-reasignacion.dto';
import { NotificationsService } from '../notificaciones/notificaciones.service';

@Injectable()
export class ReasignacionService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async reasignarActivo(createReasignacionDto: CreateReasignacionDto): Promise<{ message: string }> {
    const { fkActivoUnidad, fkUsuarioAnterior, fkUsuarioNuevo, fkPersonalAnterior, fkPersonalNuevo, detalle,avalReasignacion, fechaReasignacion } = createReasignacionDto;


    // Verificar la existencia de la unidad de activo y su estado
    const activoUnidad = await this.prisma.activoUnidad.findUnique({
      where: { id: fkActivoUnidad },
      select: { id: true, estadoCondicion: true },
    });

    if (!activoUnidad) {
      throw new NotFoundException('La unidad de activo no existe.');
    }

    // Validar que el activo no esté en estado "baja"
    if (activoUnidad.estadoCondicion === 'BAJA') {
      throw new BadRequestException('No se puede reasignar una unidad de activo que está de BAJA.');
    }

    

    // Validar la existencia de los usuarios y personal
    const [usuarioAnterior, usuarioNuevo, personalAnterior, personalNuevo] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: fkUsuarioAnterior }, select: { id: true, name: true } }),
      this.prisma.user.findUnique({ where: { id: fkUsuarioNuevo }, select: { id: true, name: true } }),
      this.prisma.personal.findUnique({ where: { id: fkPersonalAnterior }, select: { id: true, nombre: true } }),
      this.prisma.personal.findUnique({ where: { id: fkPersonalNuevo }, select: { id: true, nombre: true } }),
    ]);

    if (!usuarioAnterior || !usuarioNuevo || !personalAnterior || !personalNuevo) {
      throw new NotFoundException('Información de usuario o personal no encontrada.');
    }

    return this.prisma.$transaction(async (prisma) => {
      // Mantener el estado del activo como asignado y cambiar el estado a REASIGNADO
      await prisma.activoUnidad.update({
        where: { id: fkActivoUnidad },
        data: { 
          asignado: true,
          estadoCondicion: 'REASIGNADO',
          fkPersonalActual: fkPersonalNuevo,
        },
      });

      // Registrar la reasignación
      const nuevaReasignacion = await prisma.reasignacion.create({
        data: {
          fkActivoUnidad,
          fkUsuarioAnterior,
          fkUsuarioNuevo,
          fkPersonalAnterior,
          fkPersonalNuevo,
          fechaReasignacion: new Date(fechaReasignacion),
          avalReasignacion,
          detalle,
        },
      });

      // Registrar en el historial de cambios
      await prisma.historialCambio.create({
        data: {
          fkActivoUnidad,
          fkReasignacion: nuevaReasignacion.id, // Se añade la relación a la reasignación
          tipoCambio: 'REASIGNACION',
          detalle: `Reasignación de ${personalAnterior.nombre} a ${personalNuevo.nombre}`,
          fechaCambio: new Date(),
        },
      });

      // Construir el mensaje de notificación
      const mensajeNotificacion = `Reasignación realizada: Usuario anterior: ${usuarioAnterior.name}, Usuario nuevo: ${usuarioNuevo.name}, Personal anterior: ${personalAnterior.nombre}, Personal nuevo: ${personalNuevo.nombre}`;

      

      return { message: 'Reasignación realizada correctamente' };
    });
  }

  async getReasignaciones(): Promise<any[]> {
    return this.prisma.reasignacion.findMany({
      include: {
        activoUnidad: {
          select: {
            id: true,
            codigo: true,
          },
        },
        usuarioAnterior: {
          select: {
            id: true,
            name: true,
          },
        },
        usuarioNuevo: {
          select: {
            id: true,
            name: true,
          },
        },
        personalAnterior: {
          select: {
            id: true,
            nombre: true,
          },
        },
        personalNuevo: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });
  }

  async getReasignacionById(id: number): Promise<any> {
    const reasignacion = await this.prisma.reasignacion.findUnique({
      where: { id },
      include: {
        activoUnidad: {
          select: {
            id: true,
            codigo: true,
          },
        },
        usuarioAnterior: {
          select: {
            id: true,
            name: true,
          },
        },
        usuarioNuevo: {
          select: {
            id: true,
            name: true,
          },
        },
        personalAnterior: {
          select: {
            id: true,
            nombre: true,
          },
        },
        personalNuevo: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    if (!reasignacion) {
      throw new NotFoundException(`Reasignación con ID ${id} no encontrada.`);
    }

    return reasignacion;
  }

  async getUltimaAsignacion(fkActivoUnidad: number): Promise<any> {
    // Verificar si el activo está actualmente asignado
    const activo = await this.prisma.activoUnidad.findUnique({
      where: {
        id: fkActivoUnidad,
        asignado: true, // Asegurarnos de que el activo esté asignado
      },
      include: {
        historialCambios: {
          orderBy: {
            fechaCambio: 'desc', // Obtener el cambio más reciente
          },
          include: {
            asignacion: {
              include: {
                usuario: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                personal: {
                  select: {
                    id: true,
                    nombre: true,
                    cargo: {
                      select: {
                        nombre: true,
                      },
                    },
                    unidad: {
                      select: {
                        nombre: true,
                      },
                    },
                  },
                },
                asignacionActivos: {
                  include: {
                    activoUnidad: {
                      select: {
                        id: true,
                        codigo: true,
                      },
                    },
                  },
                },
              },
            },
            reasignacion: {
              include: {
                usuarioNuevo: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                personalNuevo: {
                  select: {
                    id: true,
                    nombre: true,
                    cargo: {
                      select: {
                        nombre: true,
                      },
                    },
                    unidad: {
                      select: {
                        nombre: true,
                      },
                    },
                  },
                },
                activoUnidad: {
                  select: {
                    id: true,
                    codigo: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  
    // Validar si se encontró un activo que esté asignado
    if (!activo || !activo.historialCambios.length) {
      throw new NotFoundException('No se encontró una asignación o reasignación válida para este activo.');
    }
  
    // Iterar sobre los cambios en el historial para encontrar la última asignación o reasignación
    for (const cambio of activo.historialCambios) {
      if (cambio.asignacion) {
        return {
          id: cambio.asignacion.id,
          fecha: cambio.fechaCambio,
          tipo: 'Asignación',
          usuario: cambio.asignacion.usuario,
          personal: cambio.asignacion.personal,
          detalle: cambio.asignacion.detalle,
          activoUnidad: cambio.asignacion.asignacionActivos.map((asignacionActivo) => ({
            id: asignacionActivo.activoUnidad.id,
            codigo: asignacionActivo.activoUnidad.codigo,
          })),
        };
      } else if (cambio.reasignacion) {
        return {
          id: cambio.reasignacion.id,
          fecha: cambio.fechaCambio,
          tipo: 'Reasignación',
          usuario: cambio.reasignacion.usuarioNuevo,
          personal: cambio.reasignacion.personalNuevo,
          detalle: cambio.reasignacion.detalle,
          activoUnidad: {
            id: cambio.reasignacion.activoUnidad.id,
            codigo: cambio.reasignacion.activoUnidad.codigo,
          },
        };
      }
    }
  
    // Si no se encuentra ninguna asignación o reasignación
    throw new NotFoundException('No se encontró una asignación o reasignación válida para este activo.');
  }
  
  
}
