import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import Button from './ui/Button'
import { SectionLabel } from './ui/Card'

interface CredentialsStepProps {
  onDone: () => void
}

const INPUT_CLASS =
  'glass-surface w-full rounded-control px-3 py-2.5 text-[13px] font-medium text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent'

export function CredentialsStep({ onDone }: CredentialsStepProps): React.JSX.Element {
  const [clientId, setClientId] = useState('')
  const [clientSecret, setClientSecret] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = (event: React.FormEvent): void => {
    event.preventDefault()
    if (!clientId.trim() || !clientSecret.trim() || busy) return
    setBusy(true)
    setError(null)
    window.api.config
      .saveCredentials(clientId.trim(), clientSecret.trim())
      .then(onDone)
      .catch((err) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setBusy(false))
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div>
        <h1 className="text-[17px] font-semibold text-white">Connect your AC</h1>
        <p className="mt-1 text-[12px] leading-relaxed text-white/75">
          This app controls a Samsung air conditioner through SmartThings. You&apos;ll need your own
          SmartThings OAuth app to connect it.
        </p>
      </div>

      <div className="glass-surface flex flex-col gap-1.5 rounded-card p-3 text-[11.5px] leading-relaxed text-white/80">
        <p className="font-semibold text-white">One-time SmartThings setup</p>
        <p>
          In the{' '}
          <a
            href="https://smartthings.developer.samsung.com/workspace/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-white underline underline-offset-2"
          >
            SmartThings Developer Workspace
            <ExternalLink size={11} />
          </a>
          , create an OAuth-In SmartApp with redirect URI{' '}
          <code className="rounded bg-black/20 px-1 py-0.5">https://httpbin.org/get</code> and
          scopes <code className="rounded bg-black/20 px-1 py-0.5">r:devices:* x:devices:*</code>.
          Copy its Client ID and Client Secret below.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <SectionLabel>Client ID</SectionLabel>
          <input
            value={clientId}
            onChange={(event) => setClientId(event.target.value)}
            disabled={busy}
            autoFocus
            spellCheck={false}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className={INPUT_CLASS}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <SectionLabel>Client secret</SectionLabel>
          <input
            type="password"
            value={clientSecret}
            onChange={(event) => setClientSecret(event.target.value)}
            disabled={busy}
            spellCheck={false}
            placeholder="••••••••••••••••"
            className={INPUT_CLASS}
          />
        </div>
      </div>

      {error && (
        <div className="rounded-control border border-danger/30 bg-danger-soft px-3 py-2 text-[11px] text-danger">
          {error}
        </div>
      )}

      <Button
        type="submit"
        variant="accent"
        loading={busy}
        disabled={!clientId.trim() || !clientSecret.trim()}
      >
        {busy ? 'Connecting…' : 'Connect SmartThings account'}
      </Button>
    </form>
  )
}
