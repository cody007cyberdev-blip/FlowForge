import { mysqlTable, mysqlSchema, AnyMySqlColumn, index, foreignKey, int, varchar, text, timestamp, mysqlEnum, decimal, boolean, uniqueIndex, tinyint } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const apiKeys = mysqlTable("api_keys", {
	id: int().autoincrement().notNull(),
	workspaceId: int().notNull().references(() => workspaces.id, { onDelete: "cascade" } ),
	name: varchar({ length: 255 }).notNull(),
	key: varchar({ length: 255 }).notNull(),
	secret: text().notNull(),
	permissions: text().notNull(),
	lastUsedAt: timestamp({ mode: 'string' }),
	expiresAt: timestamp({ mode: 'string' }),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("apikey_workspace_idx").on(table.workspaceId),
	index("key").on(table.key),
]);

export const auditLogs = mysqlTable("audit_logs", {
	id: int().autoincrement().notNull(),
	workspaceId: int().notNull().references(() => workspaces.id, { onDelete: "cascade" } ),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	action: varchar({ length: 100 }).notNull(),
	resourceType: varchar({ length: 100 }).notNull(),
	resourceId: int(),
	details: text(),
	ipAddress: varchar({ length: 45 }),
	userAgent: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("audit_workspace_idx").on(table.workspaceId),
	index("audit_user_idx").on(table.userId),
	index("audit_action_idx").on(table.action),
]);

export const auditLogsEnhanced = mysqlTable("audit_logs_enhanced", {
	id: int().autoincrement().notNull(),
	organizationId: int().notNull().references(() => organizations.id, { onDelete: "cascade" } ),
	workspaceId: int().references(() => workspacesEnhanced.id, { onDelete: "cascade" } ),
	teamId: int().references(() => teams.id, { onDelete: "cascade" } ),
	userId: int().notNull(),
	action: varchar({ length: 100 }).notNull(),
	resourceType: varchar({ length: 100 }).notNull(),
	resourceId: int(),
	resourceName: varchar({ length: 255 }),
	oldValue: text(),
	newValue: text(),
	ipAddress: varchar({ length: 45 }),
	userAgent: text(),
	status: mysqlEnum(['success','failure']).default('success').notNull(),
	errorMessage: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("audit_org_idx").on(table.organizationId),
	index("audit_user_idx").on(table.userId),
	index("audit_action_idx").on(table.action),
	index("audit_resource_idx").on(table.resourceType, table.resourceId),
	index("audit_created_idx").on(table.createdAt),
]);

