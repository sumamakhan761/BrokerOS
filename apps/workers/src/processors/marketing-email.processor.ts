import { Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@brokeros/prisma';
import { SesAdapter } from '@brokeros/int-mail-ses';
import { SendgridAdapter } from '@brokeros/int-mail-sendgrid';
import { BrevoAdapter } from '@brokeros/int-mail-brevo';
import { MailchimpAdapter } from '@brokeros/int-mail-mailchimp';
import type { IEmailMarketingProvider, ProviderCredentials, SendEmailOptions } from '@brokeros/types';

export interface CampaignDispatchJobData {
  campaignId: string;
}

@Injectable()
export class MarketingEmailProcessor {
  private readonly logger = new Logger(MarketingEmailProcessor.name);
  private readonly prisma = new PrismaClient();

  private readonly sesAdapter = new SesAdapter();
  private readonly sendgridAdapter = new SendgridAdapter();
  private readonly brevoAdapter = new BrevoAdapter();
  private readonly mailchimpAdapter = new MailchimpAdapter();

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
    }

    const appBaseUrl =
      process.env.API_PUBLIC_URL ||
      process.env.BETTER_AUTH_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:3333';
    const batchSize = 100;
    const recipients = campaign.recipients;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const chunk = recipients.slice(i, i + batchSize);

      for (const rec of chunk) {
        try {
          const mergeData = (rec.mergeData as any) || {};
          let personalizedHtml = campaign.htmlContent;

          // Replace merge tags
          personalizedHtml = personalizedHtml
            .replace(/{{lead\.firstName}}/g, mergeData.firstName || rec.name?.split(' ')[0] || 'Valued Client')
            .replace(/{{lead\.lastName}}/g, mergeData.lastName || '')
            .replace(/{{lead\.fullName}}/g, rec.name || 'Valued Client')
            .replace(/{{lead\.city}}/g, mergeData.city || 'your city')
            .replace(/{{project\.name}}/g, mergeData.projectName || 'Luxury Residence')
            .replace(/{{agent\.name}}/g, mergeData.agentName || campaign.fromName)
            .replace(/{{agent\.phone}}/g, mergeData.agentPhone || '')
            .replace(
              /{{unsubscribeUrl}}/g,
              `${appBaseUrl}/api/marketing/unsubscribe?email=${encodeURIComponent(rec.email)}&cid=${campaignId}`,
            );

          // Inject open tracking pixel
          const openPixelUrl = `${appBaseUrl}/api/marketing/track/open?cid=${campaignId}&rid=${rec.id}`;
          const trackingPixelHtml = `<img src="${openPixelUrl}" width="1" height="1" alt="" style="display:none !important; min-height:1px; width:1px;" />`;
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
            subject: campaign.subject,
            htmlContent: personalizedHtml,
          };

          const sendResult = await adapter.sendBatch(sendOptions, credentials);

          if (sendResult.success) {
            await this.prisma.campaignRecipient.update({
              where: { id: rec.id },
              data: {
                status: 'SENT',
                providerMsgId: sendResult.providerMessageId,
                sentAt: new Date(),
              },
            });
            await this.prisma.marketingCampaign.update({
              where: { id: campaignId },
              data: { sentCount: { increment: 1 } },
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
