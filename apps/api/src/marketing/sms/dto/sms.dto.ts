import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsObject,
  IsNumber,
} from 'class-validator';
import type {
  AudienceFilterDto,
  AudienceSourceType,
  CsvLeadRow,
  SmsProviderType,
  MarketingChannel,
} from '@brokeros/types';

export class CreateSmsCampaignDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  channel?: MarketingChannel;

  @IsOptional()
  @IsString()
  providerType?: SmsProviderType;

  @IsOptional()
  @IsString()
  audienceSource?: AudienceSourceType;

  @IsOptional()
  @IsBoolean()
  isCpCampaign?: boolean;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  integrationId?: string;

  @IsOptional()
  @IsString()
  fromSender?: string;

  @IsOptional()
  @IsString()
  messageContent?: string;

  @IsOptional()
  @IsString()
  dltTemplateId?: string;

  @IsOptional()
  @IsObject()
  audienceFilters?: AudienceFilterDto;

  @IsOptional()
  @IsArray()
  csvRecipients?: CsvLeadRow[];

  @IsOptional()
  @IsBoolean()
  saveCsvAsCrmLeads?: boolean;

  @IsOptional()
  @IsString()
  scheduledAt?: string;

  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @IsNumber()
  currentStep?: number;
}

export class SaveDraftSmsCampaignDto {
  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  channel?: MarketingChannel;

  @IsOptional()
  @IsString()
  providerType?: SmsProviderType;

  @IsOptional()
  @IsString()
  audienceSource?: AudienceSourceType;

  @IsOptional()
  @IsBoolean()
  isCpCampaign?: boolean;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  integrationId?: string;

  @IsOptional()
  @IsString()
  fromSender?: string;

  @IsOptional()
  @IsString()
  messageContent?: string;

  @IsOptional()
  @IsString()
  dltTemplateId?: string;

  @IsOptional()
  @IsObject()
  audienceFilters?: AudienceFilterDto;

  @IsOptional()
  @IsArray()
  csvRecipients?: CsvLeadRow[];

  @IsOptional()
  @IsBoolean()
  saveCsvAsCrmLeads?: boolean;

  @IsOptional()
  @IsString()
  scheduledAt?: string;

  @IsOptional()
  @IsNumber()
  currentStep?: number;
}

export class PreviewSmsAudienceDto {
  @IsOptional()
  @IsString()
  audienceSource?: AudienceSourceType;

  @IsOptional()
  @IsBoolean()
  isCpCampaign?: boolean;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsObject()
  audienceFilters?: AudienceFilterDto;

  @IsOptional()
  @IsArray()
  csvRecipients?: CsvLeadRow[];
}

export class SendTestSmsDto {
  @IsOptional()
  @IsString()
  recipientPhone?: string;

  @IsOptional()
  @IsString()
  toPhone?: string;

  @IsOptional()
  @IsString()
  messageContent?: string;

  @IsOptional()
  @IsString()
  fromSender?: string;

  @IsOptional()
  @IsString()
  providerType?: SmsProviderType;

  @IsOptional()
  @IsString()
  integrationId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsString()
  dltTemplateId?: string;
}

export class ConnectSmsIntegrationDto {
  @IsString()
  provider!: SmsProviderType;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsString()
  accountSid?: string;

  @IsOptional()
  @IsString()
  authToken?: string;

  @IsOptional()
  @IsString()
  messagingServiceSid?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  servicePlanId?: string;

  @IsOptional()
  @IsString()
  awsAccessKeyId?: string;

  @IsOptional()
  @IsString()
  awsSecretKey?: string;

  @IsOptional()
  @IsString()
  awsRegion?: string;

  @IsOptional()
  @IsString()
  dltEntityId?: string;

  @IsOptional()
  @IsString()
  fromSender?: string;
}
