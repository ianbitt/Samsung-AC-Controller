import { cn } from '../../lib/cn'

interface Option<T extends string> {
  value: T
  label: string
  icon?: React.ReactNode
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  disabled?: boolean
  className?: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  disabled,
  className
}: SegmentedControlProps<T>): React.JSX.Element {
  return (
    <div
      role="radiogroup"
      className={cn('flex gap-1 rounded-control bg-surface-raised p-1', className)}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={option.label}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 rounded-[calc(var(--radius-control)-4px)] px-1 py-1.5 text-[11px] font-medium transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              active ? 'bg-accent text-accent-foreground' : 'text-text-muted hover:text-text'
            )}
          >
            {option.icon}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
