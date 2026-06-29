'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, Download, Loader2, X } from 'lucide-react'
import { runExport } from '@/lib/export/exporter'
import type { ExportFormat } from '@/lib/export/presets'
import { useEditorStore } from '@/lib/store/editorStore'
import { cn } from '@/lib/utils/cn'

interface Props { onClose: () => void }

export default function ExportDialog({ onClose }: Props) {
  const { project, activePageId } = useEditorStore()
  const page = project?.pages.find((item) => item.id === activePageId)
  const [format, setFormat] = useState<ExportFormat>('png')
  const [scale, setScale] = useState(1)
  const [quality, setQuality] = useState(0.92)
  const [transparent, setTransparent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'exporting' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!page || !project) return null
  const width = Math.round(page.width * scale)
  const height = Math.round(page.height * scale)
  const extension = format === 'jpg' ? 'jpg' : format
  const filename = `${project.name.toLowerCase().replace(/s+/g, '-').replace(/[^a-z0-9-]/g, '') || 'covr-design'}-${page.name.toLowerCase().replace(/s+/g, '-')}.${extension}`

  const exportDesign = async () => {
    setStatus('exporting')
    setError('')
    try {
      await runExport({ filename, format, quality, width, height, transparent: format !== 'jpg' && transparent })
      setStatus('done')
      setTimeout(() => setStatus('idle'), 2200)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Export failed')
      setStatus('error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div className="w-full max-w-md rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl">
        <header className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div><h2 className="text-sm font-semibold text-zinc-100">Export frame</h2><p className="mt-0.5 text-xs text-zinc-500">{page.name} · {page.width} × {page.height}</p></div>
          <button onClick={onClose} className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"><X className="h-4 w-4" /></button>
        </header>
        <div className="space-y-5 p-5">
          <section><p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Format</p><div className="grid grid-cols-3 gap-2">{(['png', 'jpg', 'webp'] as ExportFormat[]).map((item) => <button key={item} onClick={() => setFormat(item)} className={cn('rounded-lg border py-3 text-xs font-semibold uppercase', format === item ? 'border-emerald-600 bg-emerald-950/40 text-emerald-300' : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600')}>{item}</button>)}</div></section>
          <section><p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">Size</p><div className="grid grid-cols-3 gap-2">{[0.5, 1, 2].map((item) => <button key={item} onClick={() => setScale(item)} className={cn('rounded border py-2 text-xs', scale === item ? 'border-emerald-600 text-emerald-300' : 'border-zinc-700 text-zinc-400')}>{item}×</button>)}</div><p className="mt-2 text-center font-mono text-xs text-zinc-500">{width} × {height}px</p></section>
          {format !== 'png' && <section><div className="mb-2 flex justify-between text-xs text-zinc-500"><span>Quality</span><span>{Math.round(quality * 100)}%</span></div><input type="range" min="10" max="100" value={quality * 100} onChange={(event) => setQuality(Number(event.target.value) / 100)} className="w-full accent-emerald-500" /></section>}
          {format !== 'jpg' && <label className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950/50 px-3 py-2.5 text-xs text-zinc-400"><span>Transparent frame background</span><input type="checkbox" checked={transparent} onChange={(event) => setTransparent(event.target.checked)} className="accent-emerald-500" /></label>}
          {status === 'done' && <p className="flex items-center gap-2 rounded-lg bg-emerald-950/40 px-3 py-2 text-xs text-emerald-300"><CheckCircle2 className="h-4 w-4" />Export downloaded</p>}
          {status === 'error' && <p className="rounded-lg bg-red-950/40 px-3 py-2 text-xs text-red-300">{error}</p>}
        </div>
        <footer className="border-t border-zinc-800 p-4"><button onClick={exportDesign} disabled={status === 'exporting'} className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:bg-zinc-700">{status === 'exporting' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}Export {format.toUpperCase()}</button></footer>
      </div>
    </div>
  )
}
