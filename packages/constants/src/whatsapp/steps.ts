// ============================================================================
// BrokerOS — WhatsApp Automation Steps Constants
// ============================================================================

export const WA_STEP_TYPES = {
  SEND_MESSAGE: 'send_message',
  SEND_BUTTONS: 'send_buttons',
  SEND_LIST: 'send_list',
  SEND_TEMPLATE: 'send_template',
  ADD_TAG: 'add_tag',
  REMOVE_TAG: 'remove_tag',
  ASSIGN_CONVERSATION: 'assign_conversation',
  CLOSE_CONVERSATION: 'close_conversation',
  SEND_WEBHOOK: 'send_webhook',
  WAIT: 'wait',
  CONDITION: 'condition',
} as const;

export const WA_STEP_META = [
  { type: WA_STEP_TYPES.SEND_MESSAGE, label: 'Send Text Message' },
  { type: WA_STEP_TYPES.SEND_BUTTONS, label: 'Send Reply Buttons' },
  { type: WA_STEP_TYPES.SEND_LIST, label: 'Send List Options' },
  { type: WA_STEP_TYPES.SEND_TEMPLATE, label: 'Send Approved Template' },
  { type: WA_STEP_TYPES.ADD_TAG, label: 'Add Tag to Contact' },
  { type: WA_STEP_TYPES.REMOVE_TAG, label: 'Remove Tag from Contact' },
  { type: WA_STEP_TYPES.ASSIGN_CONVERSATION, label: 'Assign Conversation to Agent' },
  { type: WA_STEP_TYPES.CLOSE_CONVERSATION, label: 'Close Conversation' },
  { type: WA_STEP_TYPES.SEND_WEBHOOK, label: 'Trigger External Webhook' },
  { type: WA_STEP_TYPES.WAIT, label: 'Wait / Delay' },
  { type: WA_STEP_TYPES.CONDITION, label: 'Branch on Condition' },
] as const;
