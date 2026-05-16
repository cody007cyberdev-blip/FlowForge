import { relations } from "drizzle-orm/relations";
import { workspaces, apiKeys, auditLogs, users, organizations, auditLogsEnhanced, workspacesEnhanced, teams, credentials, executions, executionSteps, workflows, files, iotDevices, organizationMembers, resourceAccess, roles, teamMembers, webhooks, webhookDeliveries, workflowTemplates, workflowVersions, workspaceInvitations, workspaceMembers } from "./schema";

export const apiKeysRelations = relations(apiKeys, ({one}) => ({
	workspace: one(workspaces, {
		fields: [apiKeys.workspaceId],
		references: [workspaces.id]
	}),
}));

export const workspacesRelations = relations(workspaces, ({one, many}) => ({
	apiKeys: many(apiKeys),
	auditLogs: many(auditLogs),
	iotDevices: many(iotDevices),
	workspaceInvitations: many(workspaceInvitations),
	workspaceMembers: many(workspaceMembers),
	user: one(users, {
		fields: [workspaces.ownerId],
		references: [users.id]
	}),
}));

export const auditLogsRelations = relations(auditLogs, ({one}) => ({
	workspace: one(workspaces, {
		fields: [auditLogs.workspaceId],
		references: [workspaces.id]
	}),
	user: one(users, {
		fields: [auditLogs.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	auditLogs: many(auditLogs),
	credentials: many(credentials),
	files: many(files),
	workflowTemplates: many(workflowTemplates),
	workflowVersions: many(workflowVersions),
	workflows: many(workflows),
	workspaceInvitations_invitedBy: many(workspaceInvitations, {
		relationName: "workspaceInvitations_invitedBy_users_id"
	}),
	workspaceInvitations_acceptedBy: many(workspaceInvitations, {
		relationName: "workspaceInvitations_acceptedBy_users_id"
	}),
	workspaceMembers: many(workspaceMembers),
	workspaces: many(workspaces),
}));

export const auditLogsEnhancedRelations = relations(auditLogsEnhanced, ({one}) => ({
	organization: one(organizations, {
		fields: [auditLogsEnhanced.organizationId],
		references: [organizations.id]
	}),
	workspacesEnhanced: one(workspacesEnhanced, {
		fields: [auditLogsEnhanced.workspaceId],
		references: [workspacesEnhanced.id]
	}),
	team: one(teams, {
		fields: [auditLogsEnhanced.teamId],
		references: [teams.id]
	}),
}));

export const organizationsRelations = relations(organizations, ({many}) => ({
	auditLogsEnhanceds: many(auditLogsEnhanced),
	organizationMembers: many(organizationMembers),
	resourceAccesses: many(resourceAccess),
	roles: many(roles),
	teams: many(teams),
	workspacesEnhanceds: many(workspacesEnhanced),
}));

export const workspacesEnhancedRelations = relations(workspacesEnhanced, ({one, many}) => ({
	auditLogsEnhanceds: many(auditLogsEnhanced),
	resourceAccesses: many(resourceAccess),
	teams: many(teams),
	organization: one(organizations, {
		fields: [workspacesEnhanced.organizationId],
		references: [organizations.id]
	}),
}));

export const teamsRelations = relations(teams, ({one, many}) => ({
	auditLogsEnhanceds: many(auditLogsEnhanced),
	resourceAccesses: many(resourceAccess),
	teamMembers: many(teamMembers),
	workspacesEnhanced: one(workspacesEnhanced, {
		fields: [teams.workspaceId],
		references: [workspacesEnhanced.id]
	}),
	organization: one(organizations, {
		fields: [teams.organizationId],
		references: [organizations.id]
	}),
}));

export const credentialsRelations = relations(credentials, ({one}) => ({
	user: one(users, {
		fields: [credentials.userId],
		references: [users.id]
	}),
}));

export const executionStepsRelations = relations(executionSteps, ({one}) => ({
	execution: one(executions, {
		fields: [executionSteps.executionId],
		references: [executions.id]
	}),
}));

export const executionsRelations = relations(executions, ({one, many}) => ({
	executionSteps: many(executionSteps),
	workflow: one(workflows, {
		fields: [executions.workflowId],
		references: [workflows.id]
	}),
	files: many(files),
}));

export const workflowsRelations = relations(workflows, ({one, many}) => ({
	executions: many(executions),
	webhooks: many(webhooks),
	workflowVersions: many(workflowVersions),
	user: one(users, {
		fields: [workflows.userId],
		references: [users.id]
	}),
}));

export const filesRelations = relations(files, ({one}) => ({
	user: one(users, {
		fields: [files.userId],
		references: [users.id]
	}),
	execution: one(executions, {
		fields: [files.executionId],
		references: [executions.id]
	}),
}));

export const iotDevicesRelations = relations(iotDevices, ({one}) => ({
	workspace: one(workspaces, {
		fields: [iotDevices.workspaceId],
		references: [workspaces.id]
	}),
}));

export const organizationMembersRelations = relations(organizationMembers, ({one}) => ({
	organization: one(organizations, {
		fields: [organizationMembers.organizationId],
		references: [organizations.id]
	}),
}));

export const resourceAccessRelations = relations(resourceAccess, ({one}) => ({
	organization: one(organizations, {
		fields: [resourceAccess.organizationId],
		references: [organizations.id]
	}),
	workspacesEnhanced: one(workspacesEnhanced, {
		fields: [resourceAccess.workspaceId],
		references: [workspacesEnhanced.id]
	}),
	team: one(teams, {
		fields: [resourceAccess.teamId],
		references: [teams.id]
	}),
}));

export const rolesRelations = relations(roles, ({one}) => ({
	organization: one(organizations, {
		fields: [roles.organizationId],
		references: [organizations.id]
	}),
}));

export const teamMembersRelations = relations(teamMembers, ({one}) => ({
	team: one(teams, {
		fields: [teamMembers.teamId],
		references: [teams.id]
	}),
}));

export const webhookDeliveriesRelations = relations(webhookDeliveries, ({one}) => ({
	webhook: one(webhooks, {
		fields: [webhookDeliveries.webhookId],
		references: [webhooks.id]
	}),
}));

export const webhooksRelations = relations(webhooks, ({one, many}) => ({
	webhookDeliveries: many(webhookDeliveries),
	workflow: one(workflows, {
		fields: [webhooks.workflowId],
		references: [workflows.id]
	}),
}));

export const workflowTemplatesRelations = relations(workflowTemplates, ({one}) => ({
	user: one(users, {
		fields: [workflowTemplates.createdBy],
		references: [users.id]
	}),
}));

export const workflowVersionsRelations = relations(workflowVersions, ({one}) => ({
	workflow: one(workflows, {
		fields: [workflowVersions.workflowId],
		references: [workflows.id]
	}),
	user: one(users, {
		fields: [workflowVersions.createdBy],
		references: [users.id]
	}),
}));

export const workspaceInvitationsRelations = relations(workspaceInvitations, ({one}) => ({
	workspace: one(workspaces, {
		fields: [workspaceInvitations.workspaceId],
		references: [workspaces.id]
	}),
	user_invitedBy: one(users, {
		fields: [workspaceInvitations.invitedBy],
		references: [users.id],
		relationName: "workspaceInvitations_invitedBy_users_id"
	}),
	user_acceptedBy: one(users, {
		fields: [workspaceInvitations.acceptedBy],
		references: [users.id],
		relationName: "workspaceInvitations_acceptedBy_users_id"
	}),
}));

export const workspaceMembersRelations = relations(workspaceMembers, ({one}) => ({
	workspace: one(workspaces, {
		fields: [workspaceMembers.workspaceId],
		references: [workspaces.id]
	}),
	user: one(users, {
		fields: [workspaceMembers.userId],
		references: [users.id]
	}),
}));