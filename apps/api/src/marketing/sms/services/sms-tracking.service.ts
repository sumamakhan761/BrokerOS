import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import type { SmsWebhookEvent } from '@brokeros/types';

@Injectable()
export class SmsTrackingService {
  private readonly logger = new Logger(SmsTrackingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async resolveShortLink(code: string, ip?: string, userAgent?: string): Promise<string> {
    try {
      const link = await this.prisma.smsShortLink.findUnique({
        where: { code },
      });

      if (!link) return 'https://brokeros.io';

      await this.prisma.$transaction([
        this.prisma.smsShortLink.update({
          where: { id: link.id },
          data: { clicksCount: { increment: 1 } },
        }),
        this.prisma.smsTrackingEvent.create({
          data: {
            campaignId: link.campaignId,
            recipientId: link.recipientId,
            eventType: 'CLICK',
            urlClicked: link.destinationUrl,
            ipAddress: ip,
            userAgent,
          },
        }),
        this.prisma.smsRecipient.update({
          where: { id: link.recipientId },
          data: {
            firstClickedAt: new Date(),
            clickCount: { increment: 1 },
          },
        }),
        this.prisma.smsCampaign.update({
          where: { id: link.campaignId },
          data: { clickedCount: { increment: 1 } },
        }),
      ]);

      return link.destinationUrl;
    } catch (err: any) {
      this.logger.warn(`Failed to resolve shortlink ${code}: ${err?.message}`);
      return 'https://brokeros.io';
    }
  }

  async processWebhookEvents(events: SmsWebhookEvent[]) {
    for (const ev of events) {
      if (ev.eventType === 'DELIVERED') {
        if (ev.campaignId) {
          await this.prisma.smsCampaign.update({
            where: { id: ev.campaignId },
            data: { deliveredCount: { increment: 1 } },
          }).catch(() => null);
        }
        await this.prisma.smsRecipient.updateMany({
          where: { phone: ev.recipientPhone, ...(ev.campaignId ? { campaignId: ev.campaignId } : {}) },
          data: { status: 'DELIVERED', deliveredAt: new Date() },
        }).catch(() => null);
      } else if (ev.eventType === 'FAILED') {
        if (ev.campaignId) {
          await this.prisma.smsCampaign.update({
            where: { id: ev.campaignId },
            data: { failedCount: { increment: 1 } },
          }).catch(() => null);
        }
        await this.prisma.smsRecipient.updateMany({
          where: { phone: ev.recipientPhone, ...(ev.campaignId ? { campaignId: ev.campaignId } : {}) },
          data: {
            status: 'FAILED',
            failReason: ev.metadata?.reason || 'Carrier delivery failure',
            failedAt: new Date(),
          },
        }).catch(() => null);
      }
    }
  }
}
