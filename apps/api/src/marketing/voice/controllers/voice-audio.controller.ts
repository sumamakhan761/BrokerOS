import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { Public } from '@thallesp/nestjs-better-auth';
import type { Response } from 'express';
import { VoiceAudioService } from '../services/voice-audio.service.js';
import { PreviewAudioTtsDto } from '../dto/voice.dto.js';

@Public()
@Controller('api/marketing/voice/audio')
export class VoiceAudioController {
  constructor(private readonly audioService: VoiceAudioService) {}

  @Post('preview')
  async previewAudio(@Body() dto: PreviewAudioTtsDto, @Res() res: Response) {
    try {
      const result = await this.audioService.previewTtsAudio(dto);
      res.setHeader('Content-Type', result.contentType || 'audio/wav');
      res.setHeader('Content-Length', result.audioBuffer.length.toString());
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.status(HttpStatus.OK).send(result.audioBuffer);
    } catch (err: any) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        statusCode: 500,
        message: err?.message || 'Failed to synthesize audio preview',
      });
    }
  }
}
