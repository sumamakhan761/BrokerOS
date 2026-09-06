// ============================================================================
// BrokerOS — WhatsApp Flow Builder Types
// ============================================================================

export type WhatsAppFlowNodeType =
  | 'start'
  | 'send_message'
  | 'send_media'
  | 'send_buttons'
  | 'send_list'
  | 'collect_input'
  | 'condition'
  | 'set_tag'
  | 'handoff'
  | 'end';

export type WhatsAppFlowStatus = 'draft' | 'active' | 'archived';

export type WhatsAppFlowRunStatus =
  | 'active'
  | 'completed'
  | 'handed_off'
  | 'timed_out'
  | 'failed'
  | 'paused_by_agent';

export interface WhatsAppFlowNodeDto {
  id?: string;
  nodeKey: string;
  nodeType: WhatsAppFlowNodeType;
  config: Record<string, unknown>;
}

export interface WhatsAppFlowDto {
  id: string;
  accountId: string;
  name: string;
  status: WhatsAppFlowStatus;
  triggerType: string;
  triggerConfig?: Record<string, unknown> | null;
  nodes: WhatsAppFlowNodeDto[];
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppFlowRunDto {
  id: string;
  flowId: string;
  accountId: string;
  contactId: string;
  conversationId?: string | null;
  status: WhatsAppFlowRunStatus;
  currentNodeKey?: string | null;
  vars?: Record<string, unknown> | null;
  startedAt: string;
  endedAt?: string | null;
  endReason?: string | null;
}
