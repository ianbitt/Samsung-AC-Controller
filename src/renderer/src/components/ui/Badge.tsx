import { cn } from '../../lib/cn'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'accent' | 'warning' | 'neutral'
}

const VARIANT_CLASSES: Record<NonNullable<BadgeProps['variant']>, string> = {
  accent: 'bg-accent-soft text-accent',
  warning: 'bg-warning-soft text-warning',
  neutral: 'bg-surface-raised text-text-muted'
}

export function Badge({ variant = 'neutral', className, ...props }: BadgeProps): React.JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
        VARIANT_CLASSES[variant],
        className
      )}
      {...props}
    />
  )
}
