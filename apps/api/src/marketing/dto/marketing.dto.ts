import type {
  AudienceFilterDto,
  AudienceSourceType,
  CsvLeadRow,
  EmailProviderType,
  MarketingChannel,
  ProviderCredentials,
} from '@brokeros/types';

export class CreateCampaignDto {
  title!: string;
  channel?: MarketingChannel;
  providerType?: EmailProviderType;
  audienceSource?: AudienceSourceType;
  isCpCampaign?: boolean;
  projectId?: string;
  integrationId?: string;
  templateId?: string;
  subject!: string;
  fromName!: string;
  fromEmail!: string;
  replyTo?: string;
  htmlContent!: string;
  audienceFilters?: AudienceFilterDto;
  csvRecipients?: CsvLeadRow[];
  saveCsvAsCrmLeads?: boolean;
  scheduledAt?: string;
}

export class PreviewAudienceDto {
  audienceSource!: AudienceSourceType;
  isCpCampaign?: boolean;
  projectId?: string;
  audienceFilters?: AudienceFilterDto;
  csvRecipients?: CsvLeadRow[];
}

export class SendTestEmailDto {
  recipientEmail!: string;
  subject!: string;
  htmlContent!: string;
  fromName!: string;
  fromEmail!: string;
  providerType?: EmailProviderType;
  integrationId?: string;
}

export class ConnectIntegrationDto {
  provider!: EmailProviderType;
  name!: string;
  isDefault?: boolean;
  apiKey?: string;
  awsAccessKeyId?: string;
  awsSecretKey?: string;
  awsRegion?: string;
  mailchimpServer?: string;
  fromEmail!: string;
  fromName!: string;
  replyTo?: string;
}

export class CreateTemplateDto {
  name!: string;
  subject!: string;
  category!: string;
  htmlBody!: string;
  plainText?: string;
  previewImageUrl?: string;
}
