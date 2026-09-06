// ============================================================================
// BrokerOS — WhatsApp Account & Webhook Verification DTOs
// ============================================================================

import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class ConnectWhatsAppAccountDto {
  @IsString()
  @IsNotEmpty()
  phoneNumberId!: string;

  @IsString()
  @IsNotEmpty()
  wabaId!: string;

  @IsString()
  @IsNotEmpty()
  accessToken!: string;

  @IsString()
  @IsOptional()
  businessName?: string;

  @IsString()
  @IsOptional()
  displayPhone?: string;

  @IsString()
  @IsOptional()
  appSecret?: string;

  @IsString()
  @IsOptional()
  webhookSecret?: string;
}

export class UpdateWhatsAppAccountDto {
  @IsString()
  @IsOptional()
  businessName?: string;

  @IsString()
  @IsOptional()
  displayPhone?: string;

  @IsString()
  @IsOptional()
  accessToken?: string;

  @IsString()
  @IsOptional()
  appSecret?: string;

  @IsString()
  @IsOptional()
  webhookSecret?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class WhatsAppWebhookChallengeQueryDto {
  @IsString()
  @IsOptional()
  'hub.mode'?: string;

  @IsString()
  @IsOptional()
  'hub.verify_token'?: string;

  @IsString()
  @IsOptional()
  'hub.challenge'?: string;
}
