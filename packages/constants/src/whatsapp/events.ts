// ============================================================================
// BrokerOS — WhatsApp Real-Time & Webhook Event Constants
// ============================================================================

export const WA_EVENTS = {
  // Socket.IO real-time events
  MESSAGE_RECEIVED: 'wa:message:received',
  MESSAGE_SENT: 'wa:message:sent',
  MESSAGE_STATUS: 'wa:message:status',
  CONVERSATION_UPDATED: 'wa:conversation:updated',
  CONVERSATION_CREATED: 'wa:conversation:created',

  // Outbound Webhook Delivery events
  OUTBOUND_MESSAGE_RECEIVED: 'message.received',
  OUTBOUND_MESSAGE_SENT: 'message.sent',
  OUTBOUND_MESSAGE_STATUS_UPDATED: 'message.status_updated',
  OUTBOUND_CONVERSATION_CREATED: 'conversation.created',
  OUTBOUND_CONVERSATION_STATUS_CHANGED: 'conversation.status_changed',
  OUTBOUND_CONTACT_CREATED: 'contact.created',
  OUTBOUND_BROADCAST_SENT: 'broadcast.sent',
} as const;

export type WhatsAppEventName = (typeof WA_EVENTS)[keyof typeof WA_EVENTS];
