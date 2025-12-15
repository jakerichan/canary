import styles from './canary-feature.module.css'

interface SelectInputProps {
  id?: string
  value: string
  onChange: (value: string) => void
  options: string[]
}
const SelectInput = ({ id, value, onChange, options }: SelectInputProps) => {
  return (
    <select
      id={id}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={styles.selectInput}
    >
      {options.map(option => (
        <option
          key={option}
          value={option}
        >
          {option}
        </option>
      ))}
    </select>
  )
}
export default SelectInput
