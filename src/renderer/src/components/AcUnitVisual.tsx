import acOffImg from '../assets/ac-off-clean.png'
import acOnImg from '../assets/ac-on-clean.png'
import { cn } from '../lib/cn'

interface AcUnitVisualProps {
  isOn: boolean
}

export function AcUnitVisual({ isOn }: AcUnitVisualProps): React.JSX.Element {
  return (
    <div className={cn('ac-stage', isOn && 'is-active')}>
      <div className="ac-unit-wrapper">
        {/* Static closed body (top body, left corner, and right panel stay 100% frozen) */}
        <img src={acOffImg} className="ac-png png-closed" alt="" draggable={false} />

        {/* Static dark inner vent cavity, masked to just the dark grill inside the tray slot */}
        <img src={acOnImg} className="ac-png png-vent-cavity" alt="" draggable={false} />

        {/* Swinging white tray blade only (excludes left frame and right panel) */}
        <img src={acOnImg} className="ac-png png-tray-blade" alt="" draggable={false} />
      </div>

      {/* Animated breeze, aligned strictly under the open tray slot */}
      <div className="airflow-container">
        <div className="air-cone" />
        <div className="wind-line w1" style={{ '--rot': '14deg' } as React.CSSProperties} />
        <div className="wind-line w2" style={{ '--rot': '7deg' } as React.CSSProperties} />
        <div className="wind-line w3" style={{ '--rot': '0deg' } as React.CSSProperties} />
        <div className="wind-line w4" style={{ '--rot': '-7deg' } as React.CSSProperties} />
        <div className="wind-line w5" style={{ '--rot': '-14deg' } as React.CSSProperties} />
      </div>
    </div>
  )
}
