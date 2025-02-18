import { int, sqliteTable, unique, text } from 'drizzle-orm/sqlite-core';

export const game = sqliteTable('game', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  active: int({ mode: 'boolean' }).notNull().default(true),
});

export const playerResult = sqliteTable('player_result', {
  id: int().primaryKey({ autoIncrement: true }),
  gameId: int().notNull().references(() => game.id),
  discordGuildId: text().notNull(),
  discordUserId: text().notNull(),
  discordDisplayName: text().notNull(),
  wins: int().notNull(),
  losses: int().notNull(),
  resultHistory: text().notNull(),
}, (t) => [
  unique().on(t.gameId, t.discordGuildId, t.discordUserId),
]);
