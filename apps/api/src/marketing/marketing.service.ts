import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../lib/database/prisma.service.js';
import type {
  AudienceEstimationResult,
  CampaignAnalyticsSummary,
  CsvLeadRow,
  EmailRecipient,
  EmailWebhookEvent,
  IEmailMarketingProvider,
  ProviderCredentials,
  SendEmailOptions,
  SendEmailResult,
} from '@brokeros/types';
import { SesAdapter } from '@brokeros/int-mail-ses';
import { SendgridAdapter } from '@brokeros/int-mail-sendgrid';
import { BrevoAdapter } from '@brokeros/int-mail-brevo';
import { MailchimpAdapter } from '@brokeros/int-mail-mailchimp';
import {
  CreateCampaignDto,
  SaveDraftCampaignDto,
  PreviewAudienceDto,
  SendTestEmailDto,
  ConnectIntegrationDto,
  CreateTemplateDto,
} from './dto/marketing.dto.js';

@Injectable()
export class MarketingService {
  private readonly logger = new Logger(MarketingService.name);

  // Provider Adapters
  private readonly sesAdapter = new SesAdapter();
  private readonly sendgridAdapter = new SendgridAdapter();
  private readonly brevoAdapter = new BrevoAdapter();
  private readonly mailchimpAdapter = new MailchimpAdapter();

  constructor(private readonly prisma: PrismaService) { }

  private getAdapter(providerType: string): IEmailMarketingProvider {
    switch (providerType) {
      case 'SENDGRID':
        return this.sendgridAdapter;
      case 'BREVO':
        return this.brevoAdapter;
      case 'MAILCHIMP':
        return this.mailchimpAdapter;
      case 'AWS_SES':
      case 'SYSTEM_DEFAULT':
      default:
        return this.sesAdapter;
    }
  }

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

  private buildLeadWhereClause(filters: any = {}, isCpCampaign?: boolean, projectId?: string) {
    const whereClause: any = {
      deletedAt: null,
      email: { not: null },
    };

    // 1. Pre-sales Status Filtering:
    // Excludes site visits, negotiations, bookings, agreements, lost leads
    if (filters.statuses?.length && !filters.statuses.includes('ALL')) {
      whereClause.status = { in: filters.statuses };
    } else {
      whereClause.status = { in: ['NEW', 'CONTACTED', 'INTERESTED', 'QUALIFIED'] };
    }

    // 2. Optional Temperature Filter
    if (filters.temperatures?.length) {
      whereClause.temperature = { in: filters.temperatures };
    }

    // 3. Optional Project Affinity Filter
    const targetProject = filters.projectId || projectId;
    if (targetProject && targetProject !== 'ALL' && targetProject !== '') {
      whereClause.interestedProjectId = targetProject;
    }

    // 4. Optional Budget Filter
    if (filters.minBudget) {
      whereClause.budget = { gte: Number(filters.minBudget) };
    }

    // 5. Business World Scope
    if (isCpCampaign) {
      whereClause.brokerId = { not: null };
    }

    return whereClause;
  }

  // ── AUDIENCE ESTIMATION & VALIDATION ──

  async previewAudience(dto: PreviewAudienceDto): Promise<AudienceEstimationResult> {
    const unsubscribedSet = new Set(
      (await this.prisma.marketingUnsubscribe.findMany({ select: { email: true } }))
        .map((u) => u.email.toLowerCase().trim()),
    );

    if (dto.audienceSource === 'CSV_UPLOAD' && dto.csvRecipients?.length) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const seenEmails = new Set<string>();
      let duplicateCount = 0;
      let unsubscribedCount = 0;
      let validEmailCount = 0;

      for (const row of dto.csvRecipients) {
        const email = row.email?.toLowerCase().trim();
        if (!email || !emailRegex.test(email)) continue;

        if (seenEmails.has(email)) {
          duplicateCount++;
          continue;
        }
        seenEmails.add(email);

        if (unsubscribedSet.has(email)) {
          unsubscribedCount++;
          continue;
        }

        validEmailCount++;
      }

      return {
        totalCount: dto.csvRecipients.length,
        validEmailCount,
        duplicateCount,
        unsubscribedCount,
        finalAudienceCount: validEmailCount,
      };
    }

    // CRM Database Query
    const whereClause = this.buildLeadWhereClause(dto.audienceFilters, dto.isCpCampaign, dto.projectId);

    const leads = await this.prisma.lead.findMany({
      where: whereClause,
      select: { email: true },
    });

    const seenEmails = new Set<string>();
    let duplicateCount = 0;
    let unsubscribedCount = 0;
    let validEmailCount = 0;

