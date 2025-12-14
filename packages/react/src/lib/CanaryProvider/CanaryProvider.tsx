import { lazy, Suspense, useEffect, useState } from 'react'
import {
  CanaryConfig,
  CanaryCore,
  CanaryStoreEntry,
  CanaryValue,
} from '@canary-flags/core'
import CanaryContext from './CanaryContext'

interface CanaryProviderProps {
  children: React.ReactNode
  canaryConfig: CanaryConfig
  parentCore?: CanaryCore
  renderCanaryUI?: (core: CanaryCore) => React.ReactNode
  urlConfigParam?: string
  onEvaluateFlag?: (
    key: string,
    value: CanaryValue,
    config?: CanaryStoreEntry
  ) => void
}

const LazyCanaryUi = lazy(() => import('../CanaryUi'))
/**
 *
 * Features todo:
 * - provide a way to hook into localStorage (onOverride?)
 */
const CanaryProvider = ({
  children,
  canaryConfig,
  parentCore,
  renderCanaryUI = core => <LazyCanaryUi core={core} />,
  onEvaluateFlag,
}: CanaryProviderProps,
) => {
  const [showCanaryUi, setShowCanaryUi] = useState<boolean>(true)
  const [core, setCore] = useState<CanaryCore | null>(null)
  useEffect(() => {
    setCore(new CanaryCore(canaryConfig))
  }, [canaryConfig])

  useEffect(() => {
    if (!core) return
    parentCore?.merge(core)
  }, [parentCore, core])

  useEffect(() => {
    if (!core) return
    if (onEvaluateFlag) core.onEvaluateFlag = onEvaluateFlag
    core.toggle = () => {
      setShowCanaryUi(value => !value)
    }

    core.on('change', () => {
      console.log('change')
    })

    return () => {
      core.destroy()
    }
  }, [core, onEvaluateFlag])

  useEffect(() => {
    if (!core) return
    // Change this to hash
    // Add a listener for location changes
    const searchParams = new URLSearchParams(globalThis.location.search)
    // console.log('searchParams', searchParams)
    const urlConfig = searchParams.get('canary') || '{}'
    // console.log('urlConfig', urlConfig, JSON.parse(urlConfig))
    try {
      core.overrideValues(JSON.parse(urlConfig))
    }
    catch (error) {
      console.error(error)
    }
  }, [core])

  // useEffect(() => {
  //   if (!core) return
  //   window['canary-ui'] = core
  //   const canaryStorage = localStorage.getItem(`canary`)
  //   const canaryStorageObject = canaryStorage ? JSON.parse(canaryStorage) : {}
  //   core.on('change', (key, value) => {
  //     localStorage.setItem(`canary`, JSON.stringify({
  //       ...canaryStorageObject, [key]: value,
  //     }))
  //   })
  //   core.on('reset', () => {
  //     localStorage.removeItem(`canary`)
  //   })
  //   core.overrideValues(canaryStorageObject)
  // }, [core])

  if (!core) return children
  return (
    <CanaryContext.Provider value={core}>
      {children}
      {showCanaryUi && core && (
        <Suspense fallback={<div>Loading...</div>}>
          {renderCanaryUI(core)}
        </Suspense>
      )}
    </CanaryContext.Provider>
  )
}

export default CanaryProvider
