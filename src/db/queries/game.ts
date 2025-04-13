import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import type { Env } from '../../init';
import { game } from '../schema';

// https://orm.drizzle.team/docs/connect-cloudflare-d1

export const getActiveGames = async (env: Env) => {
  const db = drizzle(env.Bindings.DB);
  return await db
    .select()
    .from(game)
    .where(eq(game.active, true));
};