'use client'

import React, { useRef, useCallback, useEffect } from 'react'
import { Stage, Layer, Rect, Circle, Text } from 'react-konva'
import type Konva from 'konva'
import { useEditorStore } from '@/lib/store/editorStore'
import { useUIStore } from '@/lib/store/uiStore'
import { withHistory } from '@/lib/store/historyStore'
import { stageRegistry } from '@/lib/export/stageRegistry'
import type { Layer as EditorLayer, ShapeLayer } from '@/lib/design/schema'
import TextLayerNode from './TextLayerNode'
import ImageLayerNode from './ImageLayerNode'
import ShapeLayerNode from './ShapeLayerNode'
import SelectionTransformer from './SelectionTransformer'

interface Props {
  zoom: number
  width: number
  height: number
  background: string
}

export default function CanvasStage({ zoom, width, height, background }: Props) {
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
    moveGroup,
    project,
    activePageId,
    addComment,
  } = useEditorStore()

  const comments = project?.pages.find((page) => page.id === activePageId)?.comments ?? []

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
    [updateLayer, width, height],
  )

  // ── Event handlers ─────────────────────────────────────────────────────────

  const handleStageMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (activeTool === 'comment') {
        const point = e.target.getStage()?.getPointerPosition()
        const text = window.prompt('Add a comment')
        if (point && text?.trim()) addComment(text.trim(), point.x / zoom, point.y / zoom)
        return
      }
      if (e.target === e.target.getStage()) {
        setSelectedIds([])
        setEditingText(null)
      }
    },
    [activeTool, addComment, zoom, setSelectedIds, setEditingText],
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

      const commitMove = () => {
        syncNodeToStore(node, layer)
        const updated = useEditorStore.getState().layers.find((item) => item.id === layerId)
        if (layer.groupId && updated) {
          moveGroup(layer.groupId, updated.x - layer.x, updated.y - layer.y, layer.id)
        }
      }

      if (snapshot) withHistory(commitMove)
      else commitMove()
    },
    [syncNodeToStore, moveGroup],
  )

  const handleSelect = useCallback(
    (id: string, multi: boolean) => {
      if (editingTextId) {
        setEditingText(null)
      }
      const clicked = useEditorStore.getState().layers.find((layer) => layer.id === id)
      if (!multi && clicked?.groupId) {
        const group = useEditorStore.getState().layers
          .filter((layer) => layer.groupId === clicked.groupId)
          .map((layer) => layer.id)
        setSelectedIds(group)
      } else if (multi) {
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
      width={width * zoom}
      height={height * zoom}
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
        <Rect id="__frame-background" width={width} height={height} fill={background} listening={false} />
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
        {comments.map((comment, index) => (
          <React.Fragment key={comment.id}>
            <Circle x={comment.x} y={comment.y} radius={14 / zoom} fill="#10b981" shadowColor="#000" shadowBlur={8 / zoom} />
            <Text x={comment.x - 14 / zoom} y={comment.y - 8 / zoom} width={28 / zoom} text={String(index + 1)} align="center" fontSize={12 / zoom} fontStyle="bold" fill="#052e16" />
          </React.Fragment>
        ))}
        <SelectionTransformer
          selectedIds={selectedIds}
          layers={layers}
          zoom={zoom}
        />
      </Layer>
    </Stage>
  )
}
