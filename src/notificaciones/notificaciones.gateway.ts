import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://activosfijosemi.up.railway.app'
      : 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  }
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedClients: Map<string, { socket: Socket, roles: Set<string> }> = new Map();

  handleConnection(client: Socket): void {
    console.log(`Client connected: ${client.id}`);
    this.connectedClients.set(client.id, { socket: client, roles: new Set() });
  }

  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('setRoles')
  handleSetRoles(client: Socket, roles: string[]): void {
    try {
      const clientInfo = this.connectedClients.get(client.id);
      if (clientInfo) {
        clientInfo.roles = new Set(roles);
        console.log(`Client ${client.id} set roles to ${roles.join(', ')}`);
        client.emit('rolesSet', { success: true, roles });
      }
    } catch (error) {
      console.error(`Error setting roles for client ${client.id}:`, error);
      client.emit('rolesSet', { success: false, error: 'Failed to set roles' });
    }
  }

  sendNotification(event: string, data: any, specificRoles: string[] = []): void {
    try {
      if (specificRoles.length === 0) {
        // Enviar a todos los clientes
        this.server.emit(event, data);
        console.log(`Notification sent to all clients: ${event}`);
      } else {
        // Enviar solo a clientes con roles específicos
        for (const [clientId, clientInfo] of this.connectedClients) {
          if (specificRoles.some(role => clientInfo.roles.has(role))) {
            clientInfo.socket.emit(event, data);
          }
        }
        console.log(`Notification sent to roles ${specificRoles.join(', ')}: ${event}`);
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }
}