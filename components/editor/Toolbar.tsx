'use client'

import Link from 'next/link'
import {
  ChevronLeft,
  MousePointer2,
  Hand,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Download,
  Magnet,
  Layers,
  SlidersHorizontal,
  RotateCcw,
} from 'lucide-react'
import { useUIStore } from '@/lib/store/uiStore'
import { useHistoryStore } from '@/lib/store/historyStore'
import IconButton from '@/components/ui/IconButton'
import Separator from '@/components/ui/Separator'
import Button from '@/components/ui/Button'

interface Props {
  templateName?: string
}

export default function Toolbar({ templateName }: Props) {
  const {
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    activeTool,
    setActiveTool,
    snapEnabled,
    toggleSnap,
    togglePanel,
    panels,
  } = useUIStore()

  const { canUndo, canRedo, undo, redo } = useHistoryStore()

  const zoomPercent = `${Math.round(zoom * 100)}%`

  return (
    <div className="no-select flex h-12 shrink-0 items-center gap-1 border-b border-zinc-800 bg-zinc-900 px-3">
      {/* ── Back + Template name ──────────────────────── */}
      <Link
        href="/"
        className="flex items-center gap-1.5 rounded px-2 py-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden text-xs font-medium md:inline">Gallery</span>
      </Link>

      {templateName && (
        <>
          <Separator />
          <span className="max-w-[180px] truncate text-sm font-medium text-zinc-300 hidden md:block">
            {templateName}
          </span>
        </>
      )}

      <Separator />

      {/* ── Tools ─────────────────────────────────────── */}
      <IconButton
        icon={MousePointer2}
        tooltip="Select (V)"
        active={activeTool === 'select'}
        onClick={() => setActiveTool('select')}
      />
      <IconButton
        icon={Hand}
        tooltip="Pan (H)"
        active={activeTool === 'hand'}
        onClick={() => setActiveTool('hand')}
      />

      <Separator />

      {/* ── History ───────────────────────────────────── */}
      <IconButton
        icon={Undo2}
        tooltip="Undo (Ctrl+Z)"
        onClick={undo}
        disabled={!canUndo()}
      />
      <IconButton
        icon={Redo2}
        tooltip="Redo (Ctrl+Shift+Z)"
        onClick={redo}
        disabled={!canRedo()}
      />

      <Separator />

      {/* ── Snap ──────────────────────────────────────── */}
      <IconButton
        icon={Magnet}
        tooltip={snapEnabled ? 'Snapping On' : 'Snapping Off'}
        active={snapEnabled}
        onClick={toggleSnap}
      />

      {/* ── Spacer ────────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── Zoom controls ─────────────────────────────── */}
      <div className="flex items-center gap-0.5">
        <IconButton icon={ZoomOut} tooltip="Zoom Out (-)" onClick={zoomOut} />
        <button
          onClick={resetZoom}
          className="w-14 rounded px-1 py-1 text-center text-xs tabular-nums text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
        >
          {zoomPercent}
        </button>
        <IconButton icon={ZoomIn} tooltip="Zoom In (+)" onClick={zoomIn} />
        <IconButton icon={RotateCcw} tooltip="Fit to Screen (F)" onClick={resetZoom} size="sm" />
      </div>

      <Separator />

      {/* ── Panel toggles ─────────────────────────────── */}
      <IconButton
        icon={Layers}
        tooltip="Toggle Layers (L)"
        active={panels.layers}
        onClick={() => togglePanel('layers')}
      />
      <IconButton
        icon={SlidersHorizontal}
        tooltip="Toggle Properties (P)"
        active={panels.properties}
        onClick={() => togglePanel('properties')}
      />

      <Separator />

      {/* ── Export ────────────────────────────────────── */}
      <Button variant="primary" size="sm" icon={Download}>
        Export
      </Button>
    </div>
  )
}
