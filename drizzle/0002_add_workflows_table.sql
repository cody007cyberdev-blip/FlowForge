CREATE TABLE `api_keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`key` varchar(255) NOT NULL,
	`secret` text NOT NULL,
	`permissions` text NOT NULL,
	`lastUsedAt` timestamp,
	`expiresAt` timestamp,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`resourceType` varchar(100) NOT NULL,
	`resourceId` int,
	`details` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `audit_logs_enhanced` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`workspaceId` int,
	`teamId` int,
	`userId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`resourceType` varchar(100) NOT NULL,
	`resourceId` int,
	`resourceName` varchar(255),
	`oldValue` text,
	`newValue` text,
	`ipAddress` varchar(45),
	`userAgent` text,
	`status` enum('success','failure') NOT NULL DEFAULT 'success',
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `iot_devices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` varchar(100) NOT NULL,
	`config` text NOT NULL,
	`status` enum('online','offline','error') NOT NULL DEFAULT 'offline',
	`lastSeen` timestamp,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `organization_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','admin','member') NOT NULL DEFAULT 'member',
	`permissions` text NOT NULL,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`invitedAt` timestamp,
	`joinedAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `organizations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`logo` varchar(255),
	`website` varchar(255),
	`plan` enum('free','pro','business','enterprise') NOT NULL DEFAULT 'free',
	`maxWorkspaces` int NOT NULL DEFAULT 5,
	`maxTeamsPerWorkspace` int NOT NULL DEFAULT 10,
	`maxUsersPerTeam` int NOT NULL DEFAULT 50,
	`maxWorkflowsPerWorkspace` int NOT NULL DEFAULT 100,
	`maxExecutionsPerMonth` int NOT NULL DEFAULT 10000,
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`billingEmail` varchar(320),
	`isActive` tinyint NOT NULL DEFAULT 1,
	`isSuspended` tinyint NOT NULL DEFAULT 0,
	`suspendReason` text,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `permissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`resource` varchar(100) NOT NULL,
	`action` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `resource_access` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`workspaceId` int,
	`teamId` int,
	`resourceType` varchar(100) NOT NULL,
	`resourceId` int NOT NULL,
	`userId` int,
	`teamId2` int,
	`permissions` text NOT NULL,
	`grantedAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int,
	`name` varchar(100) NOT NULL,
	`description` text,
	`permissionIds` text NOT NULL,
	`isSystem` tinyint NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('lead','member','viewer') NOT NULL DEFAULT 'member',
	`permissions` text NOT NULL,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`joinedAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`organizationId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(255),
	`isPublic` tinyint NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `tenant_context` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`workspaceId` int,
	`teamId` int,
	`userId` int NOT NULL,
	`requestId` varchar(255) NOT NULL,
	`sessionId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`expiresAt` timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE `webhook_deliveries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`webhookId` int NOT NULL,
	`payload` text NOT NULL,
	`statusCode` int,
	`response` text,
	`error` text,
	`retryCount` int NOT NULL DEFAULT 0,
	`nextRetryAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `workflow_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(100) NOT NULL,
	`nodes` text NOT NULL,
	`edges` text NOT NULL,
	`thumbnail` varchar(255),
	`downloads` int NOT NULL DEFAULT 0,
	`rating` decimal(3,2) DEFAULT '0',
	`isPublic` tinyint NOT NULL DEFAULT 1,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `workflow_versions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workflowId` int NOT NULL,
	`version` int NOT NULL,
	`nodes` text NOT NULL,
	`edges` text NOT NULL,
	`changeLog` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `workspace_invitations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`invitedBy` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`role` enum('owner','admin','editor','viewer') NOT NULL DEFAULT 'editor',
	`token` varchar(255) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`acceptedAt` timestamp,
	`acceptedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `workspace_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workspaceId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','admin','editor','viewer') NOT NULL DEFAULT 'editor',
	`joinedAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `workspaces` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(255),
	`isActive` tinyint NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `workspaces_enhanced` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`ownerId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(255),
	`isPublic` tinyint NOT NULL DEFAULT 0,
	`requiresApproval` tinyint NOT NULL DEFAULT 0,
	`maxTeams` int NOT NULL DEFAULT 10,
	`maxWorkflows` int NOT NULL DEFAULT 100,
	`isActive` tinyint NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE `users` DROP INDEX `users_openId_unique`;--> statement-breakpoint
