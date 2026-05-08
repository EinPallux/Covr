'use client'

import { useRef, useEffect } from 'react'
import { Text } from 'react-konva'
import type Konva from 'konva'
import type { TextLayer } from '@/lib/templates/schema'

interface Props {
  layer: TextLayer
  isSelected: boolean
  isEditing: boolean
  onSelect: (id: string, multi: boolean) => void
  onDragStart: () => void
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void
  onDblClick: (id: string) => void
  onHeightChange: (id: string, height: number) => void
}

export default function TextLayerNode({
  layer,
  isEditing,
  onSelect,
  onDragStart,
  onDragEnd,
  onTransformEnd,
  onDblClick,
  onHeightChange,
}: Props) {
  const nodeRef = useRef<Konva.Text>(null)

  // Sync computed text height back after content/style changes
  useEffect(() => {
    if (!nodeRef.current) return
    const h = Math.ceil(nodeRef.current.height())
    if (h > 0 && Math.abs(h - layer.height) > 1) {
      onHeightChange(layer.id, h)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer.text, layer.fontSize, layer.fontFamily, layer.fontStyle, layer.width, layer.lineHeight, layer.letterSpacing])

  return (
    <Text
      ref={nodeRef}
      id={layer.id}
      x={layer.x}
      y={layer.y}
      width={layer.width}
      rotation={layer.rotation}
      opacity={layer.opacity}
      // Hide the Konva node while DOM textarea is active
      visible={layer.visible && !isEditing}
      text={layer.text}
      fontFamily={layer.fontFamily}
      fontSize={layer.fontSize}
      fontStyle={layer.fontStyle}
      fill={layer.color}
      align={layer.align as 'left' | 'center' | 'right'}
      lineHeight={layer.lineHeight}
      letterSpacing={layer.letterSpacing}
      stroke={layer.stroke ?? undefined}
      strokeWidth={layer.strokeWidth}
      wrap="word"
      listening={!layer.locked}
      draggable={!layer.locked && !isEditing}
      perfectDrawEnabled={false}
      onClick={(e) => {
        e.cancelBubble = true
        onSelect(layer.id, e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey)
      }}
      onTap={(e) => {
        e.cancelBubble = true
        onSelect(layer.id, false)
      }}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
      onDblClick={(e) => {
        e.cancelBubble = true
        if (layer.editable) onDblClick(layer.id)
      }}
      onDblTap={(e) => {
        e.cancelBubble = true
        if (layer.editable) onDblClick(layer.id)
      }}
    />
  )
}
