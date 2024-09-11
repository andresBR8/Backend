import { Module } from '@nestjs/common';
import { SeguimientoService } from './seguimiento.service';
import { SeguimientoController } from './seguimiento.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [SeguimientoController],
  providers: [SeguimientoService,PrismaService],
})
export class SeguimientoModule {}
