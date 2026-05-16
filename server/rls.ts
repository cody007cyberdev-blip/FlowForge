/**
 * Row-Level Security (RLS) Implementation
 * Enforces tenant isolation and permission-based access control
 */

import { and, eq, or, inArray } from "drizzle-orm";
import { getDb } from "./db";
import { 
  organizations, 
  organizationMembers, 
  workspacesEnhanced, 
  teams, 
  teamMembers,
  resourceAccess,
  permissions as permissionsTable
} from "../drizzle/schema-enterprise";

export interface TenantContext {
  userId: number;
  organizationId: number;
  workspaceId?: number;
  teamId?: number;
  role: "owner" | "admin" | "member" | "editor" | "viewer";
  permissions: string[];
}

/**
 * Get tenant context for current user
 * Returns organization, workspace, team, and permissions
 */
export async function getTenantContext(userId: number, organizationId: number): Promise<TenantContext | null> {
  const db = await getDb();
  if (!db) return null;

  // Get user's organization membership
  const orgMember = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.isActive, true)
      )
    )
    .limit(1);

  if (!orgMember || orgMember.length === 0) {
    return null;
  }

  const member = orgMember[0];
  const permissions = member.permissions ? JSON.parse(member.permissions as string) : [];

  return {
    userId,
    organizationId,
    role: member.role as "owner" | "admin" | "member",
    permissions,
  };
}

/**
 * Check if user has permission for a resource
 */
export async function checkResourcePermission(
  userId: number,
  organizationId: number,
  resourceType: string,
  resourceId: number,
  action: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  // Get user's resource access
  const access = await db
    .select()
    .from(resourceAccess)
    .where(
      and(
        eq(resourceAccess.organizationId, organizationId),
        eq(resourceAccess.resourceType, resourceType),
        eq(resourceAccess.resourceId, resourceId),
        eq(resourceAccess.userId, userId)
      )
    )
    .limit(1);

  if (access && access.length > 0) {
    const perms = access[0].permissions ? JSON.parse(access[0].permissions as string) : [];
    return perms.includes(action);
  }

  return false;
}

/**
 * Get all organizations for a user
 */
export async function getUserOrganizations(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      plan: organizations.plan,
      role: organizationMembers.role,
      isActive: organizations.isActive,
    })
    .from(organizations)
    .innerJoin(
      organizationMembers,
      and(
        eq(organizations.id, organizationMembers.organizationId),
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.isActive, true)
      )
    )
    .where(eq(organizations.isActive, true));
}

/**
 * Get all workspaces in an organization for a user
 */
export async function getWorkspacesInOrganization(userId: number, organizationId: number) {
  const db = await getDb();
  if (!db) return [];

  // First verify user is member of organization
  const orgMember = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.isActive, true)
      )
    )
    .limit(1);

  if (!orgMember || orgMember.length === 0) {
    return [];
  }

  // Get all active workspaces in organization
  return db
    .select()
    .from(workspacesEnhanced)
    .where(
      and(
        eq(workspacesEnhanced.organizationId, organizationId),
        eq(workspacesEnhanced.isActive, true)
      )
    );
}

/**
 * Get all teams in a workspace for a user
 */
export async function getTeamsInWorkspace(userId: number, workspaceId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: teams.id,
      name: teams.name,
      description: teams.description,
      icon: teams.icon,
      isPublic: teams.isPublic,
      role: teamMembers.role,
    })
    .from(teams)
    .leftJoin(
      teamMembers,
      and(
        eq(teams.id, teamMembers.teamId),
        eq(teamMembers.userId, userId),
        eq(teamMembers.isActive, true)
      )
    )
    .where(eq(teams.workspaceId, workspaceId));
}

/**
 * Verify user can access workspace
 */
export async function canAccessWorkspace(userId: number, workspaceId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  // Get workspace
  const workspace = await db
    .select()
    .from(workspacesEnhanced)
    .where(eq(workspacesEnhanced.id, workspaceId))
    .limit(1);

  if (!workspace || workspace.length === 0) {
    return false;
  }

  const ws = workspace[0];

  // Check if user is member of organization
  const orgMember = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.organizationId, ws.organizationId),
        eq(organizationMembers.isActive, true)
      )
    )
    .limit(1);

  return orgMember && orgMember.length > 0;
}

/**
 * Verify user can access team
 */
