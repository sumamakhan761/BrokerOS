// ============================================================================
// BrokerOS — Voice Telephony Media Streaming Gateway (WebSocket)
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
import { VoiceAudioService } from '../services/voice-audio.service.js';
import { VoiceAudioTranscoder } from './voice-audio-transcoder.js';
import { StreamSessionManager } from './voice-stream-session.js';

@Public()
@WebSocketGateway({
  path: '/voice/stream',
  cors: {
    origin: '*',
  },
})
@Injectable()
export class VoiceMediaStreamGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(VoiceMediaStreamGateway.name);
  private readonly sessionManager = new StreamSessionManager();

  constructor(private readonly audioService?: VoiceAudioService) {}

  handleConnection(client: Socket) {
    this.logger.log(`[MediaGateway] Telephony stream client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`[MediaGateway] Telephony stream client disconnected: ${client.id}`);
    this.sessionManager.endSessionBySocket(client.id);
  }

  @SubscribeMessage('start')
  async handleStreamStart(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const streamSid = data?.streamSid || data?.start?.streamSid || `stream_${Date.now()}`;
    const callSid = data?.start?.callSid || data?.callSid || `call_${Date.now()}`;
    const customParams = data?.start?.customParameters || data?.customParameters || {};

    const session = this.sessionManager.startSession(streamSid, callSid, client.id, customParams);

    // Speak First Message as soon as the media stream connects
    if (session.firstMessage && this.audioService) {
      try {
        const audio = await this.audioService.previewTtsAudio({
          text: session.firstMessage,
          voiceId: session.voiceId || 'rahul',
          voiceProvider: session.voiceProvider || 'sarvam',
        });

        if (audio?.audioBuffer) {
          const ulawBase64 = VoiceAudioTranscoder.pcm16ToBase64Ulaw(audio.audioBuffer);
          const chunkSize = 160; // 20ms of μ-law audio at 8kHz
          for (let offset = 0; offset < ulawBase64.length; offset += chunkSize) {
            const chunk = ulawBase64.substring(offset, offset + chunkSize);
            client.emit('media', {
              event: 'media',
              streamSid,
              media: { payload: chunk },
            });
            this.sessionManager.recordPacketSent(streamSid);
          }
        }
      } catch (err: any) {
        this.logger.warn(`Failed to synthesize first message for stream ${streamSid}: ${err?.message}`);
      }
    }

    return { event: 'started', streamSid };
  }

  @SubscribeMessage('media')
  handleMediaChunk(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const streamSid = data?.streamSid;
    if (streamSid) {
      this.sessionManager.recordPacketReceived(streamSid);
    }
  }

  @SubscribeMessage('stop')
  handleStreamStop(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const streamSid = data?.streamSid || data?.stop?.streamSid;
    if (streamSid) {
      this.sessionManager.endSession(streamSid);
    }
    return { event: 'stopped', streamSid };
  }

  getActiveSessionsCount(): number {
    return this.sessionManager.getActiveCount();
  }
}
