import { Module } from '@nestjs/common';
import { EstadoActivoService } from './estado-activo.service';
import { EstadoActivoController } from './estado-activo.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [EstadoActivoController],
  providers: [EstadoActivoService, PrismaService],
})
export class EstadoActivoModule {}
