'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Clock3, Github, Layers3, Monitor, Sparkles } from 'lucide-react'
import { DESIGN_PRESETS, createProjectFromPreset } from '@/lib/projects/presets'
import { listProjectSummaries, saveProject, type ProjectSummary } from '@/lib/projects/persistence'

export default function ProjectHome() {
  const router = useRouter()
  const [recent, setRecent] = useState<ProjectSummary[]>([])
  useEffect(() => setRecent(listProjectSummaries()), [])

  const create = (presetId: string) => {
    const project = createProjectFromPreset(presetId)
    saveProject(project)
    router.push(`/editor/${project.id}`)
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 font-black text-zinc-950">C</div><div><p className="font-semibold tracking-tight">Covr</p><p className="text-[10px] text-zinc-500">Social design, without the clutter</p></div></div>
          <div className="flex items-center gap-4 text-xs text-zinc-500"><span className="hidden items-center gap-1.5 sm:flex"><Monitor className="h-3.5 w-3.5" />Desktop editor</span><span className="rounded-full border border-emerald-800/70 bg-emerald-950/40 px-3 py-1 text-emerald-400">Free & open source</span><a href="https://github.com/EinPallux/Covr" target="_blank" rel="noreferrer" className="hover:text-zinc-200"><Github className="h-4 w-4" /></a></div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-zinc-800/60">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,.14),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(59,130,246,.09),transparent_35%)]" />
        <div className="relative mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/70 px-3 py-1 text-xs text-zinc-400"><Sparkles className="h-3.5 w-3.5 text-emerald-400" />Local-first creative workspace</div>
          <h1 className="max-w-3xl text-5xl font-semibold leading-[1.05] tracking-[-0.04em] text-white md:text-7xl">Turn ideas into scroll-stopping graphics.</h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 md:text-lg">Design posts, stories, covers, and thumbnails in a focused browser editor. Your projects stay on your device—no account required.</p>
          <button onClick={() => create('instagram-post')} className="mt-8 inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-400">Start designing <ArrowRight className="h-4 w-4" /></button>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-14 px-6 py-12">
        {recent.length > 0 && <section><div className="mb-5 flex items-center gap-2"><Clock3 className="h-4 w-4 text-zinc-500" /><h2 className="text-sm font-semibold text-zinc-300">Recent projects</h2></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{recent.map((project) => <button key={project.id} onClick={() => router.push(`/editor/${project.id}`)} className="group rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 text-left transition hover:border-zinc-700 hover:bg-zinc-900"><div className="mb-8 flex aspect-[1.8] items-center justify-center rounded-lg bg-zinc-950 text-zinc-700"><Layers3 className="h-8 w-8" /></div><p className="truncate text-sm font-medium text-zinc-200">{project.name}</p><p className="mt-1 text-xs text-zinc-600">{project.width} × {project.height}</p></button>)}</div></section>}

        <section><div className="mb-6"><h2 className="text-xl font-semibold tracking-tight">Create a new design</h2><p className="mt-1 text-sm text-zinc-500">Choose a social-ready frame. You can add more pages inside the editor.</p></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{DESIGN_PRESETS.map((preset) => <button key={preset.id} onClick={() => create(preset.id)} className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 text-left transition hover:-translate-y-0.5 hover:border-zinc-700"><div className="relative h-36 bg-zinc-950"><div className="absolute inset-5 rounded-lg border border-white/10" style={{ background: `linear-gradient(135deg, ${preset.accent}33, #18181b 68%)` }}><div className="absolute bottom-4 left-4 h-2 w-20 rounded-full" style={{ backgroundColor: preset.accent }} /><div className="absolute bottom-8 left-4 h-3 w-32 rounded bg-white/80" /></div></div><div className="flex items-center justify-between p-4"><div><p className="text-sm font-medium text-zinc-200">{preset.name}</p><p className="mt-1 text-xs text-zinc-500">{preset.width} × {preset.height} · {preset.description}</p></div><ArrowRight className="h-4 w-4 text-zinc-700 transition group-hover:translate-x-1 group-hover:text-emerald-400" /></div></button>)}</div></section>
      </div>
    </main>
  )
}
