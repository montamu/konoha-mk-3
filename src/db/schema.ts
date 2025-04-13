import { int, sqliteTable, unique, text } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

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

export const match = sqliteTable('match', {
  id: int().primaryKey({ autoIncrement: true }),
  status: text().notNull().default('pending'), // pending: 待機中, ongoing: 進行中, finished: 終了
  gameId: int().notNull().references(() => game.id),
  discordGuildId: text().notNull(),
  discordVoiceChannelId: text().notNull(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`), // sqlite(d1)には日付型がないのでtext型で保存する
  startedAt: text(),
  endedAt: text(),
});

export const team = sqliteTable('team', {
  id: int().primaryKey({ autoIncrement: true }),
  matchId: int().notNull().references(() => match.id),
  number: int().notNull(),
  createdAt: text().notNull().default(sql`CURRENT_TIMESTAMP`), // sqlite(d1)には日付型がないのでtext型で保存する
}, (t) => [
  unique().on(t.matchId, t.number),
]);

export const teamMember = sqliteTable('team_member', {
  id: int().primaryKey({ autoIncrement: true }),
  teamId: int().notNull().references(() => team.id),
  discordUserId: text().notNull(),
  discordDisplayName: text().notNull(),
}, (t) => [
  unique().on(t.teamId, t.discordUserId),
]);

export const matchResult = sqliteTable('match_result', {
  id: int().primaryKey({ autoIncrement: true }),
  matchId: int().notNull().references(() => match.id),
  winnerTeamId: int().notNull().references(() => team.id),
  loserTeamId: int().notNull().references(() => team.id)
}, (t) => [
  unique().on(t.matchId),
]);

