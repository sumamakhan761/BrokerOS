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

export const DEFAULT_EMAIL_QUICK_REPLIES: EmailQuickReplyItem[] = [
  {
    id: 'qr-site-visit',
    shortcut: '/site-visit',
    title: 'Site Visit Confirmation',
    contentHtml: 'We would be delighted to host you for a private site inspection this weekend. Our luxury concierge will meet you at the reception. What time works best for you?',
  },
  {
    id: 'qr-pricing',
    shortcut: '/pricing',
    title: 'Payment Plan & Pricing',
    contentHtml: 'Attached please find the comprehensive payment milestone schedule and current inventory availability with flexible developer payment options.',
  },
  {
    id: 'qr-brochure',
    shortcut: '/brochure',
    title: 'Project Brochure Download',
    contentHtml: 'Here is the high-resolution architectural brochure including full floor plans, penthouse specs, and world-class amenities overview.',
  },
  {
    id: 'qr-followup',
    shortcut: '/followup',
    title: 'Gentle Follow-up',
    contentHtml: 'Following up on our recent conversation regarding the residences. Have you had a chance to review the floor layout options?',
  },
  {
    id: 'qr-floorplan',
    shortcut: '/floorplan',
    title: 'Floor Plans & Carpet Area',
    contentHtml: 'Attached are the detailed 2 BHK and 3 BHK floor plans and carpet area breakdown for your review.',
  },
  {
    id: 'qr-callback',
    shortcut: '/callback',
    title: 'Schedule Advisor Call',
    contentHtml: 'Would you be available for a brief 5-minute call today with our senior project advisor to address your queries?',
  },
];

