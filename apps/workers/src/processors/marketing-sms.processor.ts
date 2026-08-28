import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import { TwilioSmsAdapter } from '@brokeros/int-sms-twilio';
import { AwsSnsSmsAdapter } from '@brokeros/int-sms-aws-sns';
import { SinchSmsAdapter } from '@brokeros/int-sms-sinch';
import { GupshupSmsAdapter } from '@brokeros/int-sms-gupshup';
import type { ISmsMarketingProvider, SendSmsOptions, SmsProviderCredentials } from '@brokeros/types';

export interface SmsCampaignDispatchJobData {
  campaignId: string;
}

// Standard GSM-7 character set regex test
const GSM7_REGEX = /^[@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ\x1BÆæßÉ !"#¤%&'()*+,\-./0-9:;<=>?¡A-ZÄÖÑÜ§¿a-zäöñüà^{}\\[~\]|€]*$/;

@Injectable()
export class MarketingSmsProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MarketingSmsProcessor.name);
  private readonly prisma = prismaClient;
  private isScanning = false;
  private scanInterval: NodeJS.Timeout | null = null;

  private readonly twilioAdapter = new TwilioSmsAdapter();
  private readonly awsSnsAdapter = new AwsSnsSmsAdapter();
  private readonly sinchAdapter = new SinchSmsAdapter();
  private readonly gupshupAdapter = new GupshupSmsAdapter();

  onModuleInit() {
    this.logger.log('MarketingSmsProcessor background auto-scanner started.');
    setTimeout(() => this.scanAndProcessPendingCampaigns(), 3000);
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
      const pendingCampaigns = await this.prisma.smsCampaign.findMany({
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
          `Auto-scanner picked up SMS campaign "${campaign.title}" (${campaign.id}) [status: ${campaign.status}]`,
        );
        await this.processSmsCampaign({ campaignId: campaign.id });
      }
    } catch (err: any) {
      this.logger.error(`SMS auto-scanner error: ${err?.message}`);
    } finally {
      this.isScanning = false;
    }
  }

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

  // Calculate SMS segments based on GSM-7 vs Unicode encoding
  static calculateSegments(text: string): { segments: number; isUnicode: boolean; charCount: number } {
    const charCount = text.length;
    const isUnicode = !GSM7_REGEX.test(text);

    if (isUnicode) {
      if (charCount <= 70) return { segments: 1, isUnicode: true, charCount };
      return { segments: Math.ceil(charCount / 67), isUnicode: true, charCount };
    } else {
      if (charCount <= 160) return { segments: 1, isUnicode: false, charCount };
      return { segments: Math.ceil(charCount / 153), isUnicode: false, charCount };
    }
  }

  // E.164 standard phone normalization
  static normalizePhoneNumber(rawPhone: string, defaultCountryCode = '+91'): string {
    if (!rawPhone) return '';
    let cleaned = rawPhone.replace(/[^\d+]/g, '');

    if (!cleaned.startsWith('+')) {
      if (cleaned.length === 10) {
        cleaned = `${defaultCountryCode}${cleaned}`;
      } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
        cleaned = `+${cleaned}`;
      } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
        cleaned = `+${cleaned}`;
      } else {
        cleaned = `+${cleaned}`;
      }
    }
    return cleaned;
  }

  async processSmsCampaign(jobData: SmsCampaignDispatchJobData): Promise<void> {
    const { campaignId } = jobData;
    this.logger.log(`Starting SMS campaign dispatch for campaignId=${campaignId}`);

    const campaign = await this.prisma.smsCampaign.findUnique({
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
      this.logger.error(`SMS Campaign ${campaignId} not found`);
      return;
    }

    await this.prisma.smsCampaign.update({
      where: { id: campaignId },
      data: { status: 'PROCESSING', startedAt: new Date() },
    });

    const adapter = this.getAdapter(campaign.providerType);
    let credentials: SmsProviderCredentials | undefined;

    if (campaign.integration) {
      credentials = {
        accountSid: campaign.integration.accountSid || undefined,
        authToken: campaign.integration.authToken || undefined,
        messagingServiceSid: campaign.integration.messagingServiceSid || undefined,
        apiKey: campaign.integration.apiKey || undefined,
        servicePlanId: campaign.integration.servicePlanId || undefined,
        awsAccessKeyId: campaign.integration.awsAccessKeyId || undefined,
        awsSecretKey: campaign.integration.awsSecretKey || undefined,
        awsRegion: campaign.integration.awsRegion || undefined,
        dltEntityId: campaign.integration.dltEntityId || undefined,
        fromNumber: campaign.integration.fromSender,
        senderId: campaign.integration.fromSender,
      };
    } else {
      const activeIntegration = await this.prisma.smsIntegration.findFirst({
        where: { provider: campaign.providerType as any, isActive: true },
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

    const appBaseUrl = process.env.API_PUBLIC_URL || 'http://localhost:3333';
    const batchSize = 50;
    const recipients = campaign.recipients;
    let campaignTotalSegments = 0;

    for (let i = 0; i < recipients.length; i += batchSize) {
      const chunk = recipients.slice(i, i + batchSize);

      for (const rec of chunk) {
        try {
          const mergeData = (rec.mergeData as any) || {};
          const recipientName = rec.name || mergeData.name || 'Client';
          const firstName = mergeData.firstName || recipientName.split(' ')[0] || 'Client';

          const normalizedPhone = MarketingSmsProcessor.normalizePhoneNumber(rec.phone);
          if (!normalizedPhone || normalizedPhone.length < 8) {
            await this.prisma.smsRecipient.update({
              where: { id: rec.id },
              data: { status: 'FAILED', failReason: 'Invalid phone number format' },
            });
            continue;
          }

          // Generate dynamic short link code for link tracking
          const shortCode = `${Math.random().toString(36).substring(2, 6)}${Date.now().toString(36).slice(-2)}`;
          const destinationUrl = campaign.project?.brochureUrl || 'https://brokeros.io';

          await this.prisma.smsShortLink.create({
            data: {
              code: shortCode,
              destinationUrl,
              campaignId,
              recipientId: rec.id,
            },
          });

          const shortUrl = `${appBaseUrl}/s/${shortCode}`;

          const tagData = {
            firstName,
            fullName: recipientName,
            projectName: mergeData.projectName || campaign.project?.name || 'Luxury Residence',
            projectStartingPrice: mergeData.budget ? `₹${(mergeData.budget / 10000000).toFixed(2)} Cr` : '₹1.50 Cr',
            projectLocation: campaign.project?.address || campaign.project?.city || 'Prime Corridor',
            agentName: mergeData.agentName || campaign.createdBy?.name || 'Sales Team',
            agentPhone: mergeData.agentPhone || campaign.createdBy?.phoneNumber || '+91 98000 00000',
            shortUrl,
            optOut: 'Reply STOP to unsub',
          };

          let personalizedMsg = campaign.messageContent
            .replace(/{{lead\.firstName}}/gi, tagData.firstName)
            .replace(/{{lead\.fullName}}/gi, tagData.fullName)
            .replace(/{{project\.name}}/gi, tagData.projectName)
            .replace(/{{project\.startingPrice}}/gi, tagData.projectStartingPrice)
            .replace(/{{project\.location}}/gi, tagData.projectLocation)
            .replace(/{{agent\.name}}/gi, tagData.agentName)
            .replace(/{{agent\.phone}}/gi, tagData.agentPhone)
            .replace(/{{shortUrl}}/gi, tagData.shortUrl)
            .replace(/{{optOut}}/gi, tagData.optOut);

          // If message contains raw long URLs, replace with short link
          if (!personalizedMsg.includes(shortUrl) && !campaign.messageContent.includes('{{shortUrl}}')) {
            personalizedMsg = personalizedMsg.replace(/https?:\/\/[^\s]+/gi, shortUrl);
          }

          const { segments } = MarketingSmsProcessor.calculateSegments(personalizedMsg);
          campaignTotalSegments += segments;

          const sendOptions: SendSmsOptions = {
            from: campaign.fromSender,
            to: [{ phone: normalizedPhone, name: recipientName }],
            message: personalizedMsg,
            campaignId,
            dltTemplateId: campaign.dltTemplateId || undefined,
            dltEntityId: credentials?.dltEntityId || undefined,
          };

          const sendResult = await adapter.sendBatch(sendOptions, credentials);

          if (sendResult.success) {
            await this.prisma.smsRecipient.update({
              where: { id: rec.id },
              data: {
                status: 'DELIVERED',
                providerMsgId: sendResult.providerMessageId,
                segmentsCount: segments,
                sentAt: new Date(),
                deliveredAt: new Date(),
              },
            });
            await this.prisma.smsCampaign.update({
              where: { id: campaignId },
              data: {
                sentCount: { increment: 1 },
                deliveredCount: { increment: 1 },
                totalSegmentsSent: { increment: segments },
              },
            });
          } else {
            await this.prisma.smsRecipient.update({
              where: { id: rec.id },
              data: {
                status: 'FAILED',
                failReason: sendResult.error || 'Carrier dispatch error',
                segmentsCount: segments,
              },
            });
            await this.prisma.smsCampaign.update({
              where: { id: campaignId },
              data: { failedCount: { increment: 1 } },
            });
          }
        } catch (itemErr: any) {
          this.logger.error(`Failed to dispatch SMS to recipient ${rec.phone}: ${itemErr?.message}`);
        }
      }
    }

    await this.prisma.smsCampaign.update({
      where: { id: campaignId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    this.logger.log(`SMS Campaign ${campaignId} processing complete! Total segments: ${campaignTotalSegments}`);
  }
}
