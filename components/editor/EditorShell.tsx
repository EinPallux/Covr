'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useEditorStore } from '@/lib/store/editorStore'
import { useHistoryStore } from '@/lib/store/historyStore'
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts'
import { createProjectFromPreset, DESIGN_PRESETS } from '@/lib/projects/presets'
import { loadProject, saveProject } from '@/lib/projects/persistence'
import Toolbar from './Toolbar'
import CanvasArea from './CanvasArea'
import LayerPanel from './panels/LayerPanel'
import PagePanel from './panels/PagePanel'
import PropertiesPanel from './panels/PropertiesPanel'
import ExportDialog from './ExportDialog'

interface Props { projectId: string }

export default function EditorShell({ projectId }: Props) {
  const { loadProject: openProject } = useEditorStore()
  const { clear: clearHistory } = useHistoryStore()
  const [exportOpen, setExportOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useKeyboardShortcuts()

  useEffect(() => {
    const preset = DESIGN_PRESETS.find((item) => item.id === projectId)
    const project = loadProject(projectId) ?? createProjectFromPreset(preset?.id ?? 'blank-square')
    openProject(project)
    clearHistory()
    saveProject(project)
    setReady(true)
  }, [projectId, openProject, clearHistory])

  useEffect(() => {
    if (!ready) return
    return useEditorStore.subscribe((state) => {
      if (!state.project) return
      if (saveTimer.current) clearTimeout(saveTimer.current)
      saveTimer.current = setTimeout(() => saveProject(state.project!), 250)
    })
  }, [ready])

  const openExport = useCallback(() => setExportOpen(true), [])
  const closeExport = useCallback(() => setExportOpen(false), [])

  if (!ready) {
    return <div className="flex h-screen items-center justify-center bg-zinc-950 text-sm text-zinc-500">Opening project…</div>
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950">
      <Toolbar onExportClick={openExport} />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex w-56 shrink-0 flex-col border-r border-zinc-800 bg-zinc-900">
          <PagePanel />
          <LayerPanel />
        </div>
        <CanvasArea />
        <PropertiesPanel />
      </div>
      {exportOpen && <ExportDialog onClose={closeExport} />}
    </div>
  )
}
