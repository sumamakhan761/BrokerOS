import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../lib/database/prisma.service.js';
import { GoogleAdsApiClient } from '@brokeros/int-ads-google';

@Injectable()
export class GoogleSyncService {
  private readonly logger = new Logger(GoogleSyncService.name);
  private readonly client = new GoogleAdsApiClient();

  constructor(private readonly prisma: PrismaService) { }

  private getDeveloperToken(): string {
    return process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '';
  }

  private getClientId(): string {
    return process.env.GOOGLE_ADS_CLIENT_ID || '';
  }

  private getClientSecret(): string {
    return process.env.GOOGLE_ADS_CLIENT_SECRET || '';
  }

  /**
   * Refreshes access token and executes full live GAQL sync for a connected Google Ads account.
   */
  async syncIntegration(integrationId: string, _datePreset?: string) {
    const integration = await this.prisma.googleAdIntegration.findUnique({
      where: { id: integrationId },
    });

    if (!integration) {
      throw new NotFoundException(
        `Google Ad Integration with ID ${integrationId} not found`,
      );
    }

    this.logger.log(
      `Starting Google Ads sync for customer: ${integration.customerId} (${integration.name})`,
    );

    const devToken = this.getDeveloperToken();
    const clientId = this.getClientId();
    const clientSecret = this.getClientSecret();

    let accessToken: string;
    try {
      accessToken = await this.client.refreshAccessToken(
        integration.refreshToken,
        clientId,
        clientSecret,
      );
    } catch (err: any) {
      this.logger.error(
        `Could not refresh Google OAuth access token (${err?.message}).`,
      );
      throw new Error(`Google OAuth access token refresh failed: ${err?.message}`);
    }

    try {
      // 1. Fetch live account details (currency, descriptive name, timezone)
      const details = await this.client
        .getAccountDetails(
          integration.customerId,
          accessToken,
          devToken,
          integration.managerCustomerId || undefined,
        )
        .catch(() => null);

      if (details) {
        await this.prisma.googleAdIntegration.update({
          where: { id: integrationId },
          data: {
            descriptiveName: details.descriptiveName,
            currency: details.currencyCode || 'INR',
            timezone: details.timeZone || 'Asia/Kolkata',
          },
        });
      }

      // 2. Query campaigns via GAQL
      const campaigns = await this.client.getCampaigns(
        integration.customerId,
        accessToken,
        devToken,
        integration.managerCustomerId || undefined,
      );

      this.logger.log(
        `Fetched ${campaigns.length} live campaigns from Google Ads for ${integration.customerId}`,
      );

      let syncedCount = 0;

      for (const camp of campaigns) {
        try {
          // 3. Fetch keywords and Quality Scores for this campaign
          const keywords = await this.client.getKeywordsAndQualityScores(
            integration.customerId,
            camp.id,
            accessToken,
            devToken,
            integration.managerCustomerId || undefined,
          );

          // 4. Upsert into GoogleCampaignCache
          await this.prisma.googleCampaignCache.upsert({
            where: { id: camp.id },
            create: {
              id: camp.id,
              integrationId: integration.id,
              name: camp.name,
              advertisingChannelType: camp.channelType,
              status: camp.status,
              dailyBudget: camp.dailyBudget,
              spend: camp.spend || 0,
              impressions: camp.impressions || 0,
              clicks: camp.clicks || 0,
              ctr: camp.ctr || 0,
              cpc: camp.cpc || 0,
              conversions: camp.conversions || 0,
              costPerConversion: camp.costPerConversion || 0,
              startTime: camp.startTime ? new Date(camp.startTime) : null,
              stopTime: camp.stopTime ? new Date(camp.stopTime) : null,
              searchKeywordsData: keywords as any,
              lastSyncedAt: new Date(),
            },
            update: {
              name: camp.name,
              advertisingChannelType: camp.channelType,
              status: camp.status,
              dailyBudget: camp.dailyBudget,
              spend: camp.spend || 0,
              impressions: camp.impressions || 0,
              clicks: camp.clicks || 0,
              ctr: camp.ctr || 0,
              cpc: camp.cpc || 0,
              conversions: camp.conversions || 0,
              costPerConversion: camp.costPerConversion || 0,
              startTime: camp.startTime ? new Date(camp.startTime) : null,
              stopTime: camp.stopTime ? new Date(camp.stopTime) : null,
              searchKeywordsData: keywords as any,
              lastSyncedAt: new Date(),
            },
          });

          syncedCount++;
        } catch (campErr: any) {
          this.logger.warn(
            `Failed to sync campaign ${camp.id}: ${campErr?.message}`,
          );
        }
      }

      // Update lastSyncedAt on integration
      await this.prisma.googleAdIntegration.update({
        where: { id: integrationId },
        data: { lastSyncedAt: new Date() },
      });

      return {
        success: true,
        integrationId,
        customerId: integration.customerId,
        syncedCampaignsCount: syncedCount,
        totalCampaignsCount: campaigns.length,
        syncedAt: new Date(),
      };
    } catch (err: any) {
      this.logger.error(
        `Error during Google Ads sync: ${err?.message}`,
        err?.stack,
      );
      throw err;
    }
  }
}
