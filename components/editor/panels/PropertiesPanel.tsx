'use client'

import { useState, useEffect, useRef } from 'react'
import { useEditorStore } from '@/lib/store/editorStore'
import { useUIStore } from '@/lib/store/uiStore'
import { withHistory } from '@/lib/store/historyStore'
import type { Layer, TextLayer, ImageLayer, ShapeLayer } from '@/lib/templates/schema'
import { cn } from '@/lib/utils/cn'

// ─── Field Primitives ────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] text-zinc-500">{children}</span>
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-zinc-800 px-4 py-4">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-zinc-600">
        {title}
      </p>
      {children}
    </div>
  )
}

// ─── NumberInput ─────────────────────────────────────────────────────────────
// Commits a history snapshot on blur, so each drag-stop / field-exit is one
// undoable step — not one per keystroke.

function NumberInput({
  label,
  value,
  onChange,
  onCommit,
  unit,
  min,
  max,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  onCommit: () => void
  unit?: string
  min?: number
  max?: number
}) {
  return (
    <div className="flex flex-col gap-1">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex h-7 items-center gap-1 rounded border border-zinc-700 bg-zinc-800 px-2 focus-within:border-zinc-500">
        <input
          type="number"
          value={Math.round(value)}
          min={min}
          max={max}
          onChange={(e) => onChange(Number(e.target.value))}
          onBlur={onCommit}
          className="w-full bg-transparent text-xs text-zinc-100 outline-none tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {unit && <span className="shrink-0 text-[10px] text-zinc-600">{unit}</span>}
      </div>
    </div>
  )
}

// ─── Transform section (all layers) ─────────────────────────────────────────

function TransformSection({ layer }: { layer: Layer }) {
  const { updateLayer } = useEditorStore()

  // Snapshot before the first change in a field-editing session; commit on blur.
  const committed = useRef(false)
  const beginCommit = () => { committed.current = false }
  const endCommit = () => { committed.current = false }

  // withHistory snapshots BEFORE the mutation. We need to snapshot once per
  // "edit session" (focus → blur), not once per keystroke. We achieve this by
  // using a local snapshot flag: the first onChange in a session runs withHistory,
  // subsequent ones just call updateLayer directly.
  const pending = useRef(false)

  const change = (patch: Partial<Layer>) => {
    if (!pending.current) {
      // First change: snapshot current state, then apply
      pending.current = true
      withHistory(() => updateLayer(layer.id, patch))
    } else {
      updateLayer(layer.id, patch)
    }
  }

  const commit = () => {
    pending.current = false
  }

  void beginCommit
  void endCommit

  return (
    <Section title="Transform">
      <div className="grid grid-cols-2 gap-2">
        <NumberInput label="X" value={layer.x} onChange={(x) => change({ x })} onCommit={commit} />
        <NumberInput label="Y" value={layer.y} onChange={(y) => change({ y })} onCommit={commit} />
        <NumberInput label="W" value={layer.width} onChange={(width) => change({ width })} onCommit={commit} min={1} />
        <NumberInput label="H" value={layer.height} onChange={(height) => change({ height })} onCommit={commit} min={1} />
        <NumberInput label="Rotation" value={layer.rotation} onChange={(rotation) => change({ rotation })} onCommit={commit} unit="°" />
        <NumberInput
          label="Opacity"
          value={Math.round(layer.opacity * 100)}
          onChange={(v) => change({ opacity: v / 100 })}
          onCommit={commit}
          min={0}
          max={100}
          unit="%"
        />
      </div>
    </Section>
  )
}

// ─── Text-specific section ───────────────────────────────────────────────────
// Text content uses a controlled local draft; commits to history on blur.

