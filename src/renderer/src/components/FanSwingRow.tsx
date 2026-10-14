import { Wind, Gauge, Zap, Fan, ArrowUpDown, ArrowLeftRight, Move, Minus } from 'lucide-react'
import type { AcFanMode, FanOscillationMode } from '../../../main/devices/ac'
import { Dropdown } from './ui/Dropdown'
import { SectionLabel } from './ui/Card'

interface FanSwingRowProps {
  fanMode: AcFanMode
  supportedFanModes: AcFanMode[]
  swingMode: FanOscillationMode
  supportedSwingModes: FanOscillationMode[]
  onChangeFanMode: (mode: AcFanMode) => void
  onChangeSwingMode: (mode: FanOscillationMode) => void
  disabled?: boolean
}

const FAN_ICONS: Record<AcFanMode, React.ReactNode> = {
  auto: <Wind size={14} />,
  low: <Fan size={14} />,
  medium: <Fan size={14} />,
  high: <Fan size={14} />,
  turbo: <Zap size={14} />
}

const FAN_LABELS: Record<AcFanMode, string> = {
  auto: 'Auto',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  turbo: 'Turbo'
}

const SWING_ICONS: Record<FanOscillationMode, React.ReactNode> = {
  fixed: <Minus size={14} />,
  vertical: <ArrowUpDown size={14} />,
  horizontal: <ArrowLeftRight size={14} />,
  all: <Move size={14} />
}

const SWING_LABELS: Record<FanOscillationMode, string> = {
  fixed: 'Fixed',
  vertical: 'Vertical',
  horizontal: 'Horizontal',
  all: 'All directions'
}

export function FanSwingRow({
  fanMode,
  supportedFanModes,
  swingMode,
  supportedSwingModes,
  onChangeFanMode,
  onChangeSwingMode,
  disabled
}: FanSwingRowProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="flex flex-col gap-1.5">
        <SectionLabel className="flex items-center gap-1.5">
          <Gauge size={11} />
          Fan speed
        </SectionLabel>
        <Dropdown
          value={fanMode}
          onChange={onChangeFanMode}
          disabled={disabled}
          options={supportedFanModes.map((mode) => ({
            value: mode,
            label: FAN_LABELS[mode],
            icon: FAN_ICONS[mode]
          }))}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <SectionLabel className="flex items-center gap-1.5">
          <Move size={11} />
          Swing
        </SectionLabel>
        <Dropdown
          value={swingMode}
          onChange={onChangeSwingMode}
          disabled={disabled}
          options={supportedSwingModes.map((mode) => ({
            value: mode,
            label: SWING_LABELS[mode],
            icon: SWING_ICONS[mode]
          }))}
        />
      </div>
    </div>
  )
}
