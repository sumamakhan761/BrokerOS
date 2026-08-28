import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../lib/database/prisma.service.js';
import type {
  ISmsMarketingProvider,
  SmsAudienceEstimationResult,
  SmsCampaignAnalyticsSummary,
  SmsProviderCredentials,
  SmsWebhookEvent,
  SendSmsOptions,
} from '@brokeros/types';
import { TwilioSmsAdapter } from '@brokeros/int-sms-twilio';
import { AwsSnsSmsAdapter } from '@brokeros/int-sms-aws-sns';
import { SinchSmsAdapter } from '@brokeros/int-sms-sinch';
import { GupshupSmsAdapter } from '@brokeros/int-sms-gupshup';
import {
  CreateSmsCampaignDto,
  SaveDraftSmsCampaignDto,
  PreviewSmsAudienceDto,
  SendTestSmsDto,
  ConnectSmsIntegrationDto,
} from './dto/sms.dto.js';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  // Adapters
  private readonly twilioAdapter = new TwilioSmsAdapter();
  private readonly awsSnsAdapter = new AwsSnsSmsAdapter();
  private readonly sinchAdapter = new SinchSmsAdapter();
  private readonly gupshupAdapter = new GupshupSmsAdapter();

  constructor(private readonly prisma: PrismaService) { }

  private getAdapter(providerType: string): ISmsMarketingProvider {
    switch (providerType) {
      case 'AWS_SNS':
        return this.awsSnsAdapter;
      case 'SINCH':
        return this.sinchAdapter;
      case 'GUPSHUP':
        return this.gupshupAdapter;
      case 'TWILIO':
      default:
        return this.twilioAdapter;
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
        brochureUrl: true,
        builder: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  private buildLeadWhereClause(filters: any = {}, isCpCampaign?: boolean, projectId?: string) {
    const whereClause: any = {
      deletedAt: null,
      phone: { not: '' },
    };

    if (filters.statuses?.length && !filters.statuses.includes('ALL')) {
      whereClause.status = { in: filters.statuses };
    } else {
      whereClause.status = { in: ['NEW', 'CONTACTED', 'INTERESTED', 'QUALIFIED'] };
    }

    if (filters.temperatures?.length) {
      whereClause.temperature = { in: filters.temperatures };
    }

    const targetProject = filters.projectId || projectId;
    if (targetProject && targetProject !== 'ALL' && targetProject !== '') {
      whereClause.interestedProjectId = targetProject;
    }

    if (filters.minBudget) {
      whereClause.budget = { gte: Number(filters.minBudget) };
    }

    if (isCpCampaign) {
      whereClause.brokerId = { not: null };
    }

    return whereClause;
  }

  async previewAudience(dto: PreviewSmsAudienceDto): Promise<SmsAudienceEstimationResult> {
    if (dto.audienceSource === 'CSV_UPLOAD' && dto.csvRecipients?.length) {
      const seenPhones = new Set<string>();
      let validPhoneCount = 0;
      let duplicateCount = 0;

      for (const row of dto.csvRecipients) {
        const phone = row.phone?.replace(/[^\d+]/g, '');
        if (!phone || phone.length < 8) continue;

        if (seenPhones.has(phone)) {
          duplicateCount++;
          continue;
        }
        seenPhones.add(phone);
        validPhoneCount++;
      }

      return {
        totalCount: dto.csvRecipients.length,
        validPhoneCount,
        duplicateCount,
        finalAudienceCount: validPhoneCount,
      };
    }

    const whereClause = this.buildLeadWhereClause(dto.audienceFilters, dto.isCpCampaign, dto.projectId);
    const leads = await this.prisma.lead.findMany({
      where: whereClause,
      select: { phone: true },
    });

    const seenPhones = new Set<string>();
    let duplicateCount = 0;
    let validPhoneCount = 0;

    for (const lead of leads) {
      if (!lead.phone) continue;
      const phone = lead.phone.replace(/[^\d+]/g, '');
      if (phone.length < 8) continue;

      if (seenPhones.has(phone)) {
        duplicateCount++;
        continue;
      }
      seenPhones.add(phone);
      validPhoneCount++;
    }

    return {
      totalCount: leads.length,
      validPhoneCount,
      duplicateCount,
      finalAudienceCount: validPhoneCount,
    };
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

    return { projectId: validProjectId, integrationId: validIntegrationId, userId: validUserId };
  }

  async saveDraftCampaign(dto: SaveDraftSmsCampaignDto, userId?: string) {
    const { projectId, integrationId, userId: validUserId } = await this.resolveForeignKeys(dto, userId);

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
            projectId: dto.projectId !== undefined ? projectId : existing.projectId,
            integrationId: dto.integrationId !== undefined ? integrationId : existing.integrationId,
            fromSender: dto.fromSender !== undefined ? dto.fromSender : existing.fromSender,
            messageContent: dto.messageContent !== undefined ? dto.messageContent : existing.messageContent,
            dltTemplateId: dto.dltTemplateId !== undefined ? dto.dltTemplateId : existing.dltTemplateId,
            audienceFilters: dto.audienceFilters ? (dto.audienceFilters as any) : existing.audienceFilters,
            scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : existing.scheduledAt,
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
        audienceFilters: dto.audienceFilters ? (dto.audienceFilters as any) : undefined,
        totalRecipients: 0,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        createdById: validUserId,
      },
    });
  }

  async createCampaign(dto: CreateSmsCampaignDto, userId?: string) {
    const { projectId, integrationId, userId: validUserId } = await this.resolveForeignKeys(dto, userId);

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
            fromSender: dto.fromSender,
            messageContent: dto.messageContent,
            dltTemplateId: dto.dltTemplateId || null,
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
          fromSender: dto.fromSender,
          messageContent: dto.messageContent,
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
      const whereClause = this.buildLeadWhereClause(dto.audienceFilters, dto.isCpCampaign, dto.projectId);
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
    }).catch(() => {
      // Auto-scanner in workers will also process it
    });
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

  async getCampaignAnalytics(campaignId: string): Promise<SmsCampaignAnalyticsSummary> {
    const campaign = await this.findOneCampaign(campaignId);

    const [
      totalRecipientsCount,
      deliveredCount,
      clickedCount,
      failedCount,
      shortLinks,
    ] = await Promise.all([
      this.prisma.smsRecipient.count({ where: { campaignId } }),
      this.prisma.smsRecipient.count({ where: { campaignId, status: 'DELIVERED' } }),
      this.prisma.smsRecipient.count({ where: { campaignId, clickCount: { gt: 0 } } }),
      this.prisma.smsRecipient.count({ where: { campaignId, status: 'FAILED' } }),
      this.prisma.smsShortLink.findMany({
        where: { campaignId },
        select: { destinationUrl: true, clicksCount: true },
      }),
    ]);

    const sentCount = Math.max(campaign.sentCount, deliveredCount + failedCount);
    const deliveryRate = sentCount > 0 ? (deliveredCount / sentCount) * 100 : 0;
    const clickRate = deliveredCount > 0 ? (clickedCount / deliveredCount) * 100 : 0;

    const linkMap: Record<string, number> = {};
    for (const link of shortLinks) {
      if (link.destinationUrl) {
        linkMap[link.destinationUrl] = (linkMap[link.destinationUrl] || 0) + (link.clicksCount || 0);
      }
    }

    const topClickedLinks = Object.entries(linkMap)
      .map(([url, clicks]) => ({ url, clicks }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5);

    return {
      campaignId: campaign.id,
      title: campaign.title,
      status: campaign.status as any,
      providerType: campaign.providerType as any,
      fromSender: campaign.fromSender,
      totalRecipients: Math.max(campaign.totalRecipients, totalRecipientsCount),
      sentCount,
      deliveredCount,
      deliveryRate: Number(deliveryRate.toFixed(1)),
      clickedCount,
      clickRate: Number(clickRate.toFixed(1)),
      failedCount,
      totalSegmentsSent: campaign.totalSegmentsSent,
      topClickedLinks,
    };
  }

  async getCampaignRecipients(
    campaignId: string,
    query?: { page?: number; limit?: number; status?: string; search?: string },
  ) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 25;
    const skip = (page - 1) * limit;

    const where: any = { campaignId };
    if (query?.status) where.status = query.status;
    if (query?.search) {
      where.OR = [
        { phone: { contains: query.search, mode: 'insensitive' } },
        { name: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      this.prisma.smsRecipient.count({ where }),
      this.prisma.smsRecipient.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ clickCount: 'desc' }, { createdAt: 'desc' }],
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
    const recipient = await this.prisma.smsRecipient.findUnique({
      where: { id: recipientId },
      include: { campaign: true },
    });

    if (!recipient) throw new NotFoundException('SMS Recipient record not found');
    if (recipient.leadId) throw new BadRequestException('Recipient is already linked to a CRM Lead');

    const nameParts = (recipient.name || 'Prospect').trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || undefined;

    const merge = (recipient.mergeData as any) || {};

    const newLead = await this.prisma.lead.create({
      data: {
        firstName,
        lastName,
        phone: recipient.phone,
        temperature: (merge.temperature as any) || 'HOT',
        status: 'INTERESTED',
        interestedProjectId: recipient.campaign.projectId,
        budget: merge.budget ? Number(merge.budget) : null,
        createdById: userId,
      },
    });

    await this.prisma.smsRecipient.update({
      where: { id: recipientId },
      data: { leadId: newLead.id },
    });

    return newLead;
  }

  async sendTestSms(dto: SendTestSmsDto) {
    const providerType = dto.providerType || 'TWILIO';
    let credentials: SmsProviderCredentials | undefined;

    if (dto.integrationId) {
      const integration = await this.prisma.smsIntegration.findUnique({
        where: { id: dto.integrationId },
      });
      if (integration) {
        credentials = {
          accountSid: integration.accountSid || undefined,
          authToken: integration.authToken || undefined,
          messagingServiceSid: integration.messagingServiceSid || undefined,
          apiKey: integration.apiKey || undefined,
          servicePlanId: integration.servicePlanId || undefined,
          awsAccessKeyId: integration.awsAccessKeyId || undefined,
          awsSecretKey: integration.awsSecretKey || undefined,
          awsRegion: integration.awsRegion || undefined,
          dltEntityId: integration.dltEntityId || undefined,
          fromNumber: integration.fromSender,
          senderId: integration.fromSender,
        };
      }
    } else {
      const activeIntegration = await this.prisma.smsIntegration.findFirst({
        where: { provider: providerType as any, isActive: true },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });
      if (activeIntegration) {
        credentials = {
          accountSid: activeIntegration.accountSid || undefined,
          authToken: activeIntegration.authToken || undefined,
          messagingServiceSid: activeIntegration.messagingServiceSid || undefined,
          apiKey: activeIntegration.apiKey || undefined,
          servicePlanId: activeIntegration.servicePlanId || undefined,
          awsAccessKeyId: activeIntegration.awsAccessKeyId || undefined,
          awsSecretKey: activeIntegration.awsSecretKey || undefined,
          awsRegion: activeIntegration.awsRegion || undefined,
          dltEntityId: activeIntegration.dltEntityId || undefined,
          fromNumber: activeIntegration.fromSender,
          senderId: activeIntegration.fromSender,
        };
      }
    }

    const adapter = this.getAdapter(providerType);
    const resolvedFrom = dto.fromSender || credentials?.fromNumber || credentials?.senderId || 'BrokerOS';

    const testMessage = `[TEST] ${dto.messageContent
      .replace(/{{lead\.firstName}}/gi, 'Rahul')
      .replace(/{{lead\.fullName}}/gi, 'Rahul Sharma')
      .replace(/{{project\.name}}/gi, 'Skyline Luxuria')
      .replace(/{{project\.startingPrice}}/gi, '₹1.45 Cr')
      .replace(/{{project\.location}}/gi, 'Bandra West')
      .replace(/{{agent\.phone}}/gi, '+91 98765 43210')
      .replace(/{{shortUrl}}/gi, 'https://brokeros.io')
      .replace(/{{optOut}}/gi, 'Reply STOP')}`;

    const sendOptions: SendSmsOptions = {
      from: resolvedFrom,
      to: [{ phone: dto.recipientPhone, name: 'Tester' }],
      message: testMessage,
      dltTemplateId: dto.dltTemplateId,
    };

    return adapter.sendBatch(sendOptions, credentials);
  }

  // ── INTEGRATIONS MANAGEMENT ──

  async listIntegrations() {
    return this.prisma.smsIntegration.findMany({
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        provider: true,
        name: true,
        isActive: true,
        isDefault: true,
        fromSender: true,
        awsRegion: true,
        dltEntityId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async connectIntegration(dto: ConnectSmsIntegrationDto) {
    const adapter = this.getAdapter(dto.provider);
    const isValid = await adapter.validateCredentials({
      accountSid: dto.accountSid,
      authToken: dto.authToken,
      messagingServiceSid: dto.messagingServiceSid,
      apiKey: dto.apiKey,
      servicePlanId: dto.servicePlanId,
      awsAccessKeyId: dto.awsAccessKeyId,
      awsSecretKey: dto.awsSecretKey,
      awsRegion: dto.awsRegion,
      dltEntityId: dto.dltEntityId,
      fromNumber: dto.fromSender,
      senderId: dto.fromSender,
    });

    if (!isValid) {
      throw new BadRequestException(`Failed to validate credentials with SMS provider ${dto.provider}`);
    }

    if (dto.isDefault) {
      await this.prisma.smsIntegration.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.smsIntegration.create({
      data: {
        provider: dto.provider as any,
        name: dto.name,
        isDefault: dto.isDefault || false,
        accountSid: dto.accountSid,
        authToken: dto.authToken,
        messagingServiceSid: dto.messagingServiceSid,
        apiKey: dto.apiKey,
        servicePlanId: dto.servicePlanId,
        awsAccessKeyId: dto.awsAccessKeyId,
        awsSecretKey: dto.awsSecretKey,
        awsRegion: dto.awsRegion,
        dltEntityId: dto.dltEntityId,
        fromSender: dto.fromSender,
      },
    });
  }

  async deleteIntegration(id: string) {
    return this.prisma.smsIntegration.delete({ where: { id } });
  }

  // ── SHORT LINK RESOLUTION & TELEMETRY ──

  async resolveShortLink(code: string, ip?: string, userAgent?: string): Promise<string> {
    try {
      const link = await this.prisma.smsShortLink.findUnique({
        where: { code },
      });

      if (!link) return 'https://brokeros.io';

      await this.prisma.$transaction([
        this.prisma.smsShortLink.update({
          where: { id: link.id },
          data: { clicksCount: { increment: 1 } },
        }),
        this.prisma.smsTrackingEvent.create({
          data: {
            campaignId: link.campaignId,
            recipientId: link.recipientId,
            eventType: 'CLICK',
            urlClicked: link.destinationUrl,
            ipAddress: ip,
            userAgent,
          },
        }),
        this.prisma.smsRecipient.update({
          where: { id: link.recipientId },
          data: {
            firstClickedAt: new Date(),
            clickCount: { increment: 1 },
          },
        }),
        this.prisma.smsCampaign.update({
          where: { id: link.campaignId },
          data: { clickedCount: { increment: 1 } },
        }),
      ]);

      return link.destinationUrl;
    } catch (err: any) {
      this.logger.warn(`Failed to resolve shortlink ${code}: ${err?.message}`);
      return 'https://brokeros.io';
    }
  }

  // ── WEBHOOK PROCESSOR ──

  async processWebhookEvents(events: SmsWebhookEvent[]) {
    for (const ev of events) {
      if (ev.eventType === 'DELIVERED') {
        if (ev.campaignId) {
          await this.prisma.smsCampaign.update({
            where: { id: ev.campaignId },
            data: { deliveredCount: { increment: 1 } },
          }).catch(() => null);
        }
        await this.prisma.smsRecipient.updateMany({
          where: { phone: ev.recipientPhone, ...(ev.campaignId ? { campaignId: ev.campaignId } : {}) },
          data: { status: 'DELIVERED', deliveredAt: new Date() },
        }).catch(() => null);
      } else if (ev.eventType === 'FAILED') {
        if (ev.campaignId) {
          await this.prisma.smsCampaign.update({
            where: { id: ev.campaignId },
            data: { failedCount: { increment: 1 } },
          }).catch(() => null);
        }
        await this.prisma.smsRecipient.updateMany({
          where: { phone: ev.recipientPhone, ...(ev.campaignId ? { campaignId: ev.campaignId } : {}) },
          data: { status: 'FAILED', failReason: ev.metadata?.reason || 'Carrier delivery failure', failedAt: new Date() },
        }).catch(() => null);
      }
    }
  }

  async deleteCampaign(id: string) {
    const campaign = await this.prisma.smsCampaign.findUnique({ where: { id } });
    if (!campaign) throw new NotFoundException('SMS Campaign not found');

    await this.prisma.smsTrackingEvent.deleteMany({ where: { campaignId: id } });
    await this.prisma.smsRecipient.deleteMany({ where: { campaignId: id } });
    await this.prisma.smsCampaign.delete({ where: { id } });

    return { success: true, message: `Deleted SMS campaign ${id}` };
  }
}
