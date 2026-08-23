import { Controller, Get, Patch, Param, Req } from '@nestjs/common';
import { NotificationsService } from './notifications.service.js';
import { Roles, AllowAnonymous } from '@thallesp/nestjs-better-auth';

@Controller('api/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Get()
  async getUserNotifications(@Req() req: any) {
    const userId = req.user?.id;
    if (!userId) return [];
    return this.notificationsService.getUserNotifications(userId);
  }

  @Patch(':id/read')
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new Error("Unauthorized");
    return this.notificationsService.markAsRead(id, userId);
  }
}
