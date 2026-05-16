import { randomBytes } from "crypto";
import { getDb } from "./db";
import { apiKeys } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Generate a new API key with prefix and random bytes
 */
export function generateApiKey(): string {
  const prefix = "fk_";
  const randomPart = randomBytes(32).toString("hex");
  return `${prefix}${randomPart}`;
}

/**
 * Hash API key for storage (simple version - use bcrypt in production)
 */
export function hashApiKey(key: string): string {
  return Buffer.from(key).toString("base64");
}

/**
 * Create a new API key for workspace
 */
export async function createApiKey(workspaceId: number, name: string, permissions: string[] = ["read", "write"], expiresInDays?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const key = generateApiKey();
  const secret = randomBytes(32).toString("hex");
  const expiresAt = expiresInDays ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000) : null;

  const result = await db.insert(apiKeys).values({
    workspaceId,
    name,
    key,
    secret,
    permissions: JSON.stringify(permissions),
    expiresAt,
    lastUsedAt: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return {
    key,
    secret,
    expiresAt,
  };
}

/**
 * Get API key by key value
 */
export async function getApiKeyByKey(key: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(apiKeys).where(eq(apiKeys.key, key)).limit(1);
  return result[0] || null;
}

/**
 * List API keys for workspace
 */
export async function listApiKeys(workspaceId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(apiKeys).where(eq(apiKeys.workspaceId, workspaceId));
}

/**
 * Rotate API key (create new, deactivate old)
 */
export async function rotateApiKey(keyId: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get old key
  const oldKey = await db.select().from(apiKeys).where(and(eq(apiKeys.id, keyId), eq(apiKeys.workspaceId, workspaceId))).limit(1);
  if (!oldKey[0]) throw new Error("API key not found");

  // Deactivate old key
  await db.update(apiKeys).set({ isActive: false }).where(eq(apiKeys.id, keyId));

  // Create new key with same permissions
  const permissions = JSON.parse(oldKey[0].permissions);
  return createApiKey(workspaceId, `${oldKey[0].name} (rotated)`, permissions);
}

/**
 * Revoke API key
 */
export async function revokeApiKey(keyId: number, workspaceId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return db.update(apiKeys).set({ isActive: false }).where(and(eq(apiKeys.id, keyId), eq(apiKeys.workspaceId, workspaceId)));
}

/**
 * Update last used timestamp
 */
export async function updateApiKeyLastUsed(keyId: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(apiKeys).set({ lastUsedAt: new Date() }).where(eq(apiKeys.id, keyId));
}

/**
 * Validate API key (check if active and not expired)
 */
export async function validateApiKey(key: string): Promise<{ valid: boolean; workspaceId?: number; permissions?: string[] }> {
  const apiKey = await getApiKeyByKey(key);
  if (!apiKey) return { valid: false };

  if (!apiKey.isActive) return { valid: false };
  if (apiKey.expiresAt && new Date() > apiKey.expiresAt) return { valid: false };

  // Update last used
  await updateApiKeyLastUsed(apiKey.id);

  const permissions = JSON.parse(apiKey.permissions);
  return { valid: true, workspaceId: apiKey.workspaceId, permissions };
}
