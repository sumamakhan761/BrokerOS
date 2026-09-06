// ============================================================================
// BrokerOS — WhatsApp Media Service (Inbound Proxy & Outbound Upload)
// ============================================================================

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { put } from '@vercel/blob';
import { getMediaUrl, downloadMedia } from '@brokeros/int-whatsapp';
import { WhatsAppConfigService } from '../config/whatsapp-config.service.js';

@Injectable()
export class WhatsAppMediaService {
  private readonly logger = new Logger(WhatsAppMediaService.name);

  constructor(private readonly configService: WhatsAppConfigService) {}

  /**
   * Proxy inbound media from Meta CDN to the client browser.
   * Resolves media ID into a short-lived download URL, fetches the binary bytes,
   * and returns the buffer with content-type.
   */
  async getInboundMediaProxy(
    mediaId: string,
    accountId: string,
  ): Promise<{ buffer: Buffer; contentType: string }> {
    const account = await this.configService.getDecryptedAccount(accountId);
    if (!account) {
      throw new NotFoundException('WhatsApp account not found');
    }

    try {
      const mediaInfo = await getMediaUrl({
        mediaId,
        accessToken: account.accessToken,
      });

      const { buffer, contentType } = await downloadMedia({
        downloadUrl: mediaInfo.url,
        accessToken: account.accessToken,
      });

      return {
        buffer,
        contentType:
          contentType || mediaInfo.mimeType || 'application/octet-stream',
      };
    } catch (err: any) {
      this.logger.error(`Media proxy failed for ${mediaId}: ${err?.message}`);
      throw new BadRequestException(
        `Failed to retrieve media: ${err?.message}`,
      );
    }
  }

  /**
   * Upload an outbound media file (attachment) to Vercel Blob storage.
   */
  async uploadOutboundMedia(file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
  }): Promise<{ url: string }> {
    if (!file || !file.buffer) {
      throw new BadRequestException('No file provided');
    }

    try {
      const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
      if (blobToken) {
        const blob = await put(
          `whatsapp/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`,
          file.buffer,
          {
            access: 'public',
            contentType: file.mimetype,
            token: blobToken,
          },
        );
        return { url: blob.url };
      }

      // Local fallback for development without Vercel Blob token
      const base64Data = file.buffer.toString('base64');
      const dataUri = `data:${file.mimetype};base64,${base64Data}`;
      return { url: dataUri };
    } catch (err: any) {
      this.logger.error(`Media upload failed: ${err?.message}`);
      throw new BadRequestException(`Media upload failed: ${err?.message}`);
    }
  }
}
