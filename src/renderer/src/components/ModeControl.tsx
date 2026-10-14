import { Snowflake, Droplet, Wind, Sparkles } from 'lucide-react'
import type { AcMode } from '../../../main/devices/ac'
import { SegmentedControl } from './ui/SegmentedControl'

interface ModeControlProps {
  value: AcMode
  options: AcMode[]
  onChange: (mode: AcMode) => void
  disabled?: boolean
}

const ICONS: Record<AcMode, React.ReactNode> = {
  cool: <Snowflake size={15} />,
  dry: <Droplet size={15} />,
  wind: <Wind size={15} />,
  auto: <Sparkles size={15} />
}

const LABELS: Record<AcMode, string> = {
  cool: 'Cool',
  dry: 'Dry',
  wind: 'Wind',
  auto: 'Auto'
}

export function ModeControl({
  value,
  options,
  onChange,
  disabled
}: ModeControlProps): React.JSX.Element {
  return (
    <SegmentedControl
      value={value}
      onChange={onChange}
      disabled={disabled}
      options={options.map((mode) => ({ value: mode, label: LABELS[mode], icon: ICONS[mode] }))}
    />
  )
}
