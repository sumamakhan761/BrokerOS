import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req, UseInterceptors, UploadedFile, UnauthorizedException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { put } from '@vercel/blob';
import { ApprovalsService } from './approvals.service.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

@Controller('api/approvals')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any) {
    if (!file) return { url: null };
    const blob = await put(`approvals/${Date.now()}-${file.originalname}`, file.buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return { url: blob.url };
  }

  @Post()
  async createRequest(@Req() req, @Body() body: { title: string; description: string; fileUrl?: string; type?: any; bookingId?: string }) {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return this.approvalsService.createRequest(userId, body.title, body.description, body.fileUrl, body.type, body.bookingId);
  }

  @Get()
  async getRequests(@Req() req) {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return this.approvalsService.getRequests(userId);
  }

  @Get(':id')
  async getRequestDetails(@Param('id') id: string) {
    return this.approvalsService.getRequestDetails(id);
  }

  @Post(':id/messages')
  async addMessage(
    @Param('id') id: string,
    @Req() req,
    @Body() body: { title: string; description: string; fileUrl?: string; action?: 'APPROVE' | 'REJECT' | 'REPLY' }
  ) {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return this.approvalsService.addMessage(id, userId, body);
  }

  @Patch(':id/close')
  async closeRequest(@Param('id') id: string) {
    return this.approvalsService.closeRequest(id);
  }

  @Post(':id/redo')
  async redoRequestDecision(@Param('id') id: string, @Req() req) {
    const userId = req.user?.id || req.user?.userId;
    if (!userId) throw new UnauthorizedException('User not authenticated');
    return this.approvalsService.redoRequestDecision(id, userId);
  }
}
