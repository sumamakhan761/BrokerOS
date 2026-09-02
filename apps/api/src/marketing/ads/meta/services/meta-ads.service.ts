import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../../lib/database/prisma.service.js';
import { MetaGraphApiClient } from '@brokeros/int-ads-meta';
import {
  ConnectMetaIntegrationDto,
  TestMetaTokenDto,
} from '../dto/meta-ads.dto.js';
import { MetaSyncService } from './meta-sync.service.js';

@Injectable()
export class MetaAdsService {
  private readonly client = new MetaGraphApiClient();

  constructor(
    private readonly prisma: PrismaService,
    private readonly syncService: MetaSyncService,
  ) {}

  /**
   * Tests token validity with Meta Graph API before saving.
   */
  async testConnection(dto: TestMetaTokenDto) {
    const isValid = await this.client.validateCredentials({
      adAccountId: dto.adAccountId,
      accessToken: dto.accessToken,
    });

    if (!isValid) {
      throw new BadRequestException(
        'Invalid Meta Ad Account ID or Access Token. Verification failed.',
      );
    }

    const details = await this.client.getAccountDetails({
      adAccountId: dto.adAccountId,
      accessToken: dto.accessToken,
    });

    return {
      success: true,
      account: details,
    };
  }

  /**
   * Connects a new Meta Ad integration and automatically triggers the first sync.
   */
  async connectIntegration(dto: ConnectMetaIntegrationDto) {
    // 1. Verify credentials live
    const isValid = await this.client.validateCredentials({
      adAccountId: dto.adAccountId,
      accessToken: dto.accessToken,
    });

    if (!isValid) {
      throw new BadRequestException(
        'Verification failed for the provided Meta Ad Account and Access Token.',
      );
    }

    const accountDetails = await this.client.getAccountDetails({
      adAccountId: dto.adAccountId,
      accessToken: dto.accessToken,
    });

    // 2. If set to default, unset other defaults
    if (dto.isDefault) {
      await this.prisma.metaAdIntegration.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    // 3. Upsert integration record
    const integration = await this.prisma.metaAdIntegration.create({
      data: {
        name: dto.name || accountDetails.name || 'Meta Ad Account',
        adAccountId: dto.adAccountId.trim(),
        accessToken: dto.accessToken.trim(),
        appId: dto.appId?.trim(),
        appSecret: dto.appSecret?.trim(),
        pageIds: dto.pageIds || [],
        currency: accountDetails.currency || 'INR',
        timezone: accountDetails.timezoneName,
        accountStatus: accountDetails.accountStatus,
        isDefault: dto.isDefault ?? false,
        isActive: true,
      },
    });

    // 4. Trigger initial background sync
    this.syncService.syncIntegration(integration.id).catch(() => {});

    return integration;
  }

  /**
   * Lists all connected Meta Ad Account integrations.
   */
  async listIntegrations() {
    return this.prisma.metaAdIntegration.findMany({
      select: {
        id: true,
        name: true,
        adAccountId: true,
        currency: true,
        timezone: true,
        accountStatus: true,
        isActive: true,
        isDefault: true,
        pageIds: true,
        lastSyncedAt: true,
        createdAt: true,
        _count: {
          select: {
            campaigns: true,
            webhookLogs: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Deletes a connected Meta Ad integration and cleans up cache.
   */
  async deleteIntegration(id: string) {
    const existing = await this.prisma.metaAdIntegration.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Integration ${id} not found`);
    }

    return this.prisma.metaAdIntegration.delete({ where: { id } });
  }

  /**
   * Fetches cached campaigns with computed aggregate KPI stats across all campaigns.
   */
  async getCampaigns(integrationId?: string) {
    const whereClause = integrationId ? { integrationId } : {};

    const campaigns = await this.prisma.metaCampaignCache.findMany({
      where: whereClause,
      include: {
        integration: {
          select: {
            id: true,
            name: true,
            adAccountId: true,
            currency: true,
          },
        },
      },
      orderBy: { spend: 'desc' },
    });

    // Calculate aggregated KPIs
    const totalSpend = campaigns.reduce((acc, c) => acc + (c.spend || 0), 0);
    const totalImpressions = campaigns.reduce(
      (acc, c) => acc + (c.impressions || 0),
      0,
    );
    const totalReach = campaigns.reduce((acc, c) => acc + (c.reach || 0), 0);
    const totalClicks = campaigns.reduce((acc, c) => acc + (c.clicks || 0), 0);
    const totalLeads = campaigns.reduce(
      (acc, c) => acc + (c.leadsCount || 0),
      0,
    );
    const avgCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
    const avgCtr =
      totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

    return {
      kpis: {
        totalSpend: Math.round(totalSpend),
        totalImpressions,
        totalReach,
        totalClicks,
        totalLeads,
        avgCpl: Math.round(avgCpl),
        avgCtr: parseFloat(avgCtr.toFixed(2)),
        activeCampaignsCount: campaigns.filter((c) => c.status === 'ACTIVE')
          .length,
        totalCampaignsCount: campaigns.length,
      },
      items: campaigns,
    };
  }

  /**
   * Returns complete campaign details: ad sets, creatives, and real CRM leads generated by it.
   */
  async getCampaignDetails(id: string) {
    const campaign = await this.prisma.metaCampaignCache.findUnique({
      where: { id },
      include: {
        integration: {
          select: {
            id: true,
            name: true,
            adAccountId: true,
            currency: true,
            timezone: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found in cache`);
    }

    // Find CRM leads captured from this campaign
    const webhookLogs = await this.prisma.metaLeadWebhookLog.findMany({
      where: { campaignId: id },
      include: {
        lead: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            email: true,
            preferredLocation: true,
            budget: true,
            status: true,
            temperature: true,
            createdAt: true,
            assignedUser: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const acquiredLeads = webhookLogs
      .filter((log) => log.lead != null)
      .map((log) => {
        const lead = log.lead!;
        const fullName =
          `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Meta Lead';
        return {
          logId: log.id,
          leadgenId: log.leadgenId,
          formId: log.formId,
          adId: log.adId,
          capturedAt: log.createdAt,
          lead: {
            id: lead.id,
            name: fullName,
            phone: lead.phone,
            email: lead.email,
            city: lead.preferredLocation,
            budget: lead.budget ? Number(lead.budget) : undefined,
            status: lead.status,
            temperature: lead.temperature,
            createdAt: lead.createdAt,
            assignedUser: lead.assignedUser,
          },
        };
      });

    return {
      campaign,
      acquiredLeads,
      totalAcquiredLeads: acquiredLeads.length,
    };
  }

  /**
   * Delegates manual on-demand sync to MetaSyncService.
   */
  async triggerSync(integrationId: string, datePreset?: string) {
    return this.syncService.syncIntegration(integrationId, datePreset);
  }
}
