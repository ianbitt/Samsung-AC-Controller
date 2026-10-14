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
    <footer className="flex shrink-0 items-center justify-between gap-2 border-t border-border px-4 py-2.5 text-[11px] text-text-muted">
      <span className="flex items-center gap-1.5">
        <StatusDot status={status} />
        {STATUS_LABEL[status]}
      </span>
      {currentTemperature !== undefined && (
        <span className="truncate font-mono text-text-faint">
          room {currentTemperature}°{unit}
        </span>
      )}
    </footer>
  )
}
