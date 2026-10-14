import { Minus, Plus, Power, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/cn'

interface PowerHeroProps {
  power: 'on' | 'off'
  target: number
  current: number
  unit: 'C' | 'F'
  onStep: (delta: number) => void
  onTogglePower: () => void
  busy?: boolean
  disabled?: boolean
  stepDisabled?: boolean
}

function RoundStepButton({
  icon,
  label,
  onClick,
  disabled
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
}): React.JSX.Element {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.92 }}
      className={cn(
        'flex h-11 w-11 items-center justify-center rounded-full bg-surface-raised-hover text-text transition-colors duration-150',
        'hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        'disabled:opacity-40 disabled:cursor-not-allowed'
      )}
    >
      {icon}
    </motion.button>
  )
}

export function PowerHero({
  power,
  target,
  current,
  unit,
  onStep,
  onTogglePower,
  busy,
  disabled,
  stepDisabled
}: PowerHeroProps): React.JSX.Element {
  const on = power === 'on'

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-card border transition-colors duration-500',
        on
          ? 'border-accent/25 bg-[radial-gradient(circle_at_50%_-10%,rgba(34,211,238,0.24),transparent_65%)]'
          : 'border-border bg-surface-raised'
      )}
    >
      <div className="flex flex-col items-center gap-0.5 pt-5">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={target}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6, position: 'absolute' }}
            transition={{ duration: 0.16 }}
            className="text-[44px] font-semibold leading-none tracking-tight text-text"
          >
            {target}°{unit}
          </motion.span>
        </AnimatePresence>
        <span className="text-[11px] text-text-muted">
          now {current}°{unit}
        </span>
      </div>

      <div className="flex items-center justify-center gap-6 py-4">
        <RoundStepButton
          icon={<Minus size={18} strokeWidth={2.5} />}
          label="Decrease temperature"
          onClick={() => onStep(-1)}
          disabled={disabled || stepDisabled}
        />

        <motion.button
          type="button"
          aria-label={on ? 'Turn off' : 'Turn on'}
          aria-pressed={on}
          disabled={disabled || busy}
          onClick={onTogglePower}
          whileTap={{ scale: 0.92 }}
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-full shadow-lg transition-colors duration-300',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            on ? 'bg-accent text-accent-foreground' : 'bg-surface-raised-hover text-text-muted'
          )}
        >
          {busy ? (
            <Loader2 size={22} className="animate-spin" />
          ) : (
            <Power size={24} strokeWidth={2.25} />
          )}
        </motion.button>

        <RoundStepButton
          icon={<Plus size={18} strokeWidth={2.5} />}
          label="Increase temperature"
          onClick={() => onStep(1)}
          disabled={disabled || stepDisabled}
        />
      </div>

      <p
        className={cn(
          'pb-3 text-center text-[11px] font-semibold uppercase tracking-wide transition-colors duration-300',
          on ? 'text-accent' : 'text-text-faint'
        )}
      >
        AC is {on ? 'On' : 'Off'}
      </p>
    </div>
  )
}
