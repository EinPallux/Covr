'use client'

import { useRef, useEffect } from 'react'
import { Transformer } from 'react-konva'
import type Konva from 'konva'
import { useEditorStore } from '@/lib/store/editorStore'
import { withHistory } from '@/lib/store/historyStore'
import type { Layer } from '@/lib/design/schema'

interface Props {
  selectedIds: string[]
  layers: Layer[]
  zoom: number
}

export default function SelectionTransformer({ selectedIds, layers, zoom }: Props) {
  const trRef = useRef<Konva.Transformer>(null)
  const { updateLayer } = useEditorStore()

  // Attach transformer to selected, non-locked nodes
  useEffect(() => {
    const tr = trRef.current
    if (!tr) return
    const stage = tr.getStage()
    if (!stage) return

    const nodes = selectedIds
      .map((id) => stage.findOne<Konva.Node>(`#${id}`))
      .filter((n): n is Konva.Node => {
        if (!n) return false
        const layer = layers.find((l) => l.id === n.id())
        return !!layer && !layer.locked
      })

    tr.nodes(nodes)
    tr.getLayer()?.batchDraw()
  }, [selectedIds, layers])

  const handleTransformEnd = () => {
    const tr = trRef.current
    if (!tr) return

    tr.nodes().forEach((node) => {
      const id = node.id()
      const layer = layers.find((l) => l.id === id)
      if (!layer) return

      const scaleX = node.scaleX()
      const scaleY = node.scaleY()
      const newW = Math.max(1, Math.round(node.width() * scaleX))
      const newH = Math.max(1, Math.round(node.height() * scaleY))

      // Ellipse origin is center — convert back to top-left
      const isEllipse = layer.type === 'shape' && layer.shapeType === 'ellipse'
      const storeX = isEllipse
        ? Math.round(node.x() - newW / 2)
        : Math.round(node.x())
      const storeY = isEllipse
        ? Math.round(node.y() - newH / 2)
        : Math.round(node.y())

      withHistory(() => {
        updateLayer(id, {
          x: storeX,
          y: storeY,
          width: newW,
          // Text height is auto-computed from content; skip forcing it here
          ...(layer.type !== 'text' && { height: newH }),
          rotation: Math.round(node.rotation() * 100) / 100,
        })
      })

      // Bake scale into dimensions, reset to 1
      node.scaleX(1)
      node.scaleY(1)
    })
  }

  // Scale-invariant handle sizes: divide pixel value by zoom
  const anchorSize = Math.max(6, 8 / zoom)
  const borderWidth = 1.5 / zoom

  return (
    <Transformer
      ref={trRef}
      rotateEnabled
      rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
      rotationSnapTolerance={5}
      borderStroke="#10b981"
      borderStrokeWidth={borderWidth}
      anchorStroke="#10b981"
      anchorFill="#ffffff"
      anchorSize={anchorSize}
      anchorCornerRadius={2}
      anchorStyleFunc={(anchor) => {
        // Make rotation handle slightly different
        if (anchor.hasName('rotater')) {
          anchor.cornerRadius(anchorSize / 2)
        }
      }}
      keepRatio={false}
      ignoreStroke
      boundBoxFunc={(oldBox, newBox) => {
        // Prevent collapsing below minimum size
        if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) return oldBox
        return newBox
      }}
      onTransformEnd={handleTransformEnd}
    />
  )
}
