import { cn } from '../../lib/cn'

interface StatusDotProps {
  status: 'connected' | 'disconnected' | 'pending'
  className?: string
}

const COLORS = {
  connected: 'bg-success',
  disconnected: 'bg-danger',
  pending: 'bg-text-faint'
}

export function StatusDot({ status, className }: StatusDotProps): React.JSX.Element {
  return (
    <span
      className={cn('inline-block h-1.5 w-1.5 shrink-0 rounded-full', COLORS[status], className)}
    />
  )
}
