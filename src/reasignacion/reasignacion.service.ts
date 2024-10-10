import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateReasignacionDto } from './dto/create-reasignacion.dto';
import { NotificationsService } from '../notificaciones/notificaciones.service';
import { NotificationServiceCorreo } from 'src/notificaciones/notificaciones.service.correo';

@Injectable()
export class ReasignacionService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private notificationServiceCorreo: NotificationServiceCorreo
  ) {}

  async reasignarActivo(createReasignacionDto: CreateReasignacionDto): Promise<{ message: string }> {
    const { fkActivoUnidad, fkUsuarioAnterior, fkUsuarioNuevo, fkPersonalAnterior, fkPersonalNuevo, detalle, avalReasignacion, fechaReasignacion } = createReasignacionDto;
  
    // Verificar la existencia de la unidad de activo y su estado
    const activoUnidad = await this.prisma.activoUnidad.findUnique({
      where: { id: fkActivoUnidad },
      select: { id: true, estadoCondicion: true,codigo: true, activoModelo: { select: { nombre: true } } },
    });
  
    if (!activoUnidad) {
      throw new NotFoundException('La unidad de activo no existe.');
    }
  
    // Validar que el activo no esté en estado "baja"
    if (activoUnidad.estadoCondicion === 'BAJA') {
      throw new BadRequestException('No se puede reasignar una unidad de activo que está de BAJA.');
    }
  
    // Validar la existencia de los usuarios y personal, incluyendo el email de `personalNuevo`
    const [usuarioAnterior, usuarioNuevo, personalAnterior, personalNuevo] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: fkUsuarioAnterior }, select: { id: true, name: true } }),
      this.prisma.user.findUnique({ where: { id: fkUsuarioNuevo }, select: { id: true, name: true } }),
      this.prisma.personal.findUnique({ where: { id: fkPersonalAnterior }, select: { id: true, nombre: true } }),
      this.prisma.personal.findUnique({ where: { id: fkPersonalNuevo }, select: { id: true, nombre: true, email: true } }), // Incluir el email
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
      console.log(personalNuevo, nuevaReasignacion, [activoUnidad])
      // Enviar notificación de reasignación con el email del personal nuevo
      await this.notificationServiceCorreo.sendReasignacionNotification(personalNuevo, nuevaReasignacion, [activoUnidad]);
  
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
    // Buscar el activo para obtener el `fkPersonalActual`
    const activo = await this.prisma.activoUnidad.findUnique({
      where: { id: fkActivoUnidad },
      select: {
        id: true,
        codigo: true,
        fkPersonalActual: true,  // Obtener solo el fkPersonalActual
        activoModelo: {
          select: {
            nombre: true,
            descripcion: true,
            fechaIngreso: true, // Fecha de ingreso del activo modelo
            costo: true, // Costo original
            partida: { // Información de la partida (vida útil y depreciación)
              select: {
                vidaUtil: true,
                porcentajeDepreciacion: true,
              },
            },
          },
        },
        estadoActual: true,
        estadoCondicion: true,
        costoActual: true, // Costo actual del activo unidad
      },
    });
  
    if (!activo) {
      throw new NotFoundException('El activo no está asignado o no se encontró.');
    }
  
    // Verificar si el activo tiene un `fkPersonalActual`
    if (!activo.fkPersonalActual) {
      throw new NotFoundException('El activo no tiene un personal asignado actualmente.');
    }
  
    // Buscar el personal usando el `fkPersonalActual`
    const personal = await this.prisma.personal.findUnique({
      where: { id: activo.fkPersonalActual },
      select: {
        id: true,
        nombre: true,
        cargo: {
          select: { nombre: true },
        },
        unidad: {
          select: { nombre: true },
        },
      },
    });
  
    if (!personal) {
      throw new NotFoundException('El personal asignado no se encontró.');
    }
  
    // Obtener el historial más reciente (asignación o reasignación)
    const ultimoCambio = await this.prisma.historialCambio.findFirst({
      where: { fkActivoUnidad },
      orderBy: { fechaCambio: 'desc' },
      include: {
        asignacion: {
          include: {
            usuario: {
              select: { id: true, name: true },
            },
          },
        },
        reasignacion: {
          include: {
            usuarioNuevo: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });
  
    if (!ultimoCambio) {
      throw new NotFoundException('No se encontró una asignación o reasignación válida para este activo.');
    }
  
    // Construir la respuesta con detalles del activoModelo y activoUnidad
    const activoDetalles = {
      id: activo.id,
      codigo: activo.codigo,
      modelo: activo.activoModelo.nombre,
      descripcion: activo.activoModelo.descripcion,
      fechaIngreso: activo.activoModelo.fechaIngreso,
      costo: activo.activoModelo.costo,
      vidaUtil: activo.activoModelo.partida?.vidaUtil,
      porcentajeDepreciacion: activo.activoModelo.partida?.porcentajeDepreciacion,
      estadoActual: activo.estadoActual,
      estadoCondicion: activo.estadoCondicion,
      costoActual: activo.costoActual,
    };
  
    // Verificar si es una asignación o reasignación y devolver los detalles correspondientes
    if (ultimoCambio.asignacion) {
      return {
        id: ultimoCambio.asignacion.id,
        fecha: ultimoCambio.fechaCambio,
        tipo: 'Asignación',
        usuario: ultimoCambio.asignacion.usuario,
        personal: {
          id: personal.id,
          nombre: personal.nombre,
          cargo: personal.cargo.nombre,
          unidad: personal.unidad.nombre,
        },
        detalle: ultimoCambio.asignacion.detalle,
        activoUnidad: activoDetalles, // Incluye detalles del activoModelo y activoUnidad
      };
    } else if (ultimoCambio.reasignacion) {
      return {
        id: ultimoCambio.reasignacion.id,
        fecha: ultimoCambio.fechaCambio,
        tipo: 'Reasignación',
        usuario: ultimoCambio.reasignacion.usuarioNuevo,
        personal: {
          id: personal.id,
          nombre: personal.nombre,
          cargo: personal.cargo.nombre,
          unidad: personal.unidad.nombre,
        },
        detalle: ultimoCambio.reasignacion.detalle,
        activoUnidad: activoDetalles, // Incluye detalles del activoModelo y activoUnidad
      };
    }
  
    // Si no se encuentra ninguna asignación o reasignación
    throw new NotFoundException('No se encontró una asignación o reasignación válida para este activo.');
  }
  
  
  
  
}
