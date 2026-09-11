// ============================================================================
// BrokerOS — Email Inbox Types & Data Contracts
// ============================================================================

export interface EmailConversation {
  id: string;
  contactEmail: string;
  contactName?: string | null;
  subject?: string | null;
  status: 'open' | 'pending' | 'closed';
  lastMessageText?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;

  assignedProvider: string;
  assignedSenderEmail?: string | null;
  assignedSenderName?: string | null;

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
    leadScore?: number | null;
  } | null;

  createdAt: string;
  updatedAt: string;
}

export interface EmailMessage {
  id: string;
  conversationId: string;
  direction: 'INBOUND' | 'OUTBOUND';
  senderType: 'agent' | 'bot' | 'contact';
  senderName?: string | null;
  fromEmail: string;
  toEmail: string;
  subject?: string | null;
  bodyText?: string | null;
  bodyHtml?: string | null;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'FAILED';
  provider?: string | null;
  providerMsgId?: string | null;
  inReplyTo?: string | null;
  attachments?: Array<{
    name: string;
    url: string;
    size?: number;
    contentType?: string;
  }> | null;
  isAiGenerated: boolean;
  failureReason?: string | null;
  sentAt?: string | null;
  deliveredAt?: string | null;
  openedAt?: string | null;
  createdAt: string;
}

export interface EmailQuickReplyItem {
  id: string;
  shortcut: string;
  title: string;
  subject?: string | null;
  contentHtml: string;
  category?: string | null;
}
