import * as Switch from '@radix-ui/react-switch'
import { Sparkles } from 'lucide-react'
import { Card } from './ui/Card'
import { cn } from '../lib/cn'

interface SelfCleanCardProps {
  on: boolean
  running: boolean
  progress: number
  onToggle: () => void
  disabled?: boolean
}

export function SelfCleanCard({
  on,
  running,
  progress,
  onToggle,
  disabled
}: SelfCleanCardProps): React.JSX.Element {
  return (
    <Card className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        <Sparkles size={16} className="text-accent" />
        <div>
          <p className="text-[13px] font-medium text-text">Self-clean</p>
          {running && <p className="text-[11px] text-text-muted">{progress}% complete</p>}
        </div>
      </div>
      <Switch.Root
        checked={on}
        onCheckedChange={onToggle}
        disabled={disabled}
        aria-label="Toggle self-clean"
        className={cn(
          'relative h-6 w-10 shrink-0 rounded-full transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          on ? 'bg-accent' : 'bg-surface-raised-hover'
        )}
      >
        <Switch.Thumb
          className={cn(
            'block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform duration-150',
            'data-[state=checked]:translate-x-[18px]'
          )}
        />
      </Switch.Root>
    </Card>
  )
}
