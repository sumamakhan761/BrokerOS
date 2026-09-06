// ============================================================================
// BrokerOS — Meta WhatsApp Cloud API v22.0 Client
// ============================================================================

import {
  INTERACTIVE_LIMITS,
  type InteractiveButton,
  type InteractiveListSection,
} from './interactive.js';

const META_API_VERSION = 'v22.0';
const META_API_BASE = `https://graph.facebook.com/${META_API_VERSION}`;

export interface MetaSendResult {
  messageId: string;
}

export interface MetaPhoneInfo {
  id: string;
  display_phone_number: string;
  verified_name?: string;
  quality_rating?: string;
}

interface MetaErrorEnvelope {
  error?: {
    message?: string;
    code?: number;
    type?: string;
    error_subcode?: number;
    fbtrace_id?: string;
  };
}

async function throwMetaError(response: Response, fallback: string): Promise<never> {
  let message = fallback;
  try {
    const data = (await response.json()) as MetaErrorEnvelope;
    if (data.error?.message) {
      message = data.error.message;
    }
  } catch {
    // Keep fallback if not JSON
  }
  throw new Error(message);
}

// ─────────────────────────────────────────────
// 1. Phone number & Account Registration
// ─────────────────────────────────────────────

export interface VerifyPhoneNumberArgs {
  phoneNumberId: string;
  accessToken: string;
}

export async function verifyPhoneNumber(
  args: VerifyPhoneNumberArgs,
): Promise<MetaPhoneInfo> {
  const { phoneNumberId, accessToken } = args;
  const url = `${META_API_BASE}/${phoneNumberId}?fields=id,display_phone_number,verified_name,quality_rating`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    await throwMetaError(response, `Meta API error: ${response.status}`);
  }
  return (await response.json()) as MetaPhoneInfo;
}

export interface RegisterPhoneNumberArgs {
  phoneNumberId: string;
  accessToken: string;
  pin: string;
}

export interface RegisterPhoneNumberResult {
  success: boolean;
  alreadyRegistered: boolean;
}

export async function registerPhoneNumber(
  args: RegisterPhoneNumberArgs,
): Promise<RegisterPhoneNumberResult> {
  const { phoneNumberId, accessToken, pin } = args;
  const url = `${META_API_BASE}/${phoneNumberId}/register`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ messaging_product: 'whatsapp', pin }),
  });

  if (response.ok) {
    return { success: true, alreadyRegistered: false };
  }

  let data: MetaErrorEnvelope = {};
  try {
    data = (await response.json()) as MetaErrorEnvelope;
  } catch {
    /* empty */
  }
  const message = data.error?.message ?? `Meta API error: ${response.status}`;
  if (/already.*registered/i.test(message)) {
    return { success: true, alreadyRegistered: true };
  }
  throw new Error(message);
}

export interface SubscribeWabaToAppArgs {
  wabaId: string;
  accessToken: string;
}

export async function subscribeWabaToApp(
  args: SubscribeWabaToAppArgs,
): Promise<void> {
  const { wabaId, accessToken } = args;
  const url = `${META_API_BASE}/${wabaId}/subscribed_apps`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    await throwMetaError(response, `Meta API error: ${response.status}`);
  }
}

export interface GetSubscribedAppsArgs {
  wabaId: string;
  accessToken: string;
}

export interface SubscribedApp {
  whatsapp_business_api_data?: {
    id?: string;
    name?: string;
    link?: string;
  };
}

export async function getSubscribedApps(
  args: GetSubscribedAppsArgs,
): Promise<SubscribedApp[]> {
  const { wabaId, accessToken } = args;
  const url = `${META_API_BASE}/${wabaId}/subscribed_apps`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    await throwMetaError(response, `Meta API error: ${response.status}`);
  }
  const data = (await response.json()) as { data?: SubscribedApp[] };
  return data.data ?? [];
}

// ─────────────────────────────────────────────
// 2. Messaging: Text & Media
// ─────────────────────────────────────────────

