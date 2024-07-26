import { Module } from '@nestjs/common';
import { UnidadService } from './unidad.service';
import { UnidadController } from './unidad.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [UnidadController],
  providers: [UnidadService, PrismaService],
})
export class UnidadModule {}
