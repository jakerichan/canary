import { CanaryCore } from '@canary-flags/core'
import useCanary from '../useCanary'

interface CanaryFeatureProps {
  name: string
  core: CanaryCore
}
const CanaryFeature = ({ name, core }: CanaryFeatureProps) => {
  const currentValue = useCanary(name)
  const feature = core.getFeature(name)
  console.log('feature', feature)
  return (
    <div>
      {name}
      {`${currentValue}`}
    </div>
  )
}

export default CanaryFeature
