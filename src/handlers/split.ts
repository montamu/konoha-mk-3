import type { APIUser } from "discord-api-types/v10";
import { factory } from "../init.js";
import { Command, Components, Button, Embed, _guilds_$_voicestates_$, _channels_$_messages_$, _channels_$_messages_$_reactions_$, _guilds_$_channels, _guilds_$_members_$ } from "discord-hono";
import { type Member, createTeamMembers, getTeamMembers } from "../db/queries/teamMember.js";
import { getTeams } from "../db/queries/team.js";

export const command_split = factory.command(
  new Command('split', 'チーム分けを開始します'),
  c => c.resDefer(async c => {
    try {
      const guildId = c.interaction.guild_id;
      const user = c.interaction.member?.user;

      if (!guildId) {
        return await c.followup('このコマンドはギルド内で実行する必要があります');
      }
      
      if (!user) {
        return await c.followup('ユーザー情報が取得できませんでした');
      }
      
      // コマンドを実行したユーザーが現在入室中のボイスチャンネルのIDを取得
      const voiceStateResponse = await c.rest('GET', _guilds_$_voicestates_$, [guildId, user.id]);
      const voiceState = await voiceStateResponse.json();

      const voiceChannelId = voiceState.channel_id;

      if (!voiceChannelId) {
        return await c.followup('ボイスチャンネルに参加している必要があります');
      }
      
      // KVから募集メッセージのIDを取得
      const messageId = await c.env.KV_VC_MESSAGES.get(voiceChannelId);

      if (!messageId) {
        return await c.followup('募集メッセージが見つかりませんでした。/readyコマンドを実行して募集メッセージを作成してください。');
      }

      const textChannelId = c.interaction.channel?.id;

      if (!textChannelId) {
        return await c.followup('テキストチャンネルの情報が取得できませんでした');
      }

      const encodedReaction = encodeURIComponent('👍');

      // 募集メッセージにリアクションしたユーザーを取得
      // TODO: なぜかレスポンスが空なので原因を詳しく調べる
      const ReactionUsersResponse = await c.rest('GET', _channels_$_messages_$_reactions_$, [textChannelId, messageId, encodedReaction]);
      const ReactionUsers = await ReactionUsersResponse.json();
      
      // RESTGetAPIChannelMessageReactionUsersResultとAPIUser[]は同じ型
      const users: APIUser[] = ReactionUsers;

      if (users.length === 0) {
        return await c.followup('リアクションしたユーザーがいません。/readyコマンドを実行して募集メッセージを作成してください。');
      }

      // チーム分け
      const { team1, team2 } = splitTeams(users);

      // readyコマンドであらかじめ作成した空のチームを取得
      const teams = await getTeams(c.env.DB, voiceChannelId);

      if (teams.length === 0) {
        return await c.followup('チームが見つかりませんでした。');
      }

      const firstTeamId = teams.filter(team => team.teamNumber === 1)[0].teamId;
      const secondTeamId = teams.filter(team => team.teamNumber === 2)[0].teamId;

      // チーム情報をOKボタンから呼び出すためにDBに保存
      const team1Members: Member[] = team1.map(user => ({
        teamId: firstTeamId,
        discordUserId: user.id,
        discordDisplayName: user.global_name ?? '',
      }));
      const team2Members: Member[] = team2.map(user => ({
        teamId: secondTeamId,
        discordUserId: user.id,
        discordDisplayName: user.global_name ?? '',
      }));
      await createTeamMembers(c.env.DB, [...team1Members, ...team2Members]);

      // 表示するEmbedとボタンを作成
      const embed = new Embed().title('チーム分け').fields(
        { name: 'チーム1', value: team1.map(user => user.global_name).join(', ') },
        { name: 'チーム2', value: team2.map(user => user.global_name).join(', ') },
      );

      const components = new Components().row(
        component_split_confirm.component,
        component_split_retry.component,
      );

      // チーム分け候補、OKボタン、リトライボタンを表示
      return await c.followup({ embeds: [embed], components });
    } catch (e) {
      console.error('/split error', e);
      return await c.followup('エラーが発生しました。しばらくしてから再度実行してください。');
    }
  }),
);

/* ボタンを押した人が参加しているボイスチャンネルのメンバーを2チームに分ける。
  * チームメンバーの内訳を表示して、OKボタンが押されたらVCの移動を実行する。
  */
export const component_split_confirm = factory.component(
  new Button('split-confirm', ['✅', 'OK'], 'Primary'),
  c => c.resDefer(async c => {
    const guildId = c.interaction.guild_id;
    const user = c.interaction.member?.user;

    if (!guildId) {
      return await c.followup('このコマンドはギルド内で実行する必要があります');
    }
    
    if (!user) {
      return await c.followup('ユーザー情報が取得できませんでした');
    }
    
    // コマンドを実行したユーザーが現在入室中のボイスチャンネルのIDを取得
    const voiceStateResponse = await c.rest('GET', _guilds_$_voicestates_$, [guildId, user.id]);
    const voiceState = await voiceStateResponse.json();

    const voiceChannelId = voiceState.channel_id;

    if (!voiceChannelId) {
      return await c.followup('ボイスチャンネルに参加している必要があります');
    }

    // チーム用のボイスチャンネルを2つ作成する
    const team1ChannelResponse = await c.rest('POST', _guilds_$_channels, [guildId], {
      name: 'チーム1',
      type: 2, // ボイスチャンネル
    })
    const team1Channel = await team1ChannelResponse.json();

    const team2ChannelResponse = await c.rest('POST', _guilds_$_channels, [guildId], {
      name: 'チーム2',
      type: 2, // ボイスチャンネル
    })
    const team2Channel = await team2ChannelResponse.json();

    // チーム1とチーム2のチームメンバーを取得する
    const teamMembers = await getTeamMembers(c.env.DB, voiceChannelId);
    if (teamMembers.length === 0) {
      return await c.followup('チームメンバーが見つかりませんでした。もう一度/splitコマンドを実行してください。');
    }

    // TODO: チーム1とチーム2にユーザーを移動する
    for (const member of teamMembers) {
      const userId = member.discordUserId;
      const teamNumber = member.teamNumber;
      const channelId = teamNumber === 1 ? team1Channel.id : team2Channel.id;

      // ユーザーをボイスチャンネルに移動
      await c.rest('PATCH', _guilds_$_members_$, [guildId, userId], {
        channel_id: channelId,
      });
    }

    return await c.followup('チーム分けを開始します');
  }),
);

export const component_split_retry = factory.component(
  new Button('split-retry', ['🔄', 'Retry'], 'Secondary'),
  /* c => c.resDeferUpdate(async c => {
    return await c.followup('チーム分けをやり直します');
  }), */
  c => {
    const embed = new Embed().title('チーム分け').fields(
      { name: 'チーム1', value: 'user1' },
      { name: 'チーム2', value: 'user2' },
    );

    return c.resUpdate({ embeds: [embed] });
  },
);

const splitTeams = (users: APIUser[]) => {
	// ユーザーをランダムにシャッフル
	const shuffledUsers = shuffleArray(users);

	// チームに分ける
	const team1 = shuffledUsers.slice(0, Math.floor(users.length / 2));

	const team2 = shuffledUsers.slice(Math.floor(users.length / 2));

	return { team1, team2 };
};

// ユーザーの配列をランダムにシャッフルする関数
const shuffleArray = <T>(array: T[]): T[] =>{
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]]; // 要素を交換
	}
	return array;
};