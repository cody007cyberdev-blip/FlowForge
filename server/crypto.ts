/**
 * Credential Encryption/Decryption
 * Uses AES-256-GCM for secure credential storage
 */

import { randomBytes, createCipheriv, createDecipheriv, scryptSync } from "crypto";

const ALGORITHM = "aes-256-gcm";
const SALT_LENGTH = 16;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Derive encryption key from master key using scrypt
 */
function deriveKey(masterKey: string, salt: Buffer): Buffer {
  return scryptSync(masterKey, salt, 32);
}

/**
 * Encrypt credential data
 */
export function encryptCredential(data: Record<string, unknown>, masterKey: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const iv = randomBytes(IV_LENGTH);
  const key = deriveKey(masterKey, salt);

  const cipher = createCipheriv(ALGORITHM, key, iv);
  const plaintext = JSON.stringify(data);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  // Combine salt + iv + authTag + encrypted data
  const combined = Buffer.concat([salt, iv, authTag, Buffer.from(encrypted, "hex")]);
  return combined.toString("base64");
}

/**
 * Decrypt credential data
 */
export function decryptCredential(encrypted: string, masterKey: string): Record<string, unknown> {
  const combined = Buffer.from(encrypted, "base64");

  const salt = combined.slice(0, SALT_LENGTH);
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const authTag = combined.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = combined.slice(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH);

  const key = deriveKey(masterKey, salt);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return JSON.parse(decrypted.toString("utf8"));
}

/**
 * Get master key from environment
 */
export function getMasterKey(): string {
  const key = process.env.CREDENTIAL_MASTER_KEY;
  if (!key) {
    throw new Error("CREDENTIAL_MASTER_KEY environment variable not set");
  }
  return key;
}
