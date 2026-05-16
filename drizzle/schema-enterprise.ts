/**
 * ENTERPRISE MULTI-TENANT SCHEMA
 * Hierarchy: Organization → Workspace → Team → User
 * 
 * This schema extends the base schema with enterprise features:
 * - Organizations (top-level tenant)
 * - Workspace hierarchies within organizations
 * - Team management and collaboration
 * - Row-Level Security (RLS) support
 * - Granular permission system
 */

import { mysqlTable, int, varchar, text, timestamp, boolean, mysqlEnum, index, uniqueIndex, decimal } from "drizzle-orm/mysql-core";

/**
 * Organizations - top-level multi-tenant container
 * Each organization is completely isolated
 */
export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  logo: varchar("logo", { length: 255 }),
  website: varchar("website", { length: 255 }),
  
  // Billing & subscription
  plan: mysqlEnum("plan", ["free", "pro", "business", "enterprise"]).default("free").notNull(),
  maxWorkspaces: int("maxWorkspaces").default(5).notNull(),
  maxTeamsPerWorkspace: int("maxTeamsPerWorkspace").default(10).notNull(),
  maxUsersPerTeam: int("maxUsersPerTeam").default(50).notNull(),
  maxWorkflowsPerWorkspace: int("maxWorkflowsPerWorkspace").default(100).notNull(),
  maxExecutionsPerMonth: int("maxExecutionsPerMonth").default(10000).notNull(),
  
  // Billing info
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  billingEmail: varchar("billingEmail", { length: 320 }),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  isSuspended: boolean("isSuspended").default(false).notNull(),
  suspendReason: text("suspendReason"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  slugIdx: uniqueIndex("org_slug_idx").on(table.slug),
  planIdx: index("org_plan_idx").on(table.plan),
  activeIdx: index("org_active_idx").on(table.isActive),
}));

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

/**
 * Organization members - users in organization with global roles
 */
export const organizationMembers = mysqlTable("organization_members", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: int("userId").notNull(),
  
  // Global org role
  role: mysqlEnum("role", ["owner", "admin", "member"]).default("member").notNull(),
  
  // Permissions (JSON array for granular control)
  permissions: text("permissions").notNull().default("[]"), // JSON array
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  invitedAt: timestamp("invitedAt"),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  orgUserIdx: uniqueIndex("org_member_idx").on(table.organizationId, table.userId),
  orgIdx: index("org_member_org_idx").on(table.organizationId),
  roleIdx: index("org_member_role_idx").on(table.role),
}));

export type OrganizationMember = typeof organizationMembers.$inferSelect;
export type InsertOrganizationMember = typeof organizationMembers.$inferInsert;

/**
 * Enhanced Workspaces - now part of organization hierarchy
 */
export const workspacesEnhanced = mysqlTable("workspaces_enhanced", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  ownerId: int("ownerId").notNull(),
  
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 255 }),
  
  // Workspace settings
  isPublic: boolean("isPublic").default(false).notNull(),
  requiresApproval: boolean("requiresApproval").default(false).notNull(),
  
  // Quotas
  maxTeams: int("maxTeams").default(10).notNull(),
  maxWorkflows: int("maxWorkflows").default(100).notNull(),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  orgIdx: index("ws_org_idx").on(table.organizationId),
  slugIdx: uniqueIndex("ws_slug_idx").on(table.organizationId, table.slug),
  activeIdx: index("ws_active_idx").on(table.isActive),
}));

export type WorkspaceEnhanced = typeof workspacesEnhanced.$inferSelect;
export type InsertWorkspaceEnhanced = typeof workspacesEnhanced.$inferInsert;

/**
 * Teams - sub-groups within workspaces for collaboration
 */
export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  workspaceId: int("workspaceId").notNull().references(() => workspacesEnhanced.id, { onDelete: "cascade" }),
  organizationId: int("organizationId").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 255 }),
  
  // Team settings
  isPublic: boolean("isPublic").default(false).notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  workspaceIdx: index("team_workspace_idx").on(table.workspaceId),
  orgIdx: index("team_org_idx").on(table.organizationId),
}));

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

/**
 * Team members - users assigned to teams with specific roles
 */
export const teamMembers = mysqlTable("team_members", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull().references(() => teams.id, { onDelete: "cascade" }),
  userId: int("userId").notNull(),
  
  // Team role
  role: mysqlEnum("role", ["lead", "member", "viewer"]).default("member").notNull(),
  
  // Permissions specific to this team
  permissions: text("permissions").notNull().default("[]"), // JSON array
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  teamUserIdx: uniqueIndex("team_member_idx").on(table.teamId, table.userId),
  teamIdx: index("team_member_team_idx").on(table.teamId),
  roleIdx: index("team_member_role_idx").on(table.role),
}));

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

