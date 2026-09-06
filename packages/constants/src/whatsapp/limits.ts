// ============================================================================
// BrokerOS — WhatsApp Limits Constants
// ============================================================================

export const WA_INTERACTIVE_BUTTON_MAX = 3;
export const WA_INTERACTIVE_BUTTON_TITLE_MAX_LENGTH = 20;

export const WA_INTERACTIVE_LIST_MAX_SECTIONS = 10;
export const WA_INTERACTIVE_LIST_MAX_ROWS_TOTAL = 10;
export const WA_INTERACTIVE_LIST_ROW_TITLE_MAX_LENGTH = 24;
export const WA_INTERACTIVE_LIST_ROW_DESC_MAX_LENGTH = 72;

export const WA_BODY_MAX_LENGTH = 1024;
export const WA_HEADER_TEXT_MAX_LENGTH = 60;
export const WA_FOOTER_TEXT_MAX_LENGTH = 60;

export const WA_BROADCAST_MAX_RECIPIENTS = 1000;
export const WA_MAX_TEMPLATE_PARAMS = 20;
export const WA_MAX_TAG_CHAIN_DEPTH = 3;
export const WA_MAX_CONSECUTIVE_WEBHOOK_FAILURES = 15;
export const WA_DEFAULT_AUTO_REPLY_MAX = 3;

export const INTERACTIVE_LIMITS = {
  maxButtons: WA_INTERACTIVE_BUTTON_MAX,
  buttonTitleMaxLength: WA_INTERACTIVE_BUTTON_TITLE_MAX_LENGTH,
  maxListSections: WA_INTERACTIVE_LIST_MAX_SECTIONS,
  maxListRowsTotal: WA_INTERACTIVE_LIST_MAX_ROWS_TOTAL,
  listRowTitleMaxLength: WA_INTERACTIVE_LIST_ROW_TITLE_MAX_LENGTH,
  listRowDescriptionMaxLength: WA_INTERACTIVE_LIST_ROW_DESC_MAX_LENGTH,
  bodyMaxLength: WA_BODY_MAX_LENGTH,
  footerMaxLength: WA_FOOTER_TEXT_MAX_LENGTH,
  headerTextMaxLength: WA_HEADER_TEXT_MAX_LENGTH,
} as const;

