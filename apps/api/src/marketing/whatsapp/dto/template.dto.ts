// ============================================================================
// BrokerOS — WhatsApp Template DTOs
// ============================================================================

import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateWhatsAppTemplateDto {
  @IsString()
  @IsOptional()
  accountId?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  language?: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsOptional()
  headerText?: string;

  @IsString()
  @IsNotEmpty()
  bodyText!: string;

  @IsString()
  @IsOptional()
  footerText?: string;

  @IsOptional()
  buttons?: any[];

  @IsOptional()
  exampleValues?: any;
}

export class ListWhatsAppTemplatesQueryDto {
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
