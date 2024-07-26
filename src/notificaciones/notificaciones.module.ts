import { Module } from '@nestjs/common';
import { NotificationsGateway } from './notificaciones.gateway';
import { NotificationsService } from './notificaciones.service';

@Module({
  providers: [NotificationsGateway, NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
