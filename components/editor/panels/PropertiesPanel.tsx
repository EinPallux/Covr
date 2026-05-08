'use client'

import { useEditorStore } from '@/lib/store/editorStore'
import { useUIStore } from '@/lib/store/uiStore'
import type { Layer, TextLayer, ImageLayer, ShapeLayer } from '@/lib/templates/schema'
import { cn } from '@/lib/utils/cn'

// ─── Field Primitives ────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] text-zinc-500">{children}</span>
}

function NumberInput({
  label,
  value,
  onChange,
  unit,
  min,
  max,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  unit?: string
  min?: number
  max?: number
}) {
  return (
    <div className="flex flex-col gap-1">
      <FieldLabel>{label}</FieldLabel>
      <div className="flex items-center gap-1 rounded border border-zinc-700 bg-zinc-800 px-2 h-7 focus-within:border-zinc-500">
        <input
          type="number"
          value={Math.round(value)}
          min={min}
          max={max}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full bg-transparent text-xs text-zinc-100 outline-none tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        {unit && <span className="shrink-0 text-[10px] text-zinc-600">{unit}</span>}
      </div>
    </div>
  )
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

// ─── Transform section (all layers) ─────────────────────────────────────────

function TransformSection({ layer }: { layer: Layer }) {
  const { updateLayer } = useEditorStore()
  const u = (patch: Partial<Layer>) => updateLayer(layer.id, patch)

  return (
    <Section title="Transform">
      <div className="grid grid-cols-2 gap-2">
        <NumberInput label="X" value={layer.x} onChange={(x) => u({ x })} />
        <NumberInput label="Y" value={layer.y} onChange={(y) => u({ y })} />
        <NumberInput label="W" value={layer.width} onChange={(width) => u({ width })} min={1} />
        <NumberInput label="H" value={layer.height} onChange={(height) => u({ height })} min={1} />
        <NumberInput label="Rotation" value={layer.rotation} onChange={(rotation) => u({ rotation })} unit="°" />
        <NumberInput
          label="Opacity"
          value={Math.round(layer.opacity * 100)}
          onChange={(v) => u({ opacity: v / 100 })}
          min={0}
          max={100}
          unit="%"
        />
      </div>
    </Section>
  )
}

// ─── Text-specific section ───────────────────────────────────────────────────

function TextSection({ layer }: { layer: TextLayer }) {
  const { updateLayer } = useEditorStore()

  return (
    <Section title="Text">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <FieldLabel>Content</FieldLabel>
          <textarea
            value={layer.text}
            onChange={(e) => updateLayer(layer.id, { text: e.target.value })}
            rows={3}
            className="w-full resize-none rounded border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-xs text-zinc-100 outline-none focus:border-zinc-500"
          />
        </div>
        <NumberInput
          label="Font Size"
          value={layer.fontSize}
          onChange={(fontSize) => updateLayer(layer.id, { fontSize })}
          unit="px"
          min={1}
        />
        <div className="flex flex-col gap-1">
          <FieldLabel>Color</FieldLabel>
          <input
            type="color"
            value={layer.color}
            onChange={(e) => updateLayer(layer.id, { color: e.target.value })}
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
        replaceLayerImage(layer.id, src)
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

  return (
    <Section title="Shape">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <FieldLabel>Fill</FieldLabel>
          <input
            type="color"
            value={layer.fill}
            onChange={(e) => updateLayer(layer.id, { fill: e.target.value })}
            className="h-7 w-full cursor-pointer rounded border border-zinc-700 bg-zinc-800 px-1"
          />
        </div>
        <NumberInput
          label="Corner Radius"
          value={layer.cornerRadius}
          onChange={(cornerRadius) => updateLayer(layer.id, { cornerRadius })}
          unit="px"
          min={0}
        />
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
          <p className="text-xs text-zinc-600 px-4 text-center">
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
