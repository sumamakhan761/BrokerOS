import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, forwardRef, Inject } from '@nestjs/common';
import { ChatService } from './chat.service.js';
import {
  JoinRoomDto,
  LeaveRoomDto,
  SendSocketMessageDto,
  TypingIndicatorDto,
} from './dto/chat.dto.js';

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private userSockets = new Map<string, string[]>();

  constructor(
    @Inject(forwardRef(() => ChatService))
    private chatService: ChatService,
  ) {}

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
      const userId = client.handshake.query.userId as string;
      if (userId) {
        this.addSocketToUser(userId, client.id);
        this.logger.log(
          `Chat client connected: ${client.id} for user ${userId}`,
        );
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
    this.logger.log(`Chat client disconnected: ${client.id}`);
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

  // Real-time events

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @MessageBody() data: JoinRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`room_${data.roomId}`);
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @MessageBody() data: LeaveRoomDto,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`room_${data.roomId}`);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @MessageBody() data: SendSocketMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.handshake.query.userId as string;
    if (!userId) return;

    try {
      const message = await this.chatService.sendMessage(
        userId,
        data.roomId,
        data.content,
        data.attachment,
      );

      // Broadcast to everyone in the room (including sender to confirm receipt if they use multiple devices)
      this.server.to(`room_${data.roomId}`).emit('new_message', message);

      // We could also emit to specific user sockets if they haven't joined the room yet (e.g. for push notifications or unread count updates)
      // For a robust system, we would fetch room members and emit 'notification' events.
    } catch (error) {
      this.logger.error('Failed to send message via socket', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() data: TypingIndicatorDto,
    @ConnectedSocket() client: Socket,
  ) {
    const userId = client.handshake.query.userId as string;
    if (!userId) return;

    // Broadcast typing status to the room, excluding the sender
    client.to(`room_${data.roomId}`).emit('user_typing', {
      userId,
      isTyping: data.isTyping,
      roomId: data.roomId,
    });
  }
}
