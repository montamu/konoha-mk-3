import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v10';
import type { APITextChannel } from 'discord-api-types/v10';

export const createRest = (DISCORD_TOKEN: string) => {
  return new REST({ version: '10' }).setToken(DISCORD_TOKEN);
};

export const createTextChannel = async (rest: REST, guildId: string, name: string) => {
  const channel = await rest.post(Routes.guildChannels(guildId), {
    body: {
      name,
      type: 0,
    },
  }) as APITextChannel;

  return channel;
};