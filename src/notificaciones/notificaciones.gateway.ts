import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'https://activosfijosemi.up.railway.app', // Replace this with your production URL
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
  }

  handleDisconnect(client: Socket): void {
    console.log(`Client disconnected: ${client.id}`);
    this.connectedClients.delete(client.id);
  }

  @SubscribeMessage('setRole')
  handleSetRole(client: Socket, role: string): void {
    this.connectedClients.set(client.id, { socket: client, role });
    console.log(`Client ${client.id} set role to ${role}`);
  }

  sendNotification(event: string, data: any, roles: string[] = []): void {
    for (const [clientId, clientInfo] of this.connectedClients) {
      if (roles.length === 0 || roles.includes(clientInfo.role)) {
        clientInfo.socket.emit(event, data);
      }
    }
  }
}