ALTER TABLE `webhooks` DROP INDEX `webhooks_webhookUrl_unique`;--> statement-breakpoint
ALTER TABLE `credentials` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `executionSteps` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `executions` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `files` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `users` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `webhooks` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `workflows` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `credentials` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `executionSteps` MODIFY COLUMN `startTime` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `executionSteps` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `executions` MODIFY COLUMN `startTime` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `executions` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `files` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `lastSignedIn` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `webhooks` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `workflows` MODIFY COLUMN `createdAt` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP';--> statement-breakpoint
ALTER TABLE `api_keys` ADD CONSTRAINT `api_keys_workspaceId_workspaces_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_workspaceId_workspaces_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_logs_enhanced` ADD CONSTRAINT `audit_logs_enhanced_organizationId_organizations_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_logs_enhanced` ADD CONSTRAINT `audit_logs_enhanced_workspaceId_workspaces_enhanced_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces_enhanced`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `audit_logs_enhanced` ADD CONSTRAINT `audit_logs_enhanced_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `iot_devices` ADD CONSTRAINT `iot_devices_workspaceId_workspaces_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `organization_members` ADD CONSTRAINT `organization_members_organizationId_organizations_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resource_access` ADD CONSTRAINT `resource_access_organizationId_organizations_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resource_access` ADD CONSTRAINT `resource_access_workspaceId_workspaces_enhanced_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces_enhanced`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `resource_access` ADD CONSTRAINT `resource_access_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `roles` ADD CONSTRAINT `roles_organizationId_organizations_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `team_members` ADD CONSTRAINT `team_members_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teams` ADD CONSTRAINT `teams_workspaceId_workspaces_enhanced_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces_enhanced`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `teams` ADD CONSTRAINT `teams_organizationId_organizations_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `webhook_deliveries` ADD CONSTRAINT `webhook_deliveries_webhookId_webhooks_id_fk` FOREIGN KEY (`webhookId`) REFERENCES `webhooks`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workflow_templates` ADD CONSTRAINT `workflow_templates_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workflow_versions` ADD CONSTRAINT `workflow_versions_workflowId_workflows_id_fk` FOREIGN KEY (`workflowId`) REFERENCES `workflows`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workflow_versions` ADD CONSTRAINT `workflow_versions_createdBy_users_id_fk` FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workspace_invitations` ADD CONSTRAINT `workspace_invitations_workspaceId_workspaces_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workspace_invitations` ADD CONSTRAINT `workspace_invitations_invitedBy_users_id_fk` FOREIGN KEY (`invitedBy`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workspace_invitations` ADD CONSTRAINT `workspace_invitations_acceptedBy_users_id_fk` FOREIGN KEY (`acceptedBy`) REFERENCES `users`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workspace_members` ADD CONSTRAINT `workspace_members_workspaceId_workspaces_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workspace_members` ADD CONSTRAINT `workspace_members_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workspaces` ADD CONSTRAINT `workspaces_ownerId_users_id_fk` FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workspaces_enhanced` ADD CONSTRAINT `workspaces_enhanced_organizationId_organizations_id_fk` FOREIGN KEY (`organizationId`) REFERENCES `organizations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `apikey_workspace_idx` ON `api_keys` (`workspaceId`);--> statement-breakpoint
CREATE INDEX `key` ON `api_keys` (`key`);--> statement-breakpoint
CREATE INDEX `audit_workspace_idx` ON `audit_logs` (`workspaceId`);--> statement-breakpoint
CREATE INDEX `audit_user_idx` ON `audit_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `audit_action_idx` ON `audit_logs` (`action`);--> statement-breakpoint
CREATE INDEX `audit_org_idx` ON `audit_logs_enhanced` (`organizationId`);--> statement-breakpoint
CREATE INDEX `audit_user_idx` ON `audit_logs_enhanced` (`userId`);--> statement-breakpoint
CREATE INDEX `audit_action_idx` ON `audit_logs_enhanced` (`action`);--> statement-breakpoint
CREATE INDEX `audit_resource_idx` ON `audit_logs_enhanced` (`resourceType`,`resourceId`);--> statement-breakpoint
CREATE INDEX `audit_created_idx` ON `audit_logs_enhanced` (`createdAt`);--> statement-breakpoint
CREATE INDEX `device_workspace_idx` ON `iot_devices` (`workspaceId`);--> statement-breakpoint
CREATE INDEX `org_member_idx` ON `organization_members` (`organizationId`,`userId`);--> statement-breakpoint
CREATE INDEX `org_member_org_idx` ON `organization_members` (`organizationId`);--> statement-breakpoint
CREATE INDEX `org_member_role_idx` ON `organization_members` (`role`);--> statement-breakpoint
CREATE INDEX `org_plan_idx` ON `organizations` (`plan`);--> statement-breakpoint
CREATE INDEX `org_active_idx` ON `organizations` (`isActive`);--> statement-breakpoint
CREATE INDEX `slug` ON `organizations` (`slug`);--> statement-breakpoint
CREATE INDEX `perm_resource_action_idx` ON `permissions` (`resource`,`action`);--> statement-breakpoint
CREATE INDEX `name` ON `permissions` (`name`);--> statement-breakpoint
CREATE INDEX `access_org_idx` ON `resource_access` (`organizationId`);--> statement-breakpoint
CREATE INDEX `access_resource_idx` ON `resource_access` (`resourceType`,`resourceId`);--> statement-breakpoint
CREATE INDEX `access_user_idx` ON `resource_access` (`userId`);--> statement-breakpoint
CREATE INDEX `access_team_idx` ON `resource_access` (`teamId`);--> statement-breakpoint
CREATE INDEX `role_org_idx` ON `roles` (`organizationId`);--> statement-breakpoint
CREATE INDEX `role_name_idx` ON `roles` (`name`);--> statement-breakpoint
CREATE INDEX `team_member_idx` ON `team_members` (`teamId`,`userId`);--> statement-breakpoint
CREATE INDEX `team_member_team_idx` ON `team_members` (`teamId`);--> statement-breakpoint
CREATE INDEX `team_member_role_idx` ON `team_members` (`role`);--> statement-breakpoint
CREATE INDEX `team_workspace_idx` ON `teams` (`workspaceId`);--> statement-breakpoint
CREATE INDEX `team_org_idx` ON `teams` (`organizationId`);--> statement-breakpoint
CREATE INDEX `context_org_idx` ON `tenant_context` (`organizationId`);--> statement-breakpoint
CREATE INDEX `context_user_idx` ON `tenant_context` (`userId`);--> statement-breakpoint
CREATE INDEX `context_expires_idx` ON `tenant_context` (`expiresAt`);--> statement-breakpoint
CREATE INDEX `requestId` ON `tenant_context` (`requestId`);--> statement-breakpoint
CREATE INDEX `delivery_webhook_idx` ON `webhook_deliveries` (`webhookId`);--> statement-breakpoint
CREATE INDEX `template_category_idx` ON `workflow_templates` (`category`);--> statement-breakpoint
CREATE INDEX `version_workflow_idx` ON `workflow_versions` (`workflowId`);--> statement-breakpoint
CREATE INDEX `version_unique_idx` ON `workflow_versions` (`workflowId`,`version`);--> statement-breakpoint
CREATE INDEX `invitation_workspace_idx` ON `workspace_invitations` (`workspaceId`);--> statement-breakpoint
CREATE INDEX `invitation_email_idx` ON `workspace_invitations` (`email`);--> statement-breakpoint
CREATE INDEX `invitation_token_idx` ON `workspace_invitations` (`token`);--> statement-breakpoint
CREATE INDEX `token` ON `workspace_invitations` (`token`);--> statement-breakpoint
CREATE INDEX `workspace_user_idx` ON `workspace_members` (`workspaceId`,`userId`);--> statement-breakpoint
CREATE INDEX `workspace_owner_idx` ON `workspaces` (`ownerId`);--> statement-breakpoint
CREATE INDEX `slug` ON `workspaces` (`slug`);--> statement-breakpoint
CREATE INDEX `ws_org_idx` ON `workspaces_enhanced` (`organizationId`);--> statement-breakpoint
CREATE INDEX `ws_slug_idx` ON `workspaces_enhanced` (`organizationId`,`slug`);--> statement-breakpoint
CREATE INDEX `ws_active_idx` ON `workspaces_enhanced` (`isActive`);--> statement-breakpoint
CREATE INDEX `users_openId_unique` ON `users` (`openId`);--> statement-breakpoint
CREATE INDEX `webhooks_webhookUrl_unique` ON `webhooks` (`webhookUrl`);