// ============================================================================
// BrokerOS — WhatsApp Marketing Worker Processor (Broadcasts & Pending Steps)
// ============================================================================

import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import { processBroadcast } from './whatsapp/whatsapp-broadcast.runner.js';
import { processPendingAutomation } from './whatsapp/whatsapp-automation.runner.js';
import { syncAllAccountTemplates } from './whatsapp/whatsapp-template.syncer.js';

@Injectable()
export class MarketingWhatsAppProcessor
  implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MarketingWhatsAppProcessor.name);
  private readonly prisma = prismaClient;
  private isScanning = false;
  private scanInterval: NodeJS.Timeout | null = null;
  private isScanningAutomations = false;
  private automationsScanInterval: NodeJS.Timeout | null = null;
  private templateSyncInterval: NodeJS.Timeout | null = null;

  onModuleInit() {
    this.logger.log('MarketingWhatsAppProcessor background scanner started.');
    setTimeout(() => this.scanAndProcessBroadcasts(), 3000);
    this.scanInterval = setInterval(() => this.scanAndProcessBroadcasts(), 7000);

    setTimeout(() => this.scanAndProcessPendingAutomations(), 5000);
    this.automationsScanInterval = setInterval(
      () => this.scanAndProcessPendingAutomations(),
      15000,
    );

    // Daily template sync (every 24 hours, runs first check after 12 seconds)
    setTimeout(() => this.syncAllAccountTemplates(), 12000);
    this.templateSyncInterval = setInterval(
      () => this.syncAllAccountTemplates(),
      24 * 60 * 60 * 1000,
    );
  }

  onModuleDestroy() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
    if (this.automationsScanInterval) {
      clearInterval(this.automationsScanInterval);
      this.automationsScanInterval = null;
    }
    if (this.templateSyncInterval) {
      clearInterval(this.templateSyncInterval);
      this.templateSyncInterval = null;
    }
  }

  // ─────────────────────────────────────────────
  // 1. WhatsApp Broadcast Processor
  // ─────────────────────────────────────────────

  async scanAndProcessBroadcasts(): Promise<void> {
    if (this.isScanning) return;
    this.isScanning = true;

    try {
      const eligibleBroadcasts = await this.prisma.whatsAppBroadcast.findMany({
        where: {
          OR: [
            { status: 'SENDING' },
            {
              status: 'SCHEDULED',
              OR: [
                { scheduledAt: null },
                { scheduledAt: { lte: new Date() } },
              ],
            },
          ],
        },
        include: {
          account: true,
        },
        take: 3,
      });

      for (const broadcast of eligibleBroadcasts) {
        await processBroadcast(this.prisma, broadcast, this.logger);
      }
    } catch (err: any) {
      this.logger.error(`Broadcast scanner error: ${err?.message}`);
    } finally {
      this.isScanning = false;
    }
  }

  // ─────────────────────────────────────────────
  // 2. Pending Automation Executions (Wait Step Resume)
  // ─────────────────────────────────────────────

  async scanAndProcessPendingAutomations(): Promise<void> {
    if (this.isScanningAutomations) return;
    this.isScanningAutomations = true;

    try {
      const pendings = await this.prisma.whatsAppAutomationPendingExecution.findMany({
        where: {
          status: 'pending',
          runAt: { lte: new Date() },
        },
        include: {
          automation: {
            include: {
              steps: { orderBy: { position: 'asc' } },
            },
          },
          account: true,
          contact: {
            include: { tags: true },
          },
        },
        take: 5,
      });

      for (const pending of pendings) {
        await processPendingAutomation(this.prisma, pending, this.logger);
      }
    } catch (err: any) {
      this.logger.error(`Pending automation scanner error: ${err?.message}`);
    } finally {
      this.isScanningAutomations = false;
    }
  }

  // ─────────────────────────────────────────────
  // 3. Automated Daily Template Sync
  // ─────────────────────────────────────────────

  async syncAllAccountTemplates(): Promise<void> {
    await syncAllAccountTemplates(this.prisma, this.logger);
  }
}
