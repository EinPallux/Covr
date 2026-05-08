'use client'

import { useRef, useEffect, useCallback } from 'react'
import { useUIStore } from '@/lib/store/uiStore'
import type { Template } from '@/lib/templates/schema'

interface Props {
  template: Template
}

const CANVAS_W = 1920
const CANVAS_H = 1080

export default function CanvasArea({ template }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { zoom, fitToScreen } = useUIStore()

  // Fit to screen on initial mount
  useEffect(() => {
    if (!containerRef.current) return
    const { clientWidth, clientHeight } = containerRef.current
    fitToScreen(clientWidth, clientHeight)
  }, [fitToScreen])

  // Ctrl+scroll to zoom
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      const { setZoom } = useUIStore.getState()
      const delta = e.deltaY > 0 ? -0.05 : 0.05
      setZoom(useUIStore.getState().zoom + delta)
    },
    [],
  )

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [handleWheel])

  const canvasStyle = {
    width: CANVAS_W * zoom,
    height: CANVAS_H * zoom,
  }

  return (
    <div
      ref={containerRef}
      className="canvas-bg relative flex flex-1 items-center justify-center overflow-auto"
    >
      {/* Canvas frame */}
      <div
        className="relative shrink-0 overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-zinc-700/50"
        style={canvasStyle}
      >
        {/* Placeholder — Phase 2 mounts Konva Stage here */}
        <div className="flex h-full w-full items-center justify-center bg-zinc-800">
          <div className="text-center select-none pointer-events-none">
            <p className="text-sm font-medium text-zinc-500">{template.name}</p>
            <p className="mt-1 text-xs text-zinc-600 tabular-nums">
              {CANVAS_W} × {CANVAS_H}
            </p>
          </div>
        </div>

        {/* Canvas size overlay — shown when zoomed far out */}
        {zoom < 0.3 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-[10px] text-zinc-600 tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
