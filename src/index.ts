import { _channels_$_messages, Button, Components, DiscordHono } from 'discord-hono'
import { createRest, createTextChannel } from './rest';
// import type { CommandContext } from 'discord-hono'

// "konoha-mk-3"という名前のテキストチャンネルを作成し、そこでボット操作用ボタンと説明文を表示する。

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
        new Button('https://discord-hono.luis.fun', ['📑', 'Docs'], 'Link'),
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
    
      // RESTクライアントを作成
      const rest = createRest(c.env.DISCORD_TOKEN);

      // テキストチャンネルを作成
      const channel = await createTextChannel(rest, guildId, 'konoha-mk-3');
      console.log('channel: ', channel);

      // メッセージを作成
      const content = 'Hello, world!';
      const components = new Components().row(
        new Button('split-start', ['🔀', 'チーム分け'], 'Primary'),
      ).toJSON();

      // TODO: チーム分けの決定は過半数のメンバーがOKを押すと行われる
      // TODO: c.restを使う。使わないと@discordjs/buildersを使うことになるので、依存関係が増えてしまう。
      // https://discord-hono.luis.fun/ja/interactions/rest/

      const message = await c.rest.post(_channels_$_messages, [channel.id], {
        content,
        components,
      });
      console.log('message: ', message);
  
      return await c.followup('Setting up the command...');
    } catch (e) {
      console.error(e)
      return await c.followup('An error occurred while setting up the command.')
    }
  }))
  .component('delete-self', c => c.resDeferUpdate(c.followupDelete))

export default app