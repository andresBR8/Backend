import { Module } from '@nestjs/common';
import { ActivoModeloService } from './activo-modelo.service';
import { ActivoModeloController } from './activo-modelo.controller';
import { PrismaService } from '../prisma.service';
import { NotificationsModule } from 'src/notificaciones/notificaciones.module';

@Module({
  imports: [NotificationsModule],
  controllers: [ActivoModeloController],
  providers: [ActivoModeloService, PrismaService],
})
export class ActivoModeloModule {}
