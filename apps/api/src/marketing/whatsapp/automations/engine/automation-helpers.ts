import { phoneVariants } from '@brokeros/int-whatsapp';
import { AutomationRunContext } from './automation-types.js';

export function interpolateAutomationText(
  text: string,
  contact: any,
  context: AutomationRunContext,
): string {
  return text
    .replace(/{{\s*name\s*}}/gi, contact?.name || 'there')
    .replace(/{{\s*phone\s*}}/gi, contact?.phone || '')
    .replace(/{{\s*company\s*}}/gi, contact?.company || '')
    .replace(/{{\s*message\s*}}/gi, context.messageText || '');
}

export async function sendWithPhoneVariants<T = any>(
  phone: string,
  senderFn: (target: string) => Promise<T>,
): Promise<T> {
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
