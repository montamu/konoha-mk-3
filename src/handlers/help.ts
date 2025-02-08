import { Command, Option, Components, Button } from 'discord-hono'
import { factory } from '../init.js'

type Var = { text?: string }

export const command_help = factory.command<Var>(
  new Command('help', 'response help').options(new Option('text', 'with text')),
  c =>
    c.res({
      content: `text: ${c.var.text}`,
      components: new Components().row(
        new Button('https://discord-hono.luis.fun', ['📑', 'Docs'], 'Link'),
        component_delete.component,
      ),
    }),
)

export const component_delete = factory.component(
  new Button('delete', ['🗑️', 'Delete'], 'Secondary'),
  c => c.resDeferUpdate(c.followupDelete),
)