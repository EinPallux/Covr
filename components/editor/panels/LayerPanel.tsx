'use client'

import { Eye, EyeOff, Lock, Unlock, Type, ImageIcon, Square, Plus, Trash2 } from 'lucide-react'
import { useEditorStore } from '@/lib/store/editorStore'
import { useUIStore } from '@/lib/store/uiStore'
import type { Layer } from '@/lib/templates/schema'
import IconButton from '@/components/ui/IconButton'
import { cn } from '@/lib/utils/cn'

const TYPE_ICONS = {
  text: Type,
  image: ImageIcon,
  shape: Square,
} as const

function LayerItem({ layer, isSelected }: { layer: Layer; isSelected: boolean }) {
  const { setSelectedIds, setLayerVisibility, setLayerLock, removeLayer } = useEditorStore()
  const Icon = TYPE_ICONS[layer.type]

  return (
    <div
      onClick={() => !layer.locked && setSelectedIds([layer.id])}
      className={cn(
        'group flex h-9 cursor-pointer items-center gap-2 px-3 transition-colors',
        isSelected
          ? 'border-l-2 border-emerald-500 bg-zinc-800 text-zinc-100'
          : 'border-l-2 border-transparent text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200',
        layer.locked && 'cursor-not-allowed opacity-60',
      )}
    >
      {/* Type icon */}
      <Icon className="h-3.5 w-3.5 shrink-0 text-zinc-500" />

      {/* Name */}
      <span className="flex-1 truncate text-xs">{layer.name}</span>

      {/* Actions — visible on hover or when active */}
      <div
        className={cn(
          'flex items-center gap-0.5 transition-opacity',
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
      >
        <IconButton
          icon={layer.visible ? Eye : EyeOff}
          size="xs"
          tooltip={layer.visible ? 'Hide' : 'Show'}
          tooltipSide="top"
          onClick={(e) => {
            e.stopPropagation()
            setLayerVisibility(layer.id, !layer.visible)
          }}
        />
        <IconButton
          icon={layer.locked ? Lock : Unlock}
          size="xs"
          tooltip={layer.locked ? 'Unlock' : 'Lock'}
          tooltipSide="top"
          onClick={(e) => {
            e.stopPropagation()
            setLayerLock(layer.id, !layer.locked)
          }}
        />
        {!layer.locked && (
          <IconButton
            icon={Trash2}
            size="xs"
            tooltip="Delete"
            tooltipSide="top"
            danger
            onClick={(e) => {
              e.stopPropagation()
              removeLayer(layer.id)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default function LayerPanel() {
  const { layers, selectedIds } = useEditorStore()
  const { panels } = useUIStore()

  if (!panels.layers) return null

  // Layers render bottom→top in canvas; panel shows top→bottom
  const reversed = [...layers].reverse()

  return (
    <div className="flex w-56 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900">
      {/* Header */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-zinc-800 px-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Layers
        </span>
        <IconButton icon={Plus} size="xs" tooltip="Add Layer" />
      </div>

      {/* Layer list */}
      <div className="flex-1 overflow-y-auto py-1">
        {reversed.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-zinc-600">No layers</p>
        ) : (
          reversed.map((layer) => (
            <LayerItem
              key={layer.id}
              layer={layer}
              isSelected={selectedIds.includes(layer.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
