import { Command, _guilds_$_channels, _channels_$_messages, Components, Button } from 'discord-hono';
import { factory } from '../init.js';
import type { APITextChannel } from 'discord-api-types/v10';

export const command_setup = factory.command(
  new Command('setup', 'Setup the bot'),
  c => c.resDefer(async c => {
    try {
      const guildId = c.interaction.guild_id;

      if (!guildId) {
        return await c.followup('This command must be run in a guild.');
      }

      // テキストチャンネルを作成
      const channelResponse = await c.rest.post(_guilds_$_channels, [guildId], {
        name: 'konoha-mk-3',
        type: 0,
      });
      const channel: APITextChannel = await channelResponse.json();

      // メッセージを作成
      const content = 'Hello, world!';
      const components = new Components().row(
        new Button('split-start', ['🔀', 'チーム分け'], 'Primary'),
      ).toJSON();

      // メッセージを送信
      await c.rest.post(_channels_$_messages, [channel.id], {
        content,
        components,
      });
  
      return await c.followup('Setting up the command...');
    } catch (e) {
      console.error(e)
      return await c.followup('An error occurred while setting up the command.')
    }
  }),);