import { lazy, Suspense, useEffect, useState } from 'react'
import {
  CanaryConfig,
  CanaryCore,
  CanaryStoreEntry,
} from '@canary-flags/core'
import CanaryContext from './CanaryContext'

export interface CanaryProviderProps {
  children: React.ReactNode
  /**
   * Warning: canaryConfig is used as a dependency for the CanaryProvider component.
   * Use an imported constant, or be sure to pass a memoized value to avoid unnecessary re-renders.
   */
  canaryConfig: CanaryConfig
  parentCore?: CanaryCore
  renderCanaryUI?: (core: CanaryCore) => React.ReactNode
  onEvaluateFlag?: (
    key: string,
    config?: CanaryStoreEntry
  ) => void
}

const LazyCanaryUi = lazy(() => import('../CanaryUi'))

const CanaryProvider = ({
  children,
  canaryConfig,
  parentCore,
  renderCanaryUI = core => <LazyCanaryUi core={core} />,
  onEvaluateFlag,
}: CanaryProviderProps,
) => {
  const [showCanaryUi, setShowCanaryUi] = useState<boolean>(false)
  const [core, setCore] = useState<CanaryCore | null>(null)
  useEffect(() => {
    const newCore = new CanaryCore(canaryConfig)
    setCore(newCore)
    return () => {
      newCore.destroy()
    }
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
  }, [core, onEvaluateFlag])

  if (!core) return children
  return (
    <CanaryContext.Provider value={core}>
      {children}
      {showCanaryUi && core && (
        <Suspense fallback={null}>
          {renderCanaryUI(core)}
        </Suspense>
      )}
    </CanaryContext.Provider>
  )
}

export default CanaryProvider
