import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Depreciacion, MetodoDepreciacion } from '@prisma/client';
import { CreateDepreciacionDto } from './dto/create-depreciacion.dto';
import { UpdateDepreciacionDto } from './dto/update-depreciacion.dto';
import { NotificationsService } from '../notificaciones/notificaciones.service';
import * as nodemailer from 'nodemailer';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class DepreciacionService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  // Crear una nueva depreciación para un activo específico
  async createDepreciacion(createDepreciacionDto: CreateDepreciacionDto): Promise<Depreciacion> {
    const { fkActivoUnidad, fecha, valor, periodo, metodo, causaEspecial } = createDepreciacionDto;
  
    try {
      // Obtener la unidad del activo y su modelo para cálculo del valor neto
      const activoUnidad = await this.prisma.activoUnidad.findUnique({
        where: { id: fkActivoUnidad },
        include: {
          activoModelo: {
            include: {
              partida: true,  // Asegurarse de incluir la relación con la entidad "partida"
            },
          },
        },
      });
  
      if (!activoUnidad) {
        throw new NotFoundException(`Activo con ID ${fkActivoUnidad} no encontrado`);
      }
  
      const { activoModelo } = activoUnidad;
      const { partida } = activoModelo;
  
      if (!partida) {
        throw new BadRequestException(`El modelo de activo con ID ${activoModelo.id} no tiene una partida asociada.`);
      }
  
      // Calcular el valor de depreciación basado en el método seleccionado
      const valorDepreciacion = metodo === MetodoDepreciacion.LINEA_RECTA
        ? (activoModelo.costo * (partida.porcentajeDepreciacion / 100)) / 12  // Ajustado para calcular mensualmente
        : activoModelo.costo * Math.pow((1 - (partida.porcentajeDepreciacion / 100)), 1 / 12);
  
      const valorNeto = activoModelo.costo - valorDepreciacion;  // Valor neto después de la depreciación
  
      const fechaActual = new Date(fecha).toISOString();
  
      // Verificar si ya existe una depreciación para este activo en el mes actual
      const primerDiaDelMes = new Date(new Date(fecha).getFullYear(), new Date(fecha).getMonth(), 1).toISOString();
      const depreciacionExistente = await this.prisma.depreciacion.findFirst({
        where: {
          fkActivoUnidad,
          fecha: {
            gte: primerDiaDelMes,
          },
        },
      });
  
      let depreciacion;
  
      if (depreciacionExistente) {
        // Actualizar la depreciación existente
        depreciacion = await this.prisma.depreciacion.update({
          where: { id: depreciacionExistente.id },
          data: {
            valor: valorDepreciacion,
            valorNeto: valorNeto,
            metodo,
            causaEspecial: causaEspecial || depreciacionExistente.causaEspecial,
          },
        });
      } else {
        // Crear una nueva depreciación si no existe una para el mes
        depreciacion = await this.prisma.depreciacion.create({
          data: {
            fkActivoUnidad,
            fecha: fechaActual,
            valor: valorDepreciacion,
            valorNeto,  // Guardar el valor neto calculado
            periodo,
            metodo,
            causaEspecial,
          },
        });
      }
  
      // Enviar notificación vía WebSocket
      this.notificationsService.sendNotification('depreciacion-create', {
        message: `Se ha realizado la depreciación del activo con ID ${fkActivoUnidad}`,
        depreciacion,
      }, ['Administrador', 'Encargado']);
  
      return depreciacion;
    } catch (error) {
      throw new BadRequestException(`Error al crear la depreciación: ${error.message}`);
    }
  }
  
  

  // Obtener todas las depreciaciones
  async getDepreciaciones(): Promise<Depreciacion[]> {
    return this.prisma.depreciacion.findMany({
      include: {
        activoUnidad: {
          include: {
            activoModelo: true,
          },
        },
      },
    });
  }

  // Obtener una depreciación por su ID
  async getDepreciacionById(id: number): Promise<Depreciacion | null> {
    const depreciacion = await this.prisma.depreciacion.findUnique({
      where: { id },
      include: {
        activoUnidad: {
          include: {
            activoModelo: true,
          },
        },
      },
    });
    if (!depreciacion) {
      throw new NotFoundException('Depreciación no encontrada');
    }
    return depreciacion;
  }

  // Actualizar una depreciación existente
  async updateDepreciacion(id: number, updateDepreciacionDto: UpdateDepreciacionDto): Promise<Depreciacion> {
    try {
      return this.prisma.depreciacion.update({
        where: { id },
        data: updateDepreciacionDto,
      });
    } catch (error) {
      throw new BadRequestException(`Error al actualizar la depreciación: ${error.message}`);
    }
  }

  // Eliminar una depreciación por su ID
  async deleteDepreciacion(id: number): Promise<Depreciacion> {
    try {
      const depreciacion = await this.prisma.depreciacion.delete({
        where: { id },
      });
      if (!depreciacion) {
        throw new NotFoundException('Depreciación no encontrada');
      }
      return depreciacion;
    } catch (error) {
      throw new NotFoundException('Error al eliminar la depreciación');
    }
  }

  // Depreciar todos los activos automáticamente al final del año
  @Cron('0 0 31 12 *')
  async depreciarTodosActivosAnualmente(): Promise<void> {
    try {
      const activos = await this.prisma.activoUnidad.findMany({
        include: {
          activoModelo: {
            include: {
              partida: true,
            },
          },
        },
      });

      const ahora = new Date().toISOString();
      for (const activo of activos) {
        const { activoModelo } = activo;
        const { partida } = activoModelo;
        const valorDepreciacion = (activoModelo.costo * partida.porcentajeDepreciacion) / 100;

        const valorNeto = activoModelo.costo - valorDepreciacion;

        await this.prisma.depreciacion.create({
          data: {
            fkActivoUnidad: activo.id,
            fecha: ahora,
            valor: valorDepreciacion,
            valorNeto: valorNeto,
            periodo: 'ANUAL',
            metodo: MetodoDepreciacion.LINEA_RECTA,
          },
        });
      }

      // Enviar reporte y notificación
      const reporte = await this.getReporteDepreciacion();
      await this.enviarReportePorCorreo(reporte);
      this.notificationsService.sendNotification('depreciacion-annual', {
        message: 'Se ha completado la depreciación anual de todos los activos.',
        reporte,
      }, ['Administrador']);
    } catch (error) {
      throw new BadRequestException(`Error al depreciar todos los activos: ${error.message}`);
    }
  }

  // Depreciar todos los activos mensualmente (opcional)
  async depreciarTodosActivosMensualmente(): Promise<void> {
    try {
      const ahora = new Date();
      const primerDiaDelMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString();
  
      // Verificar si ya se ha realizado una depreciación este mes
      const depreciacionExistente = await this.prisma.depreciacion.findFirst({
        where: {
          periodo: 'MENSUAL',
          fecha: {
            gte: primerDiaDelMes,
          },
        },
      });
  
      if (depreciacionExistente) {
        throw new BadRequestException('Ya se ha realizado una depreciación mensual este mes.');
      }
  
      const activos = await this.prisma.activoUnidad.findMany({
        include: {
          activoModelo: {
            include: {
              partida: true,
            },
          },
        },
      });
  
      const fechaActual = ahora.toISOString();
      for (const activo of activos) {
        const { activoModelo } = activo;
        const { partida } = activoModelo;
        const valorDepreciacion =activoModelo.costo - activoModelo.costo * ((partida.porcentajeDepreciacion / 100) / 12);
        console.log(activoModelo.costo, valorDepreciacion,partida.porcentajeDepreciacion);
  
        await this.prisma.depreciacion.create({
          data: {
            fkActivoUnidad: activo.id,
            fecha: fechaActual,
            valor: valorDepreciacion,
            valorNeto: valorDepreciacion,
            periodo: 'MENSUAL',
            metodo: MetodoDepreciacion.LINEA_RECTA,
          },
        });
      }
  
      // Notificar al usuario (opcional, sin envío de correo mensual)
      this.notificationsService.sendNotification('depreciacion-monthly', {
        message: 'Se ha completado la depreciación mensual de todos los activos.',
      }, ['Administrador']);
    } catch (error) {
      throw new BadRequestException(`Error al depreciar todos los activos: ${error.message}`);
    }
  }
  

  // Obtener las depreciaciones del último mes
  async getDepreciacionesUltimoMes(): Promise<Depreciacion[]> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return this.prisma.depreciacion.findMany({
      where: {
        fecha: {
          gte: firstDayOfMonth.toISOString(),
        },
      },
      include: {
        activoUnidad: {
          include: {
            activoModelo: true,
          },
        },
      },
    });
  }

  // Obtener reportes de depreciación
  async getReporteDepreciacion(): Promise<any> {
    try {
      const depreciaciones = await this.prisma.depreciacion.findMany({
        include: {
          activoUnidad: {
            include: {
              activoModelo: {
                include: {
                  partida: true,
                },
              },
            },
          },
        },
      });

      const reporte = depreciaciones.map((dep) => ({
        id: dep.id,
        activoUnidad: dep.activoUnidad.codigo,
        descripcion: dep.activoUnidad.activoModelo.descripcion,
        fecha: dep.fecha,
        valor: dep.valor,
        metodo: dep.metodo,
        periodo: dep.periodo,
        partida: dep.activoUnidad.activoModelo.partida.nombre,
      }));

      return reporte;
    } catch (error) {
      throw new BadRequestException(`Error al generar el reporte de depreciación: ${error.message}`);
    }
  }

  // Enviar reporte por correo al administrador (anual)
  private async enviarReportePorCorreo(reporte: any): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'activosfijosuaemi@gmail.com',
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const htmlContent = `<h1>Reporte Anual de Depreciaciones</h1><pre>${JSON.stringify(reporte, null, 2)}</pre>`;

    await transporter.sendMail({
      from: 'activosfijosuaemi@gmail.com',
      to: 'admin@example.com',
      subject: 'Reporte Anual de Depreciaciones',
      html: htmlContent,
    });
  }
}
