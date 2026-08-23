import { Injectable, Logger } from '@nestjs/common';
import { put } from '@vercel/blob';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
  ): Promise<string> {
    this.logger.log(`Uploading ${fileName} to Vercel Blob`);
    try {
      const { url } = await put(fileName, fileBuffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      return url;
    } catch (error) {
      this.logger.error('Vercel Blob upload failed', error);
      throw error;
    }
  }
}
