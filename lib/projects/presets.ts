import { nanoid } from 'nanoid'
import type { DesignPage, DesignPreset, DesignProject } from './schema'
import { makeShapeLayer, makeTextLayer } from '@/lib/design/schema'

export const DESIGN_PRESETS: DesignPreset[] = [
  { id: 'instagram-post', name: 'Instagram Post', description: 'Square feed post', platform: 'Instagram', width: 1080, height: 1080, accent: '#f43f5e' },
  { id: 'instagram-story', name: 'Instagram Story', description: 'Full-screen vertical story', platform: 'Instagram', width: 1080, height: 1920, accent: '#a855f7' },
  { id: 'tiktok-video', name: 'TikTok Video', description: 'Vertical video cover', platform: 'TikTok', width: 1080, height: 1920, accent: '#22d3ee' },
  { id: 'linkedin-post', name: 'LinkedIn Post', description: 'Landscape professional post', platform: 'LinkedIn', width: 1200, height: 627, accent: '#3b82f6' },
  { id: 'youtube-thumbnail', name: 'YouTube Thumbnail', description: 'Video thumbnail', platform: 'YouTube', width: 1280, height: 720, accent: '#ef4444' },
  { id: 'blank-square', name: 'Blank Square', description: 'A clean 1:1 canvas', platform: 'Custom', width: 1080, height: 1080, accent: '#10b981' },
]

function starterLayers(preset: DesignPreset): DesignPage['layers'] {
  if (preset.id === 'blank-square') return []
  const padding = Math.round(preset.width * 0.08)
  const headlineSize = Math.max(48, Math.round(preset.width * 0.085))
  return [
    { ...makeShapeLayer({ name: 'Background', role: 'background', x: 0, y: 0, width: preset.width, height: preset.height, fill: '#18181b', locked: true }), id: nanoid() },
    { ...makeShapeLayer({ name: 'Accent', x: padding, y: padding, width: Math.round(preset.width * 0.18), height: 14, fill: preset.accent, cornerRadius: 7 }), id: nanoid() },
    { ...makeTextLayer({ name: 'Headline', x: padding, y: Math.round(preset.height * 0.34), width: preset.width - padding * 2, height: headlineSize * 2.5, fontSize: headlineSize, text: 'Make your next post impossible to ignore.', align: 'left' }), id: nanoid() },
    { ...makeTextLayer({ name: 'Supporting text', x: padding, y: Math.round(preset.height * 0.68), width: preset.width - padding * 2, height: 70, fontSize: Math.max(24, Math.round(preset.width * 0.03)), fontStyle: 'normal', color: '#a1a1aa', text: 'Edit every layer, add your visuals, and make it yours.', align: 'left' }), id: nanoid() },
  ]
}

export function makePage(name: string, width: number, height: number, layers: DesignPage['layers'] = []): DesignPage {
  return { id: nanoid(), name, width, height, background: '#ffffff', layers, comments: [] }
}

export function createProjectFromPreset(presetId: string): DesignProject {
  const preset = DESIGN_PRESETS.find((item) => item.id === presetId) ?? DESIGN_PRESETS[0]
  const now = new Date().toISOString()
  return {
    id: nanoid(),
    version: 1,
    name: `Untitled ${preset.name}`,
    createdAt: now,
    updatedAt: now,
    pages: [makePage(preset.name, preset.width, preset.height, starterLayers(preset))],
  }
}
