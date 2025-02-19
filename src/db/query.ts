import { sql, and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import type { Env } from '../init';
import { game, playerResult } from './schema';

// https://orm.drizzle.team/docs/connect-cloudflare-d1

// playerResult table query.

export const incrementWinCount = async ({
  env,
  gameId,
  discordGuildId,
  discordUserId,
  discordDisplayName,
} : {
  env: Env,
  gameId: number,
  discordGuildId: string,
  discordUserId: string,
  discordDisplayName: string,
}) => {
  const db = drizzle(env.Bindings.DB);
  return await db
    .insert(playerResult)
    .values({ gameId, discordGuildId, discordUserId, discordDisplayName, wins: 1, losses: 0, resultHistory: 'W' })
    .onConflictDoUpdate({
      target: [playerResult.gameId, playerResult.discordGuildId, playerResult.discordUserId],
      set: { wins: sql`${playerResult.wins} + 1`, resultHistory: sql`'W' || ${playerResult.resultHistory}` },
    });
};

export const incrementLossCount = async ({
  env,
  gameId,
  discordGuildId,
  discordUserId,
  discordDisplayName,
} : {
  env: Env,
  gameId: number,
  discordGuildId: string,
  discordUserId: string,
  discordDisplayName: string,
}) => {
  const db = drizzle(env.Bindings.DB);
  return await db
    .insert(playerResult)
    .values({ gameId, discordGuildId, discordUserId, discordDisplayName, wins: 0, losses: 1, resultHistory: 'L' })
    .onConflictDoUpdate({
      target: [playerResult.gameId, playerResult.discordGuildId, playerResult.discordUserId],
      set: { losses: sql`${playerResult.losses} + 1`, resultHistory: sql`'L' || ${playerResult.resultHistory}` },
    });
};

export const getPlayerResult = async ({
  env,
  gameId,
  discordGuildId,
  discordUserId,
} : {
  env: Env,
  gameId: number,
  discordGuildId: string,
  discordUserId: string,
}) => {
  const db = drizzle(env.Bindings.DB);
  return await db
    .select()
    .from(playerResult)
    .where(
      and(
        eq(playerResult.gameId, gameId),
        eq(playerResult.discordGuildId, discordGuildId),
        eq(playerResult.discordUserId, discordUserId),
    ));
};

// game table query.

export const getActiveGames = async (env: Env) => {
  const db = drizzle(env.Bindings.DB);
  return await db
    .select()
    .from(game)
    .where(eq(game.active, true));
};