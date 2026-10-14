import * as Tooltip from '@radix-ui/react-tooltip'
import AcCard from './components/AcCard'

function App(): React.JSX.Element {
  return (
    <Tooltip.Provider delayDuration={400}>
      <AcCard />
    </Tooltip.Provider>
  )
}

export default App
