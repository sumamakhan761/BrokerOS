// ============================================================================
// BrokerOS — WhatsApp Broadcast DTOs
// ============================================================================

import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export interface CsvWhatsAppRecipientRow {
  phone: string;
  name?: string;
  params?: string[] | Record<string, string>;
}

export class WhatsAppBroadcastRecipientInputDto {
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsOptional()
  contactId?: string;

  @IsOptional()
  parameters?: string[];
}

export class CreateWhatsAppBroadcastDto {
  @IsString()
  @IsOptional()
  accountId?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  templateName!: string;

  @IsString()
  @IsOptional()
  templateLanguage?: string;

  @IsOptional()
  templateParams?: any;

  @IsString()
  @IsOptional()
  audienceType?: 'all' | 'tag' | 'csv' | 'crm_filter';

  @IsString()
  @IsOptional()
  tagId?: string;

  @IsOptional()
  crmFilter?: Record<string, any>;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  contactIds?: string[];

  @IsArray()
  @IsOptional()
  csvRows?: CsvWhatsAppRecipientRow[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhatsAppBroadcastRecipientInputDto)
  @IsOptional()
  recipients?: WhatsAppBroadcastRecipientInputDto[];

  @IsString()
  @IsOptional()
  scheduledAt?: string;
}

export class ScheduleWhatsAppBroadcastDto {
  @IsString()
  @IsOptional()
  scheduledAt?: string;
}

export class ListWhatsAppBroadcastsQueryDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  accountId?: string;

  @IsOptional()
  page?: string | number;

  @IsOptional()
  limit?: string | number;
}
