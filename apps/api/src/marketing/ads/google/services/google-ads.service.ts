import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../../../lib/database/prisma.service.js';
import { GoogleAdsApiClient } from '@brokeros/int-ads-google';
import {
  ConnectGoogleIntegrationDto,
  GoogleOAuthCallbackDto,
  TestGoogleTokenDto,
} from '../dto/google-ads.dto.js';
import { GoogleSyncService } from './google-sync.service.js';

@Injectable()
export class GoogleAdsService {
  private readonly client = new GoogleAdsApiClient();

  constructor(
    private readonly prisma: PrismaService,
    private readonly syncService: GoogleSyncService,
  ) { }

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
   * Generates the Google OAuth authorization URL for the frontend popup/redirect.
   */
  getOAuthUrl(redirectUri: string, state?: string): string {
    const clientId = this.getClientId();
    return this.client.generateOAuthUrl(clientId, redirectUri, state);
  }

  /**
   * Exchanges authorization code for tokens and auto-discovers accessible Customer IDs.
   */
  async handleOAuthCallback(dto: GoogleOAuthCallbackDto) {
    const clientId = this.getClientId();
    const clientSecret = this.getClientSecret();
    const devToken = this.getDeveloperToken();

    const tokens = await this.client.exchangeCodeForTokens(
      dto.code,
      clientId,
      clientSecret,
      dto.redirectUri,
    );

    if (!tokens.refreshToken) {
      throw new BadRequestException(
        'No refresh token received from Google. Please ensure you approved all offline access permissions.',
      );
    }

    // Auto-discover accessible Google Ads customer accounts
    let customerIds: string[] = [];
    try {
      customerIds = await this.client.listAccessibleCustomers(
        tokens.accessToken,
        devToken,
      );
    } catch {
      // If listAccessibleCustomers fails (e.g. test mode), return empty so user enters manually
      customerIds = [];
    }

    // Format for display
    const discoveredAccounts = customerIds.map((cid) => ({
      customerId: cid,
      formattedId: this.client.formatDisplayCustomerId(cid),
      name: `Google Ads Account (${this.client.formatDisplayCustomerId(cid)})`,
    }));

    return {
      refreshToken: tokens.refreshToken,
      discoveredAccounts,
      totalDiscovered: discoveredAccounts.length,
    };
  }

  /**
   * Tests credential verification before saving.
   */
  async testConnection(dto: TestGoogleTokenDto) {
    const devToken = this.getDeveloperToken();
    const clientId = this.getClientId();
    const clientSecret = this.getClientSecret();

    let accessToken: string;
    try {
      accessToken = await this.client.refreshAccessToken(
        dto.refreshToken,
        clientId,
        clientSecret,
      );
    } catch (err: any) {
      throw new BadRequestException(
        `Failed to verify Google refresh token: ${err?.message}`,
      );
    }

    const cleanCid = this.client.cleanCustomerId(dto.customerId);
    const details = await this.client.getAccountDetails(
      cleanCid,
      accessToken,
      devToken,
      dto.managerCustomerId || undefined,
    );

    return {
      success: true,
      account: {
        ...details,
        formattedId: this.client.formatDisplayCustomerId(details.customerId),
      },
    };
  }