function TextSection({ layer }: { layer: TextLayer }) {
  const { updateLayer } = useEditorStore()
  const [draft, setDraft] = useState(layer.text)
  const committed = useRef(false)

  // Keep draft in sync when selection changes to a different layer
  useEffect(() => {
    setDraft(layer.text)
    committed.current = false
  }, [layer.id, layer.text])

  const commitText = () => {
    if (draft !== layer.text) {
      withHistory(() => updateLayer(layer.id, { text: draft }))
    }
    committed.current = true
  }

  // Font size, color: commit on blur like transform fields
  const sizePending = useRef(false)
  const changeSize = (fontSize: number) => {
    if (!sizePending.current) {
      sizePending.current = true
      withHistory(() => updateLayer(layer.id, { fontSize }))
    } else {
      updateLayer(layer.id, { fontSize })
    }
  }

  const colorPending = useRef(false)
  const changeColor = (color: string) => {
    if (!colorPending.current) {
      colorPending.current = true
      withHistory(() => updateLayer(layer.id, { color }))
    } else {
      updateLayer(layer.id, { color })
    }
  }

  return (
    <Section title="Text">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <FieldLabel>Content</FieldLabel>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitText}
            rows={3}
            className="w-full resize-none rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-zinc-100 outline-none focus:border-zinc-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <FieldLabel>Font Size</FieldLabel>
          <div className="flex h-7 items-center gap-1 rounded border border-zinc-700 bg-zinc-800 px-2 focus-within:border-zinc-500">
            <input
              type="number"
              value={layer.fontSize}
              min={1}
              onChange={(e) => changeSize(Number(e.target.value))}
              onBlur={() => { sizePending.current = false }}
              className="w-full bg-transparent text-xs text-zinc-100 outline-none tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            />
            <span className="shrink-0 text-[10px] text-zinc-600">px</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <FieldLabel>Align</FieldLabel>
          <div className="flex gap-1">
            {(['left', 'center', 'right'] as const).map((a) => (
              <button
                key={a}
                onClick={() => withHistory(() => updateLayer(layer.id, { align: a }))}
                className={cn(
                  'flex-1 rounded border py-1 text-[10px] capitalize transition-colors',
                  layer.align === a
                    ? 'border-emerald-700 bg-emerald-900/40 text-emerald-400'
                    : 'border-zinc-700 bg-zinc-800 text-zinc-500 hover:text-zinc-300',
                )}
              >
                {a}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <FieldLabel>Style</FieldLabel>
          <div className="flex gap-1">
            {(['normal', 'bold', 'italic'] as const).map((s) => (
              <button
                key={s}
                onClick={() => withHistory(() => updateLayer(layer.id, { fontStyle: s }))}
                className={cn(
                  'flex-1 rounded border py-1 text-[10px] capitalize transition-colors',
                  layer.fontStyle === s
                    ? 'border-emerald-700 bg-emerald-900/40 text-emerald-400'
                    : 'border-zinc-700 bg-zinc-800 text-zinc-500 hover:text-zinc-300',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <FieldLabel>Color</FieldLabel>
          <input
            type="color"
            value={layer.color}
            onChange={(e) => changeColor(e.target.value)}
            onBlur={() => { colorPending.current = false }}
            className="h-7 w-full cursor-pointer rounded border border-zinc-700 bg-zinc-800 px-1"
          />
        </div>
      </div>
    </Section>
  )
}

// ─── Image-specific section ──────────────────────────────────────────────────

function ImageSection({ layer }: { layer: ImageLayer }) {
  const { replaceLayerImage } = useEditorStore()

  const handleReplace = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const src = ev.target?.result as string
        withHistory(() => replaceLayerImage(layer.id, src))
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  return (
    <Section title="Image">
      {layer.replaceable ? (
        <button
          onClick={handleReplace}
          className="w-full rounded border border-dashed border-zinc-700 bg-zinc-800/50 py-2 text-xs text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
        >
          Replace Image…
        </button>
      ) : (
        <p className="text-xs text-zinc-600">This image is locked and cannot be replaced.</p>
      )}
    </Section>
  )
}

// ─── Shape-specific section ──────────────────────────────────────────────────

function ShapeSection({ layer }: { layer: ShapeLayer }) {
  const { updateLayer } = useEditorStore()

  const fillPending = useRef(false)
  const changeFill = (fill: string) => {
    if (!fillPending.current) {
      fillPending.current = true
      withHistory(() => updateLayer(layer.id, { fill }))
    } else {
      updateLayer(layer.id, { fill })
    }
  }

  const radiusPending = useRef(false)
  const changeRadius = (cornerRadius: number) => {
    if (!radiusPending.current) {
      radiusPending.current = true
      withHistory(() => updateLayer(layer.id, { cornerRadius }))
    } else {
      updateLayer(layer.id, { cornerRadius })
    }
  }

  return (
    <Section title="Shape">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <FieldLabel>Shape</FieldLabel>
          <div className="flex gap-1">
            {(['rect', 'ellipse', 'triangle'] as const).map((s) => (
              <button
                key={s}
                onClick={() => withHistory(() => updateLayer(layer.id, { shapeType: s }))}
                className={cn(
                  'flex-1 rounded border py-1 text-[10px] capitalize transition-colors',
                  layer.shapeType === s
                    ? 'border-emerald-700 bg-emerald-900/40 text-emerald-400'
                    : 'border-zinc-700 bg-zinc-800 text-zinc-500 hover:text-zinc-300',
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <FieldLabel>Fill</FieldLabel>
          <input
            type="color"
            value={layer.fill}
            onChange={(e) => changeFill(e.target.value)}
            onBlur={() => { fillPending.current = false }}
            className="h-7 w-full cursor-pointer rounded border border-zinc-700 bg-zinc-800 px-1"
          />
        </div>

        {layer.shapeType === 'rect' && (
          <div className="flex flex-col gap-1">
            <FieldLabel>Corner Radius</FieldLabel>
            <div className="flex h-7 items-center gap-1 rounded border border-zinc-700 bg-zinc-800 px-2 focus-within:border-zinc-500">
              <input
                type="number"
                value={layer.cornerRadius}
                min={0}
                onChange={(e) => changeRadius(Number(e.target.value))}
                onBlur={() => { radiusPending.current = false }}
                className="w-full bg-transparent text-xs text-zinc-100 outline-none tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
              <span className="shrink-0 text-[10px] text-zinc-600">px</span>
            </div>
          </div>
        )}
      </div>
    </Section>
  )
}

// ─── Root component ──────────────────────────────────────────────────────────

export default function PropertiesPanel() {
  const { layers, selectedIds } = useEditorStore()
  const { panels } = useUIStore()

  if (!panels.properties) return null

  const selectedLayer = selectedIds.length === 1
    ? layers.find((l) => l.id === selectedIds[0])
    : null

  return (
    <div className="flex w-64 shrink-0 flex-col border-l border-zinc-800 bg-zinc-900">
      {/* Header */}
      <div className="flex h-10 shrink-0 items-center border-b border-zinc-800 px-4">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Properties
        </span>
      </div>

      {/* Content */}
      <div className={cn('flex-1 overflow-y-auto', !selectedLayer && 'flex items-center justify-center')}>
        {!selectedLayer ? (
          <p className="px-4 text-center text-xs text-zinc-600">
            {selectedIds.length > 1
              ? `${selectedIds.length} layers selected`
              : 'Select a layer to edit'}
          </p>
        ) : (
          <>
            <TransformSection layer={selectedLayer} />
            {selectedLayer.type === 'text' && <TextSection layer={selectedLayer} />}
            {selectedLayer.type === 'image' && <ImageSection layer={selectedLayer} />}
            {selectedLayer.type === 'shape' && <ShapeSection layer={selectedLayer} />}
          </>
        )}
      </div>
    </div>
  )
}
