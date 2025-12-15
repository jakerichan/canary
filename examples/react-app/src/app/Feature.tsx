import { useCanary } from '@canary-flags/react'

const Feature = () => {
  const testEnabled = useCanary('test')
  const paramTestEnabled = useCanary('param-test')

  return (
    <ul>
      <li>
        Feature "test" is:
        {' '}
        {`${testEnabled}`}
      </li>
      <li>
        Feature "param-test" is:
        {' '}
        {`${paramTestEnabled}`}
      </li>
    </ul>
  )
}

export default Feature
