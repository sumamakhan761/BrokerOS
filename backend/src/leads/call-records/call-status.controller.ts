import { Controller, Post, Body, Req } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';

@Controller('api/call-status')
export class CallStatusController {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Called by the mobile app (AutoDialer hook) when:
   * - A call starts: { isOnCall: true }
   * - A call ends:   { isOnCall: false }
   *
   * Updates the authenticated user's isOnCall flag in the database.
   * This flag is read by the manager's employee-cards endpoint to show
   * a real-time on-call/not-in-call indicator on each employee card.
   */
  @Post()
  async setCallStatus(@Body() body: { isOnCall: boolean }, @Req() req: any) {
    const userId = req.user?.id;
    if (!userId) return { success: false, message: 'Not authenticated' };

    await this.prisma.user.update({
      where: { id: userId },
      data: { isOnCall: body.isOnCall },
    });

    return { success: true, isOnCall: body.isOnCall };
  }
}
