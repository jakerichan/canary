import type { CanaryValue } from '@canary-flags/core'
import { useEffect, useState } from 'react'
import useCanaryCore from '../useCanaryCore'

const useCanary = (flag: string) => {
  const core = useCanaryCore()
  const storedValue = core?.get(flag)
  const [flagValue, setFlagValue] = useState<CanaryValue | null>(storedValue)

  useEffect(() => {
    if (storedValue !== flagValue) {
      setFlagValue(storedValue)
    }
  }, [storedValue, flagValue])

  useEffect(() => {
    if (!core) return
    const handleFlagChange = (value: CanaryValue) => {
      setFlagValue(value)
    }
    core.on(`assign:${flag}`, handleFlagChange)
    core.on(`override:${flag}`, handleFlagChange)
    core.on(`config:${flag}`, handleFlagChange)

    return () => {
      core.off(`assign:${flag}`, handleFlagChange)
      core.off(`override:${flag}`, handleFlagChange)
      core.off(`config:${flag}`, handleFlagChange)
    }
  }, [core, flag])
  return flagValue
}

export default useCanary
