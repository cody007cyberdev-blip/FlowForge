-- Create workspaces table for multi-tenant support
CREATE TABLE `workspaces` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `ownerId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL UNIQUE,
  `description` text,
  `icon` varchar(255),
  `isActive` boolean DEFAULT true NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `workspace_owner_idx` (`ownerId`),
  FOREIGN KEY (`ownerId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Create workspace members table for RBAC
CREATE TABLE `workspace_members` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `workspaceId` int NOT NULL,
  `userId` int NOT NULL,
  `role` enum('owner', 'admin', 'editor', 'viewer') DEFAULT 'editor' NOT NULL,
  `joinedAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  UNIQUE INDEX `workspace_user_idx` (`workspaceId`, `userId`),
  FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

-- Create API keys table
CREATE TABLE `api_keys` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `workspaceId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `key` varchar(255) NOT NULL UNIQUE,
  `secret` text NOT NULL,
  `permissions` text NOT NULL,
  `lastUsedAt` timestamp,
  `expiresAt` timestamp,
  `isActive` boolean DEFAULT true NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `apikey_workspace_idx` (`workspaceId`),
  FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE
);

-- Alter workflows table to add workspaceId and currentVersion
ALTER TABLE `workflows` 
ADD COLUMN `workspaceId` int NOT NULL AFTER `id`,
ADD COLUMN `currentVersion` int DEFAULT 1 NOT NULL AFTER `triggerConfig`,
MODIFY COLUMN `isActive` boolean DEFAULT false NOT NULL,
ADD INDEX `workflow_workspace_idx` (`workspaceId`),
ADD FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE;

-- Create workflow versions table
CREATE TABLE `workflow_versions` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `workflowId` int NOT NULL,
  `version` int NOT NULL,
  `nodes` text NOT NULL,
  `edges` text NOT NULL,
  `changeLog` text,
  `createdBy` int NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `version_workflow_idx` (`workflowId`),
  UNIQUE INDEX `version_unique_idx` (`workflowId`, `version`),
  FOREIGN KEY (`workflowId`) REFERENCES `workflows`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`)
);

-- Alter executions table to add workspaceId and modify columns
ALTER TABLE `executions`
ADD COLUMN `workspaceId` int NOT NULL AFTER `workflowId`,
MODIFY COLUMN `status` enum('pending', 'running', 'success', 'failed', 'cancelled') DEFAULT 'pending' NOT NULL,
ADD COLUMN `startedAt` timestamp,
ADD COLUMN `completedAt` timestamp,
ADD COLUMN `duration` int,
MODIFY COLUMN `error` text,
ADD COLUMN `input` text,
MODIFY COLUMN `output` text,
ADD INDEX `execution_workspace_idx` (`workspaceId`),
ADD INDEX `execution_status_idx` (`status`),
ADD FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE;

-- Alter execution_steps table to add missing columns
ALTER TABLE `execution_steps`
ADD COLUMN `input` text AFTER `nodeType`,
MODIFY COLUMN `status` enum('pending', 'running', 'success', 'failed', 'skipped') DEFAULT 'pending' NOT NULL,
ADD COLUMN `startedAt` timestamp AFTER `duration`,
ADD COLUMN `completedAt` timestamp AFTER `startedAt`;

-- Create webhook deliveries table
CREATE TABLE `webhook_deliveries` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `webhookId` int NOT NULL,
  `payload` text NOT NULL,
  `statusCode` int,
  `response` text,
  `error` text,
  `retryCount` int DEFAULT 0 NOT NULL,
  `nextRetryAt` timestamp,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `delivery_webhook_idx` (`webhookId`),
  FOREIGN KEY (`webhookId`) REFERENCES `webhooks`(`id`) ON DELETE CASCADE
);

-- Alter webhooks table to add workspaceId
ALTER TABLE `webhooks`
ADD COLUMN `workspaceId` int NOT NULL AFTER `workflowId`,
MODIFY COLUMN `method` varchar(10) DEFAULT 'POST' NOT NULL,
ADD COLUMN `secret` varchar(255),
MODIFY COLUMN `isActive` boolean DEFAULT true NOT NULL,
ADD INDEX `webhook_workspace_idx` (`workspaceId`),
ADD FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE;

-- Alter files table to add workspaceId
ALTER TABLE `files`
ADD COLUMN `workspaceId` int NOT NULL AFTER `id`,
ADD INDEX `file_workspace_idx` (`workspaceId`),
ADD FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE;

-- Alter credentials table to add workspaceId
ALTER TABLE `credentials`
ADD COLUMN `workspaceId` int NOT NULL AFTER `id`,
MODIFY COLUMN `isActive` boolean DEFAULT true NOT NULL,
ADD INDEX `credential_workspace_idx` (`workspaceId`),
ADD FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE;

-- Create audit logs table
CREATE TABLE `audit_logs` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `workspaceId` int NOT NULL,
  `userId` int NOT NULL,
  `action` varchar(100) NOT NULL,
  `resourceType` varchar(100) NOT NULL,
  `resourceId` int,
  `details` text,
  `ipAddress` varchar(45),
  `userAgent` text,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `audit_workspace_idx` (`workspaceId`),
  INDEX `audit_user_idx` (`userId`),
  INDEX `audit_action_idx` (`action`),
  FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
);

-- Create workflow templates table
CREATE TABLE `workflow_templates` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `description` text,
  `category` varchar(100) NOT NULL,
  `nodes` text NOT NULL,
  `edges` text NOT NULL,
  `thumbnail` varchar(255),
  `downloads` int DEFAULT 0 NOT NULL,
  `rating` decimal(3,2) DEFAULT 0,
  `isPublic` boolean DEFAULT true NOT NULL,
  `createdBy` int NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  INDEX `template_category_idx` (`category`),
  FOREIGN KEY (`createdBy`) REFERENCES `users`(`id`)
);

-- Create IoT devices table
CREATE TABLE `iot_devices` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `workspaceId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(100) NOT NULL,
  `config` text NOT NULL,
  `status` enum('online', 'offline', 'error') DEFAULT 'offline' NOT NULL,
  `lastSeen` timestamp,
  `isActive` boolean DEFAULT true NOT NULL,
  `createdAt` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updatedAt` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  INDEX `device_workspace_idx` (`workspaceId`),
  FOREIGN KEY (`workspaceId`) REFERENCES `workspaces`(`id`) ON DELETE CASCADE
);
