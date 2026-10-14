import { forwardRef } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import { Loader2 } from 'lucide-react'
import { cn } from '../../lib/cn'

type Variant = 'default' | 'accent' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode
  label: string
  variant?: Variant
  size?: Size
  pressed?: boolean
  loading?: boolean
}

const SIZE_CLASSES: Record<Size, string> = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14'
}

const VARIANT_CLASSES: Record<Variant, string> = {
  default: 'bg-surface-raised hover:bg-surface-raised-hover text-text',
  accent: 'bg-accent text-accent-foreground hover:brightness-110',
  danger: 'bg-danger-soft text-danger hover:bg-danger/20',
  ghost: 'bg-transparent hover:bg-surface-raised text-text-muted'
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    icon,
    label,
    variant = 'default',
    size = 'md',
    pressed,
    loading,
    disabled,
    className,
    ...props
  },
  ref
) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          ref={ref}
          type="button"
          aria-label={label}
          aria-pressed={pressed}
          disabled={disabled || loading}
          className={cn(
            'inline-flex items-center justify-center rounded-control transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
            'disabled:opacity-40 disabled:cursor-not-allowed active:scale-95',
            SIZE_CLASSES[size],
            VARIANT_CLASSES[variant],
            pressed && 'ring-2 ring-accent',
            className
          )}
          {...props}
        >
          {loading ? <Loader2 className="animate-spin" size={size === 'sm' ? 14 : 18} /> : icon}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="top"
          sideOffset={6}
          className="z-50 select-none rounded-md bg-black/90 px-2 py-1 text-[11px] font-medium text-white shadow-lg"
        >
          {label}
          <Tooltip.Arrow className="fill-black/90" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
})

export default IconButton
