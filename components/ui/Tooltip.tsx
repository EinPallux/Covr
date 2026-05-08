'use client'

import { useState, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils/cn'

interface TooltipProps {
  content: string
  children: React.ReactElement
  side?: 'top' | 'bottom' | 'left' | 'right'
  delay?: number
}

export default function Tooltip({ content, children, side = 'bottom', delay = 500 }: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => setVisible(true), delay)
  }, [delay])

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setVisible(false)
  }, [])

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-50 whitespace-nowrap rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-100 shadow-lg animate-fade-in',
            side === 'bottom' && 'top-full mt-2 left-1/2 -translate-x-1/2',
            side === 'top' && 'bottom-full mb-2 left-1/2 -translate-x-1/2',
            side === 'left' && 'right-full mr-2 top-1/2 -translate-y-1/2',
            side === 'right' && 'left-full ml-2 top-1/2 -translate-y-1/2',
          )}
        >
          {content}
        </div>
      )}
    </div>
  )
}
