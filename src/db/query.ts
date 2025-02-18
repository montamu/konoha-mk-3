import { sql, and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import type { Env } from '../init';
import { game, playerResult } from './schema';

// https://orm.drizzle.team/docs/connect-cloudflare-d1

export const incrementWinCount = async (env: Env, gameId: number, discordGuildId: string, discordUserId: string) => {
  const db = drizzle(env.Bindings.DB);
  return await db
    .update(playerResult)
    .set({ wins: sql`${playerResult.wins} + 1` })
    .where(and(eq(playerResult.gameId, gameId), eq(playerResult.discordGuildId, discordGuildId), eq(playerResult.discordUserId, discordUserId)));
};

export const incrementLossCount = async (env: Env, gameId: number, discordGuildId: string, discordUserId: string) => {
  const db = drizzle(env.Bindings.DB);
  return await db
    .update(playerResult)
    .set({ losses: sql`${playerResult.losses} + 1` })
    .where(and(eq(playerResult.gameId, gameId), eq(playerResult.discordGuildId, discordGuildId), eq(playerResult.discordUserId, discordUserId)));
};

export const getActiveGames = async (env: Env) => {
  const db = drizzle(env.Bindings.DB);
  return await db
    .select()
    .from(game)
    .where(eq(game.active, true));
}