export const credentials = mysqlTable("credentials", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	name: varchar({ length: 255 }).notNull(),
	type: varchar({ length: 100 }).notNull(),
	encryptedData: text().notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const executionSteps = mysqlTable("executionSteps", {
	id: int().autoincrement().notNull(),
	executionId: int().notNull().references(() => executions.id, { onDelete: "cascade" } ),
	nodeId: varchar({ length: 255 }).notNull(),
	nodeName: varchar({ length: 255 }),
	nodeType: varchar({ length: 100 }).notNull(),
	status: varchar({ length: 50 }).notNull(),
	input: text(),
	output: text(),
	error: text(),
	startTime: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	endTime: timestamp({ mode: 'string' }),
	duration: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const executions = mysqlTable("executions", {
	id: int().autoincrement().notNull(),
	workflowId: int().notNull().references(() => workflows.id, { onDelete: "cascade" } ),
	status: varchar({ length: 50 }).notNull(),
	startTime: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	endTime: timestamp({ mode: 'string' }),
	duration: int(),
	error: text(),
	triggerSource: varchar({ length: 50 }),
	triggerData: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const files = mysqlTable("files", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	executionId: int().references(() => executions.id, { onDelete: "cascade" } ),
	filename: varchar({ length: 255 }).notNull(),
	mimeType: varchar({ length: 100 }),
	fileSize: int(),
	fileKey: varchar({ length: 500 }).notNull(),
	fileUrl: varchar({ length: 500 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const iotDevices = mysqlTable("iot_devices", {
	id: int().autoincrement().notNull(),
	workspaceId: int().notNull().references(() => workspaces.id, { onDelete: "cascade" } ),
	name: varchar({ length: 255 }).notNull(),
	type: varchar({ length: 100 }).notNull(),
	config: text().notNull(),
	status: mysqlEnum(['online','offline','error']).default('offline').notNull(),
	lastSeen: timestamp({ mode: 'string' }),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("device_workspace_idx").on(table.workspaceId),
]);

export const organizationMembers = mysqlTable("organization_members", {
	id: int().autoincrement().notNull(),
	organizationId: int().notNull().references(() => organizations.id, { onDelete: "cascade" } ),
	userId: int().notNull(),
	role: mysqlEnum(['owner','admin','member']).default('member').notNull(),
	permissions: text().notNull(),
	isActive: tinyint().default(1).notNull(),
	invitedAt: timestamp({ mode: 'string' }),
	joinedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("org_member_idx").on(table.organizationId, table.userId),
	index("org_member_org_idx").on(table.organizationId),
	index("org_member_role_idx").on(table.role),
]);

export const organizations = mysqlTable("organizations", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	description: text(),
	logo: varchar({ length: 255 }),
	website: varchar({ length: 255 }),
	plan: mysqlEnum(['free','pro','business','enterprise']).default('free').notNull(),
	maxWorkspaces: int().default(5).notNull(),
	maxTeamsPerWorkspace: int().default(10).notNull(),
	maxUsersPerTeam: int().default(50).notNull(),
	maxWorkflowsPerWorkspace: int().default(100).notNull(),
	maxExecutionsPerMonth: int().default(10000).notNull(),
	stripeCustomerId: varchar({ length: 255 }),
	stripeSubscriptionId: varchar({ length: 255 }),
	billingEmail: varchar({ length: 320 }),
	isActive: tinyint().default(1).notNull(),
	isSuspended: tinyint().default(0).notNull(),
	suspendReason: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("org_plan_idx").on(table.plan),
	index("org_active_idx").on(table.isActive),
	index("slug").on(table.slug),
]);

export const permissions = mysqlTable("permissions", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	resource: varchar({ length: 100 }).notNull(),
	action: varchar({ length: 100 }).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("perm_resource_action_idx").on(table.resource, table.action),
	index("name").on(table.name),
]);

export const resourceAccess = mysqlTable("resource_access", {
	id: int().autoincrement().notNull(),
	organizationId: int().notNull().references(() => organizations.id, { onDelete: "cascade" } ),
	workspaceId: int().references(() => workspacesEnhanced.id, { onDelete: "cascade" } ),
	teamId: int().references(() => teams.id, { onDelete: "cascade" } ),
	resourceType: varchar({ length: 100 }).notNull(),
	resourceId: int().notNull(),
	userId: int(),
	teamId2: int(),
	permissions: text().notNull(),
	grantedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	expiresAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("access_org_idx").on(table.organizationId),
	index("access_resource_idx").on(table.resourceType, table.resourceId),
	index("access_user_idx").on(table.userId),
	index("access_team_idx").on(table.teamId),
]);

export const roles = mysqlTable("roles", {
	id: int().autoincrement().notNull(),
	organizationId: int().references(() => organizations.id, { onDelete: "cascade" } ),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	permissionIds: text().notNull(),
	isSystem: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("role_org_idx").on(table.organizationId),
	index("role_name_idx").on(table.name),
]);

export const teamMembers = mysqlTable("team_members", {
	id: int().autoincrement().notNull(),
	teamId: int().notNull().references(() => teams.id, { onDelete: "cascade" } ),
	userId: int().notNull(),
	role: mysqlEnum(['lead','member','viewer']).default('member').notNull(),
	permissions: text().notNull(),
	isActive: tinyint().default(1).notNull(),
	joinedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("team_member_idx").on(table.teamId, table.userId),
	index("team_member_team_idx").on(table.teamId),
	index("team_member_role_idx").on(table.role),
]);

export const teams = mysqlTable("teams", {
	id: int().autoincrement().notNull(),
	workspaceId: int().notNull().references(() => workspacesEnhanced.id, { onDelete: "cascade" } ),
	organizationId: int().notNull().references(() => organizations.id, { onDelete: "cascade" } ),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	icon: varchar({ length: 255 }),
	isPublic: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("team_workspace_idx").on(table.workspaceId),
	index("team_org_idx").on(table.organizationId),
]);

export const tenantContext = mysqlTable("tenant_context", {
	id: int().autoincrement().notNull(),
	organizationId: int().notNull(),
	workspaceId: int(),
	teamId: int(),
	userId: int().notNull(),
	requestId: varchar({ length: 255 }).notNull(),
	sessionId: varchar({ length: 255 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
},
(table) => [
	index("context_org_idx").on(table.organizationId),
	index("context_user_idx").on(table.userId),
	index("context_expires_idx").on(table.expiresAt),
	index("requestId").on(table.requestId),
]);

export const users = mysqlTable("users", {
	id: int().autoincrement().notNull(),
	openId: varchar({ length: 64 }).notNull(),
	name: text(),
	email: varchar({ length: 320 }),
	loginMethod: varchar({ length: 64 }),
	role: mysqlEnum(['user','admin']).default('user').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	lastSignedIn: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("users_openId_unique").on(table.openId),
]);

export const webhookDeliveries = mysqlTable("webhook_deliveries", {
	id: int().autoincrement().notNull(),
	webhookId: int().notNull().references(() => webhooks.id, { onDelete: "cascade" } ),
	payload: text().notNull(),
	statusCode: int(),
	response: text(),
	error: text(),
	retryCount: int().default(0).notNull(),
	nextRetryAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("delivery_webhook_idx").on(table.webhookId),
]);

export const webhooks = mysqlTable("webhooks", {
	id: int().autoincrement().notNull(),
	workflowId: int().notNull().references(() => workflows.id, { onDelete: "cascade" } ),
	webhookUrl: varchar({ length: 500 }).notNull(),
	isActive: int().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("webhooks_webhookUrl_unique").on(table.webhookUrl),
]);

export const workflowTemplates = mysqlTable("workflow_templates", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	category: varchar({ length: 100 }).notNull(),
	nodes: text().notNull(),
	edges: text().notNull(),
	thumbnail: varchar({ length: 255 }),
	downloads: int().default(0).notNull(),
	rating: decimal({ precision: 3, scale: 2 }).default('0'),
	isPublic: tinyint().default(1).notNull(),
	createdBy: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("template_category_idx").on(table.category),
]);

export const workflowVersions = mysqlTable("workflow_versions", {
	id: int().autoincrement().notNull(),
	workflowId: int().notNull().references(() => workflows.id, { onDelete: "cascade" } ),
	version: int().notNull(),
	nodes: text().notNull(),
	edges: text().notNull(),
	changeLog: text(),
	createdBy: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("version_workflow_idx").on(table.workflowId),
	index("version_unique_idx").on(table.workflowId, table.version),
]);

export const workflows = mysqlTable("workflows", {
	id: int().autoincrement().notNull(),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	isActive: int().default(0).notNull(),
	nodes: text().notNull(),
	edges: text().notNull(),
	trigger: varchar({ length: 50 }).notNull(),
	triggerConfig: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const workspaceInvitations = mysqlTable("workspace_invitations", {
	id: int().autoincrement().notNull(),
	workspaceId: int().notNull().references(() => workspaces.id, { onDelete: "cascade" } ),
	invitedBy: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	email: varchar({ length: 320 }).notNull(),
	role: mysqlEnum(['owner','admin','editor','viewer']).default('editor').notNull(),
	token: varchar({ length: 255 }).notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	acceptedAt: timestamp({ mode: 'string' }),
	acceptedBy: int().references(() => users.id, { onDelete: "set null" } ),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("invitation_workspace_idx").on(table.workspaceId),
	index("invitation_email_idx").on(table.email),
	index("invitation_token_idx").on(table.token),
	index("token").on(table.token),
]);

export const workspaceMembers = mysqlTable("workspace_members", {
	id: int().autoincrement().notNull(),
	workspaceId: int().notNull().references(() => workspaces.id, { onDelete: "cascade" } ),
	userId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	role: mysqlEnum(['owner','admin','editor','viewer']).default('editor').notNull(),
	joinedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("workspace_user_idx").on(table.workspaceId, table.userId),
]);

export const workspaces = mysqlTable("workspaces", {
	id: int().autoincrement().notNull(),
	ownerId: int().notNull().references(() => users.id, { onDelete: "cascade" } ),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	description: text(),
	icon: varchar({ length: 255 }),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("workspace_owner_idx").on(table.ownerId),
	index("slug").on(table.slug),
]);

export const workspacesEnhanced = mysqlTable("workspaces_enhanced", {
	id: int().autoincrement().notNull(),
	organizationId: int().notNull().references(() => organizations.id, { onDelete: "cascade" } ),
	ownerId: int().notNull(),
	name: varchar({ length: 255 }).notNull(),
	slug: varchar({ length: 255 }).notNull(),
	description: text(),
	icon: varchar({ length: 255 }),
	isPublic: tinyint().default(0).notNull(),
	requiresApproval: tinyint().default(0).notNull(),
	maxTeams: int().default(10).notNull(),
	maxWorkflows: int().default(100).notNull(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("ws_org_idx").on(table.organizationId),
	index("ws_slug_idx").on(table.organizationId, table.slug),
	index("ws_active_idx").on(table.isActive),
]);
