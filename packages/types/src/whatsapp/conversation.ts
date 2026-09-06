// ============================================================================
// BrokerOS — WhatsApp Conversation & Message Types
// ============================================================================

export type WhatsAppMessageDirection = 'INBOUND' | 'OUTBOUND';
export type WhatsAppMessageStatus = 'SENT' | 'DELIVERED' | 'READ' | 'FAILED' | 'RECEIVED';
export type WhatsAppMessageType =
  | 'TEXT'
  | 'TEMPLATE'
  | 'IMAGE'
  | 'DOCUMENT'
  | 'VIDEO'
  | 'AUDIO'
  | 'LOCATION'
  | 'CONTACT'
  | 'INTERACTIVE';

export type WhatsAppSenderType = 'customer' | 'agent' | 'bot';
export type WhatsAppConversationStatus = 'open' | 'pending' | 'closed';

export interface WhatsAppContactDto {
  id: string;
  accountId: string;
  phone: string;
  name?: string | null;
  email?: string | null;
  company?: string | null;
  avatarUrl?: string | null;
  leadId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppMessageDto {
  id: string;
  conversationId: string;
  waMessageId?: string | null;
  direction: WhatsAppMessageDirection;
  type: WhatsAppMessageType;
  status: WhatsAppMessageStatus;
  senderType: WhatsAppSenderType;
  contentType: string;
  senderName?: string | null;
  body?: string | null;
  caption?: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null;
  mediaSize?: number | null;
  fileName?: string | null;
  interactivePayload?: Record<string, unknown> | null;
  replyToMessageId?: string | null;
  isAiGenerated?: boolean;
  sentAt?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
  failedAt?: string | null;
  failureReason?: string | null;
  createdAt: string;
}

export interface WhatsAppConversationSummary {
  id: string;
  accountId: string;
  contactId?: string | null;
  contactPhone: string;
  contactName?: string | null;
  status: WhatsAppConversationStatus;
  lastMessageText?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
  assignedAgentId?: string | null;
  agent?: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  contact?: WhatsAppContactDto | null;
  createdAt: string;
  updatedAt: string;
}
