import { factory } from "../init.js";
import { Command, Option, Components, Button, Embed, _guilds_$_voicestates_$, _guilds_$_scheduledevents } from "discord-hono";

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

      // オプションの内容を取得
      const game = c.var.game;
      const channel = c.var.channel;
      const title = c.var.title;

      // イベントの開始時刻
      const startTime = new Date();
      startTime.setMinutes(startTime.getMinutes() + 5);

      // イベントを作成(これは後でボイスチャンネル内のユーザーを取得するための下準備)
      const event = await c.rest('POST', _guilds_$_scheduledevents, [guildId], {
        channel_id: channel,
        name: title,
        privacy_level: 2, // ギルド内の全ユーザーが参加可能
        scheduled_start_time: startTime.toISOString(),
        entity_type: 2, // ボイスチャンネル
      });

      const eventJson = await event.json();
      const eventId = eventJson.id;

      // KVにキーをチャンネルID、バリューをイベントIDとして保存
      await c.env.KV.put(channel, eventId);

      return await c.followup('カスタムマッチ用のイベントを作成しました！');
    } catch (e) {
      console.error(e);
      return await c.followup('カスタムマッチのチャンネル設定中にエラーが発生しました');
    }
  }),
);