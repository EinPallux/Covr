'use client'

import { useRef, useCallback, useEffect } from 'react'
import { Stage, Layer } from 'react-konva'
import type Konva from 'konva'
import { useEditorStore } from '@/lib/store/editorStore'
import { useUIStore } from '@/lib/store/uiStore'
import { withHistory } from '@/lib/store/historyStore'
import { stageRegistry } from '@/lib/export/stageRegistry'
import type { Layer as EditorLayer, ShapeLayer } from '@/lib/templates/schema'
import TextLayerNode from './TextLayerNode'
import ImageLayerNode from './ImageLayerNode'
import ShapeLayerNode from './ShapeLayerNode'
import SelectionTransformer from './SelectionTransformer'

const CANVAS_W = 1920
const CANVAS_H = 1080

interface Props {
  zoom: number
}

export default function CanvasStage({ zoom }: Props) {
  const stageRef = useRef<Konva.Stage>(null)

  // Register the stage so the export function can access it without prop drilling
  useEffect(() => {
    if (stageRef.current) stageRegistry.set(stageRef.current)
    return () => stageRegistry.set(null)
  }, [])

  const {
    layers,
    selectedIds,
    editingTextId,
    setSelectedIds,
    toggleSelectedId,
    updateLayer,
    setEditingText,
  } = useEditorStore()

  const { activeTool } = useUIStore()

  // ── Helpers ────────────────────────────────────────────────────────────────

  /** Read the Konva node's current position/size and commit to store. */
  const syncNodeToStore = useCallback(
    (node: Konva.Node, layer: EditorLayer) => {
      const scaleX = node.scaleX()
      const scaleY = node.scaleY()
      const newW = Math.max(1, Math.round(node.width() * scaleX))
      const newH = Math.max(1, Math.round(node.height() * scaleY))

      // Ellipse stores top-left but Konva reports center
      const isEllipse =
        layer.type === 'shape' && (layer as ShapeLayer).shapeType === 'ellipse'
      const storeX = isEllipse
        ? Math.round(node.x() - newW / 2)
        : Math.round(node.x())
      const storeY = isEllipse
        ? Math.round(node.y() - newH / 2)
        : Math.round(node.y())

      updateLayer(layer.id, {
        x: storeX,
        y: storeY,
        ...(layer.type !== 'text' && { width: newW, height: newH }),
      })

      node.scaleX(1)
      node.scaleY(1)
    },
    [updateLayer],
  )

  // ── Event handlers ─────────────────────────────────────────────────────────

  const handleStageMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      // Clicked the stage background → deselect
      if (e.target === e.target.getStage()) {
        setSelectedIds([])
        setEditingText(null)
      }
    },
    [setSelectedIds, setEditingText],
  )

  const handleDragStart = useCallback(() => {
    // Snapshot before drag begins
    const before = useEditorStore.getState().layers
    useEditorStore.setState({ _dragSnapshot: before } as never)
  }, [])

  const handleDragEnd = useCallback(
    (layerId: string, e: Konva.KonvaEventObject<DragEvent>) => {
      const node = e.target
      const layer = useEditorStore.getState().layers.find((l) => l.id === layerId)
      if (!layer) return

      // Retrieve snapshot taken at drag start
      const snapshot = (useEditorStore.getState() as unknown as Record<string, unknown>)
        ._dragSnapshot as EditorLayer[] | undefined

      if (snapshot) {
        withHistory(() => syncNodeToStore(node, layer))
      } else {
        syncNodeToStore(node, layer)
      }
    },
    [syncNodeToStore],
  )

  const handleSelect = useCallback(
    (id: string, multi: boolean) => {
      if (editingTextId) {
        setEditingText(null)
      }
      if (multi) {
        toggleSelectedId(id, true)
      } else {
        setSelectedIds([id])
      }
    },
    [editingTextId, setEditingText, toggleSelectedId, setSelectedIds],
  )

  const handleTextDblClick = useCallback(
    (id: string) => {
      setSelectedIds([])
      setEditingText(id)
    },
    [setSelectedIds, setEditingText],
  )

  const handleHeightChange = useCallback(
    (id: string, height: number) => {
      updateLayer(id, { height })
    },
    [updateLayer],
  )

  // ── Cursor ─────────────────────────────────────────────────────────────────

  const cursor =
    activeTool === 'hand'
      ? 'grab'
      : activeTool === 'text'
        ? 'text'
        : 'default'

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Stage
      ref={stageRef}
      width={CANVAS_W * zoom}
      height={CANVAS_H * zoom}
      scaleX={zoom}
      scaleY={zoom}
      onMouseDown={handleStageMouseDown}
      onTouchStart={(e) => {
        if (e.target === e.target.getStage()) setSelectedIds([])
      }}
      style={{ cursor, display: 'block' }}
    >
      {/* ── Content layer ─────────────────────────────────────────────────── */}
      <Layer>
        {layers.map((layer) => {
          if (!layer.visible) return null

          const commonProps = {
            isSelected: selectedIds.includes(layer.id),
            onSelect: handleSelect,
            onDragStart: handleDragStart,
            onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => handleDragEnd(layer.id, e),
            onTransformEnd: () => {},
          }

          if (layer.type === 'text') {
            return (
              <TextLayerNode
                key={layer.id}
                {...commonProps}
                layer={layer}
                isEditing={editingTextId === layer.id}
                onDblClick={handleTextDblClick}
                onHeightChange={handleHeightChange}
              />
            )
          }

          if (layer.type === 'image') {
            return <ImageLayerNode key={layer.id} {...commonProps} layer={layer} />
          }

          if (layer.type === 'shape') {
            return <ShapeLayerNode key={layer.id} {...commonProps} layer={layer} />
          }

          return null
        })}
      </Layer>

      {/* ── Transformer layer — separate to avoid content redraws ─────────── */}
      <Layer listening={false}>
        <SelectionTransformer
          selectedIds={selectedIds}
          layers={layers}
          zoom={zoom}
        />
      </Layer>
    </Stage>
  )
}
