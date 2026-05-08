'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { TemplateManifestEntry } from '@/lib/templates/registry'

const CATEGORY_COLORS: Record<string, string> = {
  adventure: 'bg-emerald-900/60 text-emerald-300 border-emerald-800/60',
  pvp: 'bg-red-900/60 text-red-300 border-red-800/60',
  survival: 'bg-amber-900/60 text-amber-300 border-amber-800/60',
  creative: 'bg-purple-900/60 text-purple-300 border-purple-800/60',
  minigame: 'bg-sky-900/60 text-sky-300 border-sky-800/60',
  roleplay: 'bg-violet-900/60 text-violet-300 border-violet-800/60',
  horror: 'bg-zinc-900/80 text-zinc-300 border-zinc-700/60',
  other: 'bg-zinc-800/60 text-zinc-400 border-zinc-700/60',
}

interface Props {
  template: TemplateManifestEntry
}

export default function TemplateCard({ template }: Props) {
  const categoryColor = CATEGORY_COLORS[template.category] ?? CATEGORY_COLORS.other

  return (
    <Link
      href={`/editor/${template.id}`}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 transition-all duration-200 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/40 hover:-translate-y-0.5"
    >
      {/* Thumbnail — 16:9 aspect ratio */}
      <div className="relative aspect-video overflow-hidden bg-zinc-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={template.thumbnail}
          alt={template.name}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            // Fallback gradient when thumbnail is missing
            const el = e.currentTarget
            el.style.display = 'none'
          }}
        />

        {/* Fallback gradient shown via sibling when img fails */}
        <div
          className={cn(
            'absolute inset-0 -z-0',
            template.category === 'pvp' && 'bg-gradient-to-br from-red-950 to-zinc-900',
            template.category === 'adventure' && 'bg-gradient-to-br from-emerald-950 to-zinc-900',
            template.category === 'survival' && 'bg-gradient-to-br from-amber-950 to-zinc-900',
            template.category === 'creative' && 'bg-gradient-to-br from-purple-950 to-zinc-900',
            template.category === 'minigame' && 'bg-gradient-to-br from-sky-950 to-zinc-900',
            template.category === 'horror' && 'bg-gradient-to-br from-zinc-900 to-zinc-950',
            !['pvp', 'adventure', 'survival', 'creative', 'minigame', 'horror'].includes(
              template.category,
            ) && 'bg-gradient-to-br from-zinc-800 to-zinc-900',
          )}
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <div className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition-transform group-hover:scale-100 scale-95">
            Use Template
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        {/* Canvas size badge */}
        <div className="absolute bottom-2 right-2 rounded border border-zinc-700/60 bg-zinc-900/80 px-1.5 py-0.5 text-[10px] text-zinc-500 font-mono backdrop-blur-sm">
          1920 × 1080
        </div>
      </div>

      {/* Card body */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-zinc-100 group-hover:text-white">
            {template.name}
          </h3>
          <p className="mt-0.5 truncate text-xs text-zinc-500">{template.description}</p>
        </div>

        {/* Category badge */}
        <span
          className={cn(
            'ml-3 shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize',
            categoryColor,
          )}
        >
          {template.category}
        </span>
      </div>
    </Link>
  )
}
