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
    <div className="absolute right-4 top-3 z-10 flex shrink-0 items-center gap-1.5 text-[10px] font-medium text-white/75">
      <StatusDot status={status} />
      {STATUS_LABEL[status]}
    </div>
  )
}
