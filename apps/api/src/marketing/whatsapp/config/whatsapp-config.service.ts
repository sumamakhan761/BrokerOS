// ============================================================================
// BrokerOS — WhatsApp Account Configuration Service
// ============================================================================

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import {
  encrypt,
  decrypt,
  verifyPhoneNumber,
  subscribeWabaToApp,
} from '@brokeros/int-whatsapp';
import type {
  ConnectWhatsAppAccountDto,
  UpdateWhatsAppAccountDto,
} from '../dto/whatsapp.dto.js';

@Injectable()
export class WhatsAppConfigService {
  private readonly logger = new Logger(WhatsAppConfigService.name);
  private readonly prisma = prismaClient;

  /**
   * Get public masked view of account configuration.
   */
  async getConfig(id?: string) {
    const account = id
      ? await this.prisma.whatsAppBusinessAccount.findUnique({
        where: { id },
      })
      : await this.prisma.whatsAppBusinessAccount.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      });

    if (!account) {
      return null;
    }

    return this.maskAccount(account);
  }

  /**
   * List all configured WhatsApp accounts.
   */
  async listAccounts() {
    const accounts = await this.prisma.whatsAppBusinessAccount.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return accounts.map((acc) => this.maskAccount(acc));
  }

  /**
   * Connect and verify a Meta WhatsApp Business Account.
   */
  async connectAccount(dto: ConnectWhatsAppAccountDto) {
    this.logger.log(`Connecting WhatsApp account: ${dto.phoneNumberId}`);

    // Pre-flight verify with Meta Graph API
    let phoneInfo: any = null;
    try {
      phoneInfo = await verifyPhoneNumber({
        phoneNumberId: dto.phoneNumberId,
        accessToken: dto.accessToken,
      });
    } catch (err: any) {
      this.logger.warn(
        `Meta verification failed for ${dto.phoneNumberId}: ${err?.message}`,
      );
      throw new BadRequestException(
        `Meta credentials verification failed: ${err?.message || 'Invalid Phone Number ID or Access Token'}`,
      );
    }

    const businessName =
      dto.businessName || phoneInfo?.verified_name || 'WhatsApp Business';
    const displayPhone =
      dto.displayPhone ||
      phoneInfo?.display_phone_number ||
      dto.phoneNumberId;

    // Try auto-subscribing WABA to app webhooks
    try {
      await subscribeWabaToApp({
        wabaId: dto.wabaId,
        accessToken: dto.accessToken,
      });
    } catch (err: any) {
      this.logger.warn(
        `Failed to auto-subscribe WABA ${dto.wabaId}: ${err?.message}`,
      );
    }

    const encryptedToken = encrypt(dto.accessToken);

    const account = await this.prisma.whatsAppBusinessAccount.upsert({
      where: { phoneNumberId: dto.phoneNumberId },
      create: {
        phoneNumberId: dto.phoneNumberId,
        wabaId: dto.wabaId,
        accessToken: encryptedToken,
        businessName,
        displayPhone,
        appSecret: dto.appSecret || null,
        webhookSecret: dto.webhookSecret || null,
        isActive: true,
        webhookVerifiedAt: new Date(),
      },
      update: {
        wabaId: dto.wabaId,
        accessToken: encryptedToken,
        businessName,
        displayPhone,
        appSecret: dto.appSecret !== undefined ? dto.appSecret : undefined,
        webhookSecret:
          dto.webhookSecret !== undefined ? dto.webhookSecret : undefined,
        isActive: true,
        webhookVerifiedAt: new Date(),
      },
    });

    return this.maskAccount(account);
  }

  /**
   * Update configuration fields.
   */
  async updateAccount(id: string, dto: UpdateWhatsAppAccountDto) {
    const existing = await this.prisma.whatsAppBusinessAccount.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`WhatsApp account ${id} not found`);
    }

    const data: Record<string, any> = {};
    if (dto.businessName !== undefined) data.businessName = dto.businessName;
    if (dto.displayPhone !== undefined) data.displayPhone = dto.displayPhone;
    if (dto.appSecret !== undefined) data.appSecret = dto.appSecret;
    if (dto.webhookSecret !== undefined) data.webhookSecret = dto.webhookSecret;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;

    if (dto.accessToken) {
      data.accessToken = encrypt(dto.accessToken);
    }

    const updated = await this.prisma.whatsAppBusinessAccount.update({
      where: { id },
      data,
    });

    return this.maskAccount(updated);
  }

  /**
   * Disconnect / deactivate an account.
   */
  async disconnectAccount(id: string) {
    const existing = await this.prisma.whatsAppBusinessAccount.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException(`WhatsApp account ${id} not found`);
    }

    await this.prisma.whatsAppBusinessAccount.update({
      where: { id },
      data: { isActive: false },
    });

    return { success: true, message: 'WhatsApp account disconnected' };
  }

  /**
   * Get raw decrypted credentials for internal service execution.
   * If idOrPhoneNumberId is omitted or undefined, falls back to the default active WhatsApp business account.
   */
  async getDecryptedAccount(idOrPhoneNumberId?: string) {
    const account = idOrPhoneNumberId
      ? await this.prisma.whatsAppBusinessAccount.findFirst({
          where: {
            OR: [{ id: idOrPhoneNumberId }, { phoneNumberId: idOrPhoneNumberId }],
            isActive: true,
          },
        })
      : await this.prisma.whatsAppBusinessAccount.findFirst({
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
        });

    if (!account) return null;

    try {
      const plainToken = decrypt(account.accessToken);
      return {
        ...account,
        accessToken: plainToken,
      };
    } catch (err: any) {
      this.logger.error(
        `Failed to decrypt access token for account ${account.id}: ${err?.message}`,
      );
      return null;
    }
  }

  /**
   * Verify Meta webhook challenge handshake.
   */
  verifyWebhook(
    mode?: string,
    verifyToken?: string,
    challenge?: string,
  ): string {
    const expectedToken =
      process.env.WA_WEBHOOK_VERIFY_TOKEN ||
      process.env.META_WEBHOOK_VERIFY_TOKEN ||
      'brokeros_whatsapp_verify_token';

    if (mode === 'subscribe' && verifyToken === expectedToken && challenge) {
      this.logger.log('WhatsApp webhook challenge verified successfully');
      return challenge;
    }

    this.logger.warn(`WhatsApp webhook challenge rejected (token mismatch)`);
    throw new ForbiddenException('Invalid webhook verification token');
  }

  private maskAccount(account: any) {
    return {
      id: account.id,
      businessName: account.businessName,
      verifiedName: account.businessName,
      phoneNumberId: account.phoneNumberId,
      displayPhone: account.displayPhone,
      displayPhoneNumber: account.displayPhone,
      wabaId: account.wabaId,
      isActive: account.isActive,
      qualityRating: 'GREEN',
      webhookVerifiedAt: account.webhookVerifiedAt,
      hasAppSecret: Boolean(account.appSecret),
      hasWebhookSecret: Boolean(account.webhookSecret),
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    };
  }
}
