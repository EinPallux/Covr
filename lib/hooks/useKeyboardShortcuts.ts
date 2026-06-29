'use client'

import { useEffect } from 'react'
import { useEditorStore } from '@/lib/store/editorStore'
import { useHistoryStore, withHistory } from '@/lib/store/historyStore'
import { useUIStore } from '@/lib/store/uiStore'

function isTypingTarget(el: EventTarget | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || el.isContentEditable
}

export function useKeyboardShortcuts() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return

      const ctrl = e.ctrlKey || e.metaKey
      const { undo, redo } = useHistoryStore.getState()
      const editor = useEditorStore.getState()
      const ui = useUIStore.getState()

      // ── History ─────────────────────────────────────────────────────────
      if (ctrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
        return
      }
      if (ctrl && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault()
        redo()
        return
      }

      // ── Duplicate ───────────────────────────────────────────────────────
      if (ctrl && e.key === 'd') {
        e.preventDefault()
        const [id] = editor.selectedIds
        if (id) withHistory(() => editor.duplicateLayer(id))
        return
      }

      // ── Delete ──────────────────────────────────────────────────────────
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const deletable = editor.selectedIds.filter(
          (id) => !editor.layers.find((l) => l.id === id)?.locked,
        )
        if (deletable.length) {
          e.preventDefault()
          withHistory(() => deletable.forEach((id) => editor.removeLayer(id)))
        }
        return
      }

      // ── Escape ──────────────────────────────────────────────────────────
      if (e.key === 'Escape') {
        editor.setSelectedIds([])
        editor.setEditingText(null)
        return
      }

      // ── Tools ───────────────────────────────────────────────────────────
      if (e.key === 'v' || e.key === 'V') { ui.setActiveTool('select'); return }
      if (e.key === 'h' || e.key === 'H') { ui.setActiveTool('hand'); return }
      if (e.key === 'c' || e.key === 'C') { ui.setActiveTool('comment'); return }

      // ── Zoom ────────────────────────────────────────────────────────────
      if (ctrl && (e.key === '=' || e.key === '+')) {
        e.preventDefault(); ui.zoomIn(); return
      }
      if (ctrl && e.key === '-') {
        e.preventDefault(); ui.zoomOut(); return
      }
      if (ctrl && e.key === '0') {
        e.preventDefault(); ui.resetZoom(); return
      }
      if (e.key === 'f' || e.key === 'F') {
        const { containerSize } = useUIStore.getState()
        ui.fitToScreen(containerSize.width, containerSize.height)
        return
      }

      // ── Panel toggles ────────────────────────────────────────────────────
      if (e.key === 'l' || e.key === 'L') { ui.togglePanel('layers'); return }
      if (e.key === 'p' || e.key === 'P') { ui.togglePanel('properties'); return }

      // ── Arrow nudge ──────────────────────────────────────────────────────
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        const movable = editor.selectedIds.filter(
          (id) => !editor.layers.find((l) => l.id === id)?.locked,
        )
        if (!movable.length) return
        e.preventDefault()
        const delta = e.shiftKey ? 10 : 1
        withHistory(() => {
          movable.forEach((id) => {
            const layer = editor.layers.find((l) => l.id === id)
            if (!layer) return
            if (e.key === 'ArrowLeft') editor.updateLayer(id, { x: layer.x - delta })
            if (e.key === 'ArrowRight') editor.updateLayer(id, { x: layer.x + delta })
            if (e.key === 'ArrowUp') editor.updateLayer(id, { y: layer.y - delta })
            if (e.key === 'ArrowDown') editor.updateLayer(id, { y: layer.y + delta })
          })
        })
        return
      }

      // ── Layer order shortcuts ─────────────────────────────────────────────
      if (e.key === ']' && ctrl) {
        e.preventDefault()
        const [id] = editor.selectedIds
        if (!id) return
        const idx = editor.layers.findIndex((l) => l.id === id)
        if (idx < editor.layers.length - 1) {
          withHistory(() => editor.reorderLayers(idx, idx + 1))
        }
        return
      }
      if (e.key === '[' && ctrl) {
        e.preventDefault()
        const [id] = editor.selectedIds
        if (!id) return
        const idx = editor.layers.findIndex((l) => l.id === id)
        if (idx > 0) withHistory(() => editor.reorderLayers(idx, idx - 1))
        return
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
