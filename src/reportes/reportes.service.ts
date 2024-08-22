import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // Reporte de Inventario de Activos
  async generateInventoryReport(filters: any) {
    const { categoria, estado, fechaIngresoDesde, fechaIngresoHasta, skip, take } = filters;

    const data = await this.prisma.activoUnidad.findMany({
      where: {
        activoModelo: {
          estado: estado || undefined,
          partida: {
            nombre: categoria || undefined,
          },
          fechaIngreso: {
            gte: fechaIngresoDesde ? new Date(fechaIngresoDesde) : undefined,
            lte: fechaIngresoHasta ? new Date(fechaIngresoHasta) : undefined,
          },
        },
      },
      include: {
        activoModelo: true,
      },
      skip: skip || 0,
      take: take || 100,
    });

    return data;
  }

  // Reporte de Depreciación de Activos
  async generateDepreciationReport(filters: any) {
    const { metodo, fechaInicio, fechaFin, activoId, skip, take } = filters;

    const data = await this.prisma.depreciacion.findMany({
      where: {
        fkActivoUnidad: activoId || undefined,
        metodo: metodo || undefined,
        fecha: {
          gte: fechaInicio ? new Date(fechaInicio) : undefined,
          lte: fechaFin ? new Date(fechaFin) : undefined,
        },
      },
      include: {
        activoUnidad: {
          include: {
            activoModelo: true,
          },
        },
      },
      skip: skip || 0,
      take: take || 100,
    });

    return data;
  }

  // Reporte de Mantenimientos de Activos
  async generateMaintenanceReport(filters: any) {
    const { activoId, fechaInicio, fechaFin, tipoMantenimiento, skip, take } = filters;

    const data = await this.prisma.mantenimiento.findMany({
      where: {
        fkActivoUnidad: activoId || undefined,
        fecha: {
          gte: fechaInicio ? new Date(fechaInicio) : undefined,
          lte: fechaFin ? new Date(fechaFin) : undefined,
        },
        descripcion: tipoMantenimiento ? { contains: tipoMantenimiento } : undefined,
      },
      include: {
        activoUnidad: {
          include: {
            activoModelo: true,
          },
        },
      },
      skip: skip || 0,
      take: take || 100,
    });

    return data;
  }

  // Reporte de Bajas de Activos
  async generateDisposalReport(filters: any) {
    const { estado, fechaInicio, fechaFin, activoId, skip, take } = filters;

    const data = await this.prisma.baja.findMany({
      where: {
        fkActivoUnidad: activoId || undefined,
        estado: estado || undefined,
        fecha: {
          gte: fechaInicio ? new Date(fechaInicio) : undefined,
          lte: fechaFin ? new Date(fechaFin) : undefined,
        },
      },
      include: {
        activoUnidad: {
          include: {
            activoModelo: true,
          },
        },
      },
      skip: skip || 0,
      take: take || 100,
    });

    return data;
  }

  // Reporte de Asignaciones de Activos
  async generateAssignmentReport(filters: any) {
    const { usuarioId, personalId, fechaInicio, fechaFin, skip, take } = filters;

    const data = await this.prisma.asignacion.findMany({
      where: {
        fkUsuario: usuarioId || undefined,
        fkPersonal: personalId || undefined,
        fechaAsignacion: {
          gte: fechaInicio ? new Date(fechaInicio) : undefined,
          lte: fechaFin ? new Date(fechaFin) : undefined,
        },
      },
      include: {
        usuario: true,
        personal: true,
        asignacionActivos: {
          include: {
            activoUnidad: {
              include: {
                activoModelo: true,
              },
            },
          },
        },
      },
      skip: skip || 0,
      take: take || 100,
    });

    return data;
  }

  // Reporte de Reasignaciones de Activos
  async generateReassignmentReport(filters: any) {
    const { usuarioAnteriorId, usuarioNuevoId, personalAnteriorId, personalNuevoId, fechaInicio, fechaFin, skip, take } = filters;

    const data = await this.prisma.reasignacion.findMany({
      where: {
        fkUsuarioAnterior: usuarioAnteriorId || undefined,
        fkUsuarioNuevo: usuarioNuevoId || undefined,
        fkPersonalAnterior: personalAnteriorId || undefined,
        fkPersonalNuevo: personalNuevoId || undefined,
        fechaReasignacion: {
          gte: fechaInicio ? new Date(fechaInicio) : undefined,
          lte: fechaFin ? new Date(fechaFin) : undefined,
        },
      },
      include: {
        usuarioAnterior: true,
        usuarioNuevo: true,
        personalAnterior: true,
        personalNuevo: true,
        activoUnidad: {
          include: {
            activoModelo: true,
          },
        },
      },
      skip: skip || 0,
      take: take || 100,
    });

    return data;
  }

  // Reporte de Historial de Asignaciones (Historial completo de un activo)
  async generateAssignmentHistoryReport(filters: any) {
    const { activoId, fechaInicio, fechaFin, skip, take } = filters;

    const data = await this.prisma.asignacionHistorial.findMany({
      where: {
        fkActivoUnidad: activoId || undefined,
        fechaAsignacion: {
          gte: fechaInicio ? new Date(fechaInicio) : undefined,
          lte: fechaFin ? new Date(fechaFin) : undefined,
        },
      },
      include: {
        activoUnidad: {
          include: {
            activoModelo: true,
          },
        },
        personal: true,
        usuario: true,
      },
      skip: skip || 0,
      take: take || 100,
    });

    return data;
  }
}
