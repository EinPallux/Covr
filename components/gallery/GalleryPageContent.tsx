'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Layers, Github, Sparkles, Zap, Lock } from 'lucide-react'
import type { TemplateManifestEntry } from '@/lib/templates/registry'
import type { TemplateCategory } from '@/lib/templates/schema'
import CategoryFilter from './CategoryFilter'
import GalleryGrid from './GalleryGrid'

interface Props {
  templates: TemplateManifestEntry[]
}

const FEATURES = [
  { icon: Layers, label: 'Drag & Drop Layers' },
  { icon: Zap, label: 'Instant Export' },
  { icon: Lock, label: 'No Account Needed' },
  { icon: Sparkles, label: '100% Free Forever' },
]

export default function GalleryPageContent({ templates }: Props) {
  const [category, setCategory] = useState<TemplateCategory | 'all'>('all')

  const filtered =
    category === 'all' ? templates : templates.filter((t) => t.category === category)

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* ── Header ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-emerald-600 text-white font-bold text-xs group-hover:bg-emerald-500 transition-colors">
              C
            </div>
            <span className="font-semibold text-zinc-100 tracking-tight">
              cov<span className="text-emerald-500">r</span>
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <span className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer">
              Templates
            </span>
            <span className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer">
              How it works
            </span>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com/einpallux/covr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              <Github className="h-4 w-4" />
              <span className="hidden sm:inline">GitHub</span>
            </a>
            <div className="h-4 w-px bg-zinc-800" />
            <span className="rounded-full border border-emerald-700/50 bg-emerald-950/50 px-2.5 py-0.5 text-xs text-emerald-400 font-medium">
              Free
            </span>
          </div>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-zinc-800/40">
        {/* Gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/30 via-zinc-950 to-zinc-950 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(16,185,129,0.08)_0%,_transparent_60%)] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-800/60 bg-emerald-950/40 px-3 py-1 text-xs text-emerald-400">
            <Sparkles className="h-3 w-3" />
            No account · No backend · No cost
          </div>

          <h1 className="max-w-2xl text-4xl font-bold leading-tight tracking-tight text-zinc-50 md:text-5xl lg:text-6xl">
            Create Stunning{' '}
            <span className="text-emerald-500">Minecraft</span>{' '}
            Marketplace Covers
          </h1>

          <p className="mt-5 max-w-xl text-base text-zinc-400 md:text-lg">
            Professional cover templates for BuiltByBit and the Minecraft Marketplace. Edit in your
            browser, export in seconds — completely free.
          </p>

          {/* Feature pills */}
          <div className="mt-8 flex flex-wrap gap-2">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400"
              >
                <Icon className="h-3 w-3 text-emerald-500" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Template Gallery ───────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-widest">
            Templates
          </h2>
          <span className="text-xs text-zinc-600">
            {filtered.length} template{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        <CategoryFilter
          templates={templates}
          selected={category}
          onChange={setCategory}
        />

        <div className="mt-6">
          <GalleryGrid templates={filtered} />
        </div>
      </main>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-800/40 py-8 text-center">
        <p className="text-sm text-zinc-600">
          <span className="font-medium text-zinc-400">covr</span> — Free forever · No account
          required · Built for the Minecraft community
        </p>
      </footer>
    </div>
  )
}
