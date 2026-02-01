import { Square, SquareCheck } from 'lucide-react'
import styles from './canary-feature.module.css'
import { useState } from 'react'
import { clsx } from 'clsx'

interface BooleanInputProps {
  id?: string
  value: boolean
  onChange: (value: boolean) => void
}
const BooleanInput = ({ id, value, onChange }: BooleanInputProps) => {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <span className={clsx(styles.checkboxButton, {
      [styles.focused]: isFocused,
    })}
    >
      <input
        id={id}
        type="checkbox"
        checked={value}
        aria-label={value ? 'Enabled' : 'Disabled'}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(event) => {
          if (event.target.checked !== value) onChange(event.target.checked)
        }}
        className={styles.hiddenCheckbox}
      />
      {value ? <SquareCheck size={20} /> : <Square size={20} />}
    </span>
  )
}

export default BooleanInput
