// ============================================================================
// BrokerOS — WhatsApp Interactive Flow Bots DTOs
// ============================================================================

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class FlowNodeInputDto {
  @IsString()
  @IsOptional()
  id?: string;

  @Transform(({ obj, value }) => value || obj?.node_key || obj?.id || obj?.key || ('node_' + Math.random().toString(36).slice(2, 7)))
  @IsString()
  @IsOptional()
  nodeKey?: string;

  @Transform(({ obj, value }) => {
    const raw = value || obj?.node_type || obj?.type;
    if (raw === 'trigger') return 'start';
    if (raw === 'interactive_button') return 'send_buttons';
    return raw || 'send_message';
  })
  @IsString()
  @IsOptional()
  nodeType?: string;

  @Transform(({ obj, value }) => value ?? obj?.data ?? obj?.step_config ?? {})
  @IsOptional()
  config?: Record<string, any>;

  @IsOptional()
  positionX?: number;

  @IsOptional()
  positionY?: number;
}

export class CreateWhatsAppFlowDto {
  @IsString()
  @IsOptional()
  accountId?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsNotEmpty()
  triggerType!: string;

  @IsOptional()
  triggerConfig?: Record<string, any>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowNodeInputDto)
  @IsOptional()
  nodes?: FlowNodeInputDto[];
}

export class UpdateWhatsAppFlowDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  triggerType?: string;

  @IsOptional()
  triggerConfig?: Record<string, any>;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FlowNodeInputDto)
  @IsOptional()
  nodes?: FlowNodeInputDto[];
}

export class ListWhatsAppFlowsQueryDto {
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