export interface SendTextMessageArgs {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  text: string;
  contextMessageId?: string;
}

export async function sendTextMessage(
  args: SendTextMessageArgs,
): Promise<MetaSendResult> {
  const { phoneNumberId, accessToken, to, text, contextMessageId } = args;
  const url = `${META_API_BASE}/${phoneNumberId}/messages`;
  const body: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'text',
    text: { body: text },
  };
  if (contextMessageId) {
    body.context = { message_id: contextMessageId };
  }
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    await throwMetaError(response, `Meta API error: ${response.status}`);
  }
  const data = (await response.json()) as { messages: Array<{ id: string }> };
  return { messageId: data.messages[0].id };
}

export type MediaKind = 'image' | 'video' | 'document' | 'audio';

export interface SendMediaMessageArgs {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  kind: MediaKind;
  link: string;
  caption?: string;
  filename?: string;
  contextMessageId?: string;
}

export async function sendMediaMessage(
  args: SendMediaMessageArgs,
): Promise<MetaSendResult> {
  const {
    phoneNumberId,
    accessToken,
    to,
    kind,
    link,
    caption,
    filename,
    contextMessageId,
  } = args;
  if (!link) throw new Error('sendMediaMessage requires a media link.');

  const media: Record<string, unknown> = { link };
  if (caption && kind !== 'audio') media.caption = caption;
  if (kind === 'document' && filename) media.filename = filename;

  const body: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: kind,
    [kind]: media,
  };
  if (contextMessageId) body.context = { message_id: contextMessageId };

  const url = `${META_API_BASE}/${phoneNumberId}/messages`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    await throwMetaError(response, `Meta API error: ${response.status}`);
  }
  const data = (await response.json()) as { messages: Array<{ id: string }> };
  return { messageId: data.messages[0].id };
}

// ─────────────────────────────────────────────
// 3. Templates & Template Sends
// ─────────────────────────────────────────────

export interface TemplateSendParameter {
  type: 'text' | 'image' | 'video' | 'document';
  text?: string;
  image?: { link?: string; id?: string };
  video?: { link?: string; id?: string };
  document?: { link?: string; id?: string; filename?: string };
}

export interface TemplateSendComponent {
  type: 'header' | 'body' | 'button';
  sub_type?: 'quick_reply' | 'url';
  index?: string | number;
  parameters: TemplateSendParameter[];
}

export interface SendTemplateMessageArgs {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  templateName: string;
  language?: string;
  components?: TemplateSendComponent[];
  params?: string[];
  contextMessageId?: string;
}

export async function sendTemplateMessage(
  args: SendTemplateMessageArgs,
): Promise<MetaSendResult> {
  const {
    phoneNumberId,
    accessToken,
    to,
    templateName,
    language = 'en_US',
    components,
    params,
    contextMessageId,
  } = args;

  const url = `${META_API_BASE}/${phoneNumberId}/messages`;

  const templatePayload: Record<string, unknown> = {
    name: templateName,
    language: { code: language },
  };

  if (components && components.length > 0) {
    templatePayload.components = components;
  } else if (params && params.length > 0) {
    templatePayload.components = [
      {
        type: 'body',
        parameters: params.map((p) => ({ type: 'text', text: String(p) })),
      },
    ];
  }

  const body: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'template',
    template: templatePayload,
  };
  if (contextMessageId) {
    body.context = { message_id: contextMessageId };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    await throwMetaError(response, `Meta API error: ${response.status}`);
  }
  const data = (await response.json()) as { messages: Array<{ id: string }> };
  return { messageId: data.messages[0].id };
}

export interface SubmitMessageTemplateArgs {
  wabaId: string;
  accessToken: string;
  payload: Record<string, unknown>;
}

export interface SubmitMessageTemplateResult {
  id: string;
  status: string;
  category?: string;
}

