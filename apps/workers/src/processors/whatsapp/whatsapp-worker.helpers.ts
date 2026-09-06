// ============================================================================
// BrokerOS — WhatsApp Worker Processor Helpers
// ============================================================================

import { phoneVariants } from '@brokeros/int-whatsapp';

export async function sendWithVariants(
  phoneNumberId: string,
  accessToken: string,
  phone: string,
  senderFn: (target: string) => Promise<any>,
): Promise<any> {
  const variants = phoneVariants(phone);
  let lastErr: any = null;
  for (const v of variants) {
    try {
      return await senderFn(v);
    } catch (err: any) {
      lastErr = err;
    }
  }
  throw lastErr || new Error('Delivery failed across all phone variants');
}

export function interpolate(template: string, contact?: any): string {
  if (!template) return '';
  return template
    .replace(/{{\s*name\s*}}/gi, contact?.name || 'there')
    .replace(/{{\s*phone\s*}}/gi, contact?.phone || '')
    .replace(/{{\s*company\s*}}/gi, contact?.company || '');
}

export function evaluateCondition(config: any, contact: any, context: any): boolean {
  const field = config.field;
  const operator = config.operator || 'equals';
  const expected = config.value;

  let actual: any = null;
  if (field === 'tag') {
    const hasTag = contact?.tags?.some((t: any) => t.tagId === expected);
    return operator === 'not_has' ? !hasTag : hasTag;
  } else if (field === 'message_text') {
    actual = context.messageText || '';
  } else if (contact && contact[field] !== undefined) {
    actual = contact[field];
  }

  if (operator === 'equals') return actual === expected;
  if (operator === 'not_equals') return actual !== expected;
  if (operator === 'contains') return String(actual).toLowerCase().includes(String(expected).toLowerCase());
  return Boolean(actual);
}
