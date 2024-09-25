import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Personal, Cargo, Unidad } from '@prisma/client';
import * as csvParser from 'csv-parser';
import { Readable } from 'stream';
import { createWriteStream } from 'fs';

@Injectable()
export class PersonalService {
  constructor(private prisma: PrismaService) {}

  // Procesar el archivo CSV para crear, actualizar e inactivar personal
  async processCSV(file: Express.Multer.File): Promise<any> {
    const data = await this.parseCSV(file.buffer);

    const resumen = {
      nuevosPersonales: [] as { nombre: string; ci: string, email: string }[],
      nuevosCargos: new Set<string>(),   // Usamos un Set para evitar duplicados
      nuevasUnidades: new Set<string>(), // Usamos un Set para evitar duplicados
      personalInactivo: [] as { nombre: string; ci: string; motivo: string }[],
      personalActualizado: [] as { nombre: string; ci: string; cambios: string[] }[],
      personalSinCambios: 0,
      totalProcesados: 0,
      advertencias: [] as string[],
      errores: [] as { fila: any, error: string }[],  // Para capturar errores por fila
    };

    for (const row of data) {
      try {
        const { nombre, ci, cargoNombre, unidadNombre, email } = row;

        // Validar si faltan datos esenciales
        if (!nombre || !ci || !cargoNombre || !unidadNombre || !email) {
          resumen.errores.push({ fila: row, error: 'Datos incompletos en la fila.' });
          continue; // Pasar a la siguiente fila
        }

        resumen.totalProcesados += 1;

        // Buscar o crear el cargo
        let cargo = await this.prisma.cargo.findUnique({ where: { nombre: cargoNombre } });
        if (!cargo) {
          cargo = await this.prisma.cargo.create({ data: { nombre: cargoNombre } });
          resumen.nuevosCargos.add(cargoNombre); // Usamos Set para evitar duplicados
        }

        // Buscar o crear la unidad
        let unidad = await this.prisma.unidad.findUnique({ where: { nombre: unidadNombre } });
        if (!unidad) {
          unidad = await this.prisma.unidad.create({ data: { nombre: unidadNombre } });
          resumen.nuevasUnidades.add(unidadNombre); // Usamos Set para evitar duplicados
        }

        // Buscar el personal por CI
        const personalExistente = await this.prisma.personal.findUnique({ where: { ci } });

        if (personalExistente) {
          const cambios = [];

          // Verificar si el cargo o la unidad han cambiado
          if (personalExistente.fkCargo !== cargo.id) {
            const cargoAnterior = await this.prisma.cargo.findUnique({ where: { id: personalExistente.fkCargo } });
            cambios.push(`Cambio de cargo: ${cargoAnterior?.nombre} -> ${cargo.nombre}`);
          }
          if (personalExistente.fkUnidad !== unidad.id) {
            const unidadAnterior = await this.prisma.unidad.findUnique({ where: { id: personalExistente.fkUnidad } });
            cambios.push(`Cambio de unidad: ${unidadAnterior?.nombre} -> ${unidad.nombre}`);
          }
          if (personalExistente.email !== email) {
            cambios.push(`Cambio de email: ${personalExistente.email} -> ${email}`);
          }

          if (cambios.length > 0) {
            // Guardar el historial de cambios
            await this.prisma.historialCargoUnidad.create({
              data: {
                fkPersonal: personalExistente.id,
                fkCargo: personalExistente.fkCargo,   // Cargo anterior
                fkUnidad: personalExistente.fkUnidad, // Unidad anterior
                fechaCambio: new Date(),
              },
            });

             // Actualizar el personal
          await this.prisma.personal.update({
            where: { ci },
            data: { fkCargo: cargo.id, fkUnidad: unidad.id, email, activo: true },
          });

            resumen.personalActualizado.push({
              nombre: personalExistente.nombre,
              ci: personalExistente.ci,
              cambios,
            });
          } else {
            resumen.personalSinCambios += 1;
          }
        } else {
          // Crear nuevo personal con email
        const nuevoPersonal = await this.prisma.personal.create({
          data: { nombre, ci, fkCargo: cargo.id, fkUnidad: unidad.id, email, activo: true },
        });

          // Registrar el nuevo personal en el resumen
          resumen.nuevosPersonales.push({
            nombre: nuevoPersonal.nombre,
            ci: nuevoPersonal.ci,
            email: nuevoPersonal.email,
          });

          // Registrar el nuevo personal en el historial
          await this.prisma.historialCargoUnidad.create({
            data: {
              fkPersonal: nuevoPersonal.id,
              fkCargo: cargo.id,
              fkUnidad: unidad.id,
              fechaCambio: new Date(),
            },
          });
        }
      } catch (error) {
        resumen.advertencias.push(`Error procesando la fila: ${JSON.stringify(row)}. Detalle: ${error.message}`);
      }
    }

    // Inactivar personal que ya no está en el CSV
    const allPersonal = await this.prisma.personal.findMany();
    for (const persona of allPersonal) {
      const found = data.find((row) => row.ci === persona.ci);
      if (!found && persona.activo) {
        const activosAsignados = await this.prisma.activoUnidad.findMany({
          where: {
            fkPersonalActual: persona.id,
            asignado: true,
          },
        });

        if (activosAsignados.length === 0) {
          // Marcar como inactivo
          await this.prisma.personal.update({
            where: { id: persona.id },
            data: { activo: false },
          });

          // Añadir al resumen el personal inactivo
          resumen.personalInactivo.push({
            nombre: persona.nombre,
            ci: persona.ci,
            motivo: 'No encontrado en el CSV',
          });
        } else {
          resumen.advertencias.push(
            `El personal con CI ${persona.ci} no puede ser inactivado, tiene activos asignados.`
          );
        }
      }
    }

    return {
      ...resumen,
      nuevosCargos: Array.from(resumen.nuevosCargos),
      nuevasUnidades: Array.from(resumen.nuevasUnidades),
    };
  }

