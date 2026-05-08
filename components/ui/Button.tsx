import { forwardRef } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'xs' | 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  loading?: boolean
  fullWidth?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'secondary',
      size = 'md',
      icon: Icon,
      iconPosition = 'left',
      loading,
      fullWidth,
      className,
      children,
      disabled,
      ...props
    },
    ref,
  ) => {
    const iconSize =
      size === 'xs' || size === 'sm' ? 'h-3.5 w-3.5' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1 focus-visible:ring-offset-zinc-950',
          'disabled:pointer-events-none disabled:opacity-40 select-none',
          // Variants
          variant === 'primary' && 'bg-emerald-600 text-white hover:bg-emerald-500 active:bg-emerald-700',
          variant === 'secondary' && 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 active:bg-zinc-750 border border-zinc-700',
          variant === 'ghost' && 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 active:bg-zinc-700',
          variant === 'danger' && 'bg-red-700/80 text-white hover:bg-red-600 active:bg-red-800',
          // Sizes
          size === 'xs' && 'h-6 px-2 text-xs',
          size === 'sm' && 'h-7 px-2.5 text-xs',
          size === 'md' && 'h-8 px-3.5 text-sm',
          size === 'lg' && 'h-10 px-5 text-sm',
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {Icon && iconPosition === 'left' && (
          <Icon className={cn(iconSize, loading && 'animate-spin')} />
        )}
        {children}
        {Icon && iconPosition === 'right' && <Icon className={iconSize} />}
      </button>
    )
  },
)

Button.displayName = 'Button'
export default Button
