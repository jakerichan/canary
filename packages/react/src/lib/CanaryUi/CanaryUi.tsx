import { CanaryCore } from '@canary-flags/core'
import CanaryFeature from '../CanaryFeature'
import styles from './canary-ui.module.css'
import { Minus, X } from 'lucide-react'
import { clsx } from 'clsx'
import { useState, useRef } from 'react'
import useDrag from './useDrag'
import useResize from './useResize'
import CornerGrip from './CornerGrip'

interface CanaryUiProps {
  core: CanaryCore
}

const CanaryUi = ({ core }: CanaryUiProps) => {
  const [minimized, setMinimized] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { position, handlers: { onMouseDown } } = useDrag(containerRef)
  const {
    size,
    handlers: {
      onMouseDown: onResizeMouseDown,
    },
  } = useResize(containerRef)
  const features = Object.entries(core.selections)

  return (
    <div
      className={styles.cui}
      ref={containerRef}
      style={{
        ...({
          left: position ? `${position.x}px` : undefined,
          top: position ? `${position.y}px` : undefined,
        }),
      }}
    >
      <div
        className={styles.container}
        style={{
          width: size ? `${size.width}px` : undefined,
          height: size ? `${size.height}px` : undefined,
        }}
      >
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
        <div
          className={styles.resizeHandle}
          onMouseDown={onResizeMouseDown}
        >
          <CornerGrip />
        </div>
      </div>
    </div>
  )
}

export default CanaryUi