    for (const lead of leads) {
      if (!lead.email) continue;
      const email = lead.email.toLowerCase().trim();

      if (seenEmails.has(email)) {
        duplicateCount++;
        continue;
      }
      seenEmails.add(email);

      if (unsubscribedSet.has(email)) {
        unsubscribedCount++;
        continue;
      }

      validEmailCount++;
    }

    return {
      totalCount: leads.length,
      validEmailCount,
      duplicateCount,
      unsubscribedCount,
      finalAudienceCount: validEmailCount,
    };
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

  // ── CAMPAIGN MANAGEMENT ──

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
            subject: dto.subject,
            fromName: dto.fromName,
            fromEmail: dto.fromEmail,
            replyTo: dto.replyTo || null,
            htmlContent: dto.htmlContent,
            audienceFilters: dto.audienceFilters as any,
            totalRecipients: audienceResult.finalAudienceCount,
            scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
          },
        });
        // Remove prior recipients if this draft had any
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
          subject: dto.subject,
          fromName: dto.fromName,
          fromEmail: dto.fromEmail,
          replyTo: dto.replyTo || null,
          htmlContent: dto.htmlContent,
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
        (await this.prisma.marketingUnsubscribe.findMany({ select: { email: true } }))
          .map((u) => u.email.toLowerCase().trim()),
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
        // Bulk import as permanent CRM leads
        await this.prisma.lead.createMany({
          data: crmLeadsToCreate,
          skipDuplicates: true,
        });
      }
    } else {
      // Query CRM DB leads and attach as recipients
      const whereClause = this.buildLeadWhereClause(dto.audienceFilters, dto.isCpCampaign, dto.projectId);

      const leads: any[] = await this.prisma.lead.findMany({
        where: whereClause,
        include: {
          interestedProject: { select: { name: true } },
          assignedUser: { select: { name: true, phoneNumber: true } },
        },
      });

      const unsubscribedSet = new Set(
        (await this.prisma.marketingUnsubscribe.findMany({ select: { email: true } }))
          .map((u) => u.email.toLowerCase().trim()),
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
    }).catch(() => {
      // Auto-scanner in workers will also process it
    });
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

  async findAllCampaigns(query?: { page?: number; limit?: number; status?: string; search?: string; includeDrafts?: string | boolean }) {
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

  async getCampaignAnalytics(campaignId: string): Promise<CampaignAnalyticsSummary> {
    const campaign = await this.findOneCampaign(campaignId);

    // Live aggregate stats from actual recipients table
    const [
      totalRecipientsCount,
      deliveredRecipients,
      openedRecipients,
      clickedRecipients,
      bouncedRecipients,
    ] = await Promise.all([
      this.prisma.campaignRecipient.count({ where: { campaignId } }),
      this.prisma.campaignRecipient.count({
        where: { campaignId, status: { in: ['DELIVERED', 'OPENED', 'CLICKED', 'SENT'] } },
      }),
      this.prisma.campaignRecipient.count({
        where: {
          campaignId,
          OR: [
            { status: { in: ['OPENED', 'CLICKED'] } },
            { openCount: { gt: 0 } },
          ],
        },
      }),
      this.prisma.campaignRecipient.count({
        where: {
          campaignId,
          OR: [
            { status: 'CLICKED' },
            { clickCount: { gt: 0 } },
          ],
        },
      }),
      this.prisma.campaignRecipient.count({
        where: { campaignId, status: { in: ['BOUNCED', 'FAILED'] } },
      }),
    ]);

    const sentCount = Math.max(campaign.sentCount, deliveredRecipients + bouncedRecipients);
    const deliveredCount = Math.max(campaign.deliveredCount, deliveredRecipients);
    const openedCount = Math.max(campaign.openedCount, openedRecipients);
    const clickedCount = Math.max(campaign.clickedCount, clickedRecipients);
    const bouncedCount = Math.max(campaign.bouncedCount, bouncedRecipients);

    const deliveryRate = sentCount > 0 ? (deliveredCount / sentCount) * 100 : 0;
    const openRate = deliveredCount > 0 ? (openedCount / deliveredCount) * 100 : 0;
    const clickRate = deliveredCount > 0 ? (clickedCount / deliveredCount) * 100 : 0;
    const clickToOpenRate = openedCount > 0 ? (clickedCount / openedCount) * 100 : 0;
    const bounceRate = sentCount > 0 ? (bouncedCount / sentCount) * 100 : 0;

    // Top Clicked Links
    const clicks = await this.prisma.emailTrackingEvent.findMany({
      where: { campaignId, eventType: 'CLICK', urlClicked: { not: null } },
      select: { urlClicked: true },
    });

    const linkMap: Record<string, number> = {};
    for (const c of clicks) {
      if (c.urlClicked) {
        linkMap[c.urlClicked] = (linkMap[c.urlClicked] || 0) + 1;
      }
    }

    const topClickedLinks = Object.entries(linkMap)
      .map(([url, count]) => ({ url, clicks: count }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);

    return {
      campaignId: campaign.id,
      title: campaign.title,
      status: campaign.status as any,
      providerType: campaign.providerType as any,
      totalRecipients: Math.max(campaign.totalRecipients, totalRecipientsCount),
      sentCount,
      deliveredCount,
      deliveryRate: Number(deliveryRate.toFixed(1)),
      openedCount,
      openRate: Number(openRate.toFixed(1)),
      clickedCount,
      clickRate: Number(clickRate.toFixed(1)),
      clickToOpenRate: Number(clickToOpenRate.toFixed(1)),
      bouncedCount,
      bounceRate: Number(bounceRate.toFixed(1)),
      unsubscribedCount: campaign.unsubscribedCount,
      complaintCount: campaign.complaintCount,
      topClickedLinks,
      hourlyActivity: [],
    };
  }

  async getCampaignRecipients(campaignId: string, query?: { page?: number; limit?: number; status?: string; search?: string }) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 25;
    const skip = (page - 1) * limit;

    const where: any = { campaignId };
    if (query?.status) where.status = query.status;
    if (query?.search) {
      where.OR = [
        { email: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.campaignRecipient.count({ where }),
      this.prisma.campaignRecipient.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ openCount: 'desc' }, { clickCount: 'desc' }, { createdAt: 'desc' }],
        include: {
          lead: { select: { id: true, firstName: true, lastName: true, phone: true, temperature: true, status: true } },
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

  async promoteCsvRecipientToLead(recipientId: string, userId?: string) {
    const recipient = await this.prisma.campaignRecipient.findUnique({
      where: { id: recipientId },
      include: { campaign: true },
    });

    if (!recipient) throw new NotFoundException('Recipient record not found');
    if (recipient.leadId) throw new BadRequestException('Recipient is already linked to a CRM Lead');

    const nameParts = (recipient.name || 'Prospect').trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || undefined;

    const merge = (recipient.mergeData as any) || {};

    const newLead = await this.prisma.lead.create({
      data: {
        firstName,
        lastName,
        email: recipient.email,
        phone: recipient.phone || 'N/A',
        temperature: (merge.temperature as any) || 'HOT', // Since they engaged, mark as HOT
        status: 'INTERESTED',
        interestedProjectId: recipient.campaign.projectId,
        budget: merge.budget ? Number(merge.budget) : null,
        createdById: userId,
      },
    });

    await this.prisma.campaignRecipient.update({
      where: { id: recipientId },
      data: { leadId: newLead.id },
    });

    return newLead;
  }

  renderMergeTags(
    template: string,
    data: {
      firstName?: string;
      lastName?: string;
      fullName?: string;
      city?: string;
      projectName?: string;
      projectLocation?: string;
      projectStartingPrice?: string;
      projectBrochureUrl?: string;
      agentName?: string;
      agentPhone?: string;
      unsubscribeUrl?: string;
    },
  ): string {
    if (!template) return '';
    return template
      .replace(/{{lead\.firstName}}/gi, data.firstName || 'Valued Prospect')
      .replace(/{{lead\.lastName}}/gi, data.lastName || '')
      .replace(/{{lead\.fullName}}/gi, data.fullName || data.firstName || 'Valued Prospect')
      .replace(/{{lead\.city}}/gi, data.city || 'your city')
      .replace(/{{project\.name}}/gi, data.projectName || 'Luxury Residence')
      .replace(/{{project\.location}}/gi, data.projectLocation || 'Prime Location')
      .replace(/{{project\.startingPrice}}/gi, data.projectStartingPrice || '₹1.50 Cr')
      .replace(/{{project\.brochureUrl}}/gi, data.projectBrochureUrl || '#')
      .replace(/{{agent\.name}}/gi, data.agentName || 'Sales Team')
      .replace(/{{agent\.phone}}/gi, data.agentPhone || '+91 98000 00000')
      .replace(/{{unsubscribeUrl}}/gi, data.unsubscribeUrl || '#unsubscribe');
  }

  async sendTestEmail(dto: SendTestEmailDto) {
    const providerType = dto.providerType || 'SYSTEM_DEFAULT';
    let credentials: ProviderCredentials | undefined;

    if (dto.integrationId) {
      const integration = await this.prisma.marketingIntegration.findUnique({
        where: { id: dto.integrationId },
      });
      if (integration) {
        credentials = {
          apiKey: integration.apiKey || undefined,
          awsAccessKeyId: integration.awsAccessKeyId || undefined,
          awsSecretKey: integration.awsSecretKey || undefined,
          awsRegion: integration.awsRegion || undefined,
          mailchimpServer: integration.mailchimpServer || undefined,
          fromEmail: integration.fromEmail,
          fromName: integration.fromName,
        };
      }
    } else if (providerType !== 'SYSTEM_DEFAULT') {
      // Automatically look up the active integration saved by the user in the CRM database!
      const activeIntegration = await this.prisma.marketingIntegration.findFirst({
        where: { provider: providerType as any, isActive: true },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });
      if (activeIntegration) {
        credentials = {
          apiKey: activeIntegration.apiKey || undefined,
          awsAccessKeyId: activeIntegration.awsAccessKeyId || undefined,
          awsSecretKey: activeIntegration.awsSecretKey || undefined,
          awsRegion: activeIntegration.awsRegion || undefined,
          mailchimpServer: activeIntegration.mailchimpServer || undefined,
          fromEmail: activeIntegration.fromEmail,
          fromName: activeIntegration.fromName,
        };
      }
    }

    let project: any = null;
    if (dto.projectId) {
      project = await this.prisma.project.findUnique({
        where: { id: dto.projectId },
        select: { name: true, city: true, address: true, brochureUrl: true },
      });
    }

    const adapter = this.getAdapter(providerType);

    // Use verified sender from integration credentials if user left fromEmail blank/default
    const resolvedFromEmail =
      dto.fromEmail && dto.fromEmail.includes('@') && dto.fromEmail !== 'marketing@example.com'
        ? dto.fromEmail
        : credentials?.fromEmail || dto.fromEmail || 'marketing@example.com';

    const resolvedFromName = dto.fromName || credentials?.fromName || 'Sales Team';

    const testRecipientName = dto.recipientEmail.split('@')[0];
    const previewData = {
      firstName: 'Rahul',
      lastName: 'Sharma',
      fullName: 'Rahul Sharma',
      city: project?.city || 'Mumbai',
      projectName: project?.name || 'Luxury Villas',
      projectLocation: project?.address || project?.city || 'Prime Downtown Corridor',
      projectStartingPrice: '₹1.50 Cr',
      projectBrochureUrl: project?.brochureUrl || 'https://yourdomain.com/brochure',
      agentName: resolvedFromName,
      agentPhone: '+91 98000 00000',
      unsubscribeUrl: '#unsubscribe',
    };

    const renderedSubject = this.renderMergeTags(dto.subject, previewData);
    const renderedHtml = this.renderMergeTags(dto.htmlContent, previewData);

    const options: SendEmailOptions = {
      fromEmail: resolvedFromEmail,
      fromName: resolvedFromName,
      to: [{ email: dto.recipientEmail, name: testRecipientName }],
      subject: `[TEST] ${renderedSubject}`,
      htmlContent: renderedHtml,
    };

    return adapter.sendBatch(options, credentials);
  }

  // ── INTEGRATIONS MANAGEMENT ──

  async listIntegrations() {
    return this.prisma.marketingIntegration.findMany({
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        provider: true,
        name: true,
        isActive: true,
        isDefault: true,
        fromEmail: true,
        fromName: true,
        replyTo: true,
        awsRegion: true,
        mailchimpServer: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async connectIntegration(dto: ConnectIntegrationDto) {
    const adapter = this.getAdapter(dto.provider);
    const isValid = await adapter.validateCredentials({
      apiKey: dto.apiKey,
      awsAccessKeyId: dto.awsAccessKeyId,
      awsSecretKey: dto.awsSecretKey,
      awsRegion: dto.awsRegion,
      mailchimpServer: dto.mailchimpServer,
    });

    if (!isValid) {
      throw new BadRequestException(`Failed to validate credentials with provider ${dto.provider}`);
    }

    if (dto.isDefault) {
      await this.prisma.marketingIntegration.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.marketingIntegration.create({
      data: {
        provider: dto.provider as any,
        name: dto.name,
        isDefault: dto.isDefault || false,
        apiKey: dto.apiKey,
        awsAccessKeyId: dto.awsAccessKeyId,
        awsSecretKey: dto.awsSecretKey,
        awsRegion: dto.awsRegion,
        mailchimpServer: dto.mailchimpServer,
        fromEmail: dto.fromEmail,
        fromName: dto.fromName,
        replyTo: dto.replyTo,
      },
    });
  }

  async deleteIntegration(id: string) {
    return this.prisma.marketingIntegration.delete({ where: { id } });
  }

  async deleteCampaign(id: string) {
    const campaign = await this.prisma.marketingCampaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('Campaign not found');

    await this.prisma.emailTrackingEvent.deleteMany({ where: { campaignId: id } });
    await this.prisma.campaignRecipient.deleteMany({ where: { campaignId: id } });
    await this.prisma.marketingCampaign.delete({ where: { id } });

    return { success: true, message: `Deleted campaign ${id}` };
  }

  // ── TRACKING & WEBHOOK EVENT HANDLERS ──

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
