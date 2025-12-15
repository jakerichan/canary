import { useEffect } from 'react'
import useCanaryCore from '../useCanaryCore'

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
    ;(globalThis as T)[propertyName] = canaryCore as T[keyof T]
    const canaryStorage = storage.getItem(propertyNameStr)
    const canaryStorageObject = canaryStorage ? JSON.parse(canaryStorage) : {}
    canaryCore.on('change', (key, value) => {
      // Read current state from storage to merge with new change
      const currentStorage = storage.getItem(propertyNameStr)
      const currentStorageObject = currentStorage
        ? JSON.parse(currentStorage)
        : {}
      storage.setItem(
        propertyNameStr,
        JSON.stringify({ ...currentStorageObject, [key]: value }),
      )
    })
    canaryCore.on('reset', () => {
      storage.removeItem(propertyNameStr)
    })
    canaryCore.overrideValues(canaryStorageObject)
  }, [canaryCore, propertyName, storage])
  return canaryCore
}

export default useGlobalCanary
