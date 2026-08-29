import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../lib/database/prisma.service.js';
import type {
  ISmsMarketingProvider,
  SmsProviderCredentials,
  SendSmsOptions,
} from '@brokeros/types';
import { TwilioSmsAdapter } from '@brokeros/int-sms-twilio';
import { AwsSnsSmsAdapter } from '@brokeros/int-sms-aws-sns';
import { SinchSmsAdapter } from '@brokeros/int-sms-sinch';
import { GupshupSmsAdapter } from '@brokeros/int-sms-gupshup';
import { ConnectSmsIntegrationDto, SendTestSmsDto } from '../dto/sms.dto.js';

@Injectable()
export class SmsIntegrationsService {
  private readonly twilioAdapter = new TwilioSmsAdapter();
  private readonly awsSnsAdapter = new AwsSnsSmsAdapter();
  private readonly sinchAdapter = new SinchSmsAdapter();
  private readonly gupshupAdapter = new GupshupSmsAdapter();

  constructor(private readonly prisma: PrismaService) { }

  getAdapter(providerType: string): ISmsMarketingProvider {
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

    const recipientPhone = (dto.recipientPhone || dto.toPhone || '').trim();
    if (!recipientPhone) {
      throw new BadRequestException('Recipient phone number is required');
    }

    const rawMessage = dto.messageContent || 'Test SMS Preview from BrokerOS';
    const testMessage = `[TEST] ${rawMessage
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
      to: [{ phone: recipientPhone, name: 'Tester' }],
      message: testMessage,
      dltTemplateId: dto.dltTemplateId,
    };

    return adapter.sendBatch(sendOptions, credentials);
  }

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
        name: dto.name || `${dto.provider} Gateway`,
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
        fromSender: dto.fromSender || 'BrokerOS',
      },
    });
  }

  async deleteIntegration(id: string) {
    return this.prisma.smsIntegration.delete({ where: { id } });
  }
}
