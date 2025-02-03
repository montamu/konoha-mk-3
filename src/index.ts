import { Button, Components, DiscordHono } from 'discord-hono'
import { createTextChannel } from './rest';
// import type { CommandContext } from 'discord-hono'

// "konoha-mk-3"という名前のテキストチャンネルを作成し、そこでボット操作用ボタンと説明文を表示する。
// const setup = async (c: CommandContext) => ();

type Env = {
  Bindings: {
    DISCORD_TOKEN: string
  }
}

const app = new DiscordHono<Env>()
  .command('hello', c => c.res('world!'))
  .command('help', c =>
    c.res({
      // content: `text: ${c.var.text}`,
      components: new Components().row(
        new Button('https://discord-hono.luis.fun', ["📑", 'Docs'], 'Link'),
        new Button('delete-self', ['🗑️', 'Delete'], 'Secondary'),
      ),
    }),
  )
  .command('setup', c => c.resDefer(async c => {
    try {
      const guildId = c.interaction.guild_id;

      if (!guildId) {
        return await c.followup('This command must be run in a guild.');
      }
    
      // テキストチャンネルを作成
      const channel = await createTextChannel(c.env.DISCORD_TOKEN, guildId, 'konoha-mk-3');
      console.log('channel: ', channel);
  
      return await c.followup('Setting up the command...');
    } catch (e) {
      console.error(e)
      return await c.followup('An error occurred while setting up the command.')
    }
  }))
  .component('delete-self', c => c.resDeferUpdate(c.followupDelete))

export default app