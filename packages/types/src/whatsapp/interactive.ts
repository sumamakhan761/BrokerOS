// ============================================================================
// BrokerOS — WhatsApp Interactive Message Payload Types
// ============================================================================

export interface InteractiveButton {
  /** Stable id echoed back in the webhook when tapped. */
  id: string;
  /** Visible label (<= 20 chars per Meta). */
  title: string;
}

export interface InteractiveButtonsPayload {
  kind: 'buttons';
  /** Body text shown above the buttons (<= 1024 chars). */
  body: string;
  /** Optional plain-text header (<= 60 chars). */
  header?: string;
  /** Optional grey footer line (<= 60 chars). */
  footer?: string;
  /** 1–3 buttons. */
  buttons: InteractiveButton[];
}

export interface InteractiveListRow {
  /** Stable id echoed back in the webhook when selected. */
  id: string;
  /** Row title (<= 24 chars per Meta). */
  title: string;
  /** Optional secondary line (<= 72 chars). */
  description?: string;
}

export interface InteractiveListSection {
  /** Optional section header shown above its rows. */
  title?: string;
  rows: InteractiveListRow[];
}

export interface InteractiveListPayload {
  kind: 'list';
  body: string;
  header?: string;
  footer?: string;
  /** Label of the tap-to-expand button on the message bubble (<= 20 chars). */
  button_label: string;
  /** 1–10 rows TOTAL across all sections. */
  sections: InteractiveListSection[];
}

export type InteractiveMessagePayload =
  | InteractiveButtonsPayload
  | InteractiveListPayload;