export async function submitMessageTemplate(
  args: SubmitMessageTemplateArgs,
): Promise<SubmitMessageTemplateResult> {
  const { wabaId, accessToken, payload } = args;
  const url = `${META_API_BASE}/${wabaId}/message_templates`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    await throwMetaError(response, `Meta API error: ${response.status}`);
  }
  const data = (await response.json()) as { id: string; status?: string; category?: string };
  return {
    id: String(data.id),
    status: data.status || 'PENDING',
    category: data.category,
  };
}

export interface DeleteMessageTemplateArgs {
  wabaId: string;
  accessToken: string;
  name: string;
  metaTemplateId?: string;
}

export async function deleteMessageTemplate(
  args: DeleteMessageTemplateArgs,
): Promise<void> {
  const { wabaId, accessToken, name, metaTemplateId } = args;
  const params = new URLSearchParams({ name });
  if (metaTemplateId) params.set('hsm_id', metaTemplateId);
  const url = `${META_API_BASE}/${wabaId}/message_templates?${params.toString()}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (response.status === 404) return;
  if (!response.ok) {
    await throwMetaError(response, `Meta API error: ${response.status}`);
  }
}

export interface FetchMessageTemplatesArgs {
  wabaId: string;
  accessToken: string;
  limit?: number;
}

export interface MetaTemplateComponent {
  type: string;
  text?: string;
  format?: string;
  buttons?: Array<{
    type: string;
    text: string;
    url?: string;
    phone_number?: string;
  }>;
  example?: {
    header_text?: string[];
    header_handle?: string[];
    body_text?: string[][];
  };
}

export interface MetaTemplateEntry {
  id: string;
  name: string;
  language: string;
  status: string;
  category: string;
  components?: MetaTemplateComponent[];
  quality_score?: { score?: string } | string;
}

export async function fetchMessageTemplates(
  args: FetchMessageTemplatesArgs,
): Promise<MetaTemplateEntry[]> {
  const { wabaId, accessToken, limit = 100 } = args;
  const url = `${META_API_BASE}/${wabaId}/message_templates?limit=${limit}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    await throwMetaError(response, `Meta API error: ${response.status}`);
  }
  const data = (await response.json()) as { data?: MetaTemplateEntry[] };
  return data.data || [];
}

// ─────────────────────────────────────────────
// 4. Reactions
// ─────────────────────────────────────────────

export interface SendReactionMessageArgs {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  targetMessageId: string;
  emoji: string;
}

export async function sendReactionMessage(
  args: SendReactionMessageArgs,
): Promise<MetaSendResult> {
  const { phoneNumberId, accessToken, to, targetMessageId, emoji } = args;
  const url = `${META_API_BASE}/${phoneNumberId}/messages`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'reaction',
      reaction: { message_id: targetMessageId, emoji },
    }),
  });
  if (!response.ok) {
    await throwMetaError(response, `Meta API error: ${response.status}`);
  }
  const data = (await response.json()) as { messages: Array<{ id: string }> };
  return { messageId: data.messages[0].id };
}

// ─────────────────────────────────────────────
// 5. Interactive (Buttons & Lists)
// ─────────────────────────────────────────────

export interface SendInteractiveButtonsArgs {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  bodyText: string;
  headerText?: string;
  footerText?: string;
  buttons: InteractiveButton[];
  contextMessageId?: string;
}

export async function sendInteractiveButtons(
  args: SendInteractiveButtonsArgs,
): Promise<MetaSendResult> {
  const {
    phoneNumberId,
    accessToken,
    to,
    bodyText,
    headerText,
    footerText,
    buttons,
    contextMessageId,
  } = args;

  if (buttons.length < 1 || buttons.length > INTERACTIVE_LIMITS.maxButtons) {
    throw new Error(
      `Interactive button message requires 1-${INTERACTIVE_LIMITS.maxButtons} buttons (got ${buttons.length}).`,
    );
  }

  const interactive: Record<string, unknown> = {
    type: 'button',
    body: { text: bodyText },
    action: {
      buttons: buttons.map((b) => ({
        type: 'reply',
        reply: { id: b.id, title: b.title },
      })),
    },
  };
  if (headerText) interactive.header = { type: 'text', text: headerText };
  if (footerText) interactive.footer = { text: footerText };

  const body: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'interactive',
    interactive,
  };
  if (contextMessageId) body.context = { message_id: contextMessageId };

  const url = `${META_API_BASE}/${phoneNumberId}/messages`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    await throwMetaError(response, `Meta API error: ${response.status}`);
  }
  const data = (await response.json()) as { messages: Array<{ id: string }> };
  return { messageId: data.messages[0].id };
}

