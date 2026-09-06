// ============================================================================
// BrokerOS — WhatsApp Webhook Inbound & Outbound Payload Types
// ============================================================================

export interface MetaMessageEntry {
  from: string;
  id: string;
  timestamp: string;
  type:
    | 'text'
    | 'image'
    | 'video'
    | 'document'
    | 'audio'
    | 'interactive'
    | 'button'
    | 'reaction'
    | 'location'
    | 'contacts'
    | 'unsupported';
  text?: { body: string };
  image?: { id: string; mime_type: string; sha256: string; caption?: string };
  video?: { id: string; mime_type: string; sha256: string; caption?: string };
  document?: { id: string; mime_type: string; sha256: string; filename?: string; caption?: string };
  audio?: { id: string; mime_type: string; sha256: string; voice?: boolean };
  interactive?: {
    type: 'button_reply' | 'list_reply';
    button_reply?: { id: string; title: string };
    list_reply?: { id: string; title: string; description?: string };
  };
  reaction?: { message_id: string; emoji: string };
  location?: { latitude: number; longitude: number; name?: string; address?: string };
  context?: { message_id: string; from?: string; id?: string };
}

export interface MetaStatusEntry {
  id: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: string;
  recipient_id: string;
  pricing?: { billable: boolean; category: string };
  errors?: Array<{ code: number; title: string; message?: string }>;
}

export interface MetaWebhookChangeValue {
  messaging_product: 'whatsapp';
  metadata: {
    display_phone_number: string;
    phone_number_id: string;
  };
  contacts?: Array<{
    profile: { name: string };
    wa_id: string;
  }>;
  messages?: MetaMessageEntry[];
  statuses?: MetaStatusEntry[];
}

export interface MetaWebhookPayload {
  object: 'whatsapp_business_account';
  entry: Array<{
    id: string;
    changes: Array<{
      field: string;
      value: MetaWebhookChangeValue;
    }>;
  }>;
}
