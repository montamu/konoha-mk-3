import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/d1';
import { team, match, teamMember } from '../schema';

export type Member = {
  teamId: number;
  discordUserId: string;
  discordDisplayName: string;
}

export const createTeamMembers = async (d1: D1Database, members: Member[]) => {
  const db = drizzle(d1);
  return await db
    .insert(teamMember)
    .values(members);
};

export const getTeamMembers = async (d1: D1Database, discordVoiceChannelId: string) => {
  const db = drizzle(d1);
  return await db
    .select({
      teamNumber: team.number,
      discordUserId: teamMember.discordUserId,
      discordDisplayName: teamMember.discordDisplayName,
    })
    .from(teamMember)
    .innerJoin(team, eq(team.id, teamMember.teamId))
    .innerJoin(match, eq(match.id, team.matchId))
    .where(eq(match.discordVoiceChannelId, discordVoiceChannelId));
};