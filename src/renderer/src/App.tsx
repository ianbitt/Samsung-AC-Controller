import { useCallback, useEffect, useState } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'
import type { ConfigState } from '../../main/config'
import AcCard from './components/AcCard'
import { Setup } from './components/Setup'

function App(): React.JSX.Element {
  const [state, setState] = useState<ConfigState | 'loading'>('loading')
  const [showSettings, setShowSettings] = useState(false)

  const refresh = useCallback((): void => {
    window.api.config.getState().then(setState)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => window.api.tray.onOpenSettings(() => setShowSettings(true)), [])

  if (state === 'loading') {
    return <div className="min-h-0 flex-1 bg-surface" />
  }

  if (showSettings || state !== 'ready') {
    return (
      <Setup
        initialState={state}
        onComplete={() => {
          setShowSettings(false)
          refresh()
        }}
        onCancel={state === 'ready' ? () => setShowSettings(false) : undefined}
      />
    )
  }

  return (
    <Tooltip.Provider delayDuration={400}>
      <AcCard />
    </Tooltip.Provider>
  )
}

export default App
