'use client'

import { useRef, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { useEditorStore } from '@/lib/store/editorStore'
import { useUIStore } from '@/lib/store/uiStore'
import type { TextLayer } from '@/lib/design/schema'
import TextEditOverlay from './canvas/TextEditOverlay'

// Konva requires DOM — never SSR
const CanvasStage = dynamic(() => import('./canvas/CanvasStage'), { ssr: false })

export default function CanvasArea() {
  const outerRef = useRef<HTMLDivElement>(null)
  const { zoom, activeTool, setContainerSize, setCanvasSize, fitToScreen } = useUIStore()
  const { editingTextId, layers, project, activePageId } = useEditorStore()
  const activePage = project?.pages.find((page) => page.id === activePageId)
  const canvasWidth = activePage?.width ?? 1080
  const canvasHeight = activePage?.height ?? 1080
  const canvasBackground = activePage?.background ?? '#ffffff'

  const editingLayer = editingTextId
    ? (layers.find((l) => l.id === editingTextId) as TextLayer | undefined)
    : undefined

  useEffect(() => {
    setCanvasSize(canvasWidth, canvasHeight)
    const frame = requestAnimationFrame(() => {
      fitToScreen()
      const container = outerRef.current
      if (container) {
        container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2
        container.scrollTop = (container.scrollHeight - container.clientHeight) / 2
      }
    })
    return () => cancelAnimationFrame(frame)
  }, [canvasWidth, canvasHeight, setCanvasSize, fitToScreen])

  // ── Report container size to uiStore for fit-to-screen ───────────────────
  useEffect(() => {
    const el = outerRef.current
    if (!el) return

    const report = () => setContainerSize(el.clientWidth, el.clientHeight)
    report()

    const ro = new ResizeObserver(report)
    ro.observe(el)
    return () => ro.disconnect()
  }, [setContainerSize])

  // ── Fit to screen on first mount ──────────────────────────────────────────
  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    fitToScreen(el.clientWidth, el.clientHeight)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Ctrl/Cmd + scroll = zoom ──────────────────────────────────────────────
  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      const { zoom: z, setZoom } = useUIStore.getState()
      const factor = e.deltaY < 0 ? 1.08 : 0.92
      setZoom(z * factor)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  // ── Hand tool: drag to pan ────────────────────────────────────────────────
  const isPanning = useRef(false)
  const panStart = useRef({ x: 0, y: 0, sl: 0, st: 0 })

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const isHandTool = activeTool === 'hand' || e.buttons === 4 // middle-click
      const isSpaceHeld = (e.nativeEvent as MouseEvent & { _spaceHeld?: boolean })._spaceHeld
      if (!isHandTool && !isSpaceHeld) return
      isPanning.current = true
      const el = outerRef.current!
      panStart.current = { x: e.clientX, y: e.clientY, sl: el.scrollLeft, st: el.scrollTop }
      e.preventDefault()
    },
    [activeTool],
  )

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning.current) return
    const el = outerRef.current!
    el.scrollLeft = panStart.current.sl - (e.clientX - panStart.current.x)
    el.scrollTop = panStart.current.st - (e.clientY - panStart.current.y)
  }, [])

  const handleMouseUp = useCallback(() => {
    isPanning.current = false
  }, [])

  // ── Space + drag: temporary pan mode ─────────────────────────────────────
  useEffect(() => {
    const el = outerRef.current
    if (!el) return

    let held = false
    const downKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat) return
      if (isTypingTarget(e.target)) return
      held = true
      el.style.cursor = 'grab'
    }
    const upKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
      held = false
      el.style.cursor = ''
    }
    const mouseDown = (e: MouseEvent) => {
      if (!held) return
      isPanning.current = true
      panStart.current = { x: e.clientX, y: e.clientY, sl: el.scrollLeft, st: el.scrollTop }
      e.preventDefault()
    }
    const mouseMove = (e: MouseEvent) => {
      if (!isPanning.current || !held) return
      el.scrollLeft = panStart.current.sl - (e.clientX - panStart.current.x)
      el.scrollTop = panStart.current.st - (e.clientY - panStart.current.y)
    }
    const mouseUp = () => { isPanning.current = false }

    window.addEventListener('keydown', downKey)
    window.addEventListener('keyup', upKey)
    el.addEventListener('mousedown', mouseDown)
    window.addEventListener('mousemove', mouseMove)
    window.addEventListener('mouseup', mouseUp)
    return () => {
      window.removeEventListener('keydown', downKey)
      window.removeEventListener('keyup', upKey)
      el.removeEventListener('mousedown', mouseDown)
      window.removeEventListener('mousemove', mouseMove)
      window.removeEventListener('mouseup', mouseUp)
    }
  }, [])

  const canvasW = canvasWidth * zoom
  const canvasH = canvasHeight * zoom

  return (
    <div
      ref={outerRef}
      className="canvas-bg relative flex-1 overflow-auto"
      style={{ cursor: activeTool === 'hand' ? 'grab' : 'default' }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/*
        Centering wrapper: when canvas is smaller than container, it centers.
        When larger, it scrolls. The stage container is the positioning root
        for the TextEditOverlay.
      */}
      <div
        className="flex min-h-full min-w-full items-center justify-center p-10"
      >
        <div
          className="relative shrink-0 shadow-2xl shadow-black/60 ring-1 ring-zinc-700/40"
          style={{ width: canvasW, height: canvasH }}
        >
          <CanvasStage zoom={zoom} width={canvasWidth} height={canvasHeight} background={canvasBackground} />

          {editingLayer && (
            <TextEditOverlay layer={editingLayer} zoom={zoom} />
          )}
        </div>
      </div>
    </div>
  )
}

function isTypingTarget(el: EventTarget | null): boolean {
  if (!el || !(el instanceof HTMLElement)) return false
  return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable
}
