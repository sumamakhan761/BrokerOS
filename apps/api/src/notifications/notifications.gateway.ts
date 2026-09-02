import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { SendNotificationDto } from './dto/notifications.dto.js';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  // Map of userId to array of socket IDs
  private userSockets = new Map<string, string[]>();

  handleConnection(client: Socket) {
    let token =
      client.handshake.auth.token || client.handshake.headers.authorization;
    if (!token && client.handshake.headers.cookie) {
      const match = client.handshake.headers.cookie.match(
        /better-auth\.session_token=([^;]+)/,
      );
      if (match) token = match[1];
    }

    if (!token) {
      client.disconnect();
      return;
    }

    try {
      // Very basic decoding - assuming JWT structure for now.
      // Replace with your actual auth verification logic if BetterAuth is used.
      // E.g. using `auth.api.getSession` or simply trusting the connection if the user passes their ID explicitly (for simplicity during implementation)
      const userId = client.handshake.query.userId as string;
      if (userId) {
        this.addSocketToUser(userId, client.id);
        this.logger.log(`Client connected: ${client.id} for user ${userId}`);
      }
    } catch (err) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.removeSocketFromUser(userId, client.id);
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  private addSocketToUser(userId: string, socketId: string) {
    const sockets = this.userSockets.get(userId) || [];
    sockets.push(socketId);
    this.userSockets.set(userId, sockets);
  }

  private removeSocketFromUser(userId: string, socketId: string) {
    const sockets = this.userSockets.get(userId) || [];
    const updatedSockets = sockets.filter((id) => id !== socketId);
    if (updatedSockets.length === 0) {
      this.userSockets.delete(userId);
    } else {
      this.userSockets.set(userId, updatedSockets);
    }
  }

  sendNotificationToUser(userId: string, notification: SendNotificationDto) {
    const sockets = this.userSockets.get(userId);
    if (sockets && sockets.length > 0) {
      sockets.forEach((socketId) => {
        this.server.to(socketId).emit('new_notification', notification);
      });
    }
  }
}
