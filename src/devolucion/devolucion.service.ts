import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDevolucionDto } from './dto/create-devolucion.dto';
import { NotificationsService } from '../notificaciones/notificaciones.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DevolucionService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async createDevolucion(createDevolucionDto: CreateDevolucionDto): Promise<{ message: string }> {
    const { fkUsuario, fkPersonal, fecha, detalle, actaDevolucion, activosUnidades } = createDevolucionDto;
  
    // Validar la existencia del usuario y personal
    const usuario = await this.prisma.user.findUnique({ where: { id: fkUsuario } });
    const personal = await this.prisma.personal.findUnique({ where: { id: fkPersonal } });
  
    if (!usuario) throw new NotFoundException(`Usuario con ID ${fkUsuario} no encontrado`);
    if (!personal) throw new NotFoundException(`Personal con ID ${fkPersonal} no encontrado`);
  
    // Iniciar transacción para asegurarnos de que todas las devoluciones se procesan correctamente
    return await this.prisma.$transaction(async (prisma) => {
      // Validar todas las unidades antes de crear las devoluciones
      for (const activoUnidad of activosUnidades) {
        const { fkActivoUnidad } = activoUnidad;
  
        const unidad = await prisma.activoUnidad.findUnique({
          where: { id: fkActivoUnidad },
        });
  
        // Validar si la unidad está asignada y si está asignada al personal actual
        if (!unidad || !unidad.asignado || unidad.fkPersonalActual !== fkPersonal) {
          throw new BadRequestException(
            `El activo con código ${unidad?.codigo || fkActivoUnidad} no está asignado al personal actual o ya ha sido devuelto.`
          );
        }
      }
  
      // Crear todas las devoluciones
      for (const activoUnidad of activosUnidades) {
        const { fkActivoUnidad } = activoUnidad;
  
        // Crear devolución en la base de datos
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
  
        // Actualizar la unidad a "no asignada" y limpiar el campo `fkPersonalActual`
        await prisma.activoUnidad.update({
          where: { id: fkActivoUnidad },
          data: {
            asignado: false,
            fkPersonalActual: null,
            estadoCondicion: 'DISPONIBLE',
          },
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
      }
      
  
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
