// ============================================================================
// BrokerOS — WhatsApp Real-time WebSocket Gateway (Socket.IO)
// ============================================================================

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
import { Logger, Injectable } from '@nestjs/common';
import { Public } from '@thallesp/nestjs-better-auth';
import { WA_EVENTS } from '@brokeros/constants';

@Public()
@WebSocketGateway({
  namespace: '/whatsapp',
  cors: {
    origin: true,
    credentials: true,
  },
})
@Injectable()
export class WhatsAppRealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(WhatsAppRealtimeGateway.name);

  handleConnection(client: Socket) {
    const conversationId = client.handshake.query.conversationId as string;
    const accountId = client.handshake.query.accountId as string;

    if (conversationId) {
      client.join(`conv:${conversationId}`);
    }
    if (accountId) {
      client.join(`acc:${accountId}`);
    }

    this.logger.log(
      `WhatsApp client connected: ${client.id} (conv: ${conversationId || 'none'}, acc: ${accountId || 'none'})`,
    );
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`WhatsApp client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join:conversation')
  handleJoinConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (data?.conversationId) {
      client.join(`conv:${data.conversationId}`);
    }
  }

  @SubscribeMessage('leave:conversation')
  handleLeaveConversation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string },
  ) {
    if (data?.conversationId) {
      client.leave(`conv:${data.conversationId}`);
    }
  }

  @SubscribeMessage('join:account')
  handleJoinAccount(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { accountId: string },
  ) {
    if (data?.accountId) {
      client.join(`acc:${data.accountId}`);
    }
  }

  /**
   * Broadcast an incoming or outgoing message to active thread subscribers.
   */
  emitMessageReceived(
    conversationId: string,
    message: any,
    accountId?: string,
  ) {
    if (!this.server) return;
    this.server
      .to(`conv:${conversationId}`)
      .emit(WA_EVENTS.MESSAGE_RECEIVED, message);
    if (accountId) {
      this.server
        .to(`acc:${accountId}`)
        .emit(WA_EVENTS.MESSAGE_RECEIVED, message);
    }
  }

  emitMessageSent(conversationId: string, message: any, accountId?: string) {
    if (!this.server) return;
    this.server
      .to(`conv:${conversationId}`)
      .emit(WA_EVENTS.MESSAGE_SENT, message);
    if (accountId) {
      this.server.to(`acc:${accountId}`).emit(WA_EVENTS.MESSAGE_SENT, message);
    }
  }

  emitMessageStatus(
    conversationId: string,
    messageId: string,
    status: string,
    accountId?: string,
  ) {
    if (!this.server) return;
    const payload = { messageId, status, conversationId };
    this.server
      .to(`conv:${conversationId}`)
      .emit(WA_EVENTS.MESSAGE_STATUS, payload);
    if (accountId) {
      this.server
        .to(`acc:${accountId}`)
        .emit(WA_EVENTS.MESSAGE_STATUS, payload);
    }
  }

  emitConversationUpdated(accountId: string, conversation: any) {
    if (!this.server) return;
    this.server
      .to(`acc:${accountId}`)
      .emit(WA_EVENTS.CONVERSATION_UPDATED, conversation);
  }
}
