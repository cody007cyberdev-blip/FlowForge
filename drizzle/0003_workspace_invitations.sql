CREATE TABLE `workspace_invitations` (
  `id` int NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `workspaceId` int NOT NULL,
  `invitedBy` int NOT NULL,
  `email` varchar(320) NOT NULL,
  `role` enum('owner','admin','editor','viewer') NOT NULL DEFAULT 'editor',
  `token` varchar(255) NOT NULL UNIQUE,
  `expiresAt` timestamp NOT NULL,
  `acceptedAt` timestamp,
  `acceptedBy` int,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `workspace_invitations_workspaceId_workspaces_id_fk` FOREIGN KEY (`workspaceId`) REFERENCES `workspaces` (`id`) ON DELETE CASCADE,
  CONSTRAINT `workspace_invitations_invitedBy_users_id_fk` FOREIGN KEY (`invitedBy`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `workspace_invitations_acceptedBy_users_id_fk` FOREIGN KEY (`acceptedBy`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  INDEX `invitation_workspace_idx` (`workspaceId`),
  INDEX `invitation_email_idx` (`email`),
  INDEX `invitation_token_idx` (`token`)
);
