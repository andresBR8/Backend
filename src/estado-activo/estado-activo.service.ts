import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateEstadoActivoDto } from './dto/create-estado-activo.dto';
import { EstadoActivo } from '@prisma/client';

@Injectable()
export class EstadoActivoService {
  constructor(private prisma: PrismaService) {}

  // Definimos las reglas de transición de estadoActual
  private readonly transitionRules = {
    Nuevo: ['Bueno', 'Regular', 'Malo'],
    Bueno: ['Regular', 'Malo'],
    Regular: ['Malo'],
    malo: [] // No puede transitar a otro estado desde 'malo'
  };

  async createEstadoActivo(createEstadoActivoDto: CreateEstadoActivoDto): Promise<EstadoActivo> {
    const { fkActivoUnidad, estadoNuevo, motivoCambio } = createEstadoActivoDto;

    // Verificar si el activo existe
    const activoUnidad = await this.prisma.activoUnidad.findUnique({
      where: { id: fkActivoUnidad },
    });

    if (!activoUnidad) {
      throw new NotFoundException(`El activo con ID ${fkActivoUnidad} no fue encontrado.`);
    }

    const estadoActual = activoUnidad.estadoActual;
    const estadoCondicion = activoUnidad.estadoCondicion;

    // Verificar si el activo está en estado "BAJA"
    if (estadoCondicion === 'BAJA') {
      throw new BadRequestException(`No se puede cambiar el estado de un activo dado de baja.`);
    }

    // Validar la transición de estadoActual
    if (estadoActual === estadoNuevo) {
      throw new BadRequestException(`El estado ${estadoNuevo} ya es el estado actual.`);
    }

    if (!this.transitionRules[estadoActual]?.includes(estadoNuevo)) {
      throw new BadRequestException(`No es posible cambiar de ${estadoActual} a ${estadoNuevo}.`);
    }

    // Actualizar el estadoActual en ActivoUnidad y registrar el cambio en el historial
    const estadoActivo = await this.prisma.$transaction(async (prisma) => {
      const nuevoEstadoActivo = await prisma.estadoActivo.create({
        data: {
          fkActivoUnidad,
          fechaCambio: new Date(),
          estadoAnterior: estadoActual,
          estadoNuevo,
          motivoCambio,
        },
      });

      await prisma.activoUnidad.update({
        where: { id: fkActivoUnidad },
        data: { estadoActual: estadoNuevo },
      });

      await prisma.historialCambio.create({
        data: {
          fkActivoUnidad,
          fkEstadoActivo: nuevoEstadoActivo.id,
          tipoCambio: 'CAMBIO_ESTADO',
          detalle: `Cambio de estado de ${estadoActual} a ${estadoNuevo}.`,
          fechaCambio: new Date(),
        },
      });

      return nuevoEstadoActivo;
    });

    return estadoActivo;
  }

  async getEstadoActivoById(id: number): Promise<EstadoActivo | null> {
    const estadoActivo = await this.prisma.estadoActivo.findUnique({
      where: { id },
      include: {
        activoUnidad: {
          select: {
            id: true,
            codigo: true,
            estadoActual: true,
          },
        },
      },
    });

    if (!estadoActivo) {
      throw new NotFoundException(`El estado activo con ID ${id} no fue encontrado.`);
    }

    return estadoActivo;
  }

  async getEstadosActivosByActivoUnidad(fkActivoUnidad: number): Promise<EstadoActivo[]> {
    return this.prisma.estadoActivo.findMany({
      where: { fkActivoUnidad },
      include: {
        activoUnidad: {
          select: {
            id: true,
            codigo: true,
            estadoActual: true,
          },
        },
      },
    });
  }
}