/**
 * Permissions - granular permission definitions
 */
export const permissions = mysqlTable("permissions", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  resource: varchar("resource", { length: 100 }).notNull(), // 'workflow', 'credential', 'team', etc.
  action: varchar("action", { length: 100 }).notNull(), // 'create', 'read', 'update', 'delete', 'execute'
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  resourceActionIdx: uniqueIndex("perm_resource_action_idx").on(table.resource, table.action),
}));

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = typeof permissions.$inferInsert;

/**
 * Role definitions - predefined roles with permission sets
 */
export const roles = mysqlTable("roles", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").references(() => organizations.id, { onDelete: "cascade" }),
  
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  
  // Permissions (JSON array of permission IDs)
  permissionIds: text("permissionIds").notNull().default("[]"),
  
  // System roles cannot be deleted
  isSystem: boolean("isSystem").default(false).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  orgIdx: index("role_org_idx").on(table.organizationId),
  nameIdx: index("role_name_idx").on(table.name),
}));

export type Role = typeof roles.$inferSelect;
export type InsertRole = typeof roles.$inferInsert;

/**
 * Resource access - fine-grained access control for workflows, credentials, etc.
 */
export const resourceAccess = mysqlTable("resource_access", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  workspaceId: int("workspaceId").references(() => workspacesEnhanced.id, { onDelete: "cascade" }),
  teamId: int("teamId").references(() => teams.id, { onDelete: "cascade" }),
  
  resourceType: varchar("resourceType", { length: 100 }).notNull(), // 'workflow', 'credential', 'file'
  resourceId: int("resourceId").notNull(),
  
  // Who has access
  userId: int("userId"),
  teamId2: int("teamId2"),
  
  // What they can do
  permissions: text("permissions").notNull(), // JSON array: ['read', 'write', 'execute', 'delete']
  
  // Timestamps
  grantedAt: timestamp("grantedAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  orgIdx: index("access_org_idx").on(table.organizationId),
  resourceIdx: index("access_resource_idx").on(table.resourceType, table.resourceId),
  userIdx: index("access_user_idx").on(table.userId),
  teamIdx: index("access_team_idx").on(table.teamId),
}));

export type ResourceAccess = typeof resourceAccess.$inferSelect;
export type InsertResourceAccess = typeof resourceAccess.$inferInsert;

/**
 * Enhanced Audit Logs - with organization context
 */
export const auditLogsEnhanced = mysqlTable("audit_logs_enhanced", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  workspaceId: int("workspaceId").references(() => workspacesEnhanced.id, { onDelete: "cascade" }),
  teamId: int("teamId").references(() => teams.id, { onDelete: "cascade" }),
  userId: int("userId").notNull(),
  
  action: varchar("action", { length: 100 }).notNull(),
  resourceType: varchar("resourceType", { length: 100 }).notNull(),
  resourceId: int("resourceId"),
  resourceName: varchar("resourceName", { length: 255 }),
  
  // Change tracking
  oldValue: text("oldValue"), // JSON
  newValue: text("newValue"), // JSON
  
  // Request context
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  
  // Status
  status: mysqlEnum("status", ["success", "failure"]).default("success").notNull(),
  errorMessage: text("errorMessage"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  orgIdx: index("audit_org_idx").on(table.organizationId),
  userIdx: index("audit_user_idx").on(table.userId),
  actionIdx: index("audit_action_idx").on(table.action),
  resourceIdx: index("audit_resource_idx").on(table.resourceType, table.resourceId),
  createdIdx: index("audit_created_idx").on(table.createdAt),
}));

export type AuditLogEnhanced = typeof auditLogsEnhanced.$inferSelect;
export type InsertAuditLogEnhanced = typeof auditLogsEnhanced.$inferInsert;

/**
 * Tenant context - for row-level security
 * Stores the current tenant context for each request
 */
export const tenantContext = mysqlTable("tenant_context", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  workspaceId: int("workspaceId"),
  teamId: int("teamId"),
  userId: int("userId").notNull(),
  
  // Request tracking
  requestId: varchar("requestId", { length: 255 }).notNull().unique(),
  sessionId: varchar("sessionId", { length: 255 }),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
}, (table) => ({
  orgIdx: index("context_org_idx").on(table.organizationId),
  userIdx: index("context_user_idx").on(table.userId),
  expiresIdx: index("context_expires_idx").on(table.expiresAt),
}));

export type TenantContext = typeof tenantContext.$inferSelect;
export type InsertTenantContext = typeof tenantContext.$inferInsert;
