import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
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
import {
  ConnectSmsIntegrationDto,
  SendTestSmsDto,
  AddSenderNumberDto,
  UpdateSenderNumberDto,
} from '../dto/sms.dto.js';

@Injectable()
export class SmsIntegrationsService {
  private readonly twilioAdapter = new TwilioSmsAdapter();
  private readonly awsSnsAdapter = new AwsSnsSmsAdapter();
  private readonly sinchAdapter = new SinchSmsAdapter();
  private readonly gupshupAdapter = new GupshupSmsAdapter();

  constructor(private readonly prisma: PrismaService) {}

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

    let intRecord: any = null;

    if (dto.integrationId) {
      intRecord = await this.prisma.smsIntegration.findUnique({
        where: { id: dto.integrationId },
        include: { senderNumbers: true },
      });
      if (intRecord) {
        credentials = {
          accountSid: intRecord.accountSid || undefined,
          authToken: intRecord.authToken || undefined,
          messagingServiceSid: intRecord.messagingServiceSid || undefined,
          apiKey: intRecord.apiKey || undefined,
          servicePlanId: intRecord.servicePlanId || undefined,
          awsAccessKeyId: intRecord.awsAccessKeyId || undefined,
          awsSecretKey: intRecord.awsSecretKey || undefined,
          awsRegion: intRecord.awsRegion || undefined,
          dltEntityId: intRecord.dltEntityId || undefined,
          fromNumber: intRecord.fromSender,
          senderId: intRecord.fromSender,
        };
      }
    } else {
      intRecord = await this.prisma.smsIntegration.findFirst({
        where: { provider: providerType as any, isActive: true },
        include: { senderNumbers: true },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      });
      if (intRecord) {
        credentials = {
          accountSid: intRecord.accountSid || undefined,
          authToken: intRecord.authToken || undefined,
          messagingServiceSid: intRecord.messagingServiceSid || undefined,
          apiKey: intRecord.apiKey || undefined,
          servicePlanId: intRecord.servicePlanId || undefined,
          awsAccessKeyId: intRecord.awsAccessKeyId || undefined,
          awsSecretKey: intRecord.awsSecretKey || undefined,
          awsRegion: intRecord.awsRegion || undefined,
          dltEntityId: intRecord.dltEntityId || undefined,
          fromNumber: intRecord.fromSender,
          senderId: intRecord.fromSender,
        };
      }
    }

    const adapter = this.getAdapter(providerType);

    // Prefer verified E.164 phone number for TWILIO (alphanumeric like "SKYLIN" will fail on Twilio)
    let resolvedFrom = (dto.fromSender || '').trim();

    if (providerType === 'TWILIO') {
      if (intRecord?.messagingServiceSid) {
        resolvedFrom = intRecord.messagingServiceSid;
      } else if (!resolvedFrom.startsWith('+')) {
        const e164Number =
          intRecord?.senderNumbers?.find((n: any) => n.phoneNumber?.startsWith('+'))?.phoneNumber ||
          (intRecord?.fromSender?.startsWith('+') ? intRecord.fromSender : null) ||
          credentials?.fromNumber;
        if (e164Number) {
          resolvedFrom = e164Number;
        }
      }
    }

    if (!resolvedFrom) {
      resolvedFrom =
        intRecord?.fromSender ||
        credentials?.fromNumber ||
        credentials?.senderId ||
        'BrokerOS';
    }

    const rawRecipient = (dto.recipientPhone || dto.toPhone || '').trim();
    if (!rawRecipient) {
      throw new BadRequestException('Recipient phone number is required');
    }

    // Auto-normalize phone number (supports scientific notation from excel & local numbers)
    let normalizedPhone = rawRecipient;
    if (/[eE]\+?[0-9]+/.test(normalizedPhone)) {
      const num = Number(normalizedPhone);
      if (!isNaN(num) && isFinite(num)) {
        normalizedPhone = num.toLocaleString('fullwide', { useGrouping: false });
      }
    }
    normalizedPhone = normalizedPhone.replace(/[^\d+]/g, '');
    if (!normalizedPhone.startsWith('+')) {
      if (normalizedPhone.length === 10) {
        normalizedPhone = `+91${normalizedPhone}`;
      } else if (normalizedPhone.length === 12 && normalizedPhone.startsWith('91')) {
        normalizedPhone = `+${normalizedPhone}`;
      } else if (normalizedPhone.length === 11 && normalizedPhone.startsWith('1')) {
        normalizedPhone = `+${normalizedPhone}`;
      } else {
        normalizedPhone = `+${normalizedPhone}`;
      }
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
      to: [{ phone: normalizedPhone, name: 'Tester' }],
      message: testMessage,
      dltTemplateId: dto.dltTemplateId,
    };

    const sendResult = await adapter.sendBatch(sendOptions, credentials);
    if (!sendResult.success) {
      throw new BadRequestException(
        sendResult.error || 'Carrier gateway rejected test SMS dispatch. Please verify your sender number and credentials.',
      );
    }

