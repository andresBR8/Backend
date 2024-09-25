import { Module } from '@nestjs/common';
import { AsignacionService } from './asignacion.service';
import { AsignacionController } from './asignacion.controller';
import { PrismaService } from '../prisma.service';
import { NotificationsModule } from '../notificaciones/notificaciones.module';
import { NotificationServiceCorreo } from 'src/notificaciones/notificaciones.service.correo';

@Module({
  imports: [NotificationsModule],
  controllers: [AsignacionController],
  providers: [AsignacionService,PrismaService,NotificationServiceCorreo],
})
export class AsignacionModule {}
