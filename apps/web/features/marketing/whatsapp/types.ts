// ============================================================================
// BrokerOS — WhatsApp Web Feature Types
// ============================================================================

export interface WhatsAppAccount {
  id: string;
  wabaId: string;
  phoneNumberId: string;
  displayPhoneNumber?: string;
  displayPhone?: string;
  verifiedName?: string;
  businessName?: string;
  qualityRating?: string;
  isActive: boolean;
  createdAt: string;
}

export interface WhatsAppContact {
  id: string;
  accountId: string;
  phone: string;
  name?: string | null;
  email?: string | null;
  company?: string | null;
  avatarUrl?: string | null;
  leadId?: string | null;
  lead?: {
    id: string;
    status: string;
    temperature?: string;
    budget?: number;
  } | null;
  tags?: Array<{
    id: string;
    tag: {
      id: string;
      name: string;
      color?: string | null;
    };
  }>;
  createdAt: string;
}

export interface WhatsAppConversation {
  id: string;
  accountId: string;
  contactId?: string | null;
  contactPhone: string;
  contactName?: string | null;
  status: 'open' | 'pending' | 'closed';
  lastMessageText?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
  agentUserId?: string | null;
  agent?: {
    id: string;
    name?: string | null;
    email: string;
  } | null;
  contact?: WhatsAppContact | null;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppMessage {
  id: string;
  conversationId: string;
  waMessageId?: string | null;
  direction: 'INBOUND' | 'OUTBOUND';
  type: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | 'AUDIO' | 'INTERACTIVE' | 'TEMPLATE' | 'LOCATION';
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  senderType: 'contact' | 'agent' | 'bot';
  senderName?: string | null;
  body?: string | null;
  mediaUrl?: string | null;
  mediaType?: string | null;
  caption?: string | null;
  interactivePayload?: any;
  templateId?: string | null;
  templateValues?: any;
  template?: WhatsAppTemplate | null;
  sentAt?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
  failedAt?: string | null;
  failureReason?: string | null;
  createdAt: string;
}

export interface WhatsAppTag {
  id: string;
  accountId: string;
  name: string;
  color?: string | null;
  _count?: {
    contacts: number;
  };
}

export interface WhatsAppQuickReply {
  id: string;
  accountId: string;
  shortcut: string;
  content: string;
  createdAt: string;
}

export interface WhatsAppTemplate {
  id: string;
  accountId: string;
  name: string;
  language: string;
  category: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'PAUSED' | 'DISABLED';
  qualityScore?: 'GREEN' | 'YELLOW' | 'RED' | null;
  headerText?: string | null;
  bodyText: string;
  footerText?: string | null;
  buttons?: any;
  exampleValues?: any;
  isActive: boolean;
  createdAt: string;
}

export interface WhatsAppBroadcast {
  id: string;
  accountId: string;
  name: string;
  templateName: string;
  templateLanguage: string;
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  repliedCount: number;
  failedCount: number;
  scheduledAt?: string | null;
  createdAt: string;
  account?: WhatsAppAccount;
}

export interface WhatsAppAutomationStep {
  id: string;
  automationId: string;
  position: number;
  parentStepId?: string | null;
  branch?: 'yes' | 'no' | null;
  stepType: string;
  stepConfig: Record<string, any>;
  branches?: {
    yes?: WhatsAppAutomationStep[];
    no?: WhatsAppAutomationStep[];
  };
}

export interface WhatsAppAutomation {
  id: string;
  accountId: string;
  name: string;
  description?: string | null;
  triggerType: string;
  triggerConfig?: Record<string, any> | null;
  isActive: boolean;
  steps?: WhatsAppAutomationStep[];
  stepsTree?: WhatsAppAutomationStep[];
  _count?: {
    logs: number;
  };
  createdAt: string;
}

export interface WhatsAppFlow {
  id: string;
  accountId: string;
  name: string;
  status: 'draft' | 'active' | 'archived';
  triggerType: string;
  triggerConfig?: Record<string, any> | null;
  nodes?: Array<{
    id: string;
    nodeKey: string;
    nodeType: string;
    config: Record<string, any>;
  }>;
  _count?: {
    runs: number;
  };
  createdAt: string;
}

export interface WhatsAppAiConfig {
  id?: string;
  accountId: string;
  provider: string;
  model: string;
  apiKey?: string | null;
  systemPrompt?: string | null;
  isActive: boolean;
  autoReplyEnabled: boolean;
  autoReplyMaxPerConversation: number;
  handoffAgentId?: string | null;
}
