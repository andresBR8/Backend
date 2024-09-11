import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  // Obtener los KPIs
  async getKPIs() {
    const totalAssets = await this.prisma.activoUnidad.count();
    const totalValueResult = await this.prisma.activoUnidad.aggregate({
      _sum: { costoActual: true },
    });
    const totalValue = totalValueResult._sum.costoActual || 0;
    const assignedAssets = await this.prisma.activoUnidad.count({
      where: { asignado: true },
    });
    const pendingDisposals = await this.prisma.baja.count({
      where: { estado: 'PENDIENTE' },
    });

    return {
      totalAssets,
      totalValue,
      assignedAssets,
      assignedPercentage: totalAssets ? (assignedAssets / totalAssets) * 100 : 0,
      pendingDisposals,
      monthlyGrowth: {
        assets: await this.calculateMonthlyGrowth('assets'),
        value: await this.calculateMonthlyGrowth('value'),
        assigned: await this.calculateMonthlyGrowth('assigned'),
      },
    };
  }

  // Calcular crecimiento mensual (placeholder para datos reales)
  async calculateMonthlyGrowth(type: string) {
    // Implementar lógica real para calcular el crecimiento mensual
    return Math.random() * 10; // Ejemplo, cambiar por lógica real
  }

  // Obtener la tendencia del valor de activos por mes
  async getAssetValueTrend() {
    const trend = await this.prisma.$queryRaw(Prisma.sql`
      SELECT
        TO_CHAR(AM."fechaIngreso", 'Mon') AS month,
        SUM(AU."costoActual") AS total
      FROM "activo_unidades" AS AU
      INNER JOIN "activo_modelos" AS AM ON AU."fkActivoModelo" = AM.id
      GROUP BY TO_CHAR(AM."fechaIngreso", 'Mon')
      ORDER BY TO_CHAR(AM."fechaIngreso", 'Mon')
    `);
    return { trend };
  }

  // Obtener la distribución de activos por categoría
  // Obtener la distribución de activos por categoría (partida)
// Obtener la distribución de activos por categoría (partida)
async getAssetDistribution() {
  try {
    const distribution: { category: string; count: number }[] = await this.prisma.$queryRaw(Prisma.sql`
      SELECT
        P."nombre" AS category,
        SUM(AM."cantidad") AS count
      FROM "activo_modelos" AS AM
      INNER JOIN "partidas" AS P ON AM."fkPartida" = P."id"
      GROUP BY P."nombre"
    `);
    
    // Mapear la respuesta para formatearla correctamente
    const formattedResponse = distribution.map((item) => ({
      category: item.category.replace(/['"]/g, ''), // Eliminar comillas dobles innecesarias
      count: Number(item.count),
    }));

    return { distribution: formattedResponse };
  } catch (error) {
    console.error("Error en la consulta de distribución de activos:", error);
    throw new Error("Error al obtener la distribución de activos");
  }
}
  // Obtener el estado de los activos
  async getAssetStatus() {
    try {
      const status: { condition: string; count: bigint }[] = await this.prisma.$queryRaw(Prisma.sql`
        SELECT
          AU."estadoCondicion" AS condition,
          COUNT(AU.id) AS count
        FROM "activo_unidades" AS AU
        GROUP BY AU."estadoCondicion"
      `);
  
      // Formatear la respuesta
      const formattedResponse = status.map((item) => ({
        condition: item.condition.replace(/['"]/g, ''), // Eliminar comillas si es necesario
        count: Number(item.count), // Asegurarse de que 'count' sea numérico
      }));
  
      return { status: formattedResponse };
    } catch (error) {
      console.error("Error en la consulta del estado de activos:", error);
      throw new Error("Error al obtener el estado de los activos");
    }
  }
  

  // Obtener activos por unidad
  async getAssetsByUnit() {
    try {
      const assetsByUnit: { unit: string; count: bigint }[] = await this.prisma.$queryRaw(Prisma.sql`
        SELECT
        U."nombre" AS unit,
        COUNT(AU.id) AS count
      FROM "activo_unidades" AS AU
      INNER JOIN "activo_modelos" AS AM ON AU."fkActivoModelo" = AM.id
      INNER JOIN "partidas" AS P ON AM."fkPartida" = P.id
      INNER JOIN "unidades" AS U ON U.id = P.id
      GROUP BY U."nombre"
      `);
  
      // Mapear la respuesta para formatearla correctamente
      const formattedResponse = assetsByUnit.map((item) => ({
        unit: item.unit.replace(/['"]/g, ''), // Eliminar comillas si es necesario
        count: Number(item.count), // Convertir el valor de count a número
      }));
  
      return { assetsByUnit: formattedResponse };
    } catch (error) {
      console.error("Error en la consulta de activos por unidad:", error);
      throw new Error("Error al obtener los activos por unidad");
    }
  }
  
   // Obtener los activos de mayor valor
   async getHighValueAssets() {
    const highValueAssets = await this.prisma.activoUnidad.findMany({
      orderBy: { costoActual: 'desc' },
      take: 3,
      include: { activoModelo: true },
    });

    return {
      highValueAssets: highValueAssets.map(asset => ({
        id: asset.id,
        name: asset.activoModelo.nombre,
        currentValue: asset.costoActual,
        condition: asset.estadoCondicion,
      })),
    };
  }

  // Obtener datos de comparación de depreciación
  async getDepreciationComparison() {
    const comparison = [
      { month: 'Ene', lineaRecta: 50000, saldosDecrecientes: 70000 },
      { month: 'Feb', lineaRecta: 100000, saldosDecrecientes: 130000 },
      { month: 'Mar', lineaRecta: 150000, saldosDecrecientes: 180000 },
      { month: 'Abr', lineaRecta: 200000, saldosDecrecientes: 230000 },
      { month: 'May', lineaRecta: 250000, saldosDecrecientes: 280000 },
      { month: 'Jun', lineaRecta: 300000, saldosDecrecientes: 330000 },
      { month: 'Jul', lineaRecta: 350000, saldosDecrecientes: 380000 },
      { month: 'Ago', lineaRecta: 400000, saldosDecrecientes: 430000 },
      { month: 'Sep', lineaRecta: 450000, saldosDecrecientes: 480000 },
      { month: 'Oct', lineaRecta: 500000, saldosDecrecientes: 530000 },
      { month: 'Nov', lineaRecta: 550000, saldosDecrecientes: 580000 },
      { month: 'Dic', lineaRecta: 600000, saldosDecrecientes: 630000 },
    ];
    return { comparison };
  }

  // Obtener próximas depreciaciones
  async getUpcomingDepreciations() {
    const upcomingDepreciations = await this.prisma.depreciacion.findMany({
      where: {
        fecha: {
          gte: new Date(),
        },
      },
      take: 5,
      orderBy: { fecha: 'asc' },
    });

    return {
      upcomingDepreciations: upcomingDepreciations.map(d => ({
        assetId: d.fkActivoUnidad,
        date: d.fecha,
        amount: d.valor,
        method: d.metodo,
      })),
    };
  }
   // Obtener las últimas asignaciones
   async getLatestAssignments() {
    const assignments = await this.prisma.asignacion.findMany({
      take: 5,
      orderBy: { fechaAsignacion: 'desc' },
      include: { personal: true },
    });

    return {
      assignments: assignments.map(a => ({
        assetId: a.id,
        personnel: a.personal.nombre,
        date: a.fechaAsignacion,
      })),
    };
  }
}
