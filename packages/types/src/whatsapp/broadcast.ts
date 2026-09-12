// ============================================================================
// BrokerOS — WhatsApp Broadcast Types
// ============================================================================

export type WhatsAppBroadcastStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'SENDING'
  | 'SENT'
  | 'FAILED';

export type WhatsAppBroadcastRecipientStatus =
  | 'PENDING'
  | 'SENT'
  | 'DELIVERED'
  | 'READ'
  | 'REPLIED'
  | 'FAILED';

export interface WhatsAppBroadcastDto {
  id: string;
  accountId: string;
  name: string;
  templateName: string;
  templateLanguage: string;
  status: WhatsAppBroadcastStatus;
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  readCount: number;
  repliedCount: number;
  failedCount: number;
  scheduledAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppBroadcastRecipientDto {
  id: string;
  broadcastId: string;
  contactId?: string | null;
  phone: string;
  templateParams?: Record<string, unknown> | null;
  status: WhatsAppBroadcastRecipientStatus;
  waMessageId?: string | null;
  sentAt?: string | null;
  errorMessage?: string | null;
  createdAt: string;
}

export interface WhatsAppPreFlightCostSummary {
  totalAudience: number;
  category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION' | 'SERVICE';
  categoryName: string;
  categoryColor: string;
  rateINR: number;
  rateUSD: number;
  totalCostINR: number;
  totalCostUSD: number;
  exchangeRate: number; // 95
  messagingTier?: string;
  dailyLimit?: number;
  isTierExceeded?: boolean;
  accountPhoneNumber?: string;
  accountName?: string;
}
