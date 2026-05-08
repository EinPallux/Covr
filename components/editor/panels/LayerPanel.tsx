'use client'

import { useCallback, useRef, useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Type,
  ImageIcon,
  Square,
  Plus,
  Trash2,
  GripVertical,
} from 'lucide-react'
import { useEditorStore } from '@/lib/store/editorStore'
import { useUIStore } from '@/lib/store/uiStore'
import { withHistory } from '@/lib/store/historyStore'
import { makeTextLayer, makeImageLayer, makeShapeLayer } from '@/lib/templates/schema'
import type { Layer } from '@/lib/templates/schema'
import IconButton from '@/components/ui/IconButton'
import { cn } from '@/lib/utils/cn'

// ─── Constants ────────────────────────────────────────────────────────────────

const TYPE_ICONS = {
  text: Type,
  image: ImageIcon,
  shape: Square,
} as const

const TYPE_COLORS = {
  text: 'text-blue-400',
  image: 'text-violet-400',
  shape: 'text-amber-400',
} as const

// ─── Add Layer Menu ───────────────────────────────────────────────────────────

interface AddLayerMenuProps {
  onClose: () => void
}

function AddLayerMenu({ onClose }: AddLayerMenuProps) {
  const { addLayer } = useEditorStore()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const add = (layer: Omit<Layer, 'id'>) => {
    withHistory(() => addLayer(layer))
    onClose()
  }

  return (
    <div
      ref={menuRef}
      className="absolute right-0 top-full z-50 mt-1 w-36 overflow-hidden rounded border border-zinc-700 bg-zinc-800 shadow-xl"
    >
      <button
        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-700"
        onClick={() => add(makeTextLayer())}
      >
        <Type className="h-3.5 w-3.5 text-blue-400" />
        Text layer
      </button>
      <button
        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-700"
        onClick={() => add(makeImageLayer())}
      >
        <ImageIcon className="h-3.5 w-3.5 text-violet-400" />
        Image layer
      </button>
      <button
        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-700"
        onClick={() => add(makeShapeLayer())}
      >
        <Square className="h-3.5 w-3.5 text-amber-400" />
        Shape layer
      </button>
    </div>
  )
}

// ─── Sortable layer item ───────────────────────────────────────────────────────

interface LayerItemProps {
  layer: Layer
  isSelected: boolean
}

function SortableLayerItem({ layer, isSelected }: LayerItemProps) {
  const { setSelectedIds, setLayerVisibility, setLayerLock, removeLayer } = useEditorStore()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: layer.id,
  })

  const Icon = TYPE_ICONS[layer.type]
  const iconColor = TYPE_COLORS[layer.type]

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 999 : undefined,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex h-9 cursor-pointer items-center gap-1.5 pl-1 pr-2 transition-colors select-none',
        isSelected
          ? 'border-l-2 border-emerald-500 bg-zinc-800 text-zinc-100'
          : 'border-l-2 border-transparent text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200',
        layer.locked && 'opacity-60',
        isDragging && 'opacity-50 bg-zinc-800 ring-1 ring-zinc-600',
      )}
      onClick={() => {
        if (!layer.locked) setSelectedIds([layer.id])
      }}
    >
      {/* Drag handle */}
      <button
        className="shrink-0 cursor-grab touch-none text-zinc-600 hover:text-zinc-400 active:cursor-grabbing"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-3 w-3" />
      </button>

      {/* Type icon */}
      <Icon className={cn('h-3.5 w-3.5 shrink-0', iconColor)} />

      {/* Name */}
      <span className="min-w-0 flex-1 truncate text-xs">{layer.name}</span>

      {/* Row actions — visible on hover or selection */}
      <div
        className={cn(
          'flex shrink-0 items-center gap-0.5 transition-opacity',
          isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
        )}
      >
        <IconButton
          icon={layer.visible ? Eye : EyeOff}
          size="xs"
          tooltip={layer.visible ? 'Hide layer' : 'Show layer'}
          tooltipSide="top"
          onClick={(e) => {
            e.stopPropagation()
            setLayerVisibility(layer.id, !layer.visible)
          }}
        />
        <IconButton
          icon={layer.locked ? Lock : Unlock}
          size="xs"
          tooltip={layer.locked ? 'Unlock layer' : 'Lock layer'}
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
            tooltip="Delete layer"
            tooltipSide="top"
            danger
            onClick={(e) => {
              e.stopPropagation()
              withHistory(() => removeLayer(layer.id))
            }}
          />
        )}
      </div>
    </div>
  )
}

// ─── Panel root ───────────────────────────────────────────────────────────────

export default function LayerPanel() {
  const { layers, selectedIds, reorderLayers } = useEditorStore()
  const { panels } = useUIStore()
  const [showAddMenu, setShowAddMenu] = useState(false)

  // Panel shows layers top→bottom (highest index = top of canvas = top of panel)
  const displayLayers = [...layers].reverse()
  const displayIds = displayLayers.map((l) => l.id)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const dispFrom = displayLayers.findIndex((l) => l.id === active.id)
      const dispTo = displayLayers.findIndex((l) => l.id === over.id)

      const fromIdx = layers.length - 1 - dispFrom
      const toIdx = layers.length - 1 - dispTo

      withHistory(() => reorderLayers(fromIdx, toIdx))
    },
    [displayLayers, layers.length, reorderLayers],
  )

  if (!panels.layers) return null

  return (
    <div className="flex w-56 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900">
      {/* Header */}
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-zinc-800 px-3">
        <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500">
          Layers
        </span>
        <div className="relative flex items-center gap-1">
          <span className="text-[10px] text-zinc-700 tabular-nums">{layers.length}</span>
          <IconButton
            icon={Plus}
            size="xs"
            tooltip="Add layer"
            active={showAddMenu}
            onClick={() => setShowAddMenu((v) => !v)}
          />
          {showAddMenu && <AddLayerMenu onClose={() => setShowAddMenu(false)} />}
        </div>
      </div>

      {/* Sortable layer list */}
      <div className="flex-1 overflow-y-auto py-1">
        {displayLayers.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-zinc-700">No layers</p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={displayIds} strategy={verticalListSortingStrategy}>
              {displayLayers.map((layer) => (
                <SortableLayerItem
                  key={layer.id}
                  layer={layer}
                  isSelected={selectedIds.includes(layer.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