  /**
   * Connects a new Google Ads account integration and triggers first sync.
   */
  async connectIntegration(dto: ConnectGoogleIntegrationDto) {
    const cleanCid = this.client.cleanCustomerId(dto.customerId);
    const formattedCid = this.client.formatDisplayCustomerId(cleanCid);

    // If set to default, unset other defaults
    if (dto.isDefault) {
      await this.prisma.googleAdIntegration.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const integration = await this.prisma.googleAdIntegration.create({
      data: {
        name: dto.name || `Google Ads (${formattedCid})`,
        customerId: cleanCid,
        managerCustomerId: dto.managerCustomerId
          ? this.client.cleanCustomerId(dto.managerCustomerId)
          : null,
        refreshToken: dto.refreshToken.trim(),
        currency: 'INR',
        isActive: true,
        isDefault: dto.isDefault ?? false,
      },
    });

    // Trigger initial background sync
    this.syncService.syncIntegration(integration.id).catch(() => { });

    return integration;
  }

  /**
   * Lists all connected Google Ads integrations.
   */
  async listIntegrations() {
    const items = await this.prisma.googleAdIntegration.findMany({
      select: {
        id: true,
        name: true,
        customerId: true,
        managerCustomerId: true,
        currency: true,
        timezone: true,
        descriptiveName: true,
        accountStatus: true,
        isActive: true,
        isDefault: true,
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

    return items.map((item) => ({
      ...item,
      formattedCustomerId: this.client.formatDisplayCustomerId(item.customerId),
    }));
  }

  /**
   * Deletes a connected Google Ads account.
   */
  async deleteIntegration(id: string) {
    const existing = await this.prisma.googleAdIntegration.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`Google Ad Integration ${id} not found`);
    }

    return this.prisma.googleAdIntegration.delete({ where: { id } });
  }

  /**
   * Fetches cached campaigns with aggregate KPIs.
   */
  async getCampaigns(integrationId?: string) {
    const whereClause = integrationId ? { integrationId } : {};

    const campaigns = await this.prisma.googleCampaignCache.findMany({
      where: whereClause,
      include: {
        integration: {
          select: {
            id: true,
            name: true,
            customerId: true,
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
    const totalClicks = campaigns.reduce((acc, c) => acc + (c.clicks || 0), 0);
    const totalConversions = campaigns.reduce(
      (acc, c) => acc + (c.conversions || 0),
      0,
    );
    const avgCostPerConversion =
      totalConversions > 0 ? totalSpend / totalConversions : 0;
    const avgCtr =
      totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgCpc = totalClicks > 0 ? totalSpend / totalClicks : 0;

    return {
      kpis: {
        totalSpend: Math.round(totalSpend),
        totalImpressions,
        totalClicks,
        totalConversions: Math.round(totalConversions),
        avgCostPerConversion: Math.round(avgCostPerConversion),
        avgCtr: parseFloat(avgCtr.toFixed(2)),
        avgCpc: parseFloat(avgCpc.toFixed(2)),
        activeCampaignsCount: campaigns.filter((c) => c.status === 'ENABLED')
          .length,
        totalCampaignsCount: campaigns.length,
      },
      items: campaigns,
    };
  }

  /**
   * Returns campaign inspection: keywords with Quality Scores and acquired CRM leads.
   */
  async getCampaignDetails(id: string) {
    const campaign = await this.prisma.googleCampaignCache.findUnique({
      where: { id },
      include: {
        integration: {
          select: {
            id: true,
            name: true,
            customerId: true,
            currency: true,
            timezone: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundException(`Google Campaign with ID ${id} not found in cache`);
    }

    // Fetch acquired CRM leads from this campaign
    const webhookLogs = await this.prisma.googleLeadWebhookLog.findMany({
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
          `${lead.firstName || ''} ${lead.lastName || ''}`.trim() ||
          'Google Search Lead';
        return {
          logId: log.id,
          googleLeadId: log.googleLeadId,
          formId: log.formId,
          gclid: log.gclid,
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
      campaign: {
        ...campaign,
        formattedCustomerId: this.client.formatDisplayCustomerId(
          campaign.integration.customerId,
        ),
      },
      keywords: (campaign.searchKeywordsData as any[]) || [],
      adGroups: (campaign.adGroupsData as any[]) || [],
      acquiredLeads,
      totalAcquiredLeads: acquiredLeads.length,
    };
  }

  /**
   * Delegates live sync to GoogleSyncService.
   */
  async triggerSync(integrationId: string, datePreset?: string) {
    return this.syncService.syncIntegration(integrationId, datePreset);
  }
}
