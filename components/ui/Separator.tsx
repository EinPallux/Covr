import { cn } from '@/lib/utils/cn'

interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export default function Separator({ orientation = 'vertical', className }: SeparatorProps) {
  return (
    <div
      className={cn(
        'shrink-0 bg-zinc-800',
        orientation === 'vertical' ? 'w-px h-5' : 'h-px w-full',
        className,
      )}
    />
  )
}