    return sendResult;
  }

  async listIntegrations() {
    return this.prisma.smsIntegration.findMany({
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
      include: {
        senderNumbers: {
          orderBy: [{ isVerified: 'desc' }, { createdAt: 'asc' }],
        },
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
      throw new BadRequestException(
        `Failed to validate credentials with SMS provider ${dto.provider}`,
      );
    }

    if (dto.isDefault) {
      await this.prisma.smsIntegration.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    const created = await this.prisma.smsIntegration.create({
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

    try {
      await this.syncNumbersForIntegration(created.id);
    } catch {
      // Non-blocking sync on initial creation
    }

    return this.prisma.smsIntegration.findUnique({
      where: { id: created.id },
      include: { senderNumbers: true },
    });
  }

  async syncNumbersForIntegration(integrationId: string) {
    const integration = await this.prisma.smsIntegration.findUnique({
      where: { id: integrationId },
    });
    if (!integration) throw new NotFoundException('SMS Integration not found');

    const credentials: SmsProviderCredentials = {
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

    const adapter = this.getAdapter(integration.provider);
    let discovered: any[] = [];
    if (typeof (adapter as any).listSenderNumbers === 'function') {
      try {
        discovered = await (adapter as any).listSenderNumbers(credentials);
      } catch {
        discovered = [];
      }
    }

    for (const identity of discovered) {
      const phone = identity.phoneNumber ? identity.phoneNumber.trim() : null;
      const senderId = identity.senderId ? identity.senderId.trim() : null;

      if (!phone && !senderId) continue;

      const existing = await this.prisma.smsSenderNumber.findFirst({
        where: {
          integrationId,
          ...(phone ? { phoneNumber: phone } : { senderId }),
        },
      });

      if (existing) {
        await this.prisma.smsSenderNumber.update({
          where: { id: existing.id },
          data: {
            senderId: senderId || existing.senderId,
            provider: identity.provider || integration.provider,
            isVerified: identity.isVerified ?? true,
          },
        });
      } else {
        await this.prisma.smsSenderNumber.create({
          data: {
            integrationId,
            phoneNumber: phone,
            senderId,
            provider: identity.provider || integration.provider,
            isVerified: identity.isVerified ?? true,
            isActive: true,
            dailyQuota: 5000,
          },
        });
      }
    }

    // Ensure the integration's default fromSender is recorded
    if (integration.fromSender) {
      const isE164 = /^\+?[0-9]{8,15}$/.test(integration.fromSender);
      const defaultPhone = isE164 ? integration.fromSender : null;
      const defaultSenderId = !isE164 ? integration.fromSender : null;

      const exists = await this.prisma.smsSenderNumber.findFirst({
        where: {
          integrationId,
          ...(defaultPhone ? { phoneNumber: defaultPhone } : { senderId: defaultSenderId }),
        },
      });

      if (!exists) {
        await this.prisma.smsSenderNumber.create({
          data: {
            integrationId,
            phoneNumber: defaultPhone,
            senderId: defaultSenderId,
            provider: integration.provider,
            isVerified: true,
            isActive: true,
            dailyQuota: 5000,
          },
        });
      }
    }

    return this.prisma.smsSenderNumber.findMany({
      where: { integrationId },
      orderBy: [{ isVerified: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async addSenderNumber(integrationId: string, dto: AddSenderNumberDto) {
    const integration = await this.prisma.smsIntegration.findUnique({
      where: { id: integrationId },
    });
    if (!integration) throw new NotFoundException('SMS Integration not found');

    const phone = dto.phoneNumber ? dto.phoneNumber.trim() : null;
    const senderId = dto.senderId ? dto.senderId.trim() : null;

    if (!phone && !senderId) {
      throw new BadRequestException('Either a phone number or sender ID is required');
    }

    const existing = await this.prisma.smsSenderNumber.findFirst({
      where: {
        integrationId,
        ...(phone ? { phoneNumber: phone } : { senderId }),
      },
    });

    if (existing) {
      throw new BadRequestException('This sender number or header is already registered');
    }

    return this.prisma.smsSenderNumber.create({
      data: {
        integrationId,
        phoneNumber: phone,
        senderId,
        provider: dto.provider || integration.provider,
        dailyQuota: dto.dailyQuota ?? 5000,
        isVerified: dto.isVerified ?? true,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateSenderNumber(numberId: string, dto: UpdateSenderNumberDto) {
    const record = await this.prisma.smsSenderNumber.findUnique({
      where: { id: numberId },
    });
    if (!record) throw new NotFoundException('Sender number not found');

    return this.prisma.smsSenderNumber.update({
      where: { id: numberId },
      data: {
        senderId: dto.senderId !== undefined ? dto.senderId : record.senderId,
        dailyQuota: dto.dailyQuota !== undefined ? dto.dailyQuota : record.dailyQuota,
        isActive: dto.isActive !== undefined ? dto.isActive : record.isActive,
      },
    });
  }

  async deleteSenderNumber(numberId: string) {
    const record = await this.prisma.smsSenderNumber.findUnique({
      where: { id: numberId },
    });
    if (!record) throw new NotFoundException('Sender number not found');

    const activePoolCount = await this.prisma.campaignSmsSenderPool.count({
      where: {
        senderNumberId: numberId,
        campaign: {
          status: { in: ['PROCESSING', 'SCHEDULED'] },
        },
      },
    });

    if (activePoolCount > 0) {
      throw new BadRequestException(
        'Cannot delete sender number while active or scheduled campaigns are using it',
      );
    }

    return this.prisma.smsSenderNumber.delete({
      where: { id: numberId },
    });
  }

  async listAllActiveSenderNumbers() {
    return this.prisma.smsSenderNumber.findMany({
      where: { isActive: true },
      include: {
        integration: {
          select: {
            id: true,
            provider: true,
            name: true,
            isActive: true,
          },
        },
      },
      orderBy: [{ integrationId: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async deleteIntegration(id: string) {
    return this.prisma.smsIntegration.delete({ where: { id } });
  }
}
