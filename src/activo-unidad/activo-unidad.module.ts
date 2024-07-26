import { Module } from '@nestjs/common';
import { ActivoUnidadService } from './activo-unidad.service';
import { ActivoUnidadController } from './activo-unidad.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ActivoUnidadController],
  providers: [ActivoUnidadService, PrismaService],
})
export class ActivoUnidadModule {}
