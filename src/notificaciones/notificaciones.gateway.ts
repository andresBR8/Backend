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

  private connectedClients: Map<string, { socket: Socket, role: string }> = new Map();

  handleConnection(client: Socket): void {
    console.log(`Client connected: ${client.id}`);
    client.on('error', (error) => {
      console.error(`Error with client ${client.id}:`, error);
    });
  }

  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('setRole')
handleSetRole(client: Socket, role: string): void {
  try {
    this.connectedClients.set(client.id, { socket: client, role });
    console.log(`Client ${client.id} set role to ${role}`);
    client.emit('roleSet', { success: true, role });
  } catch (error) {
    console.error(`Error setting role for client ${client.id}:`, error);
    client.emit('roleSet', { success: false, error: 'Failed to set role' });
  }
}

sendNotification(event: string, data: any, roles: string[] = []): void {
  try {
    for (const [clientId, clientInfo] of this.connectedClients) {
      if (roles.length === 0 || roles.includes(clientInfo.role)) {
        clientInfo.socket.emit(event, data);
      }
    }
    console.log(`Notification sent: ${event}`, roles.length ? `to roles: ${roles.join(', ')}` : 'to all clients');
  } catch (error) {
    console.error('Error sending notification:', error);
  }
}

}
