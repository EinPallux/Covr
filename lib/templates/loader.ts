import { TemplateSchema, type Template } from './schema'

// Static JSON imports — all templates bundled at build time.
// For >20 templates, migrate to dynamic import() with Suspense.
import adventurePack from '@/templates/adventure-pack/template.json'
import pvpArena from '@/templates/pvp-arena/template.json'
import survivalWorld from '@/templates/survival-world/template.json'
import creativeStudio from '@/templates/creative-studio/template.json'
import minigameHub from '@/templates/minigame-hub/template.json'
import horrorEscape from '@/templates/horror-escape/template.json'

const templateModules: Record<string, unknown> = {
  'adventure-pack': adventurePack,
  'pvp-arena': pvpArena,
  'survival-world': survivalWorld,
  'creative-studio': creativeStudio,
  'minigame-hub': minigameHub,
  'horror-escape': horrorEscape,
}

export function loadTemplate(id: string): Template | null {
  const raw = templateModules[id]
  if (!raw) return null

  const result = TemplateSchema.safeParse(raw)

  if (!result.success) {
    console.error(`[Covr] Invalid template "${id}":`, result.error.flatten())
    return null
  }

  return result.data
}

export function cloneTemplate(template: Template): Template {
  return JSON.parse(JSON.stringify(template))
}
