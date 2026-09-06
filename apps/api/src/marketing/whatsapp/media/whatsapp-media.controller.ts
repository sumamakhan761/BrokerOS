// ============================================================================
// BrokerOS — WhatsApp Media Controller (REST Streaming & Upload)
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { WhatsAppMediaService } from './whatsapp-media.service.js';

@Controller('api/marketing/whatsapp/media')
export class WhatsAppMediaController {
  constructor(private readonly mediaService: WhatsAppMediaService) {}

  @Get(':mediaId')
  async getInboundMedia(
    @Param('mediaId') mediaId: string,
    @Query('accountId') accountId: string,
    @Res() res: Response,
  ) {
    if (!accountId) {
      throw new BadRequestException('accountId is required');
    }

    const { buffer, contentType } =
      await this.mediaService.getInboundMediaProxy(mediaId, accountId);

    res.set({
      'Content-Type': contentType,
      'Content-Length': buffer.length,
      'Cache-Control': 'public, max-age=86400',
    });

    res.send(buffer);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadMedia(@UploadedFile() file: any) {
    return this.mediaService.uploadOutboundMedia(file);
  }
}
