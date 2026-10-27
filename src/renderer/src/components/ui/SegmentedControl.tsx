import { useId } from 'react'
import { motion } from 'framer-motion'
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
  const layoutId = useId()

  return (
    <div
      role="radiogroup"
      className={cn('flex gap-1 rounded-control bg-[rgba(12,45,90,0.16)] p-1', className)}
    >
      {options.map((option) => {
        const active = option.value === value
        return (
          <motion.button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={option.label}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            whileHover={disabled ? undefined : { scale: 1.04 }}
            whileTap={disabled ? undefined : { scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={cn(
              'relative flex flex-1 flex-col items-center justify-center gap-1 rounded-[calc(var(--radius-control)-4px)] px-1 py-1.5 text-[11px] font-medium transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              active ? 'active text-accent-foreground' : 'text-text-muted hover:text-text'
            )}
          >
            {active && (
              <motion.div
                layoutId={`segment-highlight-${layoutId}`}
                className="glass-pill-active absolute inset-0 rounded-[calc(var(--radius-control)-4px)]"
                transition={{ type: 'spring', stiffness: 500, damping: 34 }}
              />
            )}
            <span className="relative z-10 flex flex-col items-center gap-1">
              {option.icon}
              {option.label}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}
