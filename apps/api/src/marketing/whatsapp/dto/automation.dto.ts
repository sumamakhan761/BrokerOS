// ============================================================================
// BrokerOS — WhatsApp Automation DTOs
// ============================================================================

import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class AutomationStepInputDto {
  @IsOptional()
  id?: string;

  @IsOptional()
  position?: number;

  @IsString()
  @IsOptional()
  parentStepId?: string | null;

  @IsString()
  @IsOptional()
  branch?: 'yes' | 'no' | null;

  @IsString()
  @IsNotEmpty()
  stepType!: string;

  @IsNotEmpty()
  stepConfig!: Record<string, any>;
}

export class CreateWhatsAppAutomationDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  triggerType!: string;

  @IsOptional()
  triggerConfig?: Record<string, any>;

  @IsOptional()
  isActive?: boolean;

  @IsNotEmpty()
  steps!: AutomationStepInputDto[];

  @IsString()
  @IsOptional()
  accountId?: string;
}

export class UpdateWhatsAppAutomationDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  triggerType?: string;

  @IsOptional()
  triggerConfig?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsOptional()
  steps?: AutomationStepInputDto[];
}

export class ListWhatsAppAutomationsQueryDto {
  @IsString()
  @IsOptional()
  triggerType?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  accountId?: string;

  @IsOptional()
  page?: string | number;

  @IsOptional()
  limit?: string | number;
}
