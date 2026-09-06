// ============================================================================
// BrokerOS — WhatsApp Outbound Webhooks Delivery Service
// ============================================================================

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import { postSafeWebhook } from '@brokeros/int-whatsapp';

const MAX_CONSECUTIVE_WEBHOOK_FAILURES = 5;

@Injectable()
export class WhatsAppOutboundWebhooksService {
  private readonly logger = new Logger(WhatsAppOutboundWebhooksService.name);
  private readonly prisma = prismaClient;

  /**
   * Dispatch an outbound event to all active endpoints subscribed to it.
   * Fire-and-forget: never throws or interrupts calling business logic.
   */
  async dispatchEvent(
    accountId: string,
    eventName: string,
    data: any,
  ): Promise<void> {
    setImmediate(async () => {
      try {
        const endpoints = await this.prisma.whatsAppWebhookEndpoint.findMany({
          where: {
            accountId,
            isActive: true,
          },
        });

        const matching = endpoints.filter(
          (ep) => ep.events.includes(eventName) || ep.events.includes('*'),
        );

        const payload = {
          event: eventName,
          accountId,
          timestamp: new Date().toISOString(),
          data,
        };

        await Promise.allSettled(
          matching.map(async (ep) => {
            try {
              const res = await postSafeWebhook(ep.url, payload, ep.secret, {
                timeoutMs: 5000,
              });

              if (!res.ok) {
                const nextFailures = (ep.failureCount || 0) + 1;
                const shouldDisable =
                  nextFailures >= MAX_CONSECUTIVE_WEBHOOK_FAILURES;

                await this.prisma.whatsAppWebhookEndpoint.update({
                  where: { id: ep.id },
                  data: {
                    failureCount: nextFailures,
                    isActive: shouldDisable ? false : true,
                    disabledAt: shouldDisable ? new Date() : undefined,
                  },
                });

                if (shouldDisable) {
                  this.logger.warn(
                    `Outbound webhook ${ep.id} disabled after ${MAX_CONSECUTIVE_WEBHOOK_FAILURES} failures`,
                  );
                }
              } else {
                if (ep.failureCount > 0) {
                  await this.prisma.whatsAppWebhookEndpoint.update({
                    where: { id: ep.id },
                    data: { failureCount: 0 },
                  });
                }
              }
            } catch (err: any) {
              this.logger.error(
                `Webhook delivery failed for ${ep.url}: ${err?.message}`,
              );
            }
          }),
        );
      } catch (err: any) {
        this.logger.error(`Outbound webhook dispatch error: ${err?.message}`);
      }
    });
  }

  // ─────────────────────────────────────────────
  // Endpoint Management CRUD
  // ─────────────────────────────────────────────

  async listEndpoints(accountId: string) {
    const endpoints = await this.prisma.whatsAppWebhookEndpoint.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
    });
    return endpoints.map((ep) => ({
      ...ep,
      secret: '••••••••',
    }));
  }

  async createEndpoint(
    accountId: string,
    data: { url: string; secret: string; events: string[] },
  ) {
    if (!data.url || !data.secret || !data.events?.length) {
      throw new BadRequestException('url, secret, and events are required');
    }

    const created = await this.prisma.whatsAppWebhookEndpoint.create({
      data: {
        accountId,
        url: data.url.trim(),
        secret: data.secret.trim(),
        events: data.events,
        isActive: true,
      },
    });

    return {
      ...created,
      secret: '••••••••',
    };
  }

  async deleteEndpoint(id: string, accountId: string) {
    const existing = await this.prisma.whatsAppWebhookEndpoint.findFirst({
      where: { id, accountId },
    });

    if (!existing) {
      throw new NotFoundException('Webhook endpoint not found');
    }

    await this.prisma.whatsAppWebhookEndpoint.delete({
      where: { id },
    });

    return { success: true };
  }
}
