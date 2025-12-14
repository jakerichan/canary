import { CanaryCore } from '@canary-flags/core'
import CanaryFeature from '../CanaryFeature'
import styles from './canary-ui.module.css'
import { Minus, X } from 'lucide-react'
import { clsx } from 'clsx'
import { useState, useRef } from 'react'
import useDrag from './useDrag'

interface CanaryUiProps {
  core: CanaryCore
}

const CanaryUi = ({ core }: CanaryUiProps) => {
  const [minimized, setMinimized] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { position, handlers: { onMouseDown } } = useDrag(containerRef)
  const features = Object.entries(core.selections)

  return (
    <div
      className={styles.cui}
      ref={containerRef}
      style={
        position
          ? {
              left: `${position.x}px`,
              top: `${position.y}px`,
            }
          : undefined
      }
    >
      <div className={styles.container}>
        <header
          className={styles.header}
          onMouseDown={onMouseDown}
        >
          <h1>CanaryUi</h1>
          <div className={styles.headerActions}>
            <button
              className={styles.headerButton}
              onClick={() => setMinimized(m => !m)}
            >
              <Minus size={16} />
            </button>
            <button
              className={styles.headerButton}
              onClick={() => core.toggle()}
            >
              <X size={16} />
            </button>
          </div>
        </header>
        <div className={
          clsx(styles.content, {
            [styles.minimized]: minimized,
          })
        }
        >
          <ul
            className={clsx(styles.featureList, {
              [styles.featureListMinimized]: minimized,
            })}
          >
            {features.map(([name]) => (
              <li key={name}>
                <CanaryFeature
                  name={name}
                  core={core}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default CanaryUi
