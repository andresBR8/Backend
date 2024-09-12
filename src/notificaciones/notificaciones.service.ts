import { Injectable } from '@nestjs/common';
import { NotificationsGateway } from './notificaciones.gateway';

@Injectable()
export class NotificationsService {
  constructor(private readonly notificationsGateway: NotificationsGateway) {}

  sendGeneralNotification(event: string, data: any): void {
    this.notificationsGateway.sendNotification(event, data);
  }

  sendRoleSpecificNotification(event: string, data: any, roles: string[]): void {
    this.notificationsGateway.sendNotification(event, data, roles);
  }
}