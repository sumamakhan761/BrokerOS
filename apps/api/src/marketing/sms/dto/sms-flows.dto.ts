import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsObject,
  IsNumber,
} from 'class-validator';

// ── Flow DTOs ──

export class CreateSmsFlowDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  triggerType?: string; // "keyword_match" | "any_reply" | "campaign_reply"

  @IsOptional()
  @IsObject()
  triggerConfig?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  campaignIds?: string[];

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsArray()
  nodes?: Array<{
    nodeKey: string;
    nodeType: string;
    config: Record<string, any>;
    positionX?: number;
    positionY?: number;
  }>;
}

export class UpdateSmsFlowDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  status?: string; // "draft" | "active" | "archived"

  @IsOptional()
  @IsString()
  triggerType?: string;

  @IsOptional()
  @IsObject()
  triggerConfig?: Record<string, any>;

  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  campaignIds?: string[];

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsArray()
  nodes?: Array<{
    id?: string;
    nodeKey: string;
    nodeType: string;
    config: Record<string, any>;
    positionX?: number;
    positionY?: number;
  }>;
}

// ── Inbound Webhook DTOs ──

export class UniversalInboundSmsDto {
  @IsString()
  from!: string;

  @IsString()
  to!: string;

  @IsString()
  text!: string;

  @IsOptional()
  @IsString()
  messageId?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsObject()
  headers?: Record<string, any>;
}

export class SimulateInboundSmsReplyDto {
  @IsOptional()
  @IsString()
  flowId?: string;

  @IsString()
  leadPhone!: string;

  @IsString()
  senderPhone!: string; // The phone number that originally sent the broadcast (e.g. +14155550199 or SKYLIN)

  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsString()
  bodyText!: string;
}

// ── Tag DTOs ──

export class CreateSmsTagDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  color?: string;
}

// ── AI Config DTO ──

export class SaveSmsAiConfigDto {
  @IsOptional()
  @IsString()
  provider?: string; // "groq" | "openai"

  @IsOptional()
  @IsString()
  model?: string; // default "openai/gpt-oss-120b"

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsString()
  systemPrompt?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  autoReplyEnabled?: boolean;

  @IsOptional()
  @IsNumber()
  autoReplyMaxPerLead?: number;

  @IsOptional()
  @IsNumber()
  maxCharacters?: number;
}
