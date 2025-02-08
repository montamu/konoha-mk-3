import { register } from 'discord-hono'
import * as handlers from './handlers/index.js'

const commands = Object.values(handlers)
  .filter(e => 'command' in e)
  .map(e => e.command)

register(
  commands,
  process.env.DISCORD_APPLICATION_ID,
  process.env.DISCORD_TOKEN,
  process.env.DISCORD_TEST_GUILD_ID,
)