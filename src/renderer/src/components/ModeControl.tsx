import { Snowflake, Droplet, Wind, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import type { AcMode } from '../../../main/devices/ac'
import { cn } from '../lib/cn'

interface ModeControlProps {
  value: AcMode
  options: AcMode[]
  onChange: (mode: AcMode) => void
  disabled?: boolean
}

const ICONS: Record<AcMode, React.ReactNode> = {
  cool: <Snowflake size={20} className="icon-cool" />,
  dry: <Droplet size={20} className="icon-dry" />,
  wind: <Wind size={20} className="icon-wind" />,
  auto: <Sparkles size={20} className="icon-auto" />
}

const LABELS: Record<AcMode, string> = {
  cool: 'Cool',
  dry: 'Dry',
  wind: 'Wind',
  auto: 'Auto'
}

export function ModeControl({
  value,
  options,
  onChange,
  disabled
}: ModeControlProps): React.JSX.Element {
  return (
    <div
      role="radiogroup"
      className="ac-mode-row grid gap-2"
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
    >
      {options.map((mode) => {
        const active = mode === value
        return (
          <motion.button
            key={mode}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={LABELS[mode]}
            disabled={disabled}
            onClick={() => onChange(mode)}
            whileHover={disabled ? undefined : { scale: 1.04 }}
            whileTap={disabled ? undefined : { scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 400, damping: 22 }}
            className={cn(
              'mode-tile glass-surface flex flex-col items-center gap-1.5 rounded-card py-3 text-[11.5px] font-semibold text-white',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              active ? 'active glass-pill-active' : 'glass-surface-hover'
            )}
          >
            {ICONS[mode]}
            {LABELS[mode]}
          </motion.button>
        )
      })}
    </div>
  )
}
