CREATE TABLE `match` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`gameId` integer NOT NULL,
	`discordGuildId` text NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`startedAt` text,
	`endedAt` text,
	FOREIGN KEY (`gameId`) REFERENCES `game`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `match_result` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`matchId` integer NOT NULL,
	`winnerTeamId` integer NOT NULL,
	`loserTeamId` integer NOT NULL,
	FOREIGN KEY (`matchId`) REFERENCES `match`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`winnerTeamId`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`loserTeamId`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `match_result_matchId_unique` ON `match_result` (`matchId`);--> statement-breakpoint
CREATE TABLE `team` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`matchId` integer NOT NULL,
	`number` integer NOT NULL,
	`createdAt` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`matchId`) REFERENCES `match`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `team_matchId_number_unique` ON `team` (`matchId`,`number`);--> statement-breakpoint
CREATE TABLE `team_member` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`teamId` integer NOT NULL,
	`discordUserId` text NOT NULL,
	`discordDisplayName` text NOT NULL,
	FOREIGN KEY (`teamId`) REFERENCES `team`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `team_member_teamId_discordUserId_unique` ON `team_member` (`teamId`,`discordUserId`);