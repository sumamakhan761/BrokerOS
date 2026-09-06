// ============================================================================
// BrokerOS — WhatsApp Message DTOs
// ============================================================================

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class SendWhatsAppMessageDto {
  @IsString()
  @IsNotEmpty()
  type!: 'text' | 'template' | 'media' | 'interactive';

  @IsString()
  @IsOptional()
  text?: string;

  @IsString()
  @IsOptional()
  templateName?: string;

  @IsString()
  @IsOptional()
  templateLanguage?: string;

  @IsOptional()
  templateParams?: any;

  @IsString()
  @IsOptional()
  mediaUrl?: string;

  @IsString()
  @IsOptional()
  mediaKind?: 'image' | 'video' | 'document' | 'audio';

  @IsString()
  @IsOptional()
  caption?: string;

  @IsString()
  @IsOptional()
  filename?: string;

  @IsOptional()
  interactivePayload?: any;

  @IsString()
  @IsOptional()
  contextMessageId?: string;
}

export class SendMessageDirectDto extends SendWhatsAppMessageDto {
  @IsString()
  @IsNotEmpty()
  conversationId!: string;
}

export class SendWhatsAppTemplateDirectDto {
  @IsString()
  @IsOptional()
  to?: string;

  @IsString()
  @IsOptional()
  contactId?: string;

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
  accountId?: string;
}

export class ListWhatsAppMessagesQueryDto {
  @IsOptional()
  page?: string | number;

  @IsOptional()
  limit?: string | number;

  @IsString()
  @IsOptional()
  cursor?: string;
}
