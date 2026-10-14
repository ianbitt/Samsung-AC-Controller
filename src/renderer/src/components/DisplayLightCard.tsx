import * as Switch from '@radix-ui/react-switch'
import { Lightbulb, LightbulbOff } from 'lucide-react'
import { Card } from './ui/Card'
import { cn } from '../lib/cn'

interface DisplayLightCardProps {
  on: boolean
  onToggle: () => void
  disabled?: boolean
}

export function DisplayLightCard({
  on,
  onToggle,
  disabled
}: DisplayLightCardProps): React.JSX.Element {
  return (
    <Card className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5">
        {on ? (
          <Lightbulb size={16} className="text-accent" />
        ) : (
          <LightbulbOff size={16} className="text-text-muted" />
        )}
        <p className="text-[13px] font-medium text-text">Display light</p>
      </div>
      <Switch.Root
        checked={on}
        onCheckedChange={onToggle}
        disabled={disabled}
        aria-label="Toggle display light"
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
