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
import { prismaClient } from '@brokeros/prisma';
import { VoiceAudioService } from '../services/voice-audio.service.js';
import { VoiceAudioTranscoder } from './voice-audio-transcoder.js';

export interface TelephonyStreamSession {
  streamSid: string;
  callSid: string;
  campaignId?: string;
  agentPlatform?: string;
  voiceId: string;
  voiceProvider: string;
  firstMessage: string;
  scriptPrompt: string;
  socketId: string;
  startedAt: Date;
  audioPacketsReceived: number;
  audioPacketsSent: number;
}

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
  private readonly prisma = prismaClient;
  private readonly activeSessions = new Map<string, TelephonyStreamSession>();

  constructor(private readonly audioService?: VoiceAudioService) { }

  handleConnection(client: Socket) {
    this.logger.log(`[MediaGateway] Telephony stream client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`[MediaGateway] Telephony stream client disconnected: ${client.id}`);
    for (const [streamSid, session] of this.activeSessions.entries()) {
      if (session.socketId === client.id) {
        this.activeSessions.delete(streamSid);
        this.logger.log(`[MediaGateway] Cleared stream session: ${streamSid} (Packets: ${session.audioPacketsReceived} in / ${session.audioPacketsSent} out)`);
        break;
      }
    }
  }

  @SubscribeMessage('start')
  async handleStreamStart(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const streamSid = data?.streamSid || data?.start?.streamSid || `stream_${Date.now()}`;
    const callSid = data?.start?.callSid || data?.callSid || `call_${Date.now()}`;
    const customParams = data?.start?.customParameters || data?.customParameters || {};

    const session: TelephonyStreamSession = {
      streamSid,
      callSid,
      campaignId: customParams.campaignId,
      agentPlatform: customParams.agentPlatform || 'SARVAM',
      voiceId: customParams.voiceId || 'rahul',
      voiceProvider: customParams.voiceProvider || 'sarvam',
      firstMessage: customParams.firstMessage || 'Hello! Thank you for connecting with Skyline Realty. How may I assist your property search today?',
      scriptPrompt: customParams.scriptPrompt || '',
      socketId: client.id,
      startedAt: new Date(),
      audioPacketsReceived: 0,
      audioPacketsSent: 0,
    };

    this.activeSessions.set(streamSid, session);
    this.logger.log(
      `[MediaGateway] Started media stream: ${streamSid} for Call: ${callSid} (Agent: ${session.agentPlatform})`,
    );

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
          const chunkSize = 160; // 20ms of μ-law audio
          for (let offset = 0; offset < ulawBase64.length; offset += chunkSize) {
            const chunk = ulawBase64.substring(offset, offset + chunkSize);
            client.emit('media', {
              event: 'media',
              streamSid,
              media: { payload: chunk },
            });
            session.audioPacketsSent += 1;
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
    const session = this.activeSessions.get(streamSid);

    if (session) {
      session.audioPacketsReceived += 1;
    }
  }

  @SubscribeMessage('stop')
  handleStreamStop(@ConnectedSocket() client: Socket, @MessageBody() data: any) {
    const streamSid = data?.streamSid || data?.stop?.streamSid;
    if (streamSid && this.activeSessions.has(streamSid)) {
      const session = this.activeSessions.get(streamSid)!;
      this.activeSessions.delete(streamSid);
      this.logger.log(
        `[MediaGateway] Stopped media stream: ${streamSid} (Duration: ${(Date.now() - session.startedAt.getTime()) / 1000}s)`,
      );
    }
    return { event: 'stopped', streamSid };
  }

  getActiveSessionsCount(): number {
    return this.activeSessions.size;
  }
}

