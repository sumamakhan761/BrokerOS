// ============================================================================
// BrokerOS — WhatsApp Phone Utilities (E.164, Normalization, Retry Variants)
// ============================================================================

/**
 * Sanitize phone number for Meta WhatsApp API.
 * Meta requires digits only — no + prefix, no spaces, no dashes.
 * e.g. "+91 98765 43210" → "919876543210"
 */
export function sanitizePhoneForMeta(phone: string): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

/**
 * Normalize phone number by removing all non-digit characters.
 * Used for comparing phone numbers in different formats.
 */
export function normalizePhone(phone: string): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

/**
 * Compare two phone numbers accounting for trunk prefix differences.
 * e.g. "910987654321" (with trunk 0) matches "919876543210"
 * by comparing the last 8 digits.
 */
export function phonesMatch(phone1: string, phone2: string): boolean {
  const n1 = normalizePhone(phone1);
  const n2 = normalizePhone(phone2);
  if (n1 === n2) return true;
  if (n1.length >= 8 && n2.length >= 8) {
    return n1.slice(-8) === n2.slice(-8);
  }
  return false;
}

/**
 * Validate phone number is E.164-like format (7-15 digits starting with non-zero).
 * Accepts with or without + prefix.
 */
export function isValidE164(phone: string): boolean {
  return /^\+?[1-9]\d{6,14}$/.test(phone);
}

/**
 * Generate plausible phone number variants for retry when Meta's
 * API rejects a number with recipient not allowed / trunk prefix error.
 */
export function phoneVariants(sanitized: string): string[] {
  if (!sanitized) return [];
  const seen = new Set<string>();
  const push = (v: string) => {
    if (v && !seen.has(v)) seen.add(v);
  };

  // 1. Original
  push(sanitized);

  // 2. Insert a 0 after each plausible country-code length (1, 2, 3 digits)
  for (const ccLen of [1, 2, 3]) {
    if (sanitized.length <= ccLen) continue;
    const cc = sanitized.slice(0, ccLen);
    const rest = sanitized.slice(ccLen);
    if (!rest.startsWith('0')) {
      push(cc + '0' + rest);
    }
  }

  // 3. Remove a leading 0 after each plausible country-code length
  for (const ccLen of [1, 2, 3]) {
    if (sanitized.length <= ccLen + 1) continue;
    const cc = sanitized.slice(0, ccLen);
    const rest = sanitized.slice(ccLen);
    if (rest.startsWith('0')) {
      push(cc + rest.slice(1));
    }
  }

  return [...seen];
}

/**
 * Returns true when the Meta API error indicates the recipient
 * phone number isn't in the allowed list or recipient not allowed.
 */
export function isRecipientNotAllowedError(message: string): boolean {
  return /131026|131030|not in allowed list|not in the allowed list|recipient not allowed/i.test(
    message,
  );
}
