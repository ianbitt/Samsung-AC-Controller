import { cn } from '../../lib/cn'

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element {
  return (
    <div
      className={cn('glass-surface rounded-card p-4 transition-colors duration-500', className)}
      {...props}
    />
  )
}

export function SectionLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>): React.JSX.Element {
  return (
    <h3
      className={cn(
        'text-[11px] font-semibold uppercase tracking-wider text-text-faint',
        className
      )}
      {...props}
    />
  )
}
