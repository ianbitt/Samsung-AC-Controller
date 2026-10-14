import { useCallback, useEffect, useState } from 'react'
import type {
  AcFanMode,
  AcMode,
  AcOptionalMode,
  AcStatus,
  AutoCleaningMode,
  FanOscillationMode
} from '../../../main/devices/ac'
import { Header } from './Header'
import { Footer } from './Footer'
import { TemperatureCard } from './TemperatureCard'
import { ModeControl } from './ModeControl'
import { FanSwingRow } from './FanSwingRow'
import { SpecialModeCard } from './SpecialModeCard'
import { TelemetryRow } from './TelemetryRow'
import { SelfCleanCard } from './SelfCleanCard'
import { SectionLabel } from './ui/Card'

const MIN_TEMP = 16
const MAX_TEMP = 30
const CONFIRM_DELAY_MS = 1500
const POLL_MS = 45_000

type ConnState = 'connected' | 'disconnected' | 'pending'

const clamp = (temp: number): number => Math.min(MAX_TEMP, Math.max(MIN_TEMP, temp))

function AcCard(): React.JSX.Element {
  const [status, setStatus] = useState<AcStatus | null>(null)
  const [conn, setConn] = useState<ConnState>('pending')
  const [error, setError] = useState<string | null>(null)
  const [powerBusy, setPowerBusy] = useState(false)

  const refresh = useCallback((): Promise<void> => {
    return window.api.ac
      .getStatus()
      .then((s) => {
        setStatus(s)
        setConn('connected')
        setError(null)
      })
      .catch((err) => {
        setConn('disconnected')
        setError(err instanceof Error ? err.message : String(err))
      })
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  // The tray sends this every time the popover opens (and from "Refresh status" in its menu),
  // so the UI is current the moment it's seen rather than waiting on the poll interval below.
  useEffect(() => window.api.tray.onRefresh(refresh), [refresh])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null

    const start = (): void => {
      if (interval) return
      interval = setInterval(refresh, POLL_MS)
    }
    const stop = (): void => {
      if (interval) clearInterval(interval)
      interval = null
    }

    const onVisibilityChange = (): void => {
      if (document.visibilityState === 'visible') {
        refresh()
        start()
      } else {
        stop()
      }
    }

    if (document.visibilityState === 'visible') start()
    document.addEventListener('visibilitychange', onVisibilityChange)
    return () => {
      stop()
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [refresh])

  const applyOptimistic = (patch: Partial<AcStatus>, action: () => Promise<void>): void => {
    if (!status) return
    const previous = status
    setStatus({ ...status, ...patch })
    setError(null)

    action()
      .then(() => {
        setTimeout(refresh, CONFIRM_DELAY_MS)
      })
      .catch((err) => {
        setStatus(previous)
        setError(err instanceof Error ? err.message : String(err))
      })
  }

  const togglePower = (): void => {
    if (!status) return
    const turningOn = status.power === 'off'
    setPowerBusy(true)
    applyOptimistic({ power: turningOn ? 'on' : 'off' }, () =>
      (turningOn ? window.api.ac.on() : window.api.ac.off()).finally(() => setPowerBusy(false))
    )
  }

  const stepTemp = (delta: number): void => {
    if (!status) return
    const next = clamp(status.targetTemperature + delta)
    applyOptimistic({ targetTemperature: next }, () => window.api.ac.setTemperature(next))
  }

  const changeMode = (mode: AcMode): void =>
    applyOptimistic({ mode }, () => window.api.ac.setMode(mode))

  const changeFanMode = (fanMode: AcFanMode): void =>
    applyOptimistic({ fanMode }, () => window.api.ac.setFanMode(fanMode))

  const changeSwingMode = (swingMode: FanOscillationMode): void =>
    applyOptimistic({ swingMode }, () => window.api.ac.setSwingMode(swingMode))

  const changeOptionalMode = (optionalMode: AcOptionalMode): void =>
    applyOptimistic({ optionalMode }, () => window.api.ac.setOptionalMode(optionalMode))

  const toggleAutoCleaning = (): void => {
    if (!status) return
    const next: AutoCleaningMode = status.autoCleaningMode === 'on' ? 'off' : 'on'
    applyOptimistic({ autoCleaningMode: next }, () => window.api.ac.setAutoCleaningMode(next))
  }

  const disabled = !status

  return (
    <>
      <Header
        status={conn}
        power={status?.power ?? null}
        onTogglePower={togglePower}
        busy={powerBusy}
        disabled={disabled}
      />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {error && (
          <div className="mb-3 rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-[11px] text-danger">
            {error}
          </div>
        )}

        {!status ? (
          <p className="py-10 text-center text-[12px] text-text-muted">Loading…</p>
        ) : (
          <div className="flex flex-col gap-4">
            <TemperatureCard
              target={status.targetTemperature}
              current={status.currentTemperature}
              unit={status.unit}
              onStep={stepTemp}
              disabled={disabled}
            />

            <div className="flex flex-col gap-1.5">
              <SectionLabel>Mode</SectionLabel>
              <ModeControl
                value={status.mode as AcMode}
                options={status.supportedModes}
                onChange={changeMode}
                disabled={disabled}
              />
            </div>

            <FanSwingRow
              fanMode={status.fanMode}
              supportedFanModes={status.supportedFanModes}
              swingMode={status.swingMode}
              supportedSwingModes={status.supportedSwingModes}
              onChangeFanMode={changeFanMode}
              onChangeSwingMode={changeSwingMode}
              disabled={disabled}
            />

            <SpecialModeCard
              value={status.optionalMode}
              options={status.supportedOptionalModes}
              onChange={changeOptionalMode}
              disabled={disabled}
            />

            <TelemetryRow
              humidity={status.humidity}
              powerWatts={status.powerWatts}
              filterStatus={status.filterStatus}
            />

            <SelfCleanCard
              on={status.autoCleaningMode === 'on'}
              running={status.autoCleaningState === 'autoClean'}
              progress={status.autoCleaningProgress}
              onToggle={toggleAutoCleaning}
              disabled={disabled}
            />
          </div>
        )}
      </div>
      <Footer status={conn} currentTemperature={status?.currentTemperature} unit={status?.unit} />
    </>
  )
}

export default AcCard
