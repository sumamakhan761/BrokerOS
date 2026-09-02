// ============================================================================
// BrokerOS — Voice Service Facade & Coordinator
// ============================================================================

import { Injectable, Logger } from '@nestjs/common';
import { VoiceAudienceService } from './services/voice-audience.service.js';
import { VoiceAnalyticsService } from './services/voice-analytics.service.js';
import { VoiceIntegrationsService } from './services/voice-integrations.service.js';
import { VoiceAudioService } from './services/voice-audio.service.js';
import { VoiceTrackingService } from './services/voice-tracking.service.js';
import { VoiceCampaignService } from './services/voice-campaign.service.js';
import { VoiceDispatcherService } from './services/voice-dispatcher.service.js';
import type {
  CreateVoiceCampaignDto,
  SaveDraftVoiceCampaignDto,
  TestTelephonyCarrierDto,
  TestVoiceAiCallDto,
} from './dto/voice.dto.js';

@Injectable()
export class VoiceService {
  private readonly logger = new Logger(VoiceService.name);

  constructor(
    public readonly audienceService: VoiceAudienceService,
    public readonly analyticsService: VoiceAnalyticsService,
    public readonly integrationsService: VoiceIntegrationsService,
    public readonly audioService: VoiceAudioService,
    public readonly trackingService: VoiceTrackingService,
    public readonly campaignService: VoiceCampaignService,
    public readonly dispatcherService: VoiceDispatcherService,
  ) {}

  // ── Facade Delegations: Audience & Analytics ──

  async previewAudience(dto: any) {
    return this.audienceService.estimateAudience(dto);
  }

  async promoteCsvRecipientToLead(id: string, userId?: string) {
    return this.audienceService.promoteCsvRecipientToLead(id, userId);
  }

  async getCampaignAnalytics(id: string) {
    return this.analyticsService.getCampaignAnalytics(id);
  }

  async getCampaignRecipients(id: string, query?: any) {
    return this.analyticsService.getCampaignRecipients(id, query);
  }

  async findOneCampaign(id: string) {
    return this.campaignService.getCampaignById(id);
  }

  async findAllCampaigns(query?: any) {
    return this.campaignService.getCampaigns(query);
  }

  // ── Facade Delegations: Campaign Lifecycle ──

  async getProjects() {
    return this.campaignService.getProjects();
  }

  async getCampaigns(query?: any) {
    return this.campaignService.getCampaigns(query);
  }

  async getCampaignById(id: string) {
    return this.campaignService.getCampaignById(id);
  }

  async saveDraftCampaign(
    dto: SaveDraftVoiceCampaignDto,
    userId?: string,
    existingId?: string,
  ) {
    return this.campaignService.saveDraftCampaign(dto, userId, existingId);
  }

  async createCampaign(dto: CreateVoiceCampaignDto, userId?: string) {
    return this.campaignService.createCampaign(dto, userId);
  }

  async deleteCampaign(id: string) {
    return this.campaignService.deleteCampaign(id);
  }

  async dispatchCampaign(campaignId: string) {
    return this.campaignService.dispatchCampaign(campaignId);
  }

  // ── Facade Delegations: Testing Endpoints ──

  async testCarrierLine(dto: TestTelephonyCarrierDto) {
    return this.dispatcherService.testCarrierLine(dto);
  }

  async testVoiceAiCall(dto: TestVoiceAiCallDto) {
    return this.dispatcherService.testVoiceAiCall(dto);
  }
}
