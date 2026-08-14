import { Controller, Get, Post, Body, Param, Req, Query, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { put } from '@vercel/blob';
import { ChatService } from './chat.service.js';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Get('contacts')
  async getContacts(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) return { success: false, message: 'Unauthorized' };

    const contacts = await this.chatService.getValidContacts(userId);
    return { success: true, data: contacts };
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: any) {
    if (!file) return { success: false, url: null };
    const blob = await put(`chat/${Date.now()}-${file.originalname}`, file.buffer, {
      access: 'private',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return { success: true, data: { url: blob.url, name: file.originalname, type: file.mimetype } };
  }

  @Get('rooms')
  async getRooms(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) return { success: false, message: 'Unauthorized' };

    const rooms = await this.chatService.getChatRooms(userId);
    return { success: true, data: rooms };
  }

  @Post('direct/:targetUserId')
  async getOrCreateRoom(@Req() req: any, @Param('targetUserId') targetUserId: string) {
    const userId = req.user?.id;
    if (!userId) return { success: false, message: 'Unauthorized' };

    const room = await this.chatService.getOrCreateDirectRoom(userId, targetUserId);
    return { success: true, data: room };
  }

  @Get('rooms/:roomId/messages')
  async getMessages(
    @Req() req: any,
    @Param('roomId') roomId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string
  ) {
    const userId = req.user?.id;
    if (!userId) return { success: false, message: 'Unauthorized' };

    const parsedLimit = limit ? parseInt(limit, 10) : 20;
    const messages = await this.chatService.getMessages(roomId, cursor, parsedLimit);
    return { success: true, data: messages };
  }

  @Post('rooms/:roomId/messages')
  async sendMessage(
    @Req() req: any,
    @Param('roomId') roomId: string,
    @Body() body: { content: string, attachment?: { url: string, type: string, name: string } }
  ) {
    const userId = req.user?.id;
    if (!userId) return { success: false, message: 'Unauthorized' };

    const message = await this.chatService.sendMessage(userId, roomId, body.content, body.attachment);
    // Note: The real-time broadcast is typically handled by the Gateway or the service calling the Gateway.
    // We will let the Gateway listen to socket events instead, OR we can emit from here if we inject the Gateway.
    return { success: true, data: message };
  }

  @Post('rooms/:roomId/read')
  async markAsRead(@Req() req: any, @Param('roomId') roomId: string) {
    const userId = req.user?.id;
    if (!userId) return { success: false, message: 'Unauthorized' };

    await this.chatService.markAsRead(userId, roomId);
    return { success: true, message: 'Marked as read' };
  }
}
