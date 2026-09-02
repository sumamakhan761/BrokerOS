import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { prismaClient } from '@brokeros/prisma';
import {
  getVoiceTelephonyProvider,
  getVoiceAgentProvider,
} from '@brokeros/int-voice';
import type {
  ConnectVoiceTelephonyDto,
  ConnectVoiceAgentDto,
} from '../dto/voice.dto.js';

@Injectable()
export class VoiceIntegrationsService {
  private readonly logger = new Logger(VoiceIntegrationsService.name);
  public readonly prisma = prismaClient;

  // ── Telephony Gateways ──

  async getTelephonyIntegrations() {
    const items = await this.prisma.voiceTelephonyIntegration.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return items.map((item) => ({
      ...item,
      fromNumbers: Array.from(
        new Set((item.fromNumbers || []).map((n) => n.trim())),
      ).filter(Boolean),
    }));
  }

  async connectTelephony(dto: ConnectVoiceTelephonyDto) {
    const provider = getVoiceTelephonyProvider(dto.provider, {
      accountSid: dto.accountSid,
      authToken: dto.authToken,
      apiKey: dto.apiKey,
      apiToken: dto.apiToken,
      subdomain: dto.subdomain,
      sipDomain: dto.sipDomain,
    });

    const isValid = await provider.validateCredentials({
      accountSid: dto.accountSid,
      authToken: dto.authToken,
      apiKey: dto.apiKey,
      apiToken: dto.apiToken,
      subdomain: dto.subdomain,
      sipDomain: dto.sipDomain,
    });

    if (dto.isDefault) {
      await this.prisma.voiceTelephonyIntegration.updateMany({
        data: { isDefault: false },
      });
    }

    const uniqueNumbers = Array.from(
      new Set((dto.fromNumbers || []).map((n) => n.trim())),
    ).filter(Boolean);

    return this.prisma.voiceTelephonyIntegration.create({
      data: {
        provider: dto.provider,
        name: dto.name,
        accountSid: dto.accountSid,
        authToken: dto.authToken,
        apiKey: dto.apiKey,
        apiToken: dto.apiToken,
        subdomain: dto.subdomain,
        sipDomain: dto.sipDomain,
        fromNumbers: uniqueNumbers,
        isDefault: dto.isDefault ?? false,
        isActive: true,
      },
    });
  }

  async deleteTelephony(id: string) {
    await this.prisma.voiceCampaign.updateMany({
      where: { telephonyId: id },
      data: { telephonyId: null },
    });
    return this.prisma.voiceTelephonyIntegration.delete({
      where: { id },
    });
  }

  // ── AI Voice Agent Platforms ──

  async getAgentIntegrations() {
    return this.prisma.voiceAgentIntegration.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async connectAgent(dto: ConnectVoiceAgentDto) {
    const provider = getVoiceAgentProvider(dto.platform, {
      apiKey: dto.apiKey,
      orgId: dto.orgId,
      serverUrl: dto.serverUrl,
    });

    const isValid = await provider.validateCredentials({
      apiKey: dto.apiKey,
      orgId: dto.orgId,
      serverUrl: dto.serverUrl,
    });

    if (dto.isDefault) {
      await this.prisma.voiceAgentIntegration.updateMany({
        data: { isDefault: false },
      });
    }

    return this.prisma.voiceAgentIntegration.create({
      data: {
        platform: dto.platform,
        name: dto.name,
        apiKey: dto.apiKey,
        orgId: dto.orgId,
        serverUrl: dto.serverUrl,
        isDefault: dto.isDefault ?? false,
        isActive: true,
      },
    });
  }

  async deleteAgent(id: string) {
    await this.prisma.voiceCampaign.updateMany({
      where: { agentPlatformId: id },
      data: { agentPlatformId: null },
    });
    return this.prisma.voiceAgentIntegration.delete({
      where: { id },
    });
  }

  async getPlatformCatalog(platform: string, integrationId?: string) {
    let credentials: any = undefined;
    const normalizedPlatform = platform.toUpperCase() as any;

    if (integrationId) {
      const integration = await this.prisma.voiceAgentIntegration.findUnique({
        where: { id: integrationId },
      });
      if (integration) {
        credentials = {
          apiKey: integration.apiKey,
          orgId: integration.orgId || undefined,
          serverUrl: integration.serverUrl || undefined,
        };
      }
    } else {
      const defaultIntegration =
        await this.prisma.voiceAgentIntegration.findFirst({
          where: { platform: normalizedPlatform, isActive: true },
          orderBy: { isDefault: 'desc' },
        });
      if (defaultIntegration) {
        credentials = {
          apiKey: defaultIntegration.apiKey,
          orgId: defaultIntegration.orgId || undefined,
          serverUrl: defaultIntegration.serverUrl || undefined,
        };
      }
    }

    try {
      const provider = getVoiceAgentProvider(
        normalizedPlatform,
        credentials,
      ) as any;
      const [models, voices, assistants] = await Promise.all([
        provider.getAvailableModels
          ? provider.getAvailableModels(credentials).catch(() => [])
          : Promise.resolve([]),
        provider.getAvailableVoices
          ? provider.getAvailableVoices(credentials).catch(() => [])
          : Promise.resolve([]),
        provider.getAccountAssistants
          ? provider.getAccountAssistants(credentials).catch(() => [])
          : Promise.resolve([]),
      ]);

      return {
        platform: normalizedPlatform,
        models,
        voices,
        assistants: Array.isArray(assistants) ? assistants : [],
      };
    } catch {
      return {
        platform: normalizedPlatform,
        models: [],
        voices: [],
        assistants: [],
      };
    }
  }
}
