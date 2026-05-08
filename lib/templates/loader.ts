import { TemplateSchema, type Template, type Layer } from './schema'
import { templateManifest, type TemplateManifestEntry } from './registry'

// Static JSON imports — all templates bundled at build time.
// To add a new template: drop the folder under /templates/, add a manifest
// entry in registry.ts, and add an import + entry here.
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

// ─── Validation ───────────────────────────────────────────────────────────────

export type ValidationResult =
  | { ok: true; template: Template }
  | { ok: false; errors: string[] }

/** Validate raw JSON against the template schema. Returns typed errors on failure. */
export function validateTemplate(raw: unknown): ValidationResult {
  const result = TemplateSchema.safeParse(raw)
  if (result.success) return { ok: true, template: result.data }

  const errors = result.error.issues.map(
    (issue) => `${issue.path.join('.')} — ${issue.message}`,
  )
  return { ok: false, errors }
}

// ─── Loading ──────────────────────────────────────────────────────────────────

/** Load and validate a single template by ID. Returns null if unknown or invalid. */
export function loadTemplate(id: string): Template | null {
  const raw = templateModules[id]
  if (!raw) return null

  const result = validateTemplate(raw)
  if (!result.ok) {
    console.error(`[Covr] Invalid template "${id}":`, result.errors)
    return null
  }

  return result.template
}

/**
 * Load all templates that appear in the manifest, in manifest order.
 * Skips any template whose JSON fails validation (logs errors to console).
 */
export function getAllTemplates(): Array<{ manifest: TemplateManifestEntry; template: Template }> {
  return templateManifest.flatMap((entry) => {
    const template = loadTemplate(entry.id)
    if (!template) return []
    return [{ manifest: entry, template }]
  })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Deep-clone a template so edits to layers don't mutate the original import. */
export function cloneTemplate(template: Template): Template {
  return JSON.parse(JSON.stringify(template))
}

/**
 * Clone template layers into a fresh array, applying any per-layer overrides.
 * Useful for loading a template into editor state.
 */
export function instantiateLayers(template: Template): Layer[] {
  return JSON.parse(JSON.stringify(template.layers)) as Layer[]
}
