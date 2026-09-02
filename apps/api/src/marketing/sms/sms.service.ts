import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import type {
  ISmsMarketingProvider,
  SmsAudienceEstimationResult,
  SmsCampaignAnalyticsSummary,
  SmsWebhookEvent,
} from '@brokeros/types';
import {
  CreateSmsCampaignDto,
  SaveDraftSmsCampaignDto,
  PreviewSmsAudienceDto,
  SendTestSmsDto,
  ConnectSmsIntegrationDto,
} from './dto/sms.dto.js';
import { SmsAudienceService } from './services/sms-audience.service.js';
import { SmsAnalyticsService } from './services/sms-analytics.service.js';
import { SmsIntegrationsService } from './services/sms-integrations.service.js';
import { SmsTrackingService } from './services/sms-tracking.service.js';

@Injectable()
export class SmsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audienceService: SmsAudienceService,
    private readonly analyticsService: SmsAnalyticsService,
    private readonly integrationsService: SmsIntegrationsService,
    private readonly trackingService: SmsTrackingService,
  ) {}

  // ── FACADE DELEGATIONS ──

  getAdapter(providerType: string): ISmsMarketingProvider {
    return this.integrationsService.getAdapter(providerType);
  }

  async previewAudience(
    dto: PreviewSmsAudienceDto,
  ): Promise<SmsAudienceEstimationResult> {
    return this.audienceService.previewAudience(dto);
  }

  async promoteCsvRecipientToLead(recipientId: string, userId?: string) {
    return this.audienceService.promoteCsvRecipientToLead(recipientId, userId);
  }

  async getCampaignAnalytics(
    campaignId: string,
  ): Promise<SmsCampaignAnalyticsSummary> {
    return this.analyticsService.getCampaignAnalytics(campaignId);
  }

  async getCampaignRecipients(
    campaignId: string,
    query?: { page?: number; limit?: number; status?: string; search?: string },
  ) {
    return this.analyticsService.getCampaignRecipients(campaignId, query);
  }

  async sendTestSms(dto: SendTestSmsDto) {
    return this.integrationsService.sendTestSms(dto);
  }

  async listIntegrations() {
    return this.integrationsService.listIntegrations();
  }

  async connectIntegration(dto: ConnectSmsIntegrationDto) {
    return this.integrationsService.connectIntegration(dto);
  }

  async deleteIntegration(id: string) {
    return this.integrationsService.deleteIntegration(id);
  }

  async resolveShortLink(
    code: string,
    ip?: string,
    userAgent?: string,
  ): Promise<string> {
    return this.trackingService.resolveShortLink(code, ip, userAgent);
  }

  async processWebhookEvents(events: SmsWebhookEvent[]) {
    return this.trackingService.processWebhookEvents(events);
  }

  // ── CORE SMS CAMPAIGN ORCHESTRATION & CRUD ──

  async getProjects() {
    return this.prisma.project.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        city: true,
        isCpProject: true,
        brochureUrl: true,
        builder: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  private async resolveForeignKeys(
    dto: { projectId?: string; integrationId?: string; providerType?: string },
    userId?: string,
  ) {
    let validProjectId: string | null = null;
    if (dto.projectId) {
      const exists = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
        select: { id: true },
      });
      if (exists) validProjectId = exists.id;
    }

    let validIntegrationId: string | null = null;
    if (dto.integrationId) {
      const exists = await this.prisma.smsIntegration.findUnique({
        where: { id: dto.integrationId },
        select: { id: true },
      });
      if (exists) validIntegrationId = exists.id;
    } else if (dto.providerType) {
      const defaultInt = await this.prisma.smsIntegration.findFirst({
        where: { provider: dto.providerType as any, isActive: true },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        select: { id: true },
      });
      if (defaultInt) validIntegrationId = defaultInt.id;
    }

    let validUserId: string | null = null;
    if (userId) {
      const exists = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });
      if (exists) validUserId = exists.id;
    }

    return {
      projectId: validProjectId,
      integrationId: validIntegrationId,
      userId: validUserId,
    };
  }

  async saveDraftCampaign(dto: SaveDraftSmsCampaignDto, userId?: string) {
    const {
      projectId,
      integrationId,
      userId: validUserId,
    } = await this.resolveForeignKeys(dto, userId);

    if (dto.campaignId) {
      const existing = await this.prisma.smsCampaign.findUnique({
        where: { id: dto.campaignId },
      });

      if (existing) {
        return this.prisma.smsCampaign.update({
          where: { id: dto.campaignId },
          data: {
            title: dto.title !== undefined ? dto.title : existing.title,
            channel: dto.channel ?? existing.channel,
            providerType: dto.providerType ?? existing.providerType,
            audienceSource: dto.audienceSource ?? existing.audienceSource,
            isCpCampaign: dto.isCpCampaign ?? existing.isCpCampaign,
            projectId:
              dto.projectId !== undefined ? projectId : existing.projectId,
            integrationId:
              dto.integrationId !== undefined
                ? integrationId
                : existing.integrationId,
            fromSender:
              dto.fromSender !== undefined
                ? dto.fromSender
                : existing.fromSender,
            messageContent:
              dto.messageContent !== undefined
                ? dto.messageContent
                : existing.messageContent,
            dltTemplateId:
              dto.dltTemplateId !== undefined
                ? dto.dltTemplateId
                : existing.dltTemplateId,
            audienceFilters: dto.audienceFilters
              ? (dto.audienceFilters as any)
              : existing.audienceFilters,
            scheduledAt: dto.scheduledAt
              ? new Date(dto.scheduledAt)
              : existing.scheduledAt,
          },
        });
      }
    }

    return this.prisma.smsCampaign.create({
      data: {
        title: dto.title?.trim() || 'Untitled Draft SMS Campaign',
        channel: dto.channel || 'SMS',
        status: 'DRAFT',
        providerType: dto.providerType || 'TWILIO',
        audienceSource: dto.audienceSource || 'CRM_DATABASE',
        isCpCampaign: dto.isCpCampaign || false,
        projectId,
        integrationId,
        fromSender: dto.fromSender || 'BrokerOS',
        messageContent: dto.messageContent || '',
        dltTemplateId: dto.dltTemplateId || null,
        audienceFilters: dto.audienceFilters
          ? (dto.audienceFilters as any)
          : undefined,
        totalRecipients: 0,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        createdById: validUserId,
      },
    });
  }

  async createCampaign(dto: CreateSmsCampaignDto, userId?: string) {
    const {
      projectId,
      integrationId,
      userId: validUserId,
    } = await this.resolveForeignKeys(dto, userId);

    const audienceResult = await this.previewAudience({
      audienceSource: dto.audienceSource || 'CRM_DATABASE',
      audienceFilters: dto.audienceFilters,
      csvRecipients: dto.csvRecipients,
      isCpCampaign: dto.isCpCampaign,
      projectId: projectId || undefined,
    });

    let campaign: any;

    if (dto.campaignId) {
      const existing = await this.prisma.smsCampaign.findUnique({
        where: { id: dto.campaignId },
      });
      if (existing) {
        campaign = await this.prisma.smsCampaign.update({
          where: { id: dto.campaignId },
          data: {
            title: dto.title,
            channel: dto.channel || 'SMS',
            status: dto.scheduledAt ? 'SCHEDULED' : 'PROCESSING',
            providerType: dto.providerType || 'TWILIO',
            audienceSource: dto.audienceSource || 'CRM_DATABASE',
            isCpCampaign: dto.isCpCampaign || false,
            projectId,
            integrationId,
            fromSender:
              dto.fromSender !== undefined
                ? dto.fromSender
                : existing.fromSender,
            messageContent:
              dto.messageContent !== undefined
                ? dto.messageContent
                : existing.messageContent,
            dltTemplateId:
              dto.dltTemplateId !== undefined
                ? dto.dltTemplateId || null
                : existing.dltTemplateId,
            audienceFilters: dto.audienceFilters as any,
            totalRecipients: audienceResult.finalAudienceCount,
            scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
          },
        });
        await this.prisma.smsRecipient.deleteMany({
          where: { campaignId: campaign.id },
        });
      }
    }

    if (!campaign) {
      campaign = await this.prisma.smsCampaign.create({
        data: {
          title: dto.title,
          channel: dto.channel || 'SMS',
          status: dto.scheduledAt ? 'SCHEDULED' : 'PROCESSING',
          providerType: dto.providerType || 'TWILIO',
          audienceSource: dto.audienceSource || 'CRM_DATABASE',
          isCpCampaign: dto.isCpCampaign || false,
          projectId,
          integrationId,
          fromSender: dto.fromSender || 'BrokerOS',
          messageContent: dto.messageContent || '',
          dltTemplateId: dto.dltTemplateId || null,
          audienceFilters: dto.audienceFilters as any,
          totalRecipients: audienceResult.finalAudienceCount,
          scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
          createdById: validUserId,
        },
      });
    }

    // Populate Recipients
    if (dto.audienceSource === 'CSV_UPLOAD' && dto.csvRecipients?.length) {
      const seenPhones = new Set<string>();
      const recipientData: any[] = [];
      const crmLeadsToCreate: any[] = [];

      for (const row of dto.csvRecipients) {
        const phone = row.phone?.replace(/[^\d+]/g, '');
        if (!phone || phone.length < 8 || seenPhones.has(phone)) continue;
        seenPhones.add(phone);

        recipientData.push({
          campaignId: campaign.id,
          phone,
          name: row.name || 'Prospect',
          status: 'QUEUED',
          source: 'CSV_UPLOAD',
          mergeData: {
            city: row.city,
            budget: row.budget,
            interestedProject: row.interestedProject,
            temperature: row.temperature,
          },
        });

        if (dto.saveCsvAsCrmLeads) {
          crmLeadsToCreate.push({
            firstName: row.name?.split(' ')[0] || 'Prospect',
            lastName: row.name?.split(' ').slice(1).join(' ') || '',
            phone,
            email: row.email || null,
            temperature: row.temperature || 'WARM',
            interestedProjectId: projectId,
            budget: row.budget ? Number(row.budget) : null,
            createdById: validUserId,
          });
        }
      }

      if (recipientData.length > 0) {
        await this.prisma.smsRecipient.createMany({ data: recipientData });
      }

      if (crmLeadsToCreate.length > 0) {
        await this.prisma.lead.createMany({
          data: crmLeadsToCreate,
          skipDuplicates: true,
        });
      }
    } else {
      const whereClause = this.audienceService.buildLeadWhereClause(
        dto.audienceFilters,
        dto.isCpCampaign,
        dto.projectId,
      );
      const leads: any[] = await this.prisma.lead.findMany({
        where: whereClause,
        include: {
          interestedProject: { select: { name: true } },
          assignedUser: { select: { name: true, phoneNumber: true } },
        },
      });

      const seenPhones = new Set<string>();
      const recipientData: any[] = [];

      for (const lead of leads) {
        if (!lead.phone) continue;
        const phone = lead.phone.replace(/[^\d+]/g, '');
        if (phone.length < 8 || seenPhones.has(phone)) continue;
        seenPhones.add(phone);

        recipientData.push({
          campaignId: campaign.id,
          leadId: lead.id,
          phone,
          name: `${lead.firstName} ${lead.lastName || ''}`.trim(),
          status: 'QUEUED',
          source: 'CRM_DATABASE',
          mergeData: {
            firstName: lead.firstName,
            lastName: lead.lastName,
            projectName: lead.interestedProject?.name,
            agentName: lead.assignedUser?.name,
            agentPhone: lead.assignedUser?.phoneNumber,
          },
        });
      }

      if (recipientData.length > 0) {
        await this.prisma.smsRecipient.createMany({ data: recipientData });
      }
    }

    if (!dto.scheduledAt) {
      this.triggerWorkerDispatch(campaign.id);
    }

    return campaign;
  }

  private triggerWorkerDispatch(campaignId: string) {
    const workerUrl = process.env.WORKER_URL || 'http://127.0.0.1:3334';
    fetch(`${workerUrl}/dispatch-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId }),
    }).catch(() => {});
  }

  async dispatchCampaign(id: string) {
    const campaign = await this.prisma.smsCampaign.findUnique({
      where: { id },
    });
    if (!campaign) throw new NotFoundException('SMS Campaign not found');

    await this.prisma.smsCampaign.update({
      where: { id },
      data: { status: 'PROCESSING' },
    });

    this.triggerWorkerDispatch(id);
    return { success: true, message: `Dispatched SMS campaign ${id}` };
  }

  async findAllCampaigns(query?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    includeDrafts?: string | boolean;
  }) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query?.status) {
      if (query.status !== 'ALL') {
        where.status = query.status;
      } else if (
        query?.includeDrafts !== 'true' &&
        query?.includeDrafts !== true
      ) {
        where.status = { not: 'DRAFT' };
      }
    } else if (
      query?.includeDrafts !== 'true' &&
      query?.includeDrafts !== true
    ) {
      where.status = { not: 'DRAFT' };
    }

    if (query?.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { messageContent: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.smsCampaign.count({ where }),
      this.prisma.smsCampaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          project: { select: { id: true, name: true } },
          integration: { select: { id: true, name: true, provider: true } },
          createdBy: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneCampaign(id: string) {
    const campaign = await this.prisma.smsCampaign.findUnique({
      where: { id },
      include: {
        project: true,
        integration: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!campaign) throw new NotFoundException('SMS Campaign not found');
    return campaign;
  }

  async deleteCampaign(id: string) {
    const campaign = await this.prisma.smsCampaign.findUnique({
      where: { id },
    });
    if (!campaign) throw new NotFoundException('SMS Campaign not found');

    await this.prisma.smsTrackingEvent.deleteMany({
      where: { campaignId: id },
    });
    await this.prisma.smsRecipient.deleteMany({ where: { campaignId: id } });
    await this.prisma.smsCampaign.delete({ where: { id } });

    return { success: true, message: `Deleted SMS campaign ${id}` };
  }
}
