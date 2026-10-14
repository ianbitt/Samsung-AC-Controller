import { Snowflake } from 'lucide-react'
import { StatusDot } from './ui/StatusDot'

interface HeaderProps {
  status: 'connected' | 'disconnected' | 'pending'
}

const STATUS_LABEL: Record<HeaderProps['status'], string> = {
  connected: 'Online',
  disconnected: 'Offline',
  pending: 'Connecting…'
}

export function Header({ status }: HeaderProps): React.JSX.Element {
  return (
    <header className="flex shrink-0 items-center gap-2.5 border-b border-border px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-accent-soft text-accent">
        <Snowflake size={18} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-[15px] font-semibold leading-tight text-text">
          Air Conditioner
        </p>
        <p className="flex items-center gap-1.5 truncate text-[11px] leading-tight text-text-muted">
          <StatusDot status={status} />
          {STATUS_LABEL[status]}
        </p>
      </div>
    </header>
  )
}
