// ============================================================================
// BrokerOS — WhatsApp Contact, Tag & Quick Reply DTOs
// ============================================================================

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateWhatsAppContactDto {
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  leadId?: string;

  @IsString()
  @IsOptional()
  accountId?: string;
}

export class UpdateWhatsAppContactDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  company?: string;

  @IsString()
  @IsOptional()
  avatarUrl?: string;

  @IsString()
  @IsOptional()
  leadId?: string | null;
}

export class ListWhatsAppContactsQueryDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  tagId?: string;

  @IsString()
  @IsOptional()
  accountId?: string;

  @IsOptional()
  page?: string | number;

  @IsOptional()
  limit?: string | number;
}

export class CreateWhatsAppTagDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  accountId?: string;
}

export class CreateWhatsAppQuickReplyDto {
  @IsString()
  @IsNotEmpty()
  shortcut!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  @IsOptional()
  accountId?: string;
}

export class UpdateWhatsAppQuickReplyDto {
  @IsString()
  @IsOptional()
  shortcut?: string;

  @IsString()
  @IsOptional()
  content?: string;
}
