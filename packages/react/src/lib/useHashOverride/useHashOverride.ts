import { useCallback, useEffect } from 'react'
import useCanaryCore from '../useCanaryCore'

const useHashOverride = (
  hashName: string,
  { clearHash = true }: { clearHash?: boolean } = {},
) => {
  const core = useCanaryCore()

  const applyHashOverride = useCallback(() => {
    if (!core) return
    const locationHash = globalThis.location.hash.slice(1)
    if (!locationHash) return
    const hash = locationHash.split('&')
      .find(param => param.startsWith(`${hashName}=`))
    const urlConfig = hash?.split('=')[1] || '{}'
    try {
      // decode twice to handle nested encoded values
      const decodedUrlConfig = decodeURIComponent(
        decodeURIComponent(urlConfig),
      )
      core.overrideValues(JSON.parse(decodedUrlConfig))
      if (clearHash) {
        globalThis.location.hash = ''
      }
    }
    catch (error) {
      console.error('Error applying hash override', urlConfig, error)
    }
  }, [core, hashName, clearHash])

  useEffect(() => {
    applyHashOverride()
    globalThis.addEventListener('hashchange', applyHashOverride)

    return () => {
      globalThis.removeEventListener('hashchange', applyHashOverride)
    }
  }, [applyHashOverride])
}

export default useHashOverride
