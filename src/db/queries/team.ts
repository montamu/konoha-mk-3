import { drizzle } from 'drizzle-orm/d1';
import { team } from '../schema';

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
