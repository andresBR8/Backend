import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class SeguimientoService {
  constructor(private prisma: PrismaService) {}

  async obtenerSeguimientoActivo(fkActivoUnidad: number) {
    // Verificar si el activo existe
    const activoUnidad = await this.prisma.activoUnidad.findUnique({
      where: { id: fkActivoUnidad },
      include: {
        activoModelo: {
          include: {
            partida: true, // Información de la partida
          },
        },
      },
    });

    if (!activoUnidad) {
      throw new NotFoundException(`El activo con ID ${fkActivoUnidad} no fue encontrado.`);
    }

    // Obtener el historial de cambios del activo
    const historialCambios = await this.prisma.historialCambio.findMany({
      where: { fkActivoUnidad },
      include: {
        asignacion: {
          include: {
            usuario: true,
            personal: {
              include: {
                cargo: true,
                unidad: true,
              },
            },
          },
        },
        reasignacion: {
          include: {
            usuarioAnterior: true,
            usuarioNuevo: true,
            personalAnterior: {
              include: {
                cargo: true,
                unidad: true,
              },
            },
            personalNuevo: {
              include: {
                cargo: true,
                unidad: true,
              },
            },
          },
        },
        depreciacion: true,
        estadoActivo: true,
        // No se puede incluir baja directamente porque no está relacionado en el modelo HistorialCambio
        // Agregar lógica de acceso manual a `bajas` si es necesario en otra parte del servicio
      },
    });

    return {
      activoUnidad: {
        id: activoUnidad.id,
        codigo: activoUnidad.codigo,
        costoActual: activoUnidad.costoActual,
        estadoActual: activoUnidad.estadoActual,
        estadoCondicion: activoUnidad.estadoCondicion,
        asignado: activoUnidad.asignado,
        activoModelo: {
          nombre: activoUnidad.activoModelo.nombre,
          descripcion: activoUnidad.activoModelo.descripcion,
          fechaIngreso: activoUnidad.activoModelo.fechaIngreso,
          costo: activoUnidad.activoModelo.costo,
          estado: activoUnidad.activoModelo.estado,
          codigoAnterior: activoUnidad.activoModelo.codigoAnterior,
          codigoNuevo: activoUnidad.activoModelo.codigoNuevo,
          ordenCompra: activoUnidad.activoModelo.ordenCompra,
          partida: {
            nombre: activoUnidad.activoModelo.partida.nombre,
            vidaUtil: activoUnidad.activoModelo.partida.vidaUtil,
            porcentajeDepreciacion: activoUnidad.activoModelo.partida.porcentajeDepreciacion,
          },
        },
      },
      historialCambios: historialCambios.map(cambio => {
        const cambioData: any = {
          tipoCambio: cambio.tipoCambio,
          detalle: cambio.detalle,
          fechaCambio: cambio.fechaCambio,
        };

        if (cambio.fkAsignacion) {
          cambioData.asignacion = {
            usuario: cambio.asignacion?.usuario.username,
            personal: {
              nombre: cambio.asignacion?.personal.nombre,
              ci: cambio.asignacion?.personal.ci,
              cargo: cambio.asignacion?.personal.cargo.nombre,
              unidad: cambio.asignacion?.personal.unidad.nombre,
            },
            fechaAsignacion: cambio.asignacion?.fechaAsignacion,
            detalle: cambio.asignacion?.detalle,
          };
        }

        if (cambio.fkReasignacion) {
          cambioData.reasignacion = {
            usuarioAnterior: cambio.reasignacion?.usuarioAnterior.username,
            usuarioNuevo: cambio.reasignacion?.usuarioNuevo.username,
            personalAnterior: {
              nombre: cambio.reasignacion?.personalAnterior.nombre,
              cargo: cambio.reasignacion?.personalAnterior.cargo.nombre,
              unidad: cambio.reasignacion?.personalAnterior.unidad.nombre,
            },
            personalNuevo: {
              nombre: cambio.reasignacion?.personalNuevo.nombre,
              cargo: cambio.reasignacion?.personalNuevo.cargo.nombre,
              unidad: cambio.reasignacion?.personalNuevo.unidad.nombre,
            },
            fechaReasignacion: cambio.reasignacion?.fechaReasignacion,
            detalle: cambio.reasignacion?.detalle,
          };
        }

        if (cambio.fkDepreciacion) {
          cambioData.depreciacion = {
            valor: cambio.depreciacion?.valor,
            valorNeto: cambio.depreciacion?.valorNeto,
            periodo: cambio.depreciacion?.periodo,
            metodo: cambio.depreciacion?.metodo,
            causaEspecial: cambio.depreciacion?.causaEspecial,
          };
        }

        if (cambio.fkEstadoActivo) {
          cambioData.estadoActivo = {
            estadoAnterior: cambio.estadoActivo?.estadoAnterior,
            estadoNuevo: cambio.estadoActivo?.estadoNuevo,
            motivoCambio: cambio.estadoActivo?.motivoCambio,
          };
        }

        return cambioData;
      }),
    };
  }
}
