import { useEffect } from 'react'
import useCanaryCore from '../useCanaryCore'
import { CanaryValue } from '@canary-flags/core'

const useGlobalCanary = <T extends typeof globalThis
  & Window = typeof globalThis & Window,
>(
  propertyName: keyof T = 'canary-ui' as keyof T,
  storage: Storage = localStorage,
) => {
  const canaryCore = useCanaryCore()

  useEffect(() => {
    if (!canaryCore) return
    const propertyNameStr = String(propertyName)

    const getValuesFromStorage = () => {
      ;(globalThis as T)[propertyName] = canaryCore as T[keyof T]
      const canaryStorage = storage.getItem(propertyNameStr)
      let canaryStorageObject: Record<string, CanaryValue> = {}
      try {
        canaryStorageObject = canaryStorage ? JSON.parse(canaryStorage) : {}
      }
      catch (error) {
        console.error('Error parsing canary storage', error)
      }
      return canaryStorageObject
    }

    const handleChange = (key: string, value: CanaryValue) => {
      // Read current state from storage to merge with new change
      const currentStorage = getValuesFromStorage()
      storage.setItem(
        propertyNameStr,
        JSON.stringify({ ...currentStorage, [key]: value }),
      )
    }
    const handleReset = () => {
      storage.removeItem(propertyNameStr)
    }

    const canaryStorageObject = getValuesFromStorage()
    canaryCore.on('override', handleChange)
    canaryCore.on('reset', handleReset)
    canaryCore.overrideValues(canaryStorageObject)

    return () => {
      canaryCore.off('override', handleChange)
      canaryCore.off('reset', handleReset)
    }
  }, [canaryCore, propertyName, storage])
  return canaryCore
}

export default useGlobalCanary
