import { Droplets, Zap, Filter } from 'lucide-react'
import { Card } from './ui/Card'
import { cn } from '../lib/cn'

interface TelemetryRowProps {
  humidity: number
  powerWatts: number
  filterStatus: string
}

export function TelemetryRow({
  humidity,
  powerWatts,
  filterStatus
}: TelemetryRowProps): React.JSX.Element {
  const filterWarning = filterStatus !== 'normal'

  return (
    <div className="grid grid-cols-3 gap-2">
      <Card className="flex flex-col items-center gap-1 p-3">
        <Droplets size={15} className="text-accent" />
        <span className="text-sm font-semibold text-text">{humidity}%</span>
        <span className="text-[10px] text-text-faint">Humidity</span>
      </Card>
      <Card className="flex flex-col items-center gap-1 p-3">
        <Zap size={15} className="text-accent" />
        <span className="text-sm font-semibold text-text">{powerWatts}W</span>
        <span className="text-[10px] text-text-faint">Power</span>
      </Card>
      <Card
        className={cn(
          'flex flex-col items-center gap-1 p-3 transition-colors duration-300',
          filterWarning && 'border-warning/40 bg-warning-soft'
        )}
      >
        <Filter size={15} className={cn(filterWarning ? 'text-warning' : 'text-accent')} />
        <span
          className={cn(
            'truncate text-sm font-semibold capitalize',
            filterWarning ? 'text-warning' : 'text-text'
          )}
        >
          {filterStatus}
        </span>
        <span className="text-[10px] text-text-faint">Filter</span>
      </Card>
    </div>
  )
}
