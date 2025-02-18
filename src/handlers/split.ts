import type { APIUser } from "discord-api-types/v10";
import { factory } from "../init.js";
import { Command, Components, Button, Embed, _guilds_$_voicestates_$, _guilds_$_scheduledevents_$_users } from "discord-hono";

export const command_split = factory.command(
  new Command('split', 'チーム分けを開始します'),
  c => c.resDefer(async c => {
    try {
      const embed = new Embed().title('チーム分け').fields(
        { name: 'チーム1', value: 'チーム1のメンバー', inline: true },
        { name: 'チーム2', value: 'チーム2のメンバー', inline: true },
      );
      const components = new Components().row(
        component_split_confirm.component,
      );

      // ボタンを押したユーザーが参加しているボイスチャンネルのメンバーを取得
      const guildId = c.interaction.guild_id;
      const user = c.interaction.member?.user;

      if (!guildId) {
        return await c.followup('このコマンドはギルド内で実行する必要があります');
      }
      
      if (!user) {
        return await c.followup('ユーザー情報が取得できませんでした');
      }
      
      // ボイスチャンネルのIDを取得
      const voiceStateResponse = await c.rest('GET', _guilds_$_voicestates_$, [guildId, user.id]);
      const voiceState = await voiceStateResponse.json();
      console.log('voiceState: ', voiceState);

      const channelId = voiceState.channel_id;

      if (!channelId) {
        return await c.followup('ボイスチャンネルに参加している必要があります');
      }

      // テスト用
      return await c.followup({ embeds: [embed], components });
  
      // TODO: KVにセットしたチャンネルIDに紐づくイベントIDを取得する。
      // TODO: イベントに参加中のユーザー一覧を取得する。c.rest('GET', _guilds_$_scheduledevents_$_users, [guildId, eventId]);
    } catch (e) {
      console.error(e)
      return await c.followup('An error occurred while starting the team split.')
    }
  }),
);

/* ボタンを押した人が参加しているボイスチャンネルのメンバーを2チームに分ける。
  * チームメンバーの内訳を表示して、OKボタンが押されたらVCの移動を実行する。
  */
export const component_split_confirm = factory.component(
  new Button('split-confirm', ['✅', 'OK'], 'Primary'),
  c => c.resDefer(async c => {
    return await c.followup('チーム分けを開始します');
  }),
);

export const component_split_retry = factory.component(
  new Button('split-retry', ['🔄', 'Retry'], 'Secondary'),
  c => c.resDefer(async c => {
    return await c.followup('チーム分けをやり直します');
  }),
);

const splitTeams = (members: APIUser[]) => {
	// ユーザーをランダムにシャッフル
	const shuffledMembers = shuffleArray(members);

	// チームに分ける
	const team1 = shuffledMembers.slice(0, Math.floor(members.length / 2));

	const team2 = shuffledMembers.slice(Math.floor(members.length / 2));

	return { team1, team2 };
};

// ユーザーの配列をランダムにシャッフルする関数
const shuffleArray = <T>(array: T[]): T[] => {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]]; // 要素を交換
	}
	return array;
};
