import { forwardRef } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import Tooltip from './Tooltip'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon
  tooltip?: string
  tooltipSide?: 'top' | 'bottom' | 'left' | 'right'
  active?: boolean
  size?: 'xs' | 'sm' | 'md'
  danger?: boolean
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, tooltip, tooltipSide, active, size = 'md', danger, className, ...props }, ref) => {
    const btn = (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded transition-colors select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950',
          'disabled:pointer-events-none disabled:opacity-40',
          size === 'xs' && 'h-6 w-6',
          size === 'sm' && 'h-7 w-7',
          size === 'md' && 'h-8 w-8',
          active
            ? 'bg-zinc-700 text-zinc-100'
            : danger
              ? 'text-red-400 hover:text-red-300 hover:bg-red-950/60'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800',
          className,
        )}
        {...props}
      >
        <Icon
          className={cn(
            size === 'xs' && 'h-3 w-3',
            size === 'sm' && 'h-3.5 w-3.5',
            size === 'md' && 'h-4 w-4',
          )}
        />
      </button>
    )

    if (tooltip) {
      return (
        <Tooltip content={tooltip} side={tooltipSide}>
          {btn}
        </Tooltip>
      )
    }

    return btn
  },
)

IconButton.displayName = 'IconButton'
export default IconButton
