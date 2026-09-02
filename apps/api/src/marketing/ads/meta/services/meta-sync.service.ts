import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../lib/database/prisma.service.js';
import { MetaGraphApiClient } from '@brokeros/int-ads-meta';

@Injectable()
export class MetaSyncService {
  private readonly logger = new Logger(MetaSyncService.name);
  private readonly client = new MetaGraphApiClient();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Performs an on-demand full sync of campaigns, adsets, creatives, and insights
   * for a given connected Meta integration, saving data directly into MetaCampaignCache.
   */
  async syncIntegration(integrationId: string, datePreset: string = 'maximum') {
    const integration = await this.prisma.metaAdIntegration.findUnique({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new NotFoundException(
        `Meta Ad Integration with ID ${integrationId} not found`,
      );
    }

    this.logger.log(
      `Starting Meta Ads sync for account: ${integration.adAccountId} (${integration.name})`,
    );

    const credentials = {
      adAccountId: integration.adAccountId,
      accessToken: integration.accessToken,
      appId: integration.appId || undefined,
      appSecret: integration.appSecret || undefined,
      pageIds: integration.pageIds,
    };

    try {
      // 1. Fetch live account overview to refresh status & currency
      const accountDetails = await this.client
        .getAccountDetails(credentials)
        .catch(() => null);
      if (accountDetails) {
        await this.prisma.metaAdIntegration.update({
          where: { id: integrationId },
          data: {
            accountStatus: accountDetails.accountStatus,
            currency: accountDetails.currency,
            timezone: accountDetails.timezoneName,
          },
        });
      }

      // 2. Fetch live campaigns from Meta
      const campaigns = await this.client.getCampaigns(credentials, datePreset);
      this.logger.log(
        `Fetched ${campaigns.length} campaigns from Meta for ${integration.adAccountId}`,
      );

      let syncedCount = 0;

      for (const camp of campaigns) {
        try {
          // 3. Fetch Ad Sets for this campaign
          const adSets = await this.client
            .getAdSets(camp.id, credentials)
            .catch(() => []);

          // 4. Fetch Creatives across the ad sets (limit to first 3 adsets to preserve rate limits)
          const allAds: any[] = [];
          for (const adSet of adSets.slice(0, 3)) {
            const ads = await this.client
              .getAdsAndCreatives(adSet.id, credentials)
              .catch(() => []);
            allAds.push(...ads);
          }

          const creativesList = allAds.map((a) => a.creative).filter(Boolean);

          // 5. Upsert into MetaCampaignCache
          await this.prisma.metaCampaignCache.upsert({
            where: { id: camp.id },
            create: {
              id: camp.id,
              integrationId: integration.id,
              name: camp.name,
              objective: String(camp.objective),
              status: camp.status,
              effectiveStatus: camp.effectiveStatus,
              dailyBudget: camp.dailyBudget,
              lifetimeBudget: camp.lifetimeBudget,
              spend: camp.insights?.spend || 0,
              impressions: camp.insights?.impressions || 0,
              reach: camp.insights?.reach || 0,
              clicks: camp.insights?.clicks || 0,
              ctr: camp.insights?.ctr || 0,
              cpc: camp.insights?.cpc || 0,
              cpm: camp.insights?.cpm || 0,
              leadsCount: camp.insights?.leadsCount || 0,
              costPerLead: camp.insights?.costPerLead || 0,
              startTime: camp.startTime ? new Date(camp.startTime) : null,
              stopTime: camp.stopTime ? new Date(camp.stopTime) : null,
              adSetsData: adSets as any,
              creativesData: creativesList as any,
              lastSyncedAt: new Date(),
            },
            update: {
              name: camp.name,
              objective: String(camp.objective),
              status: camp.status,
              effectiveStatus: camp.effectiveStatus,
              dailyBudget: camp.dailyBudget,
              lifetimeBudget: camp.lifetimeBudget,
              spend: camp.insights?.spend || 0,
              impressions: camp.insights?.impressions || 0,
              reach: camp.insights?.reach || 0,
              clicks: camp.insights?.clicks || 0,
              ctr: camp.insights?.ctr || 0,
              cpc: camp.insights?.cpc || 0,
              cpm: camp.insights?.cpm || 0,
              leadsCount: camp.insights?.leadsCount || 0,
              costPerLead: camp.insights?.costPerLead || 0,
              startTime: camp.startTime ? new Date(camp.startTime) : null,
              stopTime: camp.stopTime ? new Date(camp.stopTime) : null,
              adSetsData: adSets as any,
              creativesData: creativesList as any,
              lastSyncedAt: new Date(),
            },
          });

          syncedCount++;
        } catch (campErr: any) {
          this.logger.warn(
            `Failed to sync details for campaign ${camp.id}: ${campErr?.message}`,
          );
        }
      }

      // Mark integration lastSyncedAt
      await this.prisma.metaAdIntegration.update({
        where: { id: integrationId },
        data: { lastSyncedAt: new Date() },
      });

      return {
        success: true,
        integrationId,
        adAccountId: integration.adAccountId,
        syncedCampaignsCount: syncedCount,
        totalCampaignsCount: campaigns.length,
        syncedAt: new Date(),
      };
    } catch (err: any) {
      this.logger.error(
        `Error during Meta Ads sync: ${err?.message}`,
        err?.stack,
      );
      throw err;
    }
  }
}
