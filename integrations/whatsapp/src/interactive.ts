// ============================================================================
// BrokerOS — WhatsApp Interactive Message Payload & Validation
// ============================================================================

export const INTERACTIVE_LIMITS = {
  maxButtons: 3,
  buttonTitleMaxLength: 20,
  maxListSections: 10,
  maxListRowsTotal: 10,
  listRowTitleMaxLength: 24,
  listRowDescriptionMaxLength: 72,
  bodyMaxLength: 1024,
  footerMaxLength: 60,
  headerTextMaxLength: 60,
} as const;

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
  /** Optional footer line (<= 60 chars). */
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

export type InteractiveValidation =
  | { ok: true }
  | { ok: false; error: string };

function ok(): InteractiveValidation {
  return { ok: true };
}

function fail(error: string): InteractiveValidation {
  return { ok: false, error };
}

function validateHeaderFooter(
  header: string | undefined,
  footer: string | undefined,
): InteractiveValidation {
  if (header && header.length > INTERACTIVE_LIMITS.headerTextMaxLength) {
    return fail(
      `Header exceeds the ${INTERACTIVE_LIMITS.headerTextMaxLength}-character limit.`,
    );
  }
  if (footer && footer.length > INTERACTIVE_LIMITS.footerMaxLength) {
    return fail(
      `Footer exceeds the ${INTERACTIVE_LIMITS.footerMaxLength}-character limit.`,
    );
  }
  return ok();
}

/**
 * Validate an interactive payload before calling Meta API.
 */
export function validateInteractivePayload(
  payload: InteractiveMessagePayload,
): InteractiveValidation {
  if (!payload || typeof payload !== 'object') {
    return fail('Interactive payload must be an object.');
  }

  if (payload.kind !== 'buttons' && payload.kind !== 'list') {
    return fail('Interactive payload kind must be "buttons" or "list".');
  }

  if (!payload.body || typeof payload.body !== 'string' || !payload.body.trim()) {
    return fail('Interactive message requires body text.');
  }

  if (payload.body.length > INTERACTIVE_LIMITS.bodyMaxLength) {
    return fail(
      `Body text exceeds the ${INTERACTIVE_LIMITS.bodyMaxLength}-character limit.`,
    );
  }

  const hf = validateHeaderFooter(payload.header, payload.footer);
  if (!hf.ok) return hf;

  if (payload.kind === 'buttons') {
    if (!Array.isArray(payload.buttons)) {
      return fail('Buttons payload must include a buttons array.');
    }
    if (
      payload.buttons.length < 1 ||
      payload.buttons.length > INTERACTIVE_LIMITS.maxButtons
    ) {
      return fail(
        `Button message requires 1-${INTERACTIVE_LIMITS.maxButtons} buttons (got ${payload.buttons.length}).`,
      );
    }
    const seen = new Set<string>();
    for (const btn of payload.buttons) {
      if (!btn.id || typeof btn.id !== 'string') {
        return fail('Every button must have a non-empty id.');
      }
      if (seen.has(btn.id)) {
        return fail(`Duplicate button id "${btn.id}".`);
      }
      seen.add(btn.id);
      if (!btn.title || typeof btn.title !== 'string') {
        return fail(`Button "${btn.id}" is missing a title.`);
      }
      if (btn.title.length > INTERACTIVE_LIMITS.buttonTitleMaxLength) {
        return fail(
          `Button title "${btn.title}" exceeds ${INTERACTIVE_LIMITS.buttonTitleMaxLength} chars.`,
        );
      }
    }
    return ok();
  }

  // payload.kind === 'list'
  if (
    !payload.button_label ||
    typeof payload.button_label !== 'string' ||
    !payload.button_label.trim()
  ) {
    return fail('List message requires a button label.');
  }
  if (payload.button_label.length > INTERACTIVE_LIMITS.buttonTitleMaxLength) {
    return fail(
      `List button label exceeds ${INTERACTIVE_LIMITS.buttonTitleMaxLength} chars.`,
    );
  }

  if (!Array.isArray(payload.sections) || payload.sections.length === 0) {
    return fail('List message requires at least one section.');
  }
  if (payload.sections.length > INTERACTIVE_LIMITS.maxListSections) {
    return fail(
      `List message cannot exceed ${INTERACTIVE_LIMITS.maxListSections} sections.`,
    );
  }

  let totalRows = 0;
  const seenRowIds = new Set<string>();

  for (const section of payload.sections) {
    if (!Array.isArray(section.rows) || section.rows.length === 0) {
      return fail('Each section must contain at least one row.');
    }
    totalRows += section.rows.length;
    for (const row of section.rows) {
      if (!row.id || typeof row.id !== 'string') {
        return fail('Every row must have a non-empty id.');
      }
      if (seenRowIds.has(row.id)) {
        return fail(`Duplicate row id "${row.id}".`);
      }
      seenRowIds.add(row.id);
      if (!row.title || typeof row.title !== 'string') {
        return fail(`Row "${row.id}" is missing a title.`);
      }
      if (row.title.length > INTERACTIVE_LIMITS.listRowTitleMaxLength) {
        return fail(
          `Row title "${row.title}" exceeds ${INTERACTIVE_LIMITS.listRowTitleMaxLength} chars.`,
        );
      }
      if (
        row.description &&
        row.description.length > INTERACTIVE_LIMITS.listRowDescriptionMaxLength
      ) {
        return fail(
          `Row description for "${row.id}" exceeds ${INTERACTIVE_LIMITS.listRowDescriptionMaxLength} chars.`,
        );
      }
    }
  }

  if (totalRows > INTERACTIVE_LIMITS.maxListRowsTotal) {
    return fail(
      `List message cannot exceed ${INTERACTIVE_LIMITS.maxListRowsTotal} rows total across all sections (got ${totalRows}).`,
    );
  }

  return ok();
}
