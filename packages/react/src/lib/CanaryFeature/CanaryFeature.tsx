import { CanaryCore } from '@canary-flags/core'
import useCanary from '../useCanary'
import styles from './canary-feature.module.css'
import BooleanInput from './BooleanInput'
import SelectInput from './SelectInput'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { clsx } from 'clsx'

interface CanaryFeatureProps {
  name: string
  core: CanaryCore
}
const CanaryFeature = ({ name, core }: CanaryFeatureProps) => {
  const [expanded, setExpanded] = useState(false)
  const currentValue = useCanary(name)
  const feature = core.getFeature(name)
  console.log('feature', feature)
  const variants = feature?.variants || []
  const metadata = feature?.metadata || {}
  const metadataEntries = Object.entries(metadata)
  const hasMetadata = metadataEntries.length > 0
  const isBoolean = variants.length === 2
    && variants.some(variant => typeof variant === 'boolean')
  const isString = variants.length > 0 && typeof variants[0] === 'string'

  return (
    <div className={styles.feature}>
      <div className={styles.details}>
        {hasMetadata && (
          <button onClick={() => setExpanded(e => !e)}>
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
        )}
        <label
          className={styles.label}
        >
          <div className={styles.name}>
            {name}
          </div>
          {isBoolean && (
            <BooleanInput
              value={currentValue as boolean}
              onChange={value => core.override(name, value)}
            />
          )}
          {isString && (
            <SelectInput
              value={currentValue as string}
              onChange={value => core.override(name, value)}
              options={variants as string[]}
            />
          )}
        </label>
      </div>
      <div className={clsx(styles.metadata, {
        [styles.expanded]: expanded,
      })}
      >
        {metadataEntries.map(([key, value]) => (
          <div
            key={key}
            className={styles.metadataEntry}
          >
            <div className={styles.metadataKey}>{key}</div>
            <div className={styles.metadataValue}>{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CanaryFeature
