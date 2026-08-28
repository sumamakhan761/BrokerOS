import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsArray,
  IsObject,
} from 'class-validator';
import type {
  AudienceFilterDto,
  AudienceSourceType,
  CsvLeadRow,
  EmailProviderType,
  MarketingChannel,
} from '@brokeros/types';

export class CreateCampaignDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  channel?: MarketingChannel;

  @IsOptional()
  @IsString()
  providerType?: EmailProviderType;

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
  templateId?: string;

  @IsString()
  subject!: string;

  @IsString()
  fromName!: string;

  @IsString()
  fromEmail!: string;

  @IsOptional()
  @IsString()
  replyTo?: string;

  @IsString()
  htmlContent!: string;

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
}

export class SaveDraftCampaignDto {
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
  providerType?: EmailProviderType;

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
  templateId?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  fromName?: string;

  @IsOptional()
  @IsString()
  fromEmail?: string;

  @IsOptional()
  @IsString()
  replyTo?: string;

  @IsOptional()
  @IsString()
  htmlContent?: string;

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
}

export class PreviewAudienceDto {
  @IsString()
  audienceSource!: AudienceSourceType;

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

export class SendTestEmailDto {
  @IsString()
  recipientEmail!: string;

  @IsString()
  subject!: string;

  @IsString()
  htmlContent!: string;

  @IsString()
  fromName!: string;

  @IsString()
  fromEmail!: string;

  @IsOptional()
  @IsString()
  providerType?: EmailProviderType;

  @IsOptional()
  @IsString()
  integrationId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;
}

export class ConnectIntegrationDto {
  @IsString()
  provider!: EmailProviderType;

  @IsString()
  name!: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsString()
  apiKey?: string;

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
  mailchimpServer?: string;

  @IsString()
  fromEmail!: string;

  @IsString()
  fromName!: string;

  @IsOptional()
  @IsString()
  replyTo?: string;
}

export class CreateTemplateDto {
  @IsString()
  name!: string;

  @IsString()
  subject!: string;

  @IsString()
  category!: string;

  @IsString()
  htmlBody!: string;

  @IsOptional()
  @IsString()
  plainText?: string;

  @IsOptional()
  @IsString()
  previewImageUrl?: string;
}
