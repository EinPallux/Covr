'use client'

import { Rect, Ellipse, Line } from 'react-konva'
import type Konva from 'konva'
import type { ShapeLayer } from '@/lib/design/schema'

interface Props {
  layer: ShapeLayer
  onSelect: (id: string, multi: boolean) => void
  onDragStart: () => void
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void
}

export default function ShapeLayerNode({
  layer,
  onSelect,
  onDragStart,
  onDragEnd,
  onTransformEnd,
}: Props) {
  const eventProps = {
    listening: !layer.locked,
    draggable: !layer.locked,
    onClick: (e: Konva.KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true
      onSelect(layer.id, e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey)
    },
    onTap: (e: Konva.KonvaEventObject<TouchEvent>) => {
      e.cancelBubble = true
      onSelect(layer.id, false)
    },
    onDragStart,
    onDragEnd,
    onTransformEnd,
  }

  const baseStyle = {
    fill: layer.fill,
    stroke: layer.stroke ?? undefined,
    strokeWidth: layer.strokeWidth,
    opacity: layer.opacity,
    visible: layer.visible,
    rotation: layer.rotation,
    perfectDrawEnabled: false,
  }

  if (layer.shapeType === 'ellipse') {
    // Konva Ellipse origin = center. Store x/y = top-left.
    // Use offsetX/offsetY so dragging syncs back to top-left naturally.
    return (
      <Ellipse
        id={layer.id}
        x={layer.x + layer.width / 2}
        y={layer.y + layer.height / 2}
        radiusX={layer.width / 2}
        radiusY={layer.height / 2}
        {...baseStyle}
        {...eventProps}
      />
    )
  }

  if (layer.shapeType === 'triangle') {
    const { width: w, height: h } = layer
    return (
      <Line
        id={layer.id}
        x={layer.x}
        y={layer.y}
        points={[w / 2, 0, w, h, 0, h]}
        closed
        {...baseStyle}
        {...eventProps}
      />
    )
  }

  return (
    <Rect
      id={layer.id}
      x={layer.x}
      y={layer.y}
      width={layer.width}
      height={layer.height}
      cornerRadius={layer.cornerRadius}
      {...baseStyle}
      {...eventProps}
    />
  )
}
