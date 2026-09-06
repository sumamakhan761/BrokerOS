// ============================================================================
// BrokerOS — WhatsApp Webhook Signature Verification & Outbound Signing
// ============================================================================

import crypto from 'node:crypto';

/**
 * Verify the HMAC-SHA256 signature Meta attaches to inbound webhook POSTs.
 * Meta sends `X-Hub-Signature-256: sha256=<hex>`.
 */
export function verifyMetaWebhookSignature(
  rawBody: string | Buffer,
  signatureHeader: string | null | undefined,
  appSecret?: string,
): boolean {
  const secret = appSecret || process.env.WA_APP_SECRET || process.env.META_APP_SECRET;
  if (!secret) {
    console.error(
      '[whatsapp webhook] WA_APP_SECRET is not set — rejecting signature verification.',
    );
    return false;
  }

  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return false;
  }

  const expected =
    'sha256=' +
    crypto
      .createHmac('sha256', secret)
      .update(typeof rawBody === 'string' ? Buffer.from(rawBody, 'utf8') : rawBody)
      .digest('hex');

  const a = Buffer.from(signatureHeader);
  const b = Buffer.from(expected);

  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Build an outbound webhook signature header (Stripe style):
 * `t=<timestamp>,v1=<hex HMAC-SHA256>`
 */
export function buildSignatureHeader(
  rawBody: string,
  secret: string,
  timestampSeconds: number,
): string {
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${timestampSeconds}.${rawBody}`)
    .digest('hex');
  return `t=${timestampSeconds},v1=${signature}`;
}

/**
 * Verify an outbound webhook signature header.
 */
export function verifySignatureHeader(
  header: string,
  rawBody: string,
  secret: string,
  nowSeconds: number,
  toleranceSeconds = 300,
): boolean {
  const parts = Object.fromEntries(
    header.split(',').map((kv) => {
      const i = kv.indexOf('=');
      return [kv.slice(0, i).trim(), kv.slice(i + 1)];
    }),
  );

  const t = Number(parts.t);
  const v1 = typeof parts.v1 === 'string' ? parts.v1.trim().toLowerCase() : '';
  if (!Number.isFinite(t) || !v1) return false;
  if (Math.abs(nowSeconds - t) > toleranceSeconds) return false;

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${t}.${rawBody}`)
    .digest('hex');

  if (expected.length !== v1.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
}
