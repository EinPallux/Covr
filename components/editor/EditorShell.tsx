'use client'

import { useEffect } from 'react'
import type { Template } from '@/lib/templates/schema'
import { useEditorStore } from '@/lib/store/editorStore'
import { useHistoryStore } from '@/lib/store/historyStore'
import { useKeyboardShortcuts } from '@/lib/hooks/useKeyboardShortcuts'
import Toolbar from './Toolbar'
import CanvasArea from './CanvasArea'
import LayerPanel from './panels/LayerPanel'
import PropertiesPanel from './panels/PropertiesPanel'

interface Props {
  template: Template
}

export default function EditorShell({ template }: Props) {
  const { loadTemplate } = useEditorStore()
  const { clear: clearHistory } = useHistoryStore()

  // Register all keyboard shortcuts
  useKeyboardShortcuts()

  // Load template into editor state on mount
  useEffect(() => {
    loadTemplate(template)
    clearHistory()
  }, [template, loadTemplate, clearHistory])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-950">
      <Toolbar templateName={template.name} />

      <div className="flex flex-1 overflow-hidden">
        <LayerPanel />
        <CanvasArea />
        <PropertiesPanel />
      </div>
    </div>
  )
}
