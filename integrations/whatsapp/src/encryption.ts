// ============================================================================
// BrokerOS — WhatsApp Token & Secret Encryption (AES-256-GCM + Legacy CBC)
// ============================================================================

import crypto from 'node:crypto';

const GCM_IV_LENGTH = 12;
const CBC_IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getKeyBuffer(): Buffer {
  const rawKey =
    process.env.WA_ENCRYPTION_KEY ||
    process.env.ENCRYPTION_KEY ||
    '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

  // If already a 64-character hex string (32 bytes), parse hex
  if (/^[0-9a-fA-F]{64}$/.test(rawKey)) {
    return Buffer.from(rawKey, 'hex');
  }

  // Otherwise derive a deterministic 32-byte key via SHA-256
  return crypto.createHash('sha256').update(rawKey).digest();
}

/**
 * Encrypt plaintext using AES-256-GCM.
 * Output format: `<iv-hex>:<ciphertext-hex>:<authTag-hex>`
 */
export function encrypt(text: string): string {
  const key = getKeyBuffer();
  const iv = crypto.randomBytes(GCM_IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${encrypted}:${authTag.toString('hex')}`;
}

/**
 * Decrypt ciphertext. Automatically detects GCM (3 parts) vs legacy CBC (2 parts).
 */
export function decrypt(encryptedText: string): string {
  const parts = encryptedText.split(':');
  const key = getKeyBuffer();

  if (parts.length === 3) {
    // GCM format
    const [ivHex, ctHex, tagHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    if (iv.length !== GCM_IV_LENGTH) {
      throw new Error(`Encrypted token has unexpected GCM IV length ${iv.length}`);
    }
    const authTag = Buffer.from(tagHex, 'hex');
    if (authTag.length !== AUTH_TAG_LENGTH) {
      throw new Error(`Encrypted token has unexpected GCM auth-tag length ${authTag.length}`);
    }

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(ctHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  if (parts.length === 2) {
    // CBC format (legacy fallback)
    const [ivHex, ctHex] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    if (iv.length !== CBC_IV_LENGTH) {
      throw new Error(`Encrypted token has unexpected CBC IV length ${iv.length}`);
    }

    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(ctHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  throw new Error(
    `Encrypted token has unrecognised format (expected 1 or 2 colons, got ${parts.length - 1})`,
  );
}

/**
 * Check if the ciphertext is in legacy CBC format (2 parts).
 */
export function isLegacyFormat(encryptedText: string): boolean {
  return encryptedText.split(':').length === 2;
}
