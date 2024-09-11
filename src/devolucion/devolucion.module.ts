import { Module } from '@nestjs/common';
import { DevolucionService } from './devolucion.service';
import { DevolucionController } from './devolucion.controller';
import { PrismaService } from 'src/prisma.service';
import { NotificationsModule } from 'src/notificaciones/notificaciones.module';

@Module({
  imports: [NotificationsModule],
  controllers: [DevolucionController],
  providers: [DevolucionService,PrismaService],
})
export class DevolucionModule {}
