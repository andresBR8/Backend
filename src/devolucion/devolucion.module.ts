import { Module } from '@nestjs/common';
import { DevolucionService } from './devolucion.service';
import { DevolucionController } from './devolucion.controller';
import { PrismaService } from 'src/prisma.service';
import { NotificationsModule } from 'src/notificaciones/notificaciones.module';
import { NotificationServiceCorreo } from 'src/notificaciones/notificaciones.service.correo';

@Module({
  imports: [NotificationsModule],
  controllers: [DevolucionController],
  providers: [DevolucionService,PrismaService,NotificationServiceCorreo],
})
export class DevolucionModule {}
