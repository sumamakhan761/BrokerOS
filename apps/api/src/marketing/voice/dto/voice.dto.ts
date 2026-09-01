import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class VoiceAudienceFiltersDto {
  @IsOptional()
  @IsArray()
  statuses?: string[];

  @IsOptional()
  @IsArray()
  temperatures?: string[];

  @IsOptional()
  @IsArray()
  projectIds?: string[];

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsInt()
  minBudget?: number;

  @IsOptional()
  @IsInt()
  maxBudget?: number;
}

export class VoiceCsvRecipientDto {
  @IsOptional()
  phone?: string;

  @IsOptional()
  phoneNumber?: string;

  @IsOptional()
  mobile?: string;

  @IsOptional()
  email?: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  city?: string;

  @IsOptional()
  budget?: number;

  @IsOptional()
  interestedProject?: string;

  @IsOptional()
  temperature?: string;

  @IsOptional()
  mergeData?: Record<string, any>;
}

export class CreateVoiceCampaignDto {
  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsOptional()
  @IsBoolean()
  isCpCampaign?: boolean;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  telephonyId?: string;

  @IsOptional()
  @IsString()
  callerIdNumber?: string;

  @IsOptional()
  @IsString()
  agentPlatformId?: string;

  @IsString()
  @IsNotEmpty()
  llmModel!: string;

  @IsString()
  @IsNotEmpty()
  voiceProvider!: string;

  @IsString()
  @IsNotEmpty()
  voiceId!: string;

  @IsOptional()
  @IsString()
  voiceName?: string;

  @IsString()
  @IsNotEmpty()
  scriptPrompt!: string;

  @IsOptional()
  @IsString()
  firstMessage?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  maxConcurrentCalls?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  retryLimit?: number;

  @IsOptional()
  @IsString()
  callingWindowStart?: string;

  @IsOptional()
  @IsString()
  callingWindowEnd?: string;

  @IsOptional()
  @IsString()
  audienceSource?: 'CRM_DATABASE' | 'CSV_UPLOAD' | 'HYBRID';

  @IsOptional()
  @ValidateNested()
  @Type(() => VoiceAudienceFiltersDto)
  audienceFilters?: VoiceAudienceFiltersDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => VoiceCsvRecipientDto)
  csvRecipients?: VoiceCsvRecipientDto[];

  @IsOptional()
  @IsBoolean()
  saveCsvAsCrmLeads?: boolean;

  @IsOptional()
  scheduledAt?: Date | string;
}

export class SaveDraftVoiceCampaignDto {
  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsBoolean()
  isCpCampaign?: boolean;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  telephonyId?: string;

  @IsOptional()
  @IsString()
  callerIdNumber?: string;

  @IsOptional()
  @IsString()
  agentPlatformId?: string;

  @IsOptional()
  @IsString()
  llmModel?: string;

  @IsOptional()
  @IsString()
  voiceProvider?: string;

  @IsOptional()
  @IsString()
  voiceId?: string;

  @IsOptional()
  @IsString()
  voiceName?: string;

  @IsOptional()
  @IsString()
  scriptPrompt?: string;

  @IsOptional()
  @IsString()
  firstMessage?: string;

  @IsOptional()
  @IsInt()
  maxConcurrentCalls?: number;

  @IsOptional()
  @IsInt()
  retryLimit?: number;

  @IsOptional()
  @IsString()
  callingWindowStart?: string;

  @IsOptional()
  @IsString()
  callingWindowEnd?: string;

  @IsOptional()
  @IsString()
  audienceSource?: 'CRM_DATABASE' | 'CSV_UPLOAD' | 'HYBRID';

  @IsOptional()
  audienceFilters?: Record<string, any>;
}

export class ConnectVoiceTelephonyDto {
  @IsString()
  @IsNotEmpty()
  provider!: 'TWILIO' | 'VOBIZ' | 'EXOTEL' | 'TELNYX' | 'AMAZON_CONNECT';

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  accountSid?: string;

  @IsOptional()
  @IsString()
  authToken?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  apiToken?: string;

  @IsOptional()
  @IsString()
  subdomain?: string;

  @IsOptional()
  @IsString()
  sipDomain?: string;

  @IsOptional()
  @IsArray()
  fromNumbers?: string[];

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class ConnectVoiceAgentDto {
  @IsString()
  @IsNotEmpty()
  platform!:
    | 'VAPI'
    | 'RETELL'
    | 'ELEVENLABS'
    | 'SARVAM'
    | 'BOLNA'
    | 'PIPECAT'
    | 'LIVEKIT'
    | 'OPENAI_REALTIME';

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  apiKey!: string;

  @IsOptional()
  @IsString()
  orgId?: string;

  @IsOptional()
  @IsString()
  serverUrl?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class TestTelephonyCarrierDto {
  @IsString()
  @IsNotEmpty()
  telephonyId!: string;

  @IsString()
  @IsNotEmpty()
  toPhone!: string;

  @IsOptional()
  @IsString()
  fromNumber?: string;
}

export class TestVoiceAiCallDto {
  @IsString()
  @IsNotEmpty()
  toPhone!: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  variables?: Record<string, any>;

  @IsString()
  @IsNotEmpty()
  telephonyId!: string;

  @IsString()
  @IsNotEmpty()
  agentPlatformId!: string;

  @IsString()
  @IsNotEmpty()
  llmModel!: string;

  @IsString()
  @IsNotEmpty()
  voiceProvider!: string;

  @IsString()
  @IsNotEmpty()
  voiceId!: string;

  @IsString()
  @IsNotEmpty()
  scriptPrompt!: string;

  @IsOptional()
  @IsString()
  firstMessage?: string;

  @IsOptional()
  @IsString()
  fromNumber?: string;

  @IsOptional()
  @IsString()
  transcriberModel?: string;

  @IsOptional()
  @IsString()
  transcriberLanguage?: string;

  @IsOptional()
  @IsNumber()
  maxTurnSilenceMs?: number;

  @IsOptional()
  @IsNumber()
  voiceSpeed?: number;

  @IsOptional()
  @IsString()
  firstMessageMode?: string;

  @IsOptional()
  @IsString()
  voicemailDetection?: string;

  @IsOptional()
  @IsString()
  backgroundSound?: string;

  @IsOptional()
  @IsNumber()
  maxDurationSeconds?: number;

  @IsOptional()
  @IsString()
  retellVoiceModel?: string;

  @IsOptional()
  @IsString()
  retellEmotion?: string;

  @IsOptional()
  @IsBoolean()
  enableExpressiveMode?: boolean;

  @IsOptional()
  @IsString()
  retellAmbientSound?: string;

  @IsOptional()
  @IsString()
  retellLanguage?: string;

  @IsOptional()
  @IsBoolean()
  retellBackchannel?: boolean;

  @IsOptional()
  @IsNumber()
  retellReminderMs?: number;
}

export class PreviewAudioTtsDto {
  @IsString()
  @IsNotEmpty()
  text!: string;

  @IsString()
  @IsNotEmpty()
  voiceId!: string;

  @IsOptional()
  @IsString()
  voiceProvider?: string;

  @IsOptional()
  @IsString()
  agentPlatformId?: string;
}

export class PreviewVoiceAudienceDto {
  @IsOptional()
  @IsString()
  audienceSource?: 'CRM_DATABASE' | 'CSV_UPLOAD' | 'HYBRID';

  @IsOptional()
  @IsBoolean()
  isCpCampaign?: boolean;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  audienceFilters?: any;

  @IsOptional()
  @IsArray()
  csvRecipients?: any[];
}
