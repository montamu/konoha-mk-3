import { createFactory } from 'discord-hono';

// importがうまくいかなかったので、worker-configuration.d.tsの内容をコピーしている。
export type Env = {
  Bindings: {
    KV: KVNamespace;
    DISCORD_APPLICATION_ID: string;
    DISCORD_PUBLIC_KEY: string;
    DISCORD_TOKEN: string;
    DISCORD_TEST_GUILD_ID: string;
    DB: D1Database;

  }
};

export const factory = createFactory<Env>();