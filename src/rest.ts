import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import type { APITextChannel } from 'discord-api-types/v10';

export const createTextChannel = async (DISCORD_TOKEN: string, guildId: string, name: string) => {
  const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

  const channel = await rest.post(Routes.guildChannels(guildId), {
    body: {
      name,
      type: 0,
    },
  }) as APITextChannel;

  return channel;
}