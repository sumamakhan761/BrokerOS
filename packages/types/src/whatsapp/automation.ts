// ============================================================================
// BrokerOS — WhatsApp Automation Types
// ============================================================================

export type WhatsAppTriggerType =
  | 'new_message_received'
  | 'keyword_match'
  | 'first_inbound_message'
  | 'interactive_reply'
  | 'new_contact_created'
  | 'conversation_assigned'
  | 'conversation_opened'
  | 'conversation_closed'
  | 'tag_added'
  | 'time_based';

export type WhatsAppStepType =
  | 'send_message'
  | 'send_buttons'
  | 'send_list'
  | 'send_template'
  | 'add_tag'
  | 'remove_tag'
  | 'assign_conversation'
  | 'update_contact_field'
  | 'create_deal'
  | 'close_conversation'
  | 'send_webhook'
  | 'wait'
  | 'condition';

export interface WhatsAppAutomationStepDto {
  id?: string;
  position: number;
  parentStepId?: string | null;
  branch?: 'yes' | 'no' | null;
  stepType: WhatsAppStepType;
  stepConfig: Record<string, unknown>;
}

export interface WhatsAppAutomationDto {
  id: string;
  accountId: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  triggerType: WhatsAppTriggerType;
  triggerConfig?: Record<string, unknown> | null;
  steps: WhatsAppAutomationStepDto[];
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppAutomationLogDto {
  id: string;
  automationId: string;
  accountId: string;
  contactId?: string | null;
  triggerEvent: string;
  status: 'success' | 'partial' | 'failed';
  stepsExecuted?: unknown[] | null;
  errorMessage?: string | null;
  createdAt: string;
}
