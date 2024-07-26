import { Module } from '@nestjs/common';
import { ActivoModeloService } from './activo-modelo.service';
import { ActivoModeloController } from './activo-modelo.controller';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [ActivoModeloController],
  providers: [ActivoModeloService, PrismaService],
})
export class ActivoModeloModule {}
