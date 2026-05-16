/**
 * Workspace Management Service
 * Handles workspace creation, management, and multi-tenant isolation
 */

import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { workspaces, workspaceMembers, workflows } from "../drizzle/schema";
import type { InsertWorkspace } from "../drizzle/schema";

export type WorkspaceRole = "owner" | "admin" | "editor" | "viewer";

export interface WorkspaceWithMembers {
  id: number;
  name: string;
  description: string | null;
  ownerId: number;
  createdAt: Date;
  updatedAt: Date;
  members: Array<{
    userId: number;
    role: WorkspaceRole;
    joinedAt: Date;
  }>;
}

/**
 * Create a new workspace
 */
export async function createWorkspace(
  userId: number,
  name: string,
  description?: string
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Generate slug from name
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const result = await db.insert(workspaces).values({
    name,
    slug,
    description: description || null,
    ownerId: userId,
  });

  const workspaceId = (result as any)[0]?.insertId as number;

  // Add owner as admin member
  await db.insert(workspaceMembers).values({
    workspaceId,
    userId,
    role: "owner",
  });

  return workspaceId;
}

/**
 * Get workspace with all members
 */
export async function getWorkspaceWithMembers(
  workspaceId: number
): Promise<WorkspaceWithMembers | null> {
  const db = await getDb();
  if (!db) return null;

  const workspace = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.id, workspaceId))
    .limit(1);

  if (!workspace.length) return null;

  const members = await db
    .select()
    .from(workspaceMembers)
    .where(eq(workspaceMembers.workspaceId, workspaceId));

  return {
    ...workspace[0]!,
    members: members.map(m => ({
      userId: m.userId,
      role: m.role as WorkspaceRole,
      joinedAt: m.joinedAt,
    })),
  };
}

/**
 * Get all workspaces for a user
 */
export async function getUserWorkspaces(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const userWorkspaces = await db
    .select({
      id: workspaces.id,
      name: workspaces.name,
      description: workspaces.description,
      ownerId: workspaces.ownerId,
      role: workspaceMembers.role,
      createdAt: workspaces.createdAt,
      updatedAt: workspaces.updatedAt,
    })
    .from(workspaces)
    .innerJoin(
      workspaceMembers,
      and(
        eq(workspaceMembers.workspaceId, workspaces.id),
        eq(workspaceMembers.userId, userId)
      )
    );

  return userWorkspaces;
}

/**
 * Add member to workspace
 */
export async function addWorkspaceMember(
  workspaceId: number,
  userId: number,
  role: WorkspaceRole = "editor"
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(workspaceMembers).values({
    workspaceId,
    userId,
    role,
  });
}

/**
 * Update member role in workspace
 */
export async function updateWorkspaceMemberRole(
  workspaceId: number,
  userId: number,
  role: WorkspaceRole
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(workspaceMembers)
    .set({ role })
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId)
      )
    );
}

/**
 * Remove member from workspace
 */
export async function removeWorkspaceMember(
  workspaceId: number,
  userId: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId)
      )
    );
}

/**
 * Check if user has permission in workspace
 */
export async function checkWorkspacePermission(
  workspaceId: number,
  userId: number,
  requiredRole: WorkspaceRole
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const member = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId)
      )
    )
    .limit(1);

  if (!member.length) return false;

  const roleHierarchy: Record<WorkspaceRole, number> = {
    owner: 4,
    admin: 3,
    editor: 2,
    viewer: 1,
  };

  return roleHierarchy[member[0]!.role as WorkspaceRole] >= roleHierarchy[requiredRole];
}

/**
 * Get user's role in workspace
 */
export async function getUserRoleInWorkspace(
  workspaceId: number,
  userId: number
): Promise<WorkspaceRole | null> {
  const db = await getDb();
  if (!db) return null;

  const member = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.workspaceId, workspaceId),
        eq(workspaceMembers.userId, userId)
      )
    )
    .limit(1);

  return member.length ? (member[0]!.role as WorkspaceRole) : null;
}

/**
 * Update workspace details
 */
export async function updateWorkspace(
  workspaceId: number,
  updates: { name?: string; description?: string }
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(workspaces)
    .set(updates)
    .where(eq(workspaces.id, workspaceId));
}

/**
 * Delete workspace (only owner can do this)
 */
export async function deleteWorkspace(workspaceId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete all workflows in workspace
  // Note: workspaceId will be implemented in FASE 1 multi-tenant
  // For now, workflows are filtered by userId only

  // Delete all members
  await db
    .delete(workspaceMembers)
    .where(eq(workspaceMembers.workspaceId, workspaceId));

  // Delete workspace
  await db
    .delete(workspaces)
    .where(eq(workspaces.id, workspaceId));
}
