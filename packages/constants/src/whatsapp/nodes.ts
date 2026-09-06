// ============================================================================
// BrokerOS — WhatsApp Flow Builder Node Types & Metadata
// ============================================================================

export const WA_NODE_TYPES = {
  START: 'start',
  SEND_MESSAGE: 'send_message',
  SEND_MEDIA: 'send_media',
  SEND_BUTTONS: 'send_buttons',
  SEND_LIST: 'send_list',
  COLLECT_INPUT: 'collect_input',
  CONDITION: 'condition',
  SET_TAG: 'set_tag',
  HANDOFF: 'handoff',
  END: 'end',
} as const;

export const WA_NODE_META = [
  { type: WA_NODE_TYPES.START, label: 'Start', color: '#10B981' },
  { type: WA_NODE_TYPES.SEND_MESSAGE, label: 'Send Message', color: '#3B82F6' },
  { type: WA_NODE_TYPES.SEND_MEDIA, label: 'Send Media', color: '#6366F1' },
  { type: WA_NODE_TYPES.SEND_BUTTONS, label: 'Send Buttons', color: '#8B5CF6' },
  { type: WA_NODE_TYPES.SEND_LIST, label: 'Send List Menu', color: '#A855F7' },
  { type: WA_NODE_TYPES.COLLECT_INPUT, label: 'Collect Input', color: '#EC4899' },
  { type: WA_NODE_TYPES.CONDITION, label: 'Condition Branch', color: '#F59E0B' },
  { type: WA_NODE_TYPES.SET_TAG, label: 'Set Tag', color: '#14B8A6' },
  { type: WA_NODE_TYPES.HANDOFF, label: 'Human Handoff', color: '#EF4444' },
  { type: WA_NODE_TYPES.END, label: 'End Flow', color: '#6B7280' },
] as const;
