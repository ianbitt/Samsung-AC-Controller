import { CircleOff, Moon, MoonStar, VolumeX, Gauge, Wind, Sparkles } from 'lucide-react'
import type { AcOptionalMode } from '../../../main/devices/ac'
import { Dropdown } from './ui/Dropdown'
import { SectionLabel } from './ui/Card'

interface SpecialModeCardProps {
  value: AcOptionalMode
  options: AcOptionalMode[]
  onChange: (mode: AcOptionalMode) => void
  disabled?: boolean
}

const ICONS: Record<AcOptionalMode, React.ReactNode> = {
  off: <CircleOff size={14} />,
  sleep: <Moon size={14} />,
  quiet: <VolumeX size={14} />,
  speed: <Gauge size={14} />,
  windFree: <Wind size={14} />,
  windFreeSleep: <MoonStar size={14} />
}

const LABELS: Record<AcOptionalMode, string> = {
  off: 'Off',
  sleep: 'Sleep',
  quiet: 'Quiet',
  speed: 'Speed',
  windFree: 'Wind-Free',
  windFreeSleep: 'Wind-Free Sleep'
}

export function SpecialModeCard({
  value,
  options,
  onChange,
  disabled
}: SpecialModeCardProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1.5">
      <SectionLabel className="flex items-center gap-1.5">
        <Sparkles size={11} />
        Special mode
      </SectionLabel>
      <Dropdown
        value={value}
        onChange={onChange}
        disabled={disabled}
        options={options.map((mode) => ({ value: mode, label: LABELS[mode], icon: ICONS[mode] }))}
      />
    </div>
  )
}
