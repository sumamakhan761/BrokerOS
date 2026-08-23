import { Controller, Get, Post, Param, Body, UseInterceptors, UploadedFile, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CallRecordsService } from './call-records.service.js';
import { UploadCallRecordDto } from './dto/call-record.dto.js';

@Controller('api/leads')
export class CallRecordsController {
  constructor(private readonly callRecordsService: CallRecordsService) {}

  @Post('upload-call-record')
  @UseInterceptors(FileInterceptor('file'))
  async uploadCallRecord(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: UploadCallRecordDto,
  ) {
    console.log('--- INCOMING UPLOAD REQUEST ---');
    console.log('Body:', body);
    console.log('File:', file ? `Exists (size: ${file.size})` : 'Missing');
    try {
      const result = await this.callRecordsService.uploadCallRecord(file, body);
      console.log('Upload Result:', result);
      return result;
    } catch (e: any) {
      console.error('--- UPLOAD ERROR ---', e);
      return { success: false, message: e.message, stack: e.stack };
    }
  }

  @Get('call-records/:id/audio')
  async getCallRecordAudio(@Param('id') id: string, @Res() res: Response) {
    const record = await this.callRecordsService.getCallRecord(id);
    if (!record || !record.recordingUrl) {
      return res.status(404).send('Audio not found');
    }

    try {
      const blobRes = await fetch(record.recordingUrl, {
        headers: { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` },
      });

      if (!blobRes.ok) {
        return res.status(blobRes.status).send('Failed to fetch audio from blob storage');
      }

      res.set({
        'Content-Type': 'audio/mpeg',
        'Accept-Ranges': 'bytes',
      });

      const contentLength = blobRes.headers.get('content-length');
      if (contentLength) {
        res.set('Content-Length', contentLength);
      }

      const arrayBuffer = await blobRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (e) {
      console.error('Error fetching audio blob:', e);
      res.status(500).send('Internal server error');
    }
  }
}
