// ============================================================================
// BrokerOS — Outbound Webhook SSRF Guard
// ============================================================================

import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

/**
 * True for loopback / private / link-local / reserved IPv4 or IPv6.
 */
export function isPrivateOrReservedIp(ip: string): boolean {
  const v4 = ip.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) {
    const a = Number(v4[1]);
    const b = Number(v4[2]);
    if (a === 0) return true; // "this" network
    if (a === 10) return true; // private
    if (a === 127) return true; // loopback
    if (a === 169 && b === 254) return true; // link-local + cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true; // private
    if (a === 192 && b === 168) return true; // private
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    return false;
  }

  const v6 = ip.toLowerCase().replace(/^\[|\]$/g, '');
  if (v6 === '::1' || v6 === '::') return true; // loopback / unspecified
  if (
    v6.startsWith('fe8') ||
    v6.startsWith('fe9') ||
    v6.startsWith('fea') ||
    v6.startsWith('feb')
  ) {
    return true; // link-local
  }
  if (v6.startsWith('fc') || v6.startsWith('fd')) return true; // ULA
  const mapped = v6.match(/::ffff:(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (mapped) return isPrivateOrReservedIp(mapped[1]);
  return false;
}

/**
 * True if `rawUrl`'s host resolves only to publicly-routable address(es).
 */
export async function isDeliverableUrl(rawUrl: string): Promise<boolean> {
  let host: string;
  try {
    host = new URL(rawUrl).hostname.replace(/^\[|\]$/g, '');
  } catch {
    return false;
  }

  if (isIP(host)) return !isPrivateOrReservedIp(host);

  const lower = host.toLowerCase();
  if (
    lower === 'localhost' ||
    lower.endsWith('.localhost') ||
    lower.endsWith('.local') ||
    lower.endsWith('.internal')
  ) {
    return false;
  }

  try {
    const results = await lookup(host, { all: true });
    if (results.length === 0) return false;
    return results.every((r) => !isPrivateOrReservedIp(r.address));
  } catch {
    return false; // unresolvable -> not deliverable
  }
}

import { buildSignatureHeader } from './webhook-sign.js';

export interface PostSafeWebhookOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
}

/**
 * Safely POST a webhook payload with SSRF validation, redirect protection, and optional HMAC signing.
 */
export async function postSafeWebhook(
  url: string,
  payload: any,
  secret?: string,
  options: PostSafeWebhookOptions = {},
): Promise<{ ok: boolean; status: number }> {
  if (!(await isDeliverableUrl(url))) {
    throw new Error(`Outbound webhook target rejected by SSRF guard: ${url}`);
  }

  const rawBody = typeof payload === 'string' ? payload : JSON.stringify(payload);
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(options.headers || {}),
  };

  if (secret) {
    const tsSeconds = Math.floor(Date.now() / 1000);
    headers['x-brokeros-signature'] = buildSignatureHeader(rawBody, secret, tsSeconds);
    headers['x-brokeros-timestamp'] = String(tsSeconds);
  }

  const timeoutMs = options.timeoutMs ?? 10_000;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: rawBody,
    redirect: 'manual',
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!res.ok) {
    throw new Error(`Webhook responded with HTTP status ${res.status}`);
  }

  return { ok: true, status: res.status };
}

