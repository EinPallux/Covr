'use client'

import Link from 'next/link'
import { ChevronLeft, MousePointer2, Hand, Undo2, Redo2, ZoomIn, ZoomOut, Download, Magnet, Layers, SlidersHorizontal, RotateCcw, Group, Ungroup, MessageCircle } from 'lucide-react'
import { useUIStore } from '@/lib/store/uiStore'
import { useHistoryStore } from '@/lib/store/historyStore'
import { useEditorStore } from '@/lib/store/editorStore'
import IconButton from '@/components/ui/IconButton'
import Separator from '@/components/ui/Separator'
import Button from '@/components/ui/Button'

interface Props { onExportClick: () => void }

export default function Toolbar({ onExportClick }: Props) {
  const { zoom, zoomIn, zoomOut, resetZoom, activeTool, setActiveTool, snapEnabled, toggleSnap, togglePanel, panels } = useUIStore()
  const { canUndo, canRedo, undo, redo } = useHistoryStore()
  const { project, selectedIds, layers, setProjectName, groupSelected, ungroupSelected } = useEditorStore()
  const selectedHasGroup = selectedIds.some((id) => layers.find((layer) => layer.id === id)?.groupId)

  return (
    <div className="no-select flex h-12 shrink-0 items-center gap-1 border-b border-zinc-800 bg-zinc-900 px-3">
      <Link href="/" className="flex items-center gap-1.5 rounded px-2 py-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100">
        <ChevronLeft className="h-4 w-4" />
        <span className="hidden text-xs font-medium md:inline">Projects</span>
      </Link>
      <Separator />
      <input
        value={project?.name ?? ''}
        onChange={(event) => setProjectName(event.target.value)}
        aria-label="Project name"
        className="w-48 rounded bg-transparent px-2 py-1 text-sm font-medium text-zinc-300 outline-none hover:bg-zinc-800 focus:bg-zinc-800 focus:ring-1 focus:ring-zinc-700"
      />
      <span className="hidden text-[10px] text-zinc-600 lg:inline">Saved locally</span>
      <Separator />
      <IconButton icon={MousePointer2} tooltip="Select (V)" active={activeTool === 'select'} onClick={() => setActiveTool('select')} />
      <IconButton icon={Hand} tooltip="Pan (H)" active={activeTool === 'hand'} onClick={() => setActiveTool('hand')} />
      <IconButton icon={MessageCircle} tooltip="Comment (C)" active={activeTool === 'comment'} onClick={() => setActiveTool('comment')} />
      <Separator />
      <IconButton icon={Undo2} tooltip="Undo (Ctrl+Z)" onClick={undo} disabled={!canUndo()} />
      <IconButton icon={Redo2} tooltip="Redo (Ctrl+Shift+Z)" onClick={redo} disabled={!canRedo()} />
      <Separator />
      <IconButton icon={Group} tooltip="Group (Ctrl+G)" onClick={groupSelected} disabled={selectedIds.length < 2} />
      <IconButton icon={Ungroup} tooltip="Ungroup (Ctrl+Shift+G)" onClick={ungroupSelected} disabled={!selectedHasGroup} />
      <IconButton icon={Magnet} tooltip={snapEnabled ? 'Snapping On' : 'Snapping Off'} active={snapEnabled} onClick={toggleSnap} />
      <div className="flex-1" />
      <div className="flex items-center gap-0.5">
        <IconButton icon={ZoomOut} tooltip="Zoom Out (-)" onClick={zoomOut} />
        <button onClick={resetZoom} className="w-14 rounded px-1 py-1 text-center text-xs tabular-nums text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-100">{Math.round(zoom * 100)}%</button>
        <IconButton icon={ZoomIn} tooltip="Zoom In (+)" onClick={zoomIn} />
        <IconButton icon={RotateCcw} tooltip="Fit to Screen (F)" onClick={resetZoom} size="sm" />
      </div>
      <Separator />
      <IconButton icon={Layers} tooltip="Toggle Layers (L)" active={panels.layers} onClick={() => togglePanel('layers')} />
      <IconButton icon={SlidersHorizontal} tooltip="Toggle Properties (P)" active={panels.properties} onClick={() => togglePanel('properties')} />
      <Separator />
      <Button variant="primary" size="sm" icon={Download} onClick={onExportClick}>Export</Button>
    </div>
  )
}
