import { Minus, Plus, Power, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../lib/cn'
import { AcUnitVisual } from './AcUnitVisual'

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
      whileHover={disabled ? undefined : { scale: 1.06 }}
      whileTap={disabled ? undefined : { scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={cn(
        'glass-surface glass-surface-hover flex h-11 w-11 items-center justify-center rounded-full text-white',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
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
    <div className="relative">
      <div className="pt-4">
        <AcUnitVisual isOn={on} />
      </div>

      <div className="flex flex-col items-center gap-0.5 pt-1">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={target}
            initial={{ opacity: 0, y: -6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9, position: 'absolute' }}
            transition={{ type: 'spring', stiffness: 500, damping: 24 }}
            className="text-[58px] font-extralight leading-none tracking-[-0.03em] text-text"
          >
            {target}°{unit}
          </motion.span>
        </AnimatePresence>
        <span className="text-[12px] font-medium tracking-tight text-text-muted">
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
          whileHover={disabled || busy ? undefined : { scale: 1.06 }}
          whileTap={disabled || busy ? undefined : { scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          className={cn(
            'flex h-16 w-16 items-center justify-center rounded-full transition-colors duration-300',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            on ? 'power-orb-on' : 'glass-surface glass-surface-hover text-white'
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
          'pb-3 text-center text-[12px] font-medium tracking-tight transition-colors duration-300',
          on ? 'text-white/90' : 'text-text-faint'
        )}
      >
        AC is {on ? 'On' : 'Off'}
      </p>
    </div>
  )
}
