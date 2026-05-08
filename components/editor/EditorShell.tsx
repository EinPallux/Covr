'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Template } from '@/lib/templates/schema'
import { useEditorStore } from '@/lib/store/editorStore'
import { useHistoryStore } from '@/lib/store/historyStore'
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts'
import Toolbar from './Toolbar'
import CanvasArea from './CanvasArea'
import LayerPanel from './panels/LayerPanel'
import PropertiesPanel from './panels/PropertiesPanel'
import ExportDialog from './ExportDialog'

interface Props {
  template: Template
}

export default function EditorShell({ template }: Props) {
  const { loadTemplate } = useEditorStore()
  const { clear: clearHistory } = useHistoryStore()
  const [exportOpen, setExportOpen] = useState(false)

  useKeyboardShortcuts()

  useEffect(() => {
    loadTemplate(template)
    clearHistory()
  }, [template, loadTemplate, clearHistory])

  const openExport = useCallback(() => setExportOpen(true), [])
  const closeExport = useCallback(() => setExportOpen(false), [])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950">
      <Toolbar templateName={template.name} onExportClick={openExport} />

      <div className="flex flex-1 overflow-hidden">
        <LayerPanel />
        <CanvasArea />
        <PropertiesPanel />
      </div>

      {exportOpen && <ExportDialog onClose={closeExport} />}
    </div>
  )
}
