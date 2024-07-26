import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notificaciones.gateway';

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsGateway: NotificationsGateway) {}

  sendNotification(event: string, data: any, roles: string[] = []): void { // Agregar roles como parámetro
    this.notificationsGateway.sendNotification(event, data, roles);
  }
}
