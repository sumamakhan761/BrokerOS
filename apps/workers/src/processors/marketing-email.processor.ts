import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import { SesAdapter } from '@brokeros/int-mail-ses';
import { SendgridAdapter } from '@brokeros/int-mail-sendgrid';
import { BrevoAdapter } from '@brokeros/int-mail-brevo';
import { MailchimpAdapter } from '@brokeros/int-mail-mailchimp';
import type { IEmailMarketingProvider, ProviderCredentials, SendEmailOptions } from '@brokeros/types';

export interface CampaignDispatchJobData {
  campaignId: string;
}

@Injectable()
export class MarketingEmailProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MarketingEmailProcessor.name);
  private readonly prisma = prismaClient;
  private isScanning = false;
  private scanInterval: NodeJS.Timeout | null = null;

  private readonly sesAdapter = new SesAdapter();
  private readonly sendgridAdapter = new SendgridAdapter();
  private readonly brevoAdapter = new BrevoAdapter();
  private readonly mailchimpAdapter = new MailchimpAdapter();

  onModuleInit() {
    this.logger.log('MarketingEmailProcessor background auto-scanner started.');
    // Immediate scan on startup
    setTimeout(() => this.scanAndProcessPendingCampaigns(), 2000);
    // Recurring scan every 8 seconds
    this.scanInterval = setInterval(() => this.scanAndProcessPendingCampaigns(), 8000);
  }

  onModuleDestroy() {
    if (this.scanInterval) {
      clearInterval(this.scanInterval);
      this.scanInterval = null;
    }
  }

  async scanAndProcessPendingCampaigns(): Promise<void> {
    if (this.isScanning) return;
    this.isScanning = true;

    try {
      // Find campaigns that have QUEUED recipients and need processing
      const pendingCampaigns = await this.prisma.marketingCampaign.findMany({
        where: {
          OR: [
            { status: 'PROCESSING' },
            {
              status: 'SCHEDULED',
              OR: [{ scheduledAt: null }, { scheduledAt: { lte: new Date() } }],
            },
            {
              status: 'DRAFT',
              recipients: { some: { status: 'QUEUED' } },
            },
          ],
          recipients: {
            some: { status: 'QUEUED' },
          },
        },
        select: { id: true, title: true, status: true },
        take: 5,
      });

      for (const campaign of pendingCampaigns) {
        this.logger.log(
          `Auto-scanner picked up campaign "${campaign.title}" (${campaign.id}) [status: ${campaign.status}]`,
        );
        await this.processCampaign({ campaignId: campaign.id });
      }
    } catch (err: any) {
      this.logger.error(`Auto-scanner error: ${err?.message}`);
    } finally {
      this.isScanning = false;
    }
  }

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

  async processCampaign(jobData: CampaignDispatchJobData): Promise<void> {
    const { campaignId } = jobData;
    this.logger.log(`Starting email campaign processing for campaignId=${campaignId}`);

    const campaign = await this.prisma.marketingCampaign.findUnique({
      where: { id: campaignId },
      include: {
        integration: true,
        project: true,
        createdBy: true,
        recipients: {
          where: { status: 'QUEUED' },
          take: 5000,
        },
      },
    });

    if (!campaign) {
      this.logger.error(`Campaign ${campaignId} not found`);
      return;
    }

    await this.prisma.marketingCampaign.update({
      where: { id: campaignId },
      data: { status: 'PROCESSING', startedAt: new Date() },
    });

    const adapter = this.getAdapter(campaign.providerType);
    let credentials: ProviderCredentials | undefined;

    if (campaign.integration) {
      credentials = {
        apiKey: campaign.integration.apiKey || undefined,
        awsAccessKeyId: campaign.integration.awsAccessKeyId || undefined,
        awsSecretKey: campaign.integration.awsSecretKey || undefined,
        awsRegion: campaign.integration.awsRegion || undefined,
        mailchimpServer: campaign.integration.mailchimpServer || undefined,
        fromEmail: campaign.integration.fromEmail,
        fromName: campaign.integration.fromName,
      };
    } else if (campaign.providerType !== 'SYSTEM_DEFAULT' && campaign.providerType !== 'AWS_SES') {
      const activeIntegration = await this.prisma.marketingIntegration.findFirst({
        where: { provider: campaign.providerType as any, isActive: true },
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

    const appBaseUrl =
      process.env.API_PUBLIC_URL ||
      'http://localhost:3333';
    const batchSize = 100;
    const recipients = campaign.recipients;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const chunk = recipients.slice(i, i + batchSize);

      for (const rec of chunk) {
        try {
          const mergeData = (rec.mergeData as any) || {};
          const recipientName = rec.name || mergeData.name || 'Valued Client';
          const nameParts = recipientName.trim().split(' ');
          const firstName = mergeData.firstName || nameParts[0] || 'Valued Client';
          const lastName = mergeData.lastName || nameParts.slice(1).join(' ') || '';

          const tagData = {
            firstName,
            lastName,
            fullName: recipientName,
            city: mergeData.city || campaign.project?.city || 'your city',
            projectName: mergeData.projectName || campaign.project?.name || 'Luxury Residence',
            projectLocation: campaign.project?.address || campaign.project?.city || 'Prime Location',
            projectStartingPrice: mergeData.budget ? `₹${(mergeData.budget / 10000000).toFixed(2)} Cr` : '₹1.50 Cr',
            projectBrochureUrl: campaign.project?.brochureUrl || '#',
            agentName: mergeData.agentName || campaign.createdBy?.name || campaign.fromName || 'Sales Team',
            agentPhone: mergeData.agentPhone || campaign.createdBy?.phoneNumber || '+91 98000 00000',
            unsubscribeUrl: `${appBaseUrl}/api/marketing/unsubscribe?email=${encodeURIComponent(rec.email)}&cid=${campaignId}`,
          };

          const replaceTags = (text: string) => {
            if (!text) return '';
            return text
              .replace(/{{lead\.firstName}}/gi, tagData.firstName)
              .replace(/{{lead\.lastName}}/gi, tagData.lastName)
              .replace(/{{lead\.fullName}}/gi, tagData.fullName)
              .replace(/{{lead\.city}}/gi, tagData.city)
              .replace(/{{project\.name}}/gi, tagData.projectName)
              .replace(/{{project\.location}}/gi, tagData.projectLocation)
              .replace(/{{project\.startingPrice}}/gi, tagData.projectStartingPrice)
              .replace(/{{project\.brochureUrl}}/gi, tagData.projectBrochureUrl)
              .replace(/{{agent\.name}}/gi, tagData.agentName)
              .replace(/{{agent\.phone}}/gi, tagData.agentPhone)
              .replace(/{{unsubscribeUrl}}/gi, tagData.unsubscribeUrl);
          };

          let personalizedHtml = replaceTags(campaign.htmlContent);
          const personalizedSubject = replaceTags(campaign.subject);

          // Inject open tracking pixel (Gmail/Outlook compatible)
          const openPixelUrl = `${appBaseUrl}/api/marketing/track/open?cid=${campaignId}&rid=${rec.id}`;
          const trackingPixelHtml = `<img src="${openPixelUrl}" alt="" width="1" height="1" border="0" style="height:1px !important;width:1px !important;border-width:0 !important;margin:0 !important;padding:0 !important;" />`;
          personalizedHtml += trackingPixelHtml;

          // Rewrite links for click tracking
          personalizedHtml = personalizedHtml.replace(
            /href=["'](https?:\/\/[^"']+)["']/gi,
            (match, originalUrl) => {
              if (originalUrl.includes('/api/marketing/')) return match;
              const clickTrackUrl = `${appBaseUrl}/api/marketing/track/click?cid=${campaignId}&rid=${rec.id}&url=${encodeURIComponent(originalUrl)}`;
              return `href="${clickTrackUrl}"`;
            },
          );

          const sendOptions: SendEmailOptions = {
            fromEmail: campaign.fromEmail,
            fromName: campaign.fromName,
            replyTo: campaign.replyTo || undefined,
            to: [{ email: rec.email, name: rec.name || undefined }],
            subject: personalizedSubject,
            htmlContent: personalizedHtml,
          };

          const sendResult = await adapter.sendBatch(sendOptions, credentials);

          if (sendResult.success) {
            await this.prisma.campaignRecipient.update({
              where: { id: rec.id },
              data: {
                status: 'DELIVERED',
                providerMsgId: sendResult.providerMessageId,
                sentAt: new Date(),
                deliveredAt: new Date(),
              },
            });
            await this.prisma.marketingCampaign.update({
              where: { id: campaignId },
              data: {
                sentCount: { increment: 1 },
                deliveredCount: { increment: 1 },
              },
            });
          } else {
            await this.prisma.campaignRecipient.update({
              where: { id: rec.id },
              data: { status: 'FAILED', bounceReason: sendResult.error },
            });
          }
        } catch (itemErr: any) {
          this.logger.error(`Failed to send to recipient ${rec.email}: ${itemErr?.message}`);
        }
      }
    }

    await this.prisma.marketingCampaign.update({
      where: { id: campaignId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    this.logger.log(`Campaign ${campaignId} processing finished`);
  }
}