  // Parsear el CSV
  private parseCSV(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results = [];
      const stream = Readable.from(buffer.toString());
      stream
        .pipe(csvParser())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', (error) => reject(error));
    });
  }

  // Método para inactivar manualmente personal
  async inactivatePersonal(ci: string): Promise<void> {
    const personal = await this.prisma.personal.findUnique({ where: { ci } });

    if (!personal) {
      throw new NotFoundException('Personal no encontrado');
    }

    // Verificar si tiene activos asignados
    const activosAsignados = await this.prisma.activoUnidad.findMany({
      where: {
        fkPersonalActual: personal.id,
        asignado: true,
      },
    });

    if (activosAsignados.length > 0) {
      throw new BadRequestException(
        `El personal con CI ${ci} no puede ser inactivado, tiene activos asignados.`
      );
    }

    // Inactivar el personal
    await this.prisma.personal.update({
      where: { ci },
      data: { activo: false },
    });
  }
  // Obtener todos los personales y sus activos
  // Obtener la lista de personal con sus cargos y unidades (activos e inactivos)
// Obtener la lista de personal con sus cargos y unidades (activos e inactivos)
async findAll(): Promise<any[]> {
  const personales = await this.prisma.personal.findMany({
    select: {
      id: true,               // ID del personal
      nombre: true,           // Nombre del personal
      ci: true,               // CI
      email: true,            // Email
      activo: true,           // Estado activo/inactivo
      cargo: {                // Cargo relacionado
        select: {
          id: true,           // ID del cargo
          nombre: true,       // Nombre del cargo
        },
      },
      unidad: {               // Unidad relacionada
        select: {
          id: true,           // ID de la unidad
          nombre: true,       // Nombre de la unidad
        },
      },
    },
  });

  return personales; // Devuelve solo los campos seleccionados
}


  
  // Obtener la lista de personal activo con solo los campos seleccionados
