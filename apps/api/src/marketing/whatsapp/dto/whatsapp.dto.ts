// ============================================================================
// BrokerOS — WhatsApp DTOs
// ============================================================================

import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

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

export class ListWhatsAppConversationsQueryDto {
  @IsString()
  @IsOptional()
  status?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  agentId?: string;

  @IsString()
  @IsOptional()
  accountId?: string;

  @IsOptional()
  page?: string | number;

  @IsOptional()
  limit?: string | number;
}

export class UpdateWhatsAppConversationStatusDto {
  @IsString()
  @IsNotEmpty()
  status!: 'open' | 'pending' | 'closed';
}

export class AssignWhatsAppConversationAgentDto {
  @IsString()
  @IsOptional()
  agentUserId?: string | null;
}

export class StartWhatsAppConversationDto {
  @IsString()
  @IsOptional()
  contactId?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  leadId?: string;

  @IsString()
  @IsOptional()
  accountId?: string;
}

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

// ─────────────────────────────────────────────
// Broadcasts DTOs
// ─────────────────────────────────────────────

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
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  templateName!: string;

  @IsString()
  @IsOptional()
  templateLanguage?: string;

  @IsOptional()
  contactIds?: string[];

  @IsOptional()
  csvRows?: CsvWhatsAppRecipientRow[];

  @IsOptional()
  recipients?: WhatsAppBroadcastRecipientInputDto[];

  @IsString()
  @IsOptional()
  scheduledAt?: string;

  @IsString()
  @IsOptional()
  accountId?: string;
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

export class ScheduleWhatsAppBroadcastDto {
  @IsString()
  @IsOptional()
  scheduledAt?: string;
}

// ─────────────────────────────────────────────
// Automations DTOs
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// 8. Flows DTOs
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// 9. Templates DTOs
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// 10. AI Assistant DTOs
// ─────────────────────────────────────────────

export class SaveWhatsAppAiConfigDto {
  @IsString()
  @IsNotEmpty()
  provider!: string;

  @IsString()
  @IsNotEmpty()
  model!: string;

  @IsString()
  @IsOptional()
  apiKey?: string;

  @IsString()
  @IsOptional()
  systemPrompt?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  autoReplyEnabled?: boolean;

  @IsOptional()
  autoReplyMaxPerConversation?: number;

  @IsString()
  @IsOptional()
  handoffAgentId?: string;
}

export class DraftReplyDto {
  @IsString()
  @IsNotEmpty()
  conversationId!: string;
}
