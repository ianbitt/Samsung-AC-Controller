import { Minus, Plus } from 'lucide-react'
import IconButton from './ui/IconButton'

interface TemperatureCardProps {
  target: number
  current: number
  unit: 'C' | 'F'
  onStep: (delta: number) => void
  disabled?: boolean
}

export function TemperatureCard({
  target,
  current,
  unit,
  onStep,
  disabled
}: TemperatureCardProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-center gap-5 rounded-card border border-border bg-surface-raised py-5">
      <IconButton
        icon={<Minus size={18} strokeWidth={2.5} />}
        label="Decrease temperature"
        size="lg"
        disabled={disabled}
        onClick={() => onStep(-1)}
      />
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[44px] font-semibold leading-none tracking-tight text-text">
          {target}°{unit}
        </span>
        <span className="text-[11px] text-text-muted">
          now {current}°{unit}
        </span>
      </div>
      <IconButton
        icon={<Plus size={18} strokeWidth={2.5} />}
        label="Increase temperature"
        size="lg"
        disabled={disabled}
        onClick={() => onStep(1)}
      />
    </div>
  )
}
