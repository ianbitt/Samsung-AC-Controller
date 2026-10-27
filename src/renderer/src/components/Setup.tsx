import { useState } from 'react'
import { X } from 'lucide-react'
import type { ConfigState } from '../../../main/config'
import { CredentialsStep } from './CredentialsStep'
import { DeviceStep } from './DeviceStep'

interface SetupProps {
  initialState: ConfigState
  onComplete: () => void
  // Only provided when a working config already existed before Settings… was reopened,
  // so bailing out without finishing the flow is always safe.
  onCancel?: () => void
}

export function Setup({ initialState, onComplete, onCancel }: SetupProps): React.JSX.Element {
  const [step, setStep] = useState<'credentials' | 'device'>(
    initialState === 'needs-device' ? 'device' : 'credentials'
  )

  return (
    <div className="isolate relative flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="ac-atmosphere -z-10" aria-hidden="true">
        <div className="ac-atmosphere-layer ac-atmosphere-on" />
        <div className="ac-ambient-orb" />
      </div>
      {onCancel && (
        <button
          type="button"
          aria-label="Cancel"
          onClick={onCancel}
          className="glass-surface glass-surface-hover absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full text-white"
        >
          <X size={14} />
        </button>
      )}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
        {step === 'credentials' ? (
          <CredentialsStep onDone={() => setStep('device')} />
        ) : (
          <DeviceStep onDone={onComplete} onReset={() => setStep('credentials')} />
        )}
      </div>
    </div>
  )
}
