// ============================================================================
// BrokerOS — WhatsApp Automation Triggers Constants
// ============================================================================

export const WA_TRIGGER_TYPES = {
  NEW_MESSAGE_RECEIVED: 'new_message_received',
  KEYWORD_MATCH: 'keyword_match',
  FIRST_INBOUND_MESSAGE: 'first_inbound_message',
  CONVERSATION_OPENED: 'conversation_opened',
  CONVERSATION_CLOSED: 'conversation_closed',
  TAG_ADDED: 'tag_added',
  INTERACTIVE_REPLY: 'interactive_reply',
} as const;

export const WA_TRIGGER_META = [
  {
    type: WA_TRIGGER_TYPES.NEW_MESSAGE_RECEIVED,
    label: 'New Message Received',
    description: 'Runs on every incoming message from a contact',
  },
  {
    type: WA_TRIGGER_TYPES.KEYWORD_MATCH,
    label: 'Keyword Match',
    description: 'Runs when an incoming message matches specific keywords',
  },
  {
    type: WA_TRIGGER_TYPES.FIRST_INBOUND_MESSAGE,
    label: 'First Message Received',
    description: 'Runs only when a brand new contact sends their very first message',
  },
  {
    type: WA_TRIGGER_TYPES.CONVERSATION_OPENED,
    label: 'Conversation Opened',
    description: 'Runs when a conversation status changes to open',
  },
  {
    type: WA_TRIGGER_TYPES.CONVERSATION_CLOSED,
    label: 'Conversation Closed',
    description: 'Runs when an agent or system closes a conversation',
  },
  {
    type: WA_TRIGGER_TYPES.TAG_ADDED,
    label: 'Tag Added',
    description: 'Runs when a specific tag is attached to a contact',
  },
  {
    type: WA_TRIGGER_TYPES.INTERACTIVE_REPLY,
    label: 'Button or List Reply',
    description: 'Runs when a contact clicks a specific button or list item',
  },
] as const;
