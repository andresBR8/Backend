import { Module } from '@nestjs/common';
import { AsignacionActivoUnidadService } from './asignacion-activo-unidad.service';
import { AsignacionActivoUnidadController } from './asignacion-activo-unidad.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [AsignacionActivoUnidadController],
  providers: [AsignacionActivoUnidadService,PrismaService],
})
export class AsignacionActivoUnidadModule {}
