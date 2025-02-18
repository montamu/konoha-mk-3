import { Command, _guilds_$_channels, _channels_$_messages } from 'discord-hono';
import { factory } from '../init.js';
import { SETUP_MESSAGE } from '../constants/setup-message.js';

export const command_setup = factory.command(
  new Command('setup', 'Setup the bot'),
  c => c.resDefer(async c => {
    try {
      const guildId = c.interaction.guild_id;

      if (!guildId) {
        return await c.followup('This command must be run in a guild.');
      }

      // テキストチャンネルを作成
      const channelResponse = await c.rest('POST', _guilds_$_channels, [guildId], {
        name: 'konoha-mk-3',
        type: 0,
      });
      const channel = await channelResponse.json();

      // メッセージを作成
      const content = SETUP_MESSAGE;

      // メッセージを送信
      await c.rest('POST', _channels_$_messages, [channel.id], {
        content,
      });
  
      return await c.followup('Setting up the command...');
    } catch (e) {
      console.error(e)
      return await c.followup('An error occurred while setting up the command.')
    }
  }),
);