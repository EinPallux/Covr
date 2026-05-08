'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { X, Download, CheckCircle2, AlertCircle, Loader2, ImageIcon, FileImage } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { runExport } from '@/lib/export/exporter'
import {
  EXPORT_PRESETS,
  DEFAULT_PRESET,
  type ExportPreset,
  type ExportFormat,
  type FitMode,
} from '@/lib/export/presets'
import { useEditorStore } from '@/lib/store/editorStore'

// ─── Types ────────────────────────────────────────────────────────────────────

type ExportStatus = 'idle' | 'exporting' | 'done' | 'error'

// ─── Sub-components ───────────────────────────────────────────────────────────

function PresetCard({
  preset,
  selected,
  onClick,
}: {
  preset: ExportPreset
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full flex-col items-start rounded-lg border px-4 py-3 text-left transition-all',
        selected
          ? 'border-emerald-600 bg-emerald-950/40 ring-1 ring-emerald-600/40'
          : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800',
      )}
    >
      <span className={cn('text-sm font-medium', selected ? 'text-emerald-300' : 'text-zinc-200')}>
        {preset.label}
      </span>
      <span className="mt-0.5 font-mono text-[11px] text-zinc-500">{preset.sublabel}</span>
    </button>
  )
}

function FormatButton({
  format,
  label,
  description,
  icon: Icon,
  selected,
  onClick,
}: {
  format: ExportFormat
  label: string
  description: string
  icon: React.ElementType
  selected: boolean
  onClick: () => void
}) {
  void format
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-1 flex-col items-center gap-1 rounded-lg border py-3 transition-all',
        selected
          ? 'border-emerald-600 bg-emerald-950/40 ring-1 ring-emerald-600/40'
          : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600 hover:bg-zinc-800',
      )}
    >
      <Icon
        className={cn('h-5 w-5', selected ? 'text-emerald-400' : 'text-zinc-400')}
      />
      <span className={cn('text-xs font-semibold', selected ? 'text-emerald-300' : 'text-zinc-300')}>
        {label}
      </span>
      <span className="text-[10px] text-zinc-500">{description}</span>
    </button>
  )
}

// ─── Fit mode selector (shown when preset dimensions differ from source) ───────

const FIT_MODES: { id: FitMode; label: string; hint: string }[] = [
  { id: 'contain', label: 'Contain', hint: 'Full content, letterboxed' },
  { id: 'cover', label: 'Cover', hint: 'Fills frame, crops edges' },
]

// ─── Main dialog ──────────────────────────────────────────────────────────────

interface Props {
  onClose: () => void
}

