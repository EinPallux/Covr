'use client'

import { cn } from '@/lib/utils/cn'
import type { TemplateManifestEntry } from '@/lib/templates/registry'
import type { TemplateCategory } from '@/lib/templates/schema'

const CATEGORY_LABELS: Record<TemplateCategory | 'all', string> = {
  all: 'All',
  adventure: 'Adventure',
  pvp: 'PvP',
  survival: 'Survival',
  creative: 'Creative',
  minigame: 'Minigame',
  roleplay: 'Roleplay',
  horror: 'Horror',
  other: 'Other',
}

interface Props {
  templates: TemplateManifestEntry[]
  selected: TemplateCategory | 'all'
  onChange: (category: TemplateCategory | 'all') => void
}

export default function CategoryFilter({ templates, selected, onChange }: Props) {
  // Only show categories that have at least one template
  const available = Array.from(new Set(templates.map((t) => t.category)))
  const categories: (TemplateCategory | 'all')[] = ['all', ...available]

  const countFor = (cat: TemplateCategory | 'all') =>
    cat === 'all' ? templates.length : templates.filter((t) => t.category === cat).length

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => {
        const count = countFor(cat)
        const isActive = selected === cat

        return (
          <button
            key={cat}
            onClick={() => onChange(cat)}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
              isActive
                ? 'border-emerald-700 bg-emerald-600/20 text-emerald-400'
                : 'border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300',
            )}
          >
            {CATEGORY_LABELS[cat]}
            <span
              className={cn(
                'rounded-full px-1.5 py-0.5 text-[10px] tabular-nums',
                isActive ? 'bg-emerald-700/40 text-emerald-300' : 'bg-zinc-800 text-zinc-500',
              )}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
