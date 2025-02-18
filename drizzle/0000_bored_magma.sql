CREATE TABLE `game` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `player_result` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`gameId` integer NOT NULL,
	`discordGuildId` text NOT NULL,
	`discordUserId` text NOT NULL,
	`discordDisplayName` text NOT NULL,
	`wins` integer NOT NULL,
	`losses` integer NOT NULL,
	`resultHistory` text NOT NULL,
	FOREIGN KEY (`gameId`) REFERENCES `game`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `player_result_gameId_discordGuildId_discordUserId_unique` ON `player_result` (`gameId`,`discordGuildId`,`discordUserId`);