export default function ExportDialog({ onClose }: Props) {
  const template = useEditorStore((s) => s.template)

  const [preset, setPreset] = useState<ExportPreset>(DEFAULT_PRESET)
  const [format, setFormat] = useState<ExportFormat>(DEFAULT_PRESET.defaultFormat)
  const [quality, setQuality] = useState(DEFAULT_PRESET.defaultQuality)
  const [fitMode, setFitMode] = useState<FitMode>(DEFAULT_PRESET.fitMode)
  const [transparent, setTransparent] = useState(false)
  const [status, setStatus] = useState<ExportStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const overlayRef = useRef<HTMLDivElement>(null)

  // Keep fitMode in sync when preset changes
  const handlePresetChange = useCallback((p: ExportPreset) => {
    setPreset(p)
    setFormat(p.defaultFormat)
    setQuality(p.defaultQuality)
    setFitMode(p.fitMode)
  }, [])

  // Dismiss on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Click outside to dismiss
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === overlayRef.current) onClose()
    },
    [onClose],
  )

  const isNative = preset.fitMode === 'native'

  // Build a human-readable filename from the template name
  const baseName = template?.name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '') ?? 'export'

  const filename = `${baseName}-${preset.id}.${format === 'jpg' ? 'jpg' : 'png'}`

  const handleExport = useCallback(async () => {
    setStatus('exporting')
    setErrorMsg('')
    try {
      await runExport({
        filename,
        format,
        quality,
        width: preset.width,
        height: preset.height,
        fitMode,
        transparent: format === 'png' && transparent,
      })
      setStatus('done')
      // Auto-dismiss success state after a moment, but keep dialog open
      setTimeout(() => setStatus('idle'), 2500)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Unknown error')
      setStatus('error')
    }
  }, [filename, format, quality, preset, fitMode, transparent])

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div className="flex w-full max-w-md flex-col rounded-xl border border-zinc-700 bg-zinc-900 shadow-2xl">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">Export</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              {template?.name ?? 'Untitled'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Body ────────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-5 overflow-y-auto px-5 py-5">

          {/* Preset -------------------------------------------------------- */}
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
              Preset
            </h3>
            <div className="flex flex-col gap-2">
              {EXPORT_PRESETS.map((p) => (
                <PresetCard
                  key={p.id}
                  preset={p}
                  selected={preset.id === p.id}
                  onClick={() => handlePresetChange(p)}
                />
              ))}
            </div>
          </section>

          {/* Format -------------------------------------------------------- */}
          <section>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
              Format
            </h3>
            <div className="flex gap-2">
              <FormatButton
                format="png"
                label="PNG"
                description="Lossless · Transparency"
                icon={FileImage}
                selected={format === 'png'}
                onClick={() => setFormat('png')}
              />
              <FormatButton
                format="jpg"
                label="JPG"
                description="Lossy · Smaller files"
                icon={ImageIcon}
                selected={format === 'jpg'}
                onClick={() => setFormat('jpg')}
              />
            </div>
          </section>

          {/* Quality (JPG only) -------------------------------------------- */}
          {format === 'jpg' && (
            <section>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                  Quality
                </h3>
                <span className="font-mono text-xs text-zinc-400">
                  {Math.round(quality * 100)}%
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={100}
                step={1}
                value={Math.round(quality * 100)}
                onChange={(e) => setQuality(Number(e.target.value) / 100)}
                className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-zinc-700 accent-emerald-500"
              />
              <div className="mt-1 flex justify-between text-[10px] text-zinc-600">
                <span>Smaller file</span>
                <span>Higher quality</span>
              </div>
            </section>
          )}

          {/* Fit mode (non-native presets only) ----------------------------- */}
          {!isNative && (
            <section>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                Fit
              </h3>
              <div className="flex gap-2">
                {FIT_MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setFitMode(m.id)}
                    className={cn(
                      'flex flex-1 flex-col items-center gap-0.5 rounded-lg border py-2 text-center transition-all',
                      fitMode === m.id
                        ? 'border-emerald-600 bg-emerald-950/40 ring-1 ring-emerald-600/40'
                        : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600',
                    )}
                  >
                    <span className={cn('text-xs font-medium', fitMode === m.id ? 'text-emerald-300' : 'text-zinc-300')}>
                      {m.label}
                    </span>
                    <span className="text-[10px] text-zinc-500">{m.hint}</span>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Transparent background (PNG only) ------------------------------ */}
          {format === 'png' && (
            <section>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
                Options
              </h3>
              <label className="flex cursor-pointer items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 hover:border-zinc-600">
                <div>
                  <p className="text-xs font-medium text-zinc-200">Transparent background</p>
                  <p className="mt-0.5 text-[11px] text-zinc-500">
                    {isNative
                      ? 'Exports with no background fill'
                      : fitMode === 'contain'
                        ? 'Letterbox bars will be transparent'
                        : 'No effect in cover mode'}
                  </p>
                </div>
                <div
                  className={cn(
                    'relative ml-3 h-5 w-9 shrink-0 rounded-full transition-colors',
                    transparent ? 'bg-emerald-600' : 'bg-zinc-600',
                  )}
                  onClick={() => setTransparent((v) => !v)}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
                      transparent ? 'translate-x-4' : 'translate-x-0.5',
                    )}
                  />
                </div>
              </label>
            </section>
          )}

          {/* Output summary ------------------------------------------------ */}
          <div className="rounded-lg border border-zinc-800 bg-zinc-800/30 px-4 py-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">Output size</span>
              <span className="font-mono text-zinc-300">
                {preset.width} × {preset.height} px
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">Filename</span>
              <span className="max-w-[200px] truncate font-mono text-zinc-400 text-right">{filename}</span>
            </div>
          </div>
        </div>

        {/* ── Footer ──────────────────────────────────────────────────────── */}
        <div className="border-t border-zinc-800 px-5 py-4">
          {/* Status feedback */}
          {status === 'error' && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-800/60 bg-red-950/40 px-3 py-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <p className="text-xs text-red-300">{errorMsg}</p>
            </div>
          )}
          {status === 'done' && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-emerald-800/60 bg-emerald-950/40 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <p className="text-xs text-emerald-300">Saved to Downloads</p>
            </div>
          )}

          <button
            onClick={handleExport}
            disabled={status === 'exporting'}
            className={cn(
              'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all',
              status === 'exporting'
                ? 'cursor-not-allowed bg-zinc-700 text-zinc-400'
                : 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-[0.98]',
            )}
          >
            {status === 'exporting' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Exporting…
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Export {format.toUpperCase()}
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  )
}
