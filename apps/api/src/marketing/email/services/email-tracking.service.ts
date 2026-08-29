import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import type { EmailWebhookEvent } from '@brokeros/types';

@Injectable()
export class EmailTrackingService {
  private readonly logger = new Logger(EmailTrackingService.name);

  constructor(private readonly prisma: PrismaService) {}

  async recordOpenEvent(campaignId: string, recipientId: string, ip?: string, userAgent?: string) {
    try {
      await this.prisma.$transaction([
        this.prisma.emailTrackingEvent.create({
          data: {
            campaignId,
            recipientId,
            eventType: 'OPEN',
            ipAddress: ip,
            userAgent,
          },
        }),
        this.prisma.campaignRecipient.update({
          where: { id: recipientId },
          data: {
            status: 'OPENED',
            openCount: { increment: 1 },
            firstOpenedAt: new Date(),
          },
        }),
        this.prisma.marketingCampaign.update({
          where: { id: campaignId },
          data: { openedCount: { increment: 1 } },
        }),
      ]);
    } catch (e: any) {
      this.logger.warn(`Failed to record open event: ${e?.message}`);
    }
  }

  async recordClickEvent(campaignId: string, recipientId: string, url: string, ip?: string, userAgent?: string) {
    try {
      const recipient = await this.prisma.campaignRecipient.findUnique({
        where: { id: recipientId },
      });

      const isFirstOpen = !recipient?.firstOpenedAt || recipient.openCount === 0;

      const txOps: any[] = [
        this.prisma.emailTrackingEvent.create({
          data: {
            campaignId,
            recipientId,
            eventType: 'CLICK',
            urlClicked: url,
            ipAddress: ip,
            userAgent,
          },
        }),
        this.prisma.campaignRecipient.update({
          where: { id: recipientId },
          data: {
            status: 'CLICKED',
            clickCount: { increment: 1 },
            openCount: isFirstOpen ? { increment: 1 } : undefined,
            firstOpenedAt: recipient?.firstOpenedAt || new Date(),
            firstClickedAt: recipient?.firstClickedAt || new Date(),
          },
        }),
        this.prisma.marketingCampaign.update({
          where: { id: campaignId },
          data: {
            clickedCount: { increment: 1 },
            openedCount: isFirstOpen ? { increment: 1 } : undefined,
          },
        }),
      ];

      if (isFirstOpen) {
        txOps.push(
          this.prisma.emailTrackingEvent.create({
            data: {
              campaignId,
              recipientId,
              eventType: 'OPEN',
              ipAddress: ip,
              userAgent,
            },
          }),
        );
      }

      await this.prisma.$transaction(txOps);
    } catch (e: any) {
      this.logger.warn(`Failed to record click event: ${e?.message}`);
    }
  }

  async recordUnsubscribe(email: string, campaignId?: string, reason?: string) {
    try {
      await this.prisma.marketingUnsubscribe.upsert({
        where: { email: email.toLowerCase().trim() },
        create: {
          email: email.toLowerCase().trim(),
          campaignId,
          reason: reason || 'User requested one-click unsubscribe',
        },
        update: {
          reason: reason || 'User requested one-click unsubscribe',
        },
      });

      if (campaignId) {
        await this.prisma.marketingCampaign.update({
          where: { id: campaignId },
          data: { unsubscribedCount: { increment: 1 } },
        });
      }
    } catch (e: any) {
      this.logger.warn(`Failed to record unsubscribe: ${e?.message}`);
    }
  }

  async processWebhookEvents(events: EmailWebhookEvent[]) {
    for (const ev of events) {
      if (ev.eventType === 'UNSUBSCRIBED') {
        await this.recordUnsubscribe(ev.recipientEmail, ev.campaignId, ev.metadata?.bounceReason);
      } else if (ev.eventType === 'BOUNCED') {
        if (ev.campaignId) {
          await this.prisma.marketingCampaign.update({
            where: { id: ev.campaignId },
            data: { bouncedCount: { increment: 1 } },
          }).catch(() => null);
        }
        await this.prisma.campaignRecipient.updateMany({
          where: { email: ev.recipientEmail, ...(ev.campaignId ? { campaignId: ev.campaignId } : {}) },
          data: { status: 'BOUNCED', bounceReason: ev.metadata?.bounceReason || 'Bounced', bouncedAt: new Date() },
        }).catch(() => null);
      } else if (ev.eventType === 'DELIVERED') {
        if (ev.campaignId) {
          await this.prisma.marketingCampaign.update({
            where: { id: ev.campaignId },
            data: { deliveredCount: { increment: 1 } },
          }).catch(() => null);
        }
        await this.prisma.campaignRecipient.updateMany({
          where: { email: ev.recipientEmail, ...(ev.campaignId ? { campaignId: ev.campaignId } : {}) },
          data: { status: 'DELIVERED', deliveredAt: new Date() },
        }).catch(() => null);
      }
    }
  }
}
