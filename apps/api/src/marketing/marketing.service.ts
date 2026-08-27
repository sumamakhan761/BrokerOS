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

  constructor(private readonly prisma: PrismaService) {}

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
    const filters = dto.audienceFilters || {};
    const whereClause: any = {
      deletedAt: null,
      email: { not: null },
    };

    if (filters.temperatures?.length) {
      whereClause.temperature = { in: filters.temperatures };
    }
    if (filters.statuses?.length) {
      whereClause.status = { in: filters.statuses };
    }
    if (filters.projectId || dto.projectId) {
      whereClause.interestedProjectId = filters.projectId || dto.projectId;
    }
    if (filters.minBudget || filters.maxBudget) {
      whereClause.budget = {};
      if (filters.minBudget) whereClause.budget.gte = filters.minBudget;
      if (filters.maxBudget) whereClause.budget.lte = filters.maxBudget;
    }

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

  // ── CAMPAIGN MANAGEMENT ──

  async createCampaign(dto: CreateCampaignDto, userId?: string) {
    const audienceResult = await this.previewAudience({
      audienceSource: dto.audienceSource || 'CRM_DATABASE',
      audienceFilters: dto.audienceFilters,
      csvRecipients: dto.csvRecipients,
      isCpCampaign: dto.isCpCampaign,
      projectId: dto.projectId,
    });

    const campaign = await this.prisma.marketingCampaign.create({
      data: {
        title: dto.title,
        channel: dto.channel || 'EMAIL',
        status: dto.scheduledAt ? 'SCHEDULED' : 'DRAFT',
        providerType: dto.providerType || 'SYSTEM_DEFAULT',
        audienceSource: dto.audienceSource || 'CRM_DATABASE',
        isCpCampaign: dto.isCpCampaign || false,
        projectId: dto.projectId,
        integrationId: dto.integrationId,
        templateId: dto.templateId,
        subject: dto.subject,
        fromName: dto.fromName,
        fromEmail: dto.fromEmail,
        replyTo: dto.replyTo,
        htmlContent: dto.htmlContent,
        audienceFilters: dto.audienceFilters as any,
        totalRecipients: audienceResult.finalAudienceCount,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : null,
        createdById: userId,
      },
    });

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
            interestedProjectId: dto.projectId,
            budget: row.budget ? Number(row.budget) : null,
            createdById: userId,
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
      const filters = dto.audienceFilters || {};
      const whereClause: any = {
        deletedAt: null,
        email: { not: null },
      };

      if (filters.temperatures?.length) whereClause.temperature = { in: filters.temperatures };
      if (filters.statuses?.length) whereClause.status = { in: filters.statuses };
      if (filters.projectId || dto.projectId) whereClause.interestedProjectId = filters.projectId || dto.projectId;

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

    return campaign;
  }

  async findAllCampaigns(query?: { page?: number; limit?: number; status?: string; search?: string }) {
    const page = Number(query?.page) || 1;
    const limit = Number(query?.limit) || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query?.status) where.status = query.status;
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

    const deliveryRate = campaign.sentCount > 0 ? (campaign.deliveredCount / campaign.sentCount) * 100 : 0;
    const openRate = campaign.deliveredCount > 0 ? (campaign.openedCount / campaign.deliveredCount) * 100 : 0;
    const clickRate = campaign.deliveredCount > 0 ? (campaign.clickedCount / campaign.deliveredCount) * 100 : 0;
    const clickToOpenRate = campaign.openedCount > 0 ? (campaign.clickedCount / campaign.openedCount) * 100 : 0;
    const bounceRate = campaign.sentCount > 0 ? (campaign.bouncedCount / campaign.sentCount) * 100 : 0;

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
      totalRecipients: campaign.totalRecipients,
      sentCount: campaign.sentCount,
      deliveredCount: campaign.deliveredCount,
      deliveryRate: Number(deliveryRate.toFixed(1)),
      openedCount: campaign.openedCount,
      openRate: Number(openRate.toFixed(1)),
      clickedCount: campaign.clickedCount,
      clickRate: Number(clickRate.toFixed(1)),
      clickToOpenRate: Number(clickToOpenRate.toFixed(1)),
      bouncedCount: campaign.bouncedCount,
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

  // ── TEST SEND & DIRECT DISPATCH ──

  async sendTestEmail(dto: SendTestEmailDto) {
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
    }

    const providerType = dto.providerType || 'SYSTEM_DEFAULT';
    const adapter = this.getAdapter(providerType);

    const options: SendEmailOptions = {
      fromEmail: dto.fromEmail,
      fromName: dto.fromName,
      to: [{ email: dto.recipientEmail, name: 'Test Recipient' }],
      subject: `[TEST] ${dto.subject}`,
      htmlContent: dto.htmlContent,
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
      await this.prisma.$transaction([
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
            firstClickedAt: new Date(),
          },
        }),
        this.prisma.marketingCampaign.update({
          where: { id: campaignId },
          data: { clickedCount: { increment: 1 } },
        }),
      ]);
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
