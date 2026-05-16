-- FASE 1: Enterprise Multi-Tenant Schema Migration
-- Hierarchy: Organization → Workspace → Team → User
-- Created: 2026-05-13

-- ============================================================================
-- ORGANIZATIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `organizations` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL UNIQUE,
  `description` text,
  `logo` varchar(255),
  `website` varchar(255),
  
  -- Billing & subscription
  `plan` enum('free', 'pro', 'business', 'enterprise') NOT NULL DEFAULT 'free',
  `maxWorkspaces` int NOT NULL DEFAULT 5,
  `maxTeamsPerWorkspace` int NOT NULL DEFAULT 10,
  `maxUsersPerTeam` int NOT NULL DEFAULT 50,
  `maxWorkflowsPerWorkspace` int NOT NULL DEFAULT 100,
  `maxExecutionsPerMonth` int NOT NULL DEFAULT 10000,
  
  -- Billing info
  `stripeCustomerId` varchar(255),
  `stripeSubscriptionId` varchar(255),
  `billingEmail` varchar(320),
  
  -- Status
  `isActive` boolean NOT NULL DEFAULT true,
  `isSuspended` boolean NOT NULL DEFAULT false,
  `suspendReason` text,
  
  -- Timestamps
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX `org_plan_idx` (`plan`),
  INDEX `org_active_idx` (`isActive`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- ORGANIZATION MEMBERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `organization_members` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `organizationId` int NOT NULL,
  `userId` int NOT NULL,
  
  -- Global org role
  `role` enum('owner', 'admin', 'member') NOT NULL DEFAULT 'member',
  
  -- Permissions (JSON array for granular control)
  `permissions` text NOT NULL DEFAULT '[]',
  
  -- Status
  `isActive` boolean NOT NULL DEFAULT true,
  `invitedAt` timestamp,
  `joinedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Timestamps
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY `org_member_idx` (`organizationId`, `userId`),
  KEY `org_member_org_idx` (`organizationId`),
  KEY `org_member_role_idx` (`role`),
  CONSTRAINT `fk_org_member_org` FOREIGN KEY (`organizationId`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- WORKSPACES ENHANCED TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `workspaces_enhanced` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `organizationId` int NOT NULL,
  `ownerId` int NOT NULL,
  
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text,
  `icon` varchar(255),
  
  -- Workspace settings
  `isPublic` boolean NOT NULL DEFAULT false,
  `requiresApproval` boolean NOT NULL DEFAULT false,
  
  -- Quotas
  `maxTeams` int NOT NULL DEFAULT 10,
  `maxWorkflows` int NOT NULL DEFAULT 100,
  
  -- Status
  `isActive` boolean NOT NULL DEFAULT true,
  
  -- Timestamps
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  KEY `ws_org_idx` (`organizationId`),
  UNIQUE KEY `ws_slug_idx` (`organizationId`, `slug`),
  KEY `ws_active_idx` (`isActive`),
  CONSTRAINT `fk_ws_org` FOREIGN KEY (`organizationId`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TEAMS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `teams` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `workspaceId` int NOT NULL,
  `organizationId` int NOT NULL,
  
  `name` varchar(255) NOT NULL,
  `description` text,
  `icon` varchar(255),
  
  -- Team settings
  `isPublic` boolean NOT NULL DEFAULT false,
  
  -- Timestamps
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  KEY `team_workspace_idx` (`workspaceId`),
  KEY `team_org_idx` (`organizationId`),
  CONSTRAINT `fk_team_workspace` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces_enhanced` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_team_org` FOREIGN KEY (`organizationId`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TEAM MEMBERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `team_members` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `teamId` int NOT NULL,
  `userId` int NOT NULL,
  
  -- Team role
  `role` enum('lead', 'member', 'viewer') NOT NULL DEFAULT 'member',
  
  -- Permissions specific to this team
  `permissions` text NOT NULL DEFAULT '[]',
  
  -- Status
  `isActive` boolean NOT NULL DEFAULT true,
  `joinedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Timestamps
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY `team_member_idx` (`teamId`, `userId`),
  KEY `team_member_team_idx` (`teamId`),
  KEY `team_member_role_idx` (`role`),
  CONSTRAINT `fk_team_member_team` FOREIGN KEY (`teamId`) REFERENCES `teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- PERMISSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(100) NOT NULL UNIQUE,
  `description` text,
  `resource` varchar(100) NOT NULL,
  `action` varchar(100) NOT NULL,
  
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE KEY `perm_resource_action_idx` (`resource`, `action`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- ROLES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `organizationId` int,
  
  `name` varchar(100) NOT NULL,
  `description` text,
  
  -- Permissions (JSON array of permission IDs)
  `permissionIds` text NOT NULL DEFAULT '[]',
  
  -- System roles cannot be deleted
  `isSystem` boolean NOT NULL DEFAULT false,
  
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  KEY `role_org_idx` (`organizationId`),
  KEY `role_name_idx` (`name`),
  CONSTRAINT `fk_role_org` FOREIGN KEY (`organizationId`) REFERENCES `organizations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- RESOURCE ACCESS TABLE (Fine-grained access control)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `resource_access` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `organizationId` int NOT NULL,
  `workspaceId` int,
  `teamId` int,
  
  `resourceType` varchar(100) NOT NULL,
  `resourceId` int NOT NULL,
  
  -- Who has access
  `userId` int,
  `teamId2` int,
  
  -- What they can do
  `permissions` text NOT NULL,
  
  -- Timestamps
  `grantedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expiresAt` timestamp,
  
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  KEY `access_org_idx` (`organizationId`),
  KEY `access_resource_idx` (`resourceType`, `resourceId`),
  KEY `access_user_idx` (`userId`),
  KEY `access_team_idx` (`teamId`),
  CONSTRAINT `fk_access_org` FOREIGN KEY (`organizationId`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_access_workspace` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces_enhanced` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_access_team` FOREIGN KEY (`teamId`) REFERENCES `teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- AUDIT LOGS ENHANCED TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS `audit_logs_enhanced` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `organizationId` int NOT NULL,
  `workspaceId` int,
  `teamId` int,
  `userId` int NOT NULL,
  
  `action` varchar(100) NOT NULL,
  `resourceType` varchar(100) NOT NULL,
  `resourceId` int,
  `resourceName` varchar(255),
  
  -- Change tracking
  `oldValue` text,
  `newValue` text,
  
  -- Request context
  `ipAddress` varchar(45),
  `userAgent` text,
  
  -- Status
  `status` enum('success', 'failure') NOT NULL DEFAULT 'success',
  `errorMessage` text,
  
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  KEY `audit_org_idx` (`organizationId`),
  KEY `audit_user_idx` (`userId`),
  KEY `audit_action_idx` (`action`),
  KEY `audit_resource_idx` (`resourceType`, `resourceId`),
  KEY `audit_created_idx` (`createdAt`),
  CONSTRAINT `fk_audit_org` FOREIGN KEY (`organizationId`) REFERENCES `organizations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_audit_workspace` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces_enhanced` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_audit_team` FOREIGN KEY (`teamId`) REFERENCES `teams` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TENANT CONTEXT TABLE (For row-level security)
-- ============================================================================
CREATE TABLE IF NOT EXISTS `tenant_context` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `organizationId` int NOT NULL,
  `workspaceId` int,
  `teamId` int,
  `userId` int NOT NULL,
  
  -- Request tracking
  `requestId` varchar(255) NOT NULL UNIQUE,
  `sessionId` varchar(255),
  
  -- Timestamps
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expiresAt` timestamp NOT NULL,
  
  KEY `context_org_idx` (`organizationId`),
  KEY `context_user_idx` (`userId`),
  KEY `context_expires_idx` (`expiresAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- INSERT DEFAULT PERMISSIONS
-- ============================================================================
INSERT INTO `permissions` (`name`, `resource`, `action`, `description`) VALUES
-- Workflow permissions
('workflow.create', 'workflow', 'create', 'Create new workflows'),
('workflow.read', 'workflow', 'read', 'View workflows'),
('workflow.update', 'workflow', 'update', 'Edit workflows'),
('workflow.delete', 'workflow', 'delete', 'Delete workflows'),
('workflow.execute', 'workflow', 'execute', 'Execute workflows'),
('workflow.share', 'workflow', 'share', 'Share workflows with others'),

-- Credential permissions
('credential.create', 'credential', 'create', 'Create credentials'),
('credential.read', 'credential', 'read', 'View credentials'),
('credential.update', 'credential', 'update', 'Edit credentials'),
('credential.delete', 'credential', 'delete', 'Delete credentials'),

-- Team permissions
('team.create', 'team', 'create', 'Create teams'),
('team.read', 'team', 'read', 'View teams'),
('team.update', 'team', 'update', 'Edit teams'),
('team.delete', 'team', 'delete', 'Delete teams'),
('team.manage_members', 'team', 'manage_members', 'Manage team members'),

-- Workspace permissions
('workspace.create', 'workspace', 'create', 'Create workspaces'),
('workspace.read', 'workspace', 'read', 'View workspaces'),
('workspace.update', 'workspace', 'update', 'Edit workspaces'),
('workspace.delete', 'workspace', 'delete', 'Delete workspaces'),
('workspace.manage_members', 'workspace', 'manage_members', 'Manage workspace members'),

-- Organization permissions
('organization.read', 'organization', 'read', 'View organization'),
('organization.update', 'organization', 'update', 'Edit organization'),
('organization.manage_members', 'organization', 'manage_members', 'Manage organization members'),
('organization.billing', 'organization', 'billing', 'Manage billing'),

-- Audit log permissions
('audit.read', 'audit', 'read', 'View audit logs'),

-- API key permissions
('apikey.create', 'apikey', 'create', 'Create API keys'),
('apikey.read', 'apikey', 'read', 'View API keys'),
('apikey.delete', 'apikey', 'delete', 'Delete API keys')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- ============================================================================
-- INSERT DEFAULT SYSTEM ROLES
-- ============================================================================
INSERT INTO `roles` (`name`, `description`, `isSystem`, `permissionIds`) VALUES
('Owner', 'Full access to organization', true, '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31]'),
('Admin', 'Administrative access', true, '[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,22,23,26,27,28,30]'),
('Editor', 'Can create and edit workflows', true, '[1,2,3,5,6,7,8,9,11,12,13,16,17,18,26,30]'),
('Viewer', 'Read-only access', true, '[2,8,12,16,21,25]')
ON DUPLICATE KEY UPDATE `description` = VALUES(`description`);

-- ============================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_org_members_user ON `organization_members` (`userId`);
CREATE INDEX idx_team_members_user ON `team_members` (`userId`);
CREATE INDEX idx_resource_access_user ON `resource_access` (`userId`);
CREATE INDEX idx_audit_logs_timestamp ON `audit_logs_enhanced` (`createdAt` DESC);
CREATE INDEX idx_tenant_context_user_org ON `tenant_context` (`userId`, `organizationId`);

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- This migration creates the enterprise multi-tenant schema foundation
-- Next: Implement tenant context middleware and Row-Level Security
