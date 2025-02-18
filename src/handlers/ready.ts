import { factory } from "../init.js";
import { Command, Option, Components, Button, Embed, _guilds_$_voicestates_$, _guilds_$_scheduledevents_$_users } from "discord-hono";

// TODO: ゲーム選択の選択肢をDBから取得して設定する。
export const command_ready = factory.command(
  new Command('ready', 'カスタムマッチで集まるチャンネルを設定します')
    .options(
      new Option('game', 'ゲーム選択', 'String')
        .required()
        .choices(),
      new Option('channel', 'チャンネル選択', 'Channel')
        .required()
        .channel_types(2), // ボイスチャンネルのみ
      new Option('title', 'タイトル', 'String')
        .required()
        .min_length(1)
        .max_length(100),
    ),
  c => c.resDefer(async c => {
    try {
      
    } catch (e) {
      console.error(e);
      return await c.followup('カスタムマッチのチャンネル設定中にエラーが発生しました');
    }
  }),
);