export interface SendInteractiveListArgs {
  phoneNumberId: string;
  accessToken: string;
  to: string;
  bodyText: string;
  buttonLabel: string;
  headerText?: string;
  footerText?: string;
  sections: InteractiveListSection[];
  contextMessageId?: string;
}

export async function sendInteractiveList(
  args: SendInteractiveListArgs,
): Promise<MetaSendResult> {
  const {
    phoneNumberId,
    accessToken,
    to,
    bodyText,
    buttonLabel,
    headerText,
    footerText,
    sections,
    contextMessageId,
  } = args;

  const totalRows = sections.reduce((sum, s) => sum + s.rows.length, 0);
  if (totalRows < 1 || totalRows > INTERACTIVE_LIMITS.maxListRowsTotal) {
    throw new Error(
      `Interactive list requires 1-${INTERACTIVE_LIMITS.maxListRowsTotal} rows total across all sections (got ${totalRows}).`,
    );
  }

  const interactive: Record<string, unknown> = {
    type: 'list',
    body: { text: bodyText },
    action: {
      button: buttonLabel,
      sections: sections.map((s) => ({
        ...(s.title ? { title: s.title } : {}),
        rows: s.rows.map((r) => ({
          id: r.id,
          title: r.title,
          ...(r.description ? { description: r.description } : {}),
        })),
      })),
    },
  };
  if (headerText) interactive.header = { type: 'text', text: headerText };
  if (footerText) interactive.footer = { text: footerText };

  const body: Record<string, unknown> = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to,
    type: 'interactive',
    interactive,
  };
  if (contextMessageId) body.context = { message_id: contextMessageId };

  const url = `${META_API_BASE}/${phoneNumberId}/messages`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    await throwMetaError(response, `Meta API error: ${response.status}`);
  }
  const data = (await response.json()) as { messages: Array<{ id: string }> };
  return { messageId: data.messages[0].id };
}

// ─────────────────────────────────────────────
// 6. Media Resolution & Download
// ─────────────────────────────────────────────

export interface GetMediaUrlArgs {
  mediaId: string;
  accessToken: string;
}

export async function getMediaUrl(
  args: GetMediaUrlArgs,
): Promise<{ url: string; mimeType: string; fileSize: number | null }> {
  const { mediaId, accessToken } = args;
  const response = await fetch(`${META_API_BASE}/${mediaId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    await throwMetaError(response, `Media fetch failed: ${response.status}`);
  }
  const data = (await response.json()) as { url?: string; mime_type?: string; file_size?: string | number };
  if (!data.url) throw new Error('Media URL not found in Meta response');
  const size = Number(data.file_size);
  return {
    url: data.url,
    mimeType: data.mime_type || 'application/octet-stream',
    fileSize: Number.isFinite(size) && size >= 0 ? size : null,
  };
}

export interface DownloadMediaArgs {
  downloadUrl: string;
  accessToken: string;
}

export async function downloadMedia(
  args: DownloadMediaArgs,
): Promise<{ buffer: Buffer; contentType: string }> {
  const { downloadUrl, accessToken } = args;
  const response = await fetch(downloadUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(`Media download failed: ${response.status}`);
  }
  const contentType =
    response.headers.get('content-type') || 'application/octet-stream';
  const buffer = Buffer.from(await response.arrayBuffer());
  return { buffer, contentType };
}
