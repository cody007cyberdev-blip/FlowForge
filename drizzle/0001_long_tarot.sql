CREATE TABLE `credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` varchar(100) NOT NULL,
	`encryptedData` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `credentials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `executionSteps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`executionId` int NOT NULL,
	`nodeId` varchar(255) NOT NULL,
	`nodeName` varchar(255),
	`nodeType` varchar(100) NOT NULL,
	`status` varchar(50) NOT NULL,
	`input` text,
	`output` text,
	`error` text,
	`startTime` timestamp NOT NULL DEFAULT (now()),
	`endTime` timestamp,
	`duration` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `executionSteps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `executions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workflowId` int NOT NULL,
	`status` varchar(50) NOT NULL,
	`startTime` timestamp NOT NULL DEFAULT (now()),
	`endTime` timestamp,
	`duration` int,
	`error` text,
	`triggerSource` varchar(50),
	`triggerData` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `executions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`executionId` int,
	`filename` varchar(255) NOT NULL,
	`mimeType` varchar(100),
	`fileSize` int,
	`fileKey` varchar(500) NOT NULL,
	`fileUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `webhooks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`workflowId` int NOT NULL,
	`webhookUrl` varchar(500) NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `webhooks_id` PRIMARY KEY(`id`),
	CONSTRAINT `webhooks_webhookUrl_unique` UNIQUE(`webhookUrl`)
);
--> statement-breakpoint
CREATE TABLE `workflows` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`isActive` int NOT NULL DEFAULT 0,
	`nodes` text NOT NULL,
	`edges` text NOT NULL,
	`trigger` varchar(50) NOT NULL,
	`triggerConfig` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `workflows_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `credentials` ADD CONSTRAINT `credentials_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `executionSteps` ADD CONSTRAINT `executionSteps_executionId_executions_id_fk` FOREIGN KEY (`executionId`) REFERENCES `executions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `executions` ADD CONSTRAINT `executions_workflowId_workflows_id_fk` FOREIGN KEY (`workflowId`) REFERENCES `workflows`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `files` ADD CONSTRAINT `files_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `files` ADD CONSTRAINT `files_executionId_executions_id_fk` FOREIGN KEY (`executionId`) REFERENCES `executions`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `webhooks` ADD CONSTRAINT `webhooks_workflowId_workflows_id_fk` FOREIGN KEY (`workflowId`) REFERENCES `workflows`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `workflows` ADD CONSTRAINT `workflows_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;