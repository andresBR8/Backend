import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateReasignacionDto } from './dto/create-reasignacion.dto';
import { UpdateReasignacionDto } from './dto/update-reasignacion.dto';
import { NotificationsService } from 'src/notificaciones/notificaciones.service';

interface UltimaAsignacion {
  tipo: string;
  id: number;
  fecha: Date;
  fkUsuario: string;
  fkPersonal: number;
  detalle: string;
}

@Injectable()
export class ReasignacionService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async reasignarActivo(createReasignacionDto: CreateReasignacionDto): Promise<void> {
    const { fkActivoUnidad, fkUsuarioAnterior, fkUsuarioNuevo, fkPersonalAnterior, fkPersonalNuevo, detalle, fechaReasignacion } = createReasignacionDto;

    return this.prisma.$transaction(async (prisma) => {
      // Crear una nueva asignación para el nuevo usuario y personal
      const nuevaAsignacion = await prisma.asignacion.create({
        data: {
          fkUsuario: fkUsuarioNuevo,
          fkPersonal: fkPersonalNuevo,
          fechaAsignacion: new Date(fechaReasignacion),
          detalle,
        },
      });

      // Mantener el estado del activo como asignado
      await prisma.activoUnidad.update({
        where: { id: fkActivoUnidad },
        data: { asignado: true },
      });

      // Registrar el cambio en el historial de asignaciones
      await prisma.asignacionHistorial.create({
        data: {
          fkActivoUnidad,
          fkUsuario: fkUsuarioNuevo,
          fkPersonal: fkPersonalNuevo,
          fechaAsignacion: new Date(fechaReasignacion),
          detalle,
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
          detalle,
        },
      });

      // Obtener detalles del usuario y personal
      const usuarioAnterior = await prisma.user.findUnique({ where: { id: fkUsuarioAnterior } });
      const usuarioNuevo = await prisma.user.findUnique({ where: { id: fkUsuarioNuevo } });
      const personalAnterior = await prisma.personal.findUnique({ where: { id: fkPersonalAnterior } });
      const personalNuevo = await prisma.personal.findUnique({ where: { id: fkPersonalNuevo } });

      if (!usuarioAnterior || !usuarioNuevo || !personalAnterior || !personalNuevo) {
        throw new NotFoundException('Información de usuario o personal no encontrada');
      }

      // Construir el mensaje de notificación
      const mensajeNotificacion = `Reasignación realizada: Usuario anterior: ${usuarioAnterior.name}, Usuario nuevo: ${usuarioNuevo.name}, Personal anterior: ${personalAnterior.nombre}, Personal nuevo: ${personalNuevo.nombre}`;

      // Enviar notificación en tiempo real
      this.notificationsService.sendNotification('reasignacion-creada', {
        reasignacion: nuevaReasignacion,
        mensaje: mensajeNotificacion,
      });
    });
  }
  
  async getUltimaAsignacion(fkActivoUnidad: number): Promise<any> {
    const [ultimaAsignacion]: UltimaAsignacion[] = await this.prisma.$queryRaw<UltimaAsignacion[]>`
      SELECT
        'asignacion' as tipo,
        ah.id,
        ah."fechaAsignacion" as fecha,
        ah."fkUsuario",
        ah."fkPersonal",
        ah.detalle
      FROM "asignacion_historial" ah
      WHERE ah."fkActivoUnidad" = ${fkActivoUnidad}
      ORDER BY ah."fechaAsignacion" DESC
      LIMIT 1
    `;
  
    if (!ultimaAsignacion) {
      throw new NotFoundException('No se encontró una asignación anterior para este activo.');
    }
  
    const usuario = await this.prisma.user.findUnique({
      where: { id: ultimaAsignacion.fkUsuario },
    });
  
    const personal = await this.prisma.personal.findUnique({
      where: { id: ultimaAsignacion.fkPersonal },
    });
  
    return {
      ...ultimaAsignacion,
      usuario,
      personal,
    };
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
