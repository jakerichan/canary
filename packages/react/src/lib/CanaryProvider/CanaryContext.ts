import { createContext } from 'react'
import { CanaryCore } from '@canary-flags/core'

const CanaryContext = createContext<CanaryCore | null>(null)

export default CanaryContext
