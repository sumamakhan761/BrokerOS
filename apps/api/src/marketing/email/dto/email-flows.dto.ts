import {
  IsString,
  IsOptional,
  IsBoolean,
  IsArray,
  IsObject,
  IsNumber,
} from 'class-validator';

// ── Flow DTOs ──

export class CreateEmailFlowDto {
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

export class UpdateEmailFlowDto {
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

export class UniversalInboundEmailDto {
  @IsString()
  from!: string;

  @IsString()
  to!: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsString()
  html?: string;

  @IsOptional()
  @IsString()
  messageId?: string;

  @IsOptional()
  @IsString()
  inReplyTo?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsObject()
  headers?: Record<string, any>;
}

export class SimulateInboundReplyDto {
  @IsOptional()
  @IsString()
  flowId?: string;

  @IsString()
  leadEmail!: string;

  @IsString()
  senderEmail!: string; // The mailbox that originally sent the broadcast (e.g. sumama@instance.sale)

  @IsOptional()
  @IsString()
  campaignId?: string;

  @IsString()
  subject!: string;

  @IsString()
  bodyText!: string;
}

// ── Tag DTOs ──

export class CreateEmailTagDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  color?: string;
}

// ── AI Config DTO ──

export class SaveEmailAiConfigDto {
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
}
