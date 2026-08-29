import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../lib/database/prisma.service.js';
import type {
  AudienceEstimationResult,
  CampaignAnalyticsSummary,
  EmailWebhookEvent,
  IEmailMarketingProvider,
} from '@brokeros/types';
import {
  CreateCampaignDto,
  SaveDraftCampaignDto,
  PreviewAudienceDto,
  SendTestEmailDto,
  ConnectIntegrationDto,
} from './dto/email.dto.js';
import { EmailAudienceService } from './services/email-audience.service.js';
import { EmailAnalyticsService } from './services/email-analytics.service.js';
import { EmailIntegrationsService } from './services/email-integrations.service.js';
import { EmailTrackingService } from './services/email-tracking.service.js';

@Injectable()
export class EmailService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audienceService: EmailAudienceService,
    private readonly analyticsService: EmailAnalyticsService,
    private readonly integrationsService: EmailIntegrationsService,
    private readonly trackingService: EmailTrackingService,
  ) { }

  // ── FACADE DELEGATIONS ──

  getAdapter(providerType: string): IEmailMarketingProvider {
    return this.integrationsService.getAdapter(providerType);
  }

  async previewAudience(dto: PreviewAudienceDto): Promise<AudienceEstimationResult> {
    return this.audienceService.previewAudience(dto);
  }

  async promoteCsvRecipientToLead(recipientId: string, userId?: string) {
    return this.audienceService.promoteCsvRecipientToLead(recipientId, userId);
  }

  async getCampaignAnalytics(campaignId: string): Promise<CampaignAnalyticsSummary> {
    return this.analyticsService.getCampaignAnalytics(campaignId);
  }

  async getCampaignRecipients(
    campaignId: string,
    query?: { page?: number; limit?: number; status?: string; search?: string },
  ) {
    return this.analyticsService.getCampaignRecipients(campaignId, query);
  }

  renderMergeTags(template: string, data: any): string {
    return this.integrationsService.renderMergeTags(template, data);
  }

  async sendTestEmail(dto: SendTestEmailDto) {
    return this.integrationsService.sendTestEmail(dto);
  }

  async listIntegrations() {
    return this.integrationsService.listIntegrations();
  }

  async connectIntegration(dto: ConnectIntegrationDto) {
    return this.integrationsService.connectIntegration(dto);
  }

  async deleteIntegration(id: string) {
    return this.integrationsService.deleteIntegration(id);
  }

  async recordOpenEvent(campaignId: string, recipientId: string, ip?: string, userAgent?: string) {
    return this.trackingService.recordOpenEvent(campaignId, recipientId, ip, userAgent);
  }

  async recordClickEvent(campaignId: string, recipientId: string, url: string, ip?: string, userAgent?: string) {
    return this.trackingService.recordClickEvent(campaignId, recipientId, url, ip, userAgent);
  }

  async recordUnsubscribe(email: string, campaignId?: string, reason?: string) {
    return this.trackingService.recordUnsubscribe(email, campaignId, reason);
  }

  async processWebhookEvents(events: EmailWebhookEvent[]) {
    return this.trackingService.processWebhookEvents(events);
  }

  // ── CORE CAMPAIGN ORCHESTRATION & CRUD ──

  async getProjects() {
    return this.prisma.project.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        city: true,
        isCpProject: true,
        builder: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  private async resolveForeignKeys(
    dto: { templateId?: string; projectId?: string; integrationId?: string; providerType?: string },
    userId?: string,
  ) {
    let validTemplateId: string | null = null;
    if (dto.templateId) {
      const exists = await this.prisma.emailTemplate.findUnique({
        where: { id: dto.templateId },
        select: { id: true },
      });
      if (exists) validTemplateId = exists.id;
    }

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
      const exists = await this.prisma.marketingIntegration.findUnique({
        where: { id: dto.integrationId },
        select: { id: true },
      });
      if (exists) validIntegrationId = exists.id;
    } else if (dto.providerType && dto.providerType !== 'SYSTEM_DEFAULT') {
      const defaultIntegration = await this.prisma.marketingIntegration.findFirst({
        where: { provider: dto.providerType as any, isActive: true },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        select: { id: true },
      });
      if (defaultIntegration) validIntegrationId = defaultIntegration.id;
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
      templateId: validTemplateId,
      projectId: validProjectId,
      integrationId: validIntegrationId,
      userId: validUserId,
    };
  }

  async saveDraftCampaign(dto: SaveDraftCampaignDto, userId?: string) {
    const { templateId, projectId, integrationId, userId: validUserId } =
      await this.resolveForeignKeys(dto, userId);

    if (dto.campaignId) {
      const existing = await this.prisma.marketingCampaign.findUnique({
        where: { id: dto.campaignId },
      });

      if (existing) {
        return this.prisma.marketingCampaign.update({
          where: { id: dto.campaignId },
          data: {
            title: dto.title !== undefined ? dto.title : existing.title,
            channel: dto.channel ?? existing.channel,
            providerType: dto.providerType ?? existing.providerType,
            audienceSource: dto.audienceSource ?? existing.audienceSource,
            isCpCampaign: dto.isCpCampaign ?? existing.isCpCampaign,
            projectId: dto.projectId !== undefined ? projectId : existing.projectId,
            integrationId: dto.integrationId !== undefined ? integrationId : existing.integrationId,
            templateId: dto.templateId !== undefined ? templateId : existing.templateId,
            subject: dto.subject !== undefined ? dto.subject : existing.subject,
            fromName: dto.fromName !== undefined ? dto.fromName : existing.fromName,
            fromEmail: dto.fromEmail !== undefined ? dto.fromEmail : existing.fromEmail,
            replyTo: dto.replyTo !== undefined ? (dto.replyTo || null) : existing.replyTo,
            htmlContent: dto.htmlContent !== undefined ? dto.htmlContent : existing.htmlContent,
            audienceFilters: dto.audienceFilters ? (dto.audienceFilters as any) : existing.audienceFilters,
            scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : existing.scheduledAt,
          },
        });
      }
    }

    return this.prisma.marketingCampaign.create({
      data: {
        title: dto.title?.trim() || 'Untitled Draft Campaign',
        channel: dto.channel || 'EMAIL',
        status: 'DRAFT',
        providerType: dto.providerType || 'SYSTEM_DEFAULT',
        audienceSource: dto.audienceSource || 'CRM_DATABASE',
        isCpCampaign: dto.isCpCampaign || false,
        projectId,
        integrationId,
        templateId,
        subject: dto.subject || '',
        fromName: dto.fromName || '',
        fromEmail: dto.fromEmail || '',
        replyTo: dto.replyTo || null,
        htmlContent: dto.htmlContent || '',
        audienceFilters: dto.audienceFilters ? (dto.audienceFilters as any) : undefined,
        totalRecipients: 0,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        createdById: validUserId,
      },
    });
  }

  async createCampaign(dto: CreateCampaignDto, userId?: string) {
    const { templateId, projectId, integrationId, userId: validUserId } =
      await this.resolveForeignKeys(dto, userId);

    const audienceResult = await this.previewAudience({
      audienceSource: dto.audienceSource || 'CRM_DATABASE',
      audienceFilters: dto.audienceFilters,
      csvRecipients: dto.csvRecipients,
      isCpCampaign: dto.isCpCampaign,
      projectId: projectId || undefined,
    });

    let campaign: any;

    if (dto.campaignId) {
      const existing = await this.prisma.marketingCampaign.findUnique({
        where: { id: dto.campaignId },
      });
      if (existing) {
        campaign = await this.prisma.marketingCampaign.update({
          where: { id: dto.campaignId },
          data: {
            title: dto.title,
            channel: dto.channel || 'EMAIL',
            status: dto.scheduledAt ? 'SCHEDULED' : 'PROCESSING',
            providerType: dto.providerType || 'SYSTEM_DEFAULT',
            audienceSource: dto.audienceSource || 'CRM_DATABASE',
            isCpCampaign: dto.isCpCampaign || false,
            projectId,
            integrationId,
            templateId,
            subject: dto.subject !== undefined ? dto.subject : existing.subject,
            fromName: dto.fromName !== undefined ? dto.fromName : existing.fromName,
            fromEmail: dto.fromEmail !== undefined ? dto.fromEmail : existing.fromEmail,
            replyTo: dto.replyTo !== undefined ? (dto.replyTo || null) : existing.replyTo,
            htmlContent: dto.htmlContent !== undefined ? dto.htmlContent : existing.htmlContent,
            audienceFilters: dto.audienceFilters as any,
            totalRecipients: audienceResult.finalAudienceCount,
            scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
          },
        });
        await this.prisma.campaignRecipient.deleteMany({
          where: { campaignId: campaign.id },
        });
      }
    }

    if (!campaign) {
      campaign = await this.prisma.marketingCampaign.create({
        data: {
          title: dto.title,
          channel: dto.channel || 'EMAIL',
          status: dto.scheduledAt ? 'SCHEDULED' : 'PROCESSING',
          providerType: dto.providerType || 'SYSTEM_DEFAULT',
          audienceSource: dto.audienceSource || 'CRM_DATABASE',
          isCpCampaign: dto.isCpCampaign || false,
          projectId,
          integrationId,
          templateId,
          subject: dto.subject || '',
          fromName: dto.fromName || '',
          fromEmail: dto.fromEmail || '',
          replyTo: dto.replyTo || null,
          htmlContent: dto.htmlContent || '',
          audienceFilters: dto.audienceFilters as any,
          totalRecipients: audienceResult.finalAudienceCount,
          scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
          createdById: validUserId,
        },
      });
    }

    // Populate Recipients
    if (dto.audienceSource === 'CSV_UPLOAD' && dto.csvRecipients?.length) {
      const unsubscribedSet = new Set(
        (await this.prisma.marketingUnsubscribe.findMany({ select: { email: true } })).map((u) =>
          u.email.toLowerCase().trim(),
        ),
      );
      const seenEmails = new Set<string>();

      const recipientData: any[] = [];
      const crmLeadsToCreate: any[] = [];

      for (const row of dto.csvRecipients) {
        const email = row.email?.toLowerCase().trim();
        if (!email || seenEmails.has(email) || unsubscribedSet.has(email)) continue;
        seenEmails.add(email);

        recipientData.push({
          campaignId: campaign.id,
          email,
          name: row.name || email.split('@')[0],
          phone: row.phone,
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
            email,
            phone: row.phone || 'N/A',
            temperature: row.temperature || 'WARM',
            interestedProjectId: projectId,
            budget: row.budget ? Number(row.budget) : null,
            createdById: validUserId,
          });
        }
      }

      if (recipientData.length > 0) {
        await this.prisma.campaignRecipient.createMany({ data: recipientData });
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

      const unsubscribedSet = new Set(
        (await this.prisma.marketingUnsubscribe.findMany({ select: { email: true } })).map((u) =>
          u.email.toLowerCase().trim(),
        ),
      );
      const seenEmails = new Set<string>();
      const recipientData: any[] = [];

      for (const lead of leads) {
        if (!lead.email) continue;
        const email = lead.email.toLowerCase().trim();
        if (seenEmails.has(email) || unsubscribedSet.has(email)) continue;
        seenEmails.add(email);

        recipientData.push({
          campaignId: campaign.id,
          leadId: lead.id,
          email,
          name: `${lead.firstName} ${lead.lastName || ''}`.trim(),
          phone: lead.phone,
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
        await this.prisma.campaignRecipient.createMany({ data: recipientData });
      }
    }

    if (!dto.scheduledAt) {
      this.triggerWorkerDispatch(campaign.id);
    }

    return campaign;
  }

  private triggerWorkerDispatch(campaignId: string) {
    const workerUrl = process.env.WORKER_URL || 'http://127.0.0.1:3334';
    fetch(`${workerUrl}/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ campaignId }),
    }).catch(() => { });
  }

  async dispatchCampaign(id: string) {
    const campaign = await this.prisma.marketingCampaign.findUnique({
      where: { id },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');

    await this.prisma.marketingCampaign.update({
      where: { id },
      data: { status: 'PROCESSING' },
    });

    this.triggerWorkerDispatch(id);
    return { success: true, message: `Dispatched campaign ${id}` };
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
      } else if (query?.includeDrafts !== 'true' && query?.includeDrafts !== true) {
        where.status = { not: 'DRAFT' };
      }
    } else if (query?.includeDrafts !== 'true' && query?.includeDrafts !== true) {
      where.status = { not: 'DRAFT' };
    }

    if (query?.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { subject: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.marketingCampaign.count({ where }),
      this.prisma.marketingCampaign.findMany({
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
    const campaign = await this.prisma.marketingCampaign.findUnique({
      where: { id },
      include: {
        project: true,
        integration: true,
        template: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async deleteCampaign(id: string) {
    const campaign = await this.prisma.marketingCampaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    await this.prisma.emailTrackingEvent.deleteMany({ where: { campaignId: id } });
    await this.prisma.campaignRecipient.deleteMany({ where: { campaignId: id } });
    await this.prisma.marketingCampaign.delete({ where: { id } });

    return { success: true, message: `Deleted campaign ${id}` };
  }
}

// Backward-compatibility alias
export { EmailService as MarketingService };
