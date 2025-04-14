import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { team, match } from '../schema';

export const createTeam = async (d1: D1Database, matchId: number, number: number) => {
  const db = drizzle(d1);
  const insertedTeam = await db
    .insert(team)
    .values({
      matchId,
      number,
      createdAt: new Date().toISOString(),
    })
    .returning({ id: team.id });
  return insertedTeam[0];
};

export const getTeams = async (d1: D1Database, discordVoiceChannelId: string) => {
  const db = drizzle(d1);
  return await db
    .select({
      teamId: team.id,
      teamNumber: team.number,
    })
    .from(team)
    .innerJoin(match, eq(match.id, team.matchId))
    .where(eq(match.discordVoiceChannelId, discordVoiceChannelId));
}