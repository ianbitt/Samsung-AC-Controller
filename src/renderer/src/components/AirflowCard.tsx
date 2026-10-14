import {
  Wind,
  Gauge,
  Zap,
  Fan,
  ArrowUpDown,
  ArrowLeftRight,
  Move,
  Minus,
  CircleOff,
  Moon,
  MoonStar,
  VolumeX
} from 'lucide-react'
import type { AcFanMode, AcOptionalMode, FanOscillationMode } from '../../../main/devices/ac'
import { Dropdown } from './ui/Dropdown'
import { SegmentedControl } from './ui/SegmentedControl'
import { Card, SectionLabel } from './ui/Card'

interface AirflowCardProps {
  fanMode: AcFanMode
  supportedFanModes: AcFanMode[]
  swingMode: FanOscillationMode
  supportedSwingModes: FanOscillationMode[]
  optionalMode: AcOptionalMode
  supportedOptionalModes: AcOptionalMode[]
  onChangeFanMode: (mode: AcFanMode) => void
  onChangeSwingMode: (mode: FanOscillationMode) => void
  onChangeOptionalMode: (mode: AcOptionalMode) => void
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
  all: 'All'
}

const SPECIAL_ICONS: Record<AcOptionalMode, React.ReactNode> = {
  off: <CircleOff size={14} />,
  sleep: <Moon size={14} />,
  quiet: <VolumeX size={14} />,
  speed: <Gauge size={14} />,
  windFree: <Wind size={14} />,
  windFreeSleep: <MoonStar size={14} />
}

const SPECIAL_LABELS: Record<AcOptionalMode, string> = {
  off: 'Off',
  sleep: 'Sleep',
  quiet: 'Quiet',
  speed: 'Speed',
  windFree: 'Wind-Free',
  windFreeSleep: 'Wind-Free Sleep'
}

export function AirflowCard({
  fanMode,
  supportedFanModes,
  swingMode,
  supportedSwingModes,
  optionalMode,
  supportedOptionalModes,
  onChangeFanMode,
  onChangeSwingMode,
  onChangeOptionalMode,
  disabled
}: AirflowCardProps): React.JSX.Element {
  return (
    <Card className="flex flex-col gap-3">
      <SectionLabel className="flex items-center gap-1.5">
        <Gauge size={11} />
        Airflow
      </SectionLabel>

      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] text-text-muted">Fan speed</span>
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
        <span className="text-[11px] text-text-muted">Swing</span>
        <SegmentedControl
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

      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] text-text-muted">Special mode</span>
        <Dropdown
          value={optionalMode}
          onChange={onChangeOptionalMode}
          disabled={disabled}
          options={supportedOptionalModes.map((mode) => ({
            value: mode,
            label: SPECIAL_LABELS[mode],
            icon: SPECIAL_ICONS[mode]
          }))}
        />
      </div>
    </Card>
  )
}
