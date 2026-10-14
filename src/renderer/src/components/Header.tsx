import { Snowflake, Power } from 'lucide-react'
import IconButton from './ui/IconButton'
import { StatusDot } from './ui/StatusDot'

interface HeaderProps {
  status: 'connected' | 'disconnected' | 'pending'
  power: 'on' | 'off' | null
  onTogglePower: () => void
  busy?: boolean
  disabled?: boolean
}

const STATUS_LABEL: Record<HeaderProps['status'], string> = {
  connected: 'Online',
  disconnected: 'Offline',
  pending: 'Connecting…'
}

export function Header({
  status,
  power,
  onTogglePower,
  busy,
  disabled
}: HeaderProps): React.JSX.Element {
  return (
    <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
      <div className="flex items-center gap-2.5 overflow-hidden">
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
      </div>
      <IconButton
        icon={<Power size={17} strokeWidth={2} />}
        label={power === 'on' ? 'Turn off' : 'Turn on'}
        variant={power === 'on' ? 'accent' : 'ghost'}
        pressed={power === 'on'}
        loading={busy}
        disabled={disabled}
        onClick={onTogglePower}
      />
    </header>
  )
}
