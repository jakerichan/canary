import { Square, SquareCheck } from 'lucide-react'
import styles from './canary-feature.module.css'

interface BooleanInputProps {
  id?: string
  value: boolean
  onChange: (value: boolean) => void
}
const BooleanInput = ({ id, value, onChange }: BooleanInputProps) => {
  const handleOnChange = () => {
    onChange(!value)
  }

  return (
    <>
      <input
        id={id}
        type="checkbox"
        checked={value}
        onChange={handleOnChange}
        className={styles.hiddenCheckbox}
      />
      <button
        type="button"
        onClick={handleOnChange}
        aria-label={value ? 'Uncheck' : 'Check'}
        className={styles.checkboxButton}
      >
        {value ? <SquareCheck size={24} /> : <Square size={24} />}
      </button>
    </>
  )
}

export default BooleanInput
