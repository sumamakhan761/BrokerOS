// ============================================================================
// BrokerOS — SMS Inbox Types & Data Contracts
// ============================================================================

export interface SmsConversation {
  id: string;
  contactPhone: string;
  contactName?: string | null;
  status: 'open' | 'pending' | 'closed';
  lastMessageText?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
  aiAutoReplyDisabled?: boolean;

  assignedProvider: string;
  assignedSenderPhone?: string | null;

  agentUserId?: string | null;
  agent?: {
    id: string;
    name: string;
    email: string;
  } | null;

  leadId?: string | null;
  lead?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
    status?: string | null;
    temperature?: string | null;
    budget?: number | null;
  } | null;

  campaignId?: string | null;
  campaign?: {
    id: string;
    title: string;
  } | null;

  createdAt: string;
  updatedAt: string;
}

export interface SmsMessage {
  id: string;
  conversationId: string;
  direction: 'INBOUND' | 'OUTBOUND';
  senderType: 'agent' | 'bot' | 'contact';
  senderName?: string | null;
  fromPhone: string;
  toPhone: string;
  bodyText: string;
  segmentsCount?: number;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  provider?: string | null;
  providerMsgId?: string | null;
  isAiGenerated?: boolean;
  failureReason?: string | null;
  sentAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
}

export interface SmsQuickReplyItem {
  id: string;
  shortcut: string;
  title: string;
  text: string;
  category?: string;
}
