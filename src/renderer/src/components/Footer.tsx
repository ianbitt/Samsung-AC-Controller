import { StatusDot } from './ui/StatusDot'

interface FooterProps {
  status: 'connected' | 'disconnected' | 'pending'
  currentTemperature?: number
  unit?: 'C' | 'F'
}

const STATUS_LABEL: Record<FooterProps['status'], string> = {
  connected: 'Online',
  disconnected: 'Offline',
  pending: 'Connecting…'
}

export function Footer({ status, currentTemperature, unit }: FooterProps): React.JSX.Element {
  return (
    <footer className="shrink-0 px-3 pb-3">
      <div className="glass-surface flex items-center justify-between gap-2 rounded-control px-3 py-2 text-[11px] text-white/85">
        <span className="flex items-center gap-1.5">
          <StatusDot status={status} />
          {STATUS_LABEL[status]}
        </span>
        {currentTemperature !== undefined && (
          <span className="truncate font-mono text-white/70">
            room {currentTemperature}°{unit}
          </span>
        )}
      </div>
    </footer>
  )
}