async findAllActive(): Promise<any[]> {
  const personales = await this.prisma.personal.findMany({
    where: {
      activo: true,  // Solo personal activo
    },
    select: {
      id: true,               // ID del personal
      nombre: true,           // Nombre del personal
      ci: true,               // CI
      cargo: {                // Cargo relacionado
        select: {
          id: true,           // ID del cargo
          nombre: true,       // Nombre del cargo
        },
      },
      unidad: {               // Unidad relacionada
        select: {
          id: true,           // ID de la unidad
          nombre: true,       // Nombre de la unidad
        },
      },
    },
  });

  return personales; // Devuelve solo los campos seleccionados
}

  
   // Crear revisión periódica (20 de diciembre)
  async createPeriodicRevision(): Promise<void> {
    const fechaRevision = new Date();
    const fechaCierre = new Date(fechaRevision);
    fechaCierre.setHours(fechaCierre.getHours() + 24); // Cierre en 24 horas

    const tipo = 'PERIODICA';
    const estado = 'PENDIENTE';

    await this.prisma.revision.create({
      data: {
        tipo,
        fecha: fechaRevision,
        fechaCierre,
        estado,
        general: true,
        aprobado: false,
      },
    });
  }

  // Crear revisión sorpresa (no almacenar fkPersonal, ya que es general)
  async createSurpriseRevision(): Promise<void> {
    const fechaRevision = new Date();
    const fechaCierre = new Date(fechaRevision);
    fechaCierre.setHours(fechaCierre.getHours() + 24); // Cierre en 24 horas

    await this.prisma.revision.create({
      data: {
        tipo: 'SORPRESA',
        fecha: fechaRevision,
        fechaCierre,
        estado: 'PENDIENTE',
        general: true,
        aprobado: false,
      },
    });
  }

  // Crear revisión individual (vacaciones, cambio de unidad, culminación de contrato)
  async createIndividualRevision(ci: string, tipo: string): Promise<void> {
    const personal = await this.prisma.personal.findUnique({ where: { ci } });

    if (!personal) {
      throw new NotFoundException('Personal no encontrado.');
    }

    const fechaRevision = new Date();
    const fechaCierre = new Date(fechaRevision);
    fechaCierre.setHours(fechaCierre.getHours() + 2); // Cierre en 2 horas

    await this.prisma.revision.create({
      data: {
        tipo,
        fecha: fechaRevision,
        fechaCierre,
        estado: 'PENDIENTE',
        general: false,
        fkPersonal: personal.id,
        aprobado: false,
      },
    });
  }

  // Obtener todas las revisiones (pendientes o finalizadas)
  async findAllRevisiones(): Promise<any[]> {
    return await this.prisma.revision.findMany({
      include: { personal: true }, // Solo si es una revisión individual
    });
  }

  // Marcar revisión como finalizada
  async finalizeRevision(id: number, observaciones: string, aprobado: boolean): Promise<void> {
    const revision = await this.prisma.revision.findUnique({ where: { id } });

    if (!revision) {
      throw new NotFoundException('Revisión no encontrada.');
    }

    await this.prisma.revision.update({
      where: { id },
      data: {
        estado: 'FINALIZADA',
        observaciones,
        aprobado,
      },
    });
  }

  // Función que finaliza automáticamente las revisiones cuando se cumple la fecha de cierre
  async autoFinalizeRevisions(): Promise<void> {
    const revisionesPendientes = await this.prisma.revision.findMany({
      where: { estado: 'PENDIENTE' },
    });

    const fechaActual = new Date();

    for (const revision of revisionesPendientes) {
      if (fechaActual >= revision.fechaCierre) {
        await this.prisma.revision.update({
          where: { id: revision.id },
          data: {
            estado: 'FINALIZADA',
            aprobado: false, // No aprobado por falta de intervención
            observaciones: 'Cerrada automáticamente sin observaciones.',
          },
        });
      }
    }
  }

  // Generar informe PDF de la revisión
  async generateRevisionReport(revisionId: number): Promise<void> {
    const revision = await this.prisma.revision.findUnique({
      where: { id: revisionId },
      include: { personal: true },
    });

    if (!revision) {
      throw new NotFoundException('Revisión no encontrada.');
    }

    const filePath = `./revisiones/report_${revisionId}.pdf`;
    const fileStream = createWriteStream(filePath);

    fileStream.write(`Reporte de Revisión - ID: ${revisionId}\n`);
    fileStream.write(`Tipo de Revisión: ${revision.tipo}\n`);
    fileStream.write(`Fecha: ${revision.fecha}\n`);
    fileStream.write(`Fecha de Cierre: ${revision.fechaCierre}\n`);
    if (revision.personal) {
      fileStream.write(`Personal: ${revision.personal.nombre} - CI: ${revision.personal.ci}\n`);
    }
    fileStream.write(`Estado: ${revision.aprobado ? 'Aprobado' : 'No Aprobado'}\n`);
    fileStream.write(`Observaciones: ${revision.observaciones}\n`);

    fileStream.end();
  }
  // En el archivo PersonalService.ts
async getPersonasByRevision(revisionId: number): Promise<any[]> {
  const revision = await this.prisma.revision.findUnique({
    where: { id: revisionId },
  });

  if (!revision) {
    throw new NotFoundException('Revisión no encontrada.');
  }

  // Si es una revisión general, buscar todos los activos
  if (revision.general) {
    return await this.prisma.personal.findMany({
      where: { activo: true }, // Solo personal activo
      include: { cargo: true, unidad: true },
    });
  } else {
    // Si es una revisión individual, devolver solo al personal específico
    return await this.prisma.personal.findMany({
      where: { id: revision.fkPersonal },
      include: { cargo: true, unidad: true },
    });
  }
}
async evaluarPersonaEnRevision(
  revisionId: number,
  personaId: number,
  observaciones: string,
  aprobado: boolean
): Promise<void> {
  // Buscar la revisión por ID
  const revision = await this.prisma.revision.findUnique({ where: { id: revisionId } });

  if (!revision) {
    throw new NotFoundException('Revisión no encontrada.');
  }

  // Buscar el personal por ID
  const persona = await this.prisma.personal.findUnique({ where: { id: personaId } });

  if (!persona) {
    throw new NotFoundException('Personal no encontrado.');
  }

  // Guardar o actualizar la evaluación del personal en la revisión
  await this.prisma.revisionPersonal.upsert({
    where: {
      fkRevision_fkPersonal: { fkRevision: revisionId, fkPersonal: personaId },  // Usamos la clave compuesta
    },
    update: {  // Si ya existe, actualiza la evaluación
      observaciones,
      aprobado,
    },
    create: {  // Si no existe, crea una nueva entrada
      fkRevision: revisionId,
      fkPersonal: personaId,
      observaciones,
      aprobado,
    },
  });
}


}