export async function canAccessTeam(userId: number, teamId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  // Get team
  const team = await db
    .select()
    .from(teams)
    .where(eq(teams.id, teamId))
    .limit(1);

  if (!team || team.length === 0) {
    return false;
  }

  const t = team[0];

  // Check if user is member of team
  const teamMember = await db
    .select()
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.isActive, true)
      )
    )
    .limit(1);

  if (teamMember && teamMember.length > 0) {
    return true;
  }

  // Check if user is member of organization (org members can access public teams)
  if (t.isPublic) {
    const orgMember = await db
      .select()
      .from(organizationMembers)
      .where(
        and(
          eq(organizationMembers.userId, userId),
          eq(organizationMembers.organizationId, t.organizationId),
          eq(organizationMembers.isActive, true)
        )
      )
      .limit(1);

    return orgMember && orgMember.length > 0;
  }

  return false;
}

/**
 * Get user's role in organization
 */
export async function getUserRoleInOrganization(userId: number, organizationId: number): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  const member = await db
    .select()
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.userId, userId),
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.isActive, true)
      )
    )
    .limit(1);

  return member && member.length > 0 ? member[0].role : null;
}

/**
 * Get user's role in team
 */
export async function getUserRoleInTeam(userId: number, teamId: number): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  const member = await db
    .select()
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.userId, userId),
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.isActive, true)
      )
    )
    .limit(1);

  return member && member.length > 0 ? member[0].role : null;
}

/**
 * Check if user is organization owner
 */
export async function isOrganizationOwner(userId: number, organizationId: number): Promise<boolean> {
  const role = await getUserRoleInOrganization(userId, organizationId);
  return role === "owner";
}

/**
 * Check if user is organization admin
 */
export async function isOrganizationAdmin(userId: number, organizationId: number): Promise<boolean> {
  const role = await getUserRoleInOrganization(userId, organizationId);
  return role === "owner" || role === "admin";
}

/**
 * Check if user is team lead
 */
export async function isTeamLead(userId: number, teamId: number): Promise<boolean> {
  const role = await getUserRoleInTeam(userId, teamId);
  return role === "lead";
}

/**
 * Get all members of an organization
 */
export async function getOrganizationMembers(organizationId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: organizationMembers.id,
      userId: organizationMembers.userId,
      role: organizationMembers.role,
      isActive: organizationMembers.isActive,
      joinedAt: organizationMembers.joinedAt,
    })
    .from(organizationMembers)
    .where(
      and(
        eq(organizationMembers.organizationId, organizationId),
        eq(organizationMembers.isActive, true)
      )
    );
}

/**
 * Get all members of a team
 */
export async function getTeamMembers(teamId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: teamMembers.id,
      userId: teamMembers.userId,
      role: teamMembers.role,
      isActive: teamMembers.isActive,
      joinedAt: teamMembers.joinedAt,
    })
    .from(teamMembers)
    .where(
      and(
        eq(teamMembers.teamId, teamId),
        eq(teamMembers.isActive, true)
      )
    );
}

/**
 * Grant resource access to user
 */
export async function grantResourceAccess(
  organizationId: number,
  resourceType: string,
  resourceId: number,
  userId: number,
  permissions: string[]
) {
  const db = await getDb();
  if (!db) return null;

  return db.insert(resourceAccess).values({
    organizationId,
    resourceType,
    resourceId,
    userId,
    permissions: JSON.stringify(permissions),
  });
}

/**
 * Revoke resource access from user
 */
export async function revokeResourceAccess(
  organizationId: number,
  resourceType: string,
  resourceId: number,
  userId: number
) {
  const db = await getDb();
  if (!db) return null;

  return db
    .delete(resourceAccess)
    .where(
      and(
        eq(resourceAccess.organizationId, organizationId),
        eq(resourceAccess.resourceType, resourceType),
        eq(resourceAccess.resourceId, resourceId),
        eq(resourceAccess.userId, userId)
      )
    );
}

/**
 * Check if organization is at capacity
 */
export async function isOrganizationAtCapacity(organizationId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return true;

  const org = await db
    .select()
    .from(organizations)
    .where(eq(organizations.id, organizationId))
    .limit(1);

  if (!org || org.length === 0) {
    return true;
  }

  const organization = org[0];
  const workspaceCount = await db
    .select()
    .from(workspacesEnhanced)
    .where(eq(workspacesEnhanced.organizationId, organizationId));

  return workspaceCount.length >= organization.maxWorkspaces;
}

/**
 * Check if workspace is at capacity
 */
export async function isWorkspaceAtCapacity(workspaceId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return true;

  const workspace = await db
    .select()
    .from(workspacesEnhanced)
    .where(eq(workspacesEnhanced.id, workspaceId))
    .limit(1);

  if (!workspace || workspace.length === 0) {
    return true;
  }

  const ws = workspace[0];
  const teamCount = await db
    .select()
    .from(teams)
    .where(eq(teams.workspaceId, workspaceId));

  return teamCount.length >= ws.maxTeams;
}
