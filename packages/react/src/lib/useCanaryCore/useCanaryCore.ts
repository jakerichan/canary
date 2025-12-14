import type { CanaryCore } from '@canary-flags/core'
import { useContext } from 'react'
import CanaryContext from '../CanaryProvider/CanaryContext'

const useCanaryCore = (): CanaryCore | null => {
  return useContext(CanaryContext)
}

export default useCanaryCore
