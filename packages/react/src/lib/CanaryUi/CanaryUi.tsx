import { CanaryCore } from '@canary-flags/core'
import CanaryFeature from '../CanaryFeature'
import styles from './canary-ui.module.css'
import { Minus, Search, X } from 'lucide-react'
import { clsx } from 'clsx'
import { useState, useRef } from 'react'
import useDrag from './useDrag'
import useResize from './useResize'
import CornerGrip from './CornerGrip'

interface CanaryUiProps {
  core: CanaryCore
  title?: string
  savePosition?: boolean
}

const CanaryUi = ({
  core,
  title = 'CanaryUi',
  savePosition = true,
}: CanaryUiProps) => {
  const [minimized, setMinimized] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { position, handlers: { onMouseDown } } = useDrag(
    containerRef,
    savePosition,
  )
  const {
    size,
    handlers: {
      onMouseDown: onResizeMouseDown,
    },
  } = useResize(containerRef, savePosition)
  const features = Object.entries(core.selections)
  const [search, setSearch] = useState('')
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
  }

  const filteredFeatures = features.filter(([name]) => name.includes(search))

  return (
    <div
      className={styles.canary}
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
          height: !minimized && size ? `${size.height}px` : undefined,
        }}
      >
        <header
          className={styles.header}
          onMouseDown={onMouseDown}
        >
          <h3 className={styles.headerTitle}>{title}</h3>
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
        {!minimized && (
          <label className={styles.searchContainer}>
            <Search size={16} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search"
              onChange={handleSearchChange}
            />
          </label>
        )}
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
            {filteredFeatures.map(([name]) => (
              <li
                key={name}
                className={styles.featureItem}
              >
                <CanaryFeature
                  name={name}
                  core={core}
                />
              </li>
            ))}
          </ul>
        </div>
        {!minimized && (
          <div
            className={styles.resizeHandle}
            onMouseDown={onResizeMouseDown}
          >
            <CornerGrip />
          </div>
        )}
      </div>
    </div>
  )
}

export default CanaryUi
