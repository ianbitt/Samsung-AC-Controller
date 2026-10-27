import { useEffect, useState } from 'react'
import { Check, Loader2, RotateCcw } from 'lucide-react'
import type { AcDeviceOption } from '../../../main/devices/ac'
import Button from './ui/Button'
import { cn } from '../lib/cn'

interface DeviceStepProps {
  onDone: () => void
  onReset: () => void
}

export function DeviceStep({ onDone, onReset }: DeviceStepProps): React.JSX.Element {
  const [devices, setDevices] = useState<AcDeviceOption[] | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    window.api.config
      .listDevices()
      .then(setDevices)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
  }, [])

  const confirm = (): void => {
    if (!selected || busy) return
    setBusy(true)
    window.api.config
      .selectDevice(selected)
      .then(onDone)
      .catch((err) => {
        setError(err instanceof Error ? err.message : String(err))
        setBusy(false)
      })
  }

  const reset = (): void => {
    window.api.config.reset().then(onReset)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-[17px] font-semibold text-white">Pick your AC</h1>
        <p className="mt-1 text-[12px] text-white/75">
          Connected! Choose which air conditioner this app should control.
        </p>
      </div>

      {error && (
        <div className="rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-[11px] text-danger">
          {error}
        </div>
      )}

      {!devices ? (
        <div className="flex items-center justify-center gap-2 py-10 text-[12px] text-white/70">
          <Loader2 className="animate-spin" size={16} />
          Looking for devices…
        </div>
      ) : devices.length === 0 ? (
        <p className="py-6 text-center text-[12px] text-white/70">
          No air conditioners were found on this SmartThings account.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {devices.map((device) => {
            const active = device.id === selected
            return (
              <button
                key={device.id}
                type="button"
                onClick={() => setSelected(device.id)}
                className={cn(
                  'glass-surface flex items-center justify-between rounded-control px-3 py-2.5 text-left text-[13px] font-medium text-white transition-colors',
                  !active && 'glass-surface-hover'
                )}
              >
                {device.label}
                {active && <Check size={16} className="text-white" />}
              </button>
            )
          })}
        </div>
      )}

      <Button variant="accent" disabled={!selected} loading={busy} onClick={confirm}>
        Continue
      </Button>

      <button
        type="button"
        onClick={reset}
        className="mx-auto flex items-center gap-1.5 text-[11px] font-medium text-white/60 hover:text-white/85"
      >
        <RotateCcw size={11} />
        Start over
      </button>
    </div>
  )
}
