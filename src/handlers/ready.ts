import { factory } from "../init.js";
import { Command, Option, Embed, _channels_$_messages_$_reactions_$_me } from "discord-hono";

type Var = {
  game: string;
  channel: string;
  title: string;
}

// TODO: ゲーム選択の選択肢をDBから取得して設定する。
export const command_ready = factory.command<Var>(
  new Command('ready', 'カスタムマッチで集まるボイスチャンネルを設定します')
    .options(
      new Option('game', 'ゲーム選択', 'String')
        .required()
        .choices(
          { name: 'League of Legends', value: '1' },
          { name: 'VALORANT', value: '2' },
        ),
      new Option('channel', 'ボイスチャンネル選択', 'Channel')
        .required()
        .channel_types(2), // ボイスチャンネルのみ
      new Option('title', 'タイトル', 'String')
        .required()
        .min_length(1)
        .max_length(100),
    ),
  c => c.resDefer(async c => {
    try {
      const guildId = c.interaction.guild_id;

      if (!guildId) {
        return await c.followup('このコマンドはギルド内で実行する必要があります');
      }

      const interactionChannelId = c.interaction.channel?.id;

      if (!interactionChannelId) {
        return await c.followup('チャンネル情報が取得できませんでした');
      }

      // オプションの内容を取得
      const game = c.var.game;
      const channel = c.var.channel;
      const title = c.var.title;

      // TODO: チームをDBに保存(teamテーブルにはinteraction_id, game_id, voice_channel_idを保存)
      // TODO: チームメンバーをDBに保存(team_memberテーブルにはteam_id, user_idを保存)

      const embed = new Embed()
        .title(title)
        .description('チーム分けに参加する方は👍を押してください')
        .fields(
          { name: 'ゲーム', value: game },
        );

      // あとでチーム分けボタンを押したときに、ボタンを押した人が参加しているボイスチャンネルIDからmessage_idを取得して、
      // 該当メッセージに対して特定の絵文字👍でリアクションしているユーザーを取得することでチーム分けに参加するユーザーを特定する。

      const followupMessage = await c.followup({ embeds: [embed] });
      const messageId = (await followupMessage.json()).id;

      // ボイスチャンネルID、メッセージIDをKVに保存
      await c.env.KV_VC_MESSAGES.put(channel, messageId);
      
      // 自分が出した募集メッセージに👍でリアクションする
      return await c.rest('PUT', _channels_$_messages_$_reactions_$_me, [interactionChannelId, messageId, '👍']); 
    } catch (e) {
      console.error(e);
      return await c.followup('カスタムマッチのチャンネル設定中にエラーが発生しました');
    }
  }),
);
