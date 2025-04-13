import { drizzle } from 'drizzle-orm/d1';
import { match } from '../schema';
import { eq, and, count } from 'drizzle-orm';

export const createMatch = async (d1: D1Database, gameId: number, discordGuildId: string, discordVoiceChannelId: string) => {
  const db = drizzle(d1);
  const insertedMatch = await db
    .insert(match)
    .values({
      status: 'pending',
      gameId,
      discordGuildId,
      discordVoiceChannelId,
      createdAt: new Date().toISOString(),
    })
    .returning({ id: match.id});
  return insertedMatch[0];
};

export const getPendingMatchCount = async (d1: D1Database, discordGuildId: string, discordVoiceChannelId: string) => {
  const db = drizzle(d1);
  return await db
    .select({ value: count() })
    .from(match)
    .where(
      and(
        eq(match.discordGuildId, discordGuildId),
        eq(match.discordVoiceChannelId, discordVoiceChannelId),
        eq(match.status, 'pending')
      )
    );
}