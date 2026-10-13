import { useCallback, useEffect, useState } from 'react'
import type {
  AcFanMode,
  AcMode,
  AcOptionalMode,
  AcStatus,
  AutoCleaningMode,
  FanOscillationMode
} from '../../../main/devices/ac'

const MIN_TEMP = 16
const MAX_TEMP = 30
const CONFIRM_DELAY_MS = 1500
const POLL_MS = 45_000

const clamp = (temp: number): number => Math.min(MAX_TEMP, Math.max(MIN_TEMP, temp))

function AcCard(): React.JSX.Element {
  const [status, setStatus] = useState<AcStatus | null>(null)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback((): Promise<void> => {
    return window.api.ac
      .getStatus()
      .then((s) => {
        setStatus(s)
        setError(null)
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
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
    applyOptimistic({ power: turningOn ? 'on' : 'off' }, () =>
      turningOn ? window.api.ac.on() : window.api.ac.off()
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

  return (
    <section className="card">
      <header className="card__header">
        <h2>Air Conditioner</h2>
        <button
          className={`power-toggle ${status?.power === 'on' ? 'power-toggle--on' : ''}`}
          onClick={togglePower}
          disabled={!status}
        >
          {status?.power === 'on' ? 'On' : 'Off'}
        </button>
      </header>

      {error && <p className="card__error">{error}</p>}

      {!status ? (
        <p className="card__loading">Loading…</p>
      ) : (
        <>
          <div className="temp-control">
            <button onClick={() => stepTemp(-1)}>−</button>
            <div className="temp-control__display">
              <span className="temp-control__target">
                {status.targetTemperature}°{status.unit}
              </span>
              <span className="temp-control__current">
                now {status.currentTemperature}°{status.unit}
              </span>
            </div>
            <button onClick={() => stepTemp(1)}>+</button>
          </div>

          <label className="mode-select">
            Mode
            <select value={status.mode} onChange={(e) => changeMode(e.target.value as AcMode)}>
              {status.supportedModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </label>

          <label className="mode-select">
            Fan speed
            <select
              value={status.fanMode}
              onChange={(e) => changeFanMode(e.target.value as AcFanMode)}
            >
              {status.supportedFanModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </label>

          <label className="mode-select">
            Swing
            <select
              value={status.swingMode}
              onChange={(e) => changeSwingMode(e.target.value as FanOscillationMode)}
            >
              {status.supportedSwingModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </label>

          <label className="mode-select">
            Special mode
            <select
              value={status.optionalMode}
              onChange={(e) => changeOptionalMode(e.target.value as AcOptionalMode)}
            >
              {status.supportedOptionalModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </label>

          <div className="telemetry">
            <span>Humidity {status.humidity}%</span>
            <span>{status.powerWatts}W</span>
            <span className={status.filterStatus !== 'normal' ? 'telemetry__warning' : ''}>
              Filter: {status.filterStatus}
            </span>
          </div>

          <div className="card__header">
            <span>
              Self-clean
              {status.autoCleaningState === 'autoClean' && ` — ${status.autoCleaningProgress}%`}
            </span>
            <button
              className={`power-toggle ${status.autoCleaningMode === 'on' ? 'power-toggle--on' : ''}`}
              onClick={toggleAutoCleaning}
            >
              {status.autoCleaningMode === 'on' ? 'On' : 'Off'}
            </button>
          </div>
        </>
      )}
    </section>
  )
}

export default AcCard
