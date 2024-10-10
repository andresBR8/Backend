import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDevolucionDto } from './dto/create-devolucion.dto';
import { NotificationsService } from '../notificaciones/notificaciones.service';
import { NotificationServiceCorreo } from 'src/notificaciones/notificaciones.service.correo';
import { Prisma } from '@prisma/client';

@Injectable()
export class DevolucionService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private notificationsServiceCorreo: NotificationServiceCorreo
  ) {}

  async createDevolucion(createDevolucionDto: CreateDevolucionDto): Promise<{ message: string }> {
    const { fkUsuario, fkPersonal, fecha, detalle, actaDevolucion, activosUnidades } = createDevolucionDto;
  
    // Validar la existencia del usuario y personal fuera de la transacción
    const usuario = await this.prisma.user.findUnique({ where: { id: fkUsuario } });
    const personal = await this.prisma.personal.findUnique({ where: { id: fkPersonal } });
  
    if (!usuario) throw new NotFoundException(`Usuario con ID ${fkUsuario} no encontrado`);
    if (!personal) throw new NotFoundException(`Personal con ID ${fkPersonal} no encontrado`);
  
    // Validar todas las unidades fuera de la transacción
    const activosIds = activosUnidades.map((activoUnidad) => activoUnidad.fkActivoUnidad);
    const unidades = await this.prisma.activoUnidad.findMany({
      where: {
        id: { in: activosIds },
        asignado: true,
        fkPersonalActual: fkPersonal,
      },
    });
  
    if (unidades.length !== activosUnidades.length) {
      throw new BadRequestException('Algunas unidades no están asignadas al personal actual o ya han sido devueltas.');
    }
  
    // Iniciar la transacción para las devoluciones y actualizaciones
    return await this.prisma.$transaction(async (prisma) => {
      const activosDevueltos = [];
  
      // Crear todas las devoluciones y actualizar las unidades
      const devoluciones = activosUnidades.map(async (activoUnidad) => {
        const { fkActivoUnidad } = activoUnidad;
  
        // Crear devolución
        const devolucion = await prisma.devolucion.create({
          data: {
            fkUsuario,
            fkPersonal,
            fkActivoUnidad,
            actaDevolucion,
            fecha: new Date(fecha),
            detalle,
          },
        });
  
        // Actualizar el activo a no asignado y disponible
        const unidadActualizada = await prisma.activoUnidad.update({
          where: { id: fkActivoUnidad },
          data: {
            asignado: false,
            fkPersonalActual: null,
            estadoCondicion: 'DISPONIBLE',
          },
          include: { activoModelo: true },
        });
  
        // Agregar la información del activo devuelto
        activosDevueltos.push({
          id: unidadActualizada.id,
          nombre: unidadActualizada.activoModelo.nombre,
          codigo: unidadActualizada.codigo,
          estadoCondicion: unidadActualizada.estadoCondicion,
        });
  
        // Registrar el cambio en el historial
        await prisma.historialCambio.create({
          data: {
            fkActivoUnidad,
            fkDevolucion: devolucion.id,
            tipoCambio: 'DEVOLUCION',
            detalle: `Unidad devuelta por ${personal.nombre}`,
            fechaCambio: new Date(),
          },
        });
      });
  
      // Esperar a que todas las devoluciones se completen
      await Promise.all(devoluciones);
  
      // Enviar notificación
      await this.notificationsServiceCorreo.sendDevolucionNotification(personal, { fecha, detalle, actaDevolucion }, activosDevueltos);
  
      return { message: 'Devoluciones realizadas correctamente' };
    });
  }
  
  

  // Función para obtener todas las devoluciones
  async getDevoluciones() {
    return this.prisma.devolucion.findMany({
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
        activoUnidad: true 
      },
    });
  }

  // Función para obtener una devolución por ID
  async getDevolucionById(id: number) {
    return this.prisma.devolucion.findUnique({
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
        activoUnidad: true 
      },
    });
  }

  // Función para obtener los activos asignados a un personal
  async getActivosByPersonal(fkPersonal: number) {
    // Consulta simplificada basada en fkPersonalActual
    const activos = await this.prisma.activoUnidad.findMany({
      where: {
        asignado: true, // Solo los activos que están actualmente asignados
        fkPersonalActual: fkPersonal, // Buscar directamente por el personal actual
      },
      include: {
        activoModelo: {
          select: {
            nombre: true,
            descripcion: true,
          },
        },
      },
    });
  
    // Estructurar la respuesta para que sea más clara
    const respuestaEstructurada = activos.map(activo => ({
      id: activo.id,
      codigo: activo.codigo,
      nombre: activo.activoModelo.nombre,
      descripcion: activo.activoModelo.descripcion,
      costoActual: activo.costoActual,
      estadoCondicion: activo.estadoCondicion,
      estadoActual: activo.estadoActual,
    }));
  
    return respuestaEstructurada;
  }
    
}
