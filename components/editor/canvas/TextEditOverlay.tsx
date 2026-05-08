'use client'

import { useEffect, useRef } from 'react'
import { useEditorStore } from '@/lib/store/editorStore'
import { withHistory } from '@/lib/store/historyStore'
import type { TextLayer } from '@/lib/templates/schema'

interface Props {
  layer: TextLayer
  zoom: number
}

export default function TextEditOverlay({ layer, zoom }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { updateLayer, setEditingText, setSelectedIds } = useEditorStore()

  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.focus()
    // Place cursor at end
    ta.setSelectionRange(ta.value.length, ta.value.length)
  }, [])

  const commit = () => {
    const ta = textareaRef.current
    if (!ta) return
    const newText = ta.value
    if (newText !== layer.text) {
      withHistory(() => updateLayer(layer.id, { text: newText }))
    }
    setEditingText(null)
    setSelectedIds([layer.id])
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    e.stopPropagation()
    if (e.key === 'Escape') {
      // Cancel — restore original text
      setEditingText(null)
      setSelectedIds([layer.id])
    }
    // Ctrl/Cmd+Enter or just Escape exits editing
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      commit()
    }
  }

  // Map Konva fontStyle string to CSS font-weight + font-style
  const isBold = layer.fontStyle.includes('bold')
  const isItalic = layer.fontStyle.includes('italic')

  return (
    <textarea
      ref={textareaRef}
      defaultValue={layer.text}
      onBlur={commit}
      onKeyDown={handleKeyDown}
      style={{
        position: 'absolute',
        left: layer.x * zoom,
        top: layer.y * zoom,
        width: layer.width * zoom,
        minHeight: layer.height * zoom,
        fontSize: layer.fontSize * zoom,
        fontFamily: layer.fontFamily,
        fontWeight: isBold ? 'bold' : 'normal',
        fontStyle: isItalic ? 'italic' : 'normal',
        color: layer.color,
        textAlign: layer.align as 'left' | 'center' | 'right',
        lineHeight: layer.lineHeight,
        letterSpacing: layer.letterSpacing * zoom,
        WebkitTextStroke:
          layer.strokeWidth > 0
            ? `${layer.strokeWidth * zoom}px ${layer.stroke ?? 'transparent'}`
            : undefined,
        // Match Konva rendering as closely as possible
        background: 'transparent',
        border: '1px dashed rgba(16,185,129,0.6)',
        outline: 'none',
        resize: 'none',
        padding: 0,
        margin: 0,
        overflow: 'hidden',
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
        transformOrigin: 'top left',
        transform: layer.rotation !== 0 ? `rotate(${layer.rotation}deg)` : undefined,
        zIndex: 10,
        cursor: 'text',
      }}
    />
  )
}
