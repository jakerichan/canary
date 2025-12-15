import { renderHook, act, waitFor } from '@testing-library/react'
import { CanaryCore } from '@canary-flags/core'
import type { CanaryStoreEntry } from '@canary-flags/core'
import CanaryProvider from '../CanaryProvider/CanaryProvider'
import useGlobalCanary from './useGlobalCanary'

// Helper to create a wrapper with CanaryProvider
const createWrapper = (canaryConfig: CanaryStoreEntry[]) => {
  return ({ children }: { children: React.ReactNode }) => (
    <CanaryProvider
      canaryConfig={canaryConfig}
      renderCanaryUI={() => null}
    >
      {children}
    </CanaryProvider>
  )
}

type GlobalThisWithCustom = typeof globalThis & Window & {
  'canary-ui'?: CanaryCore
  'custom-property'?: CanaryCore
}

describe('useGlobalCanary', () => {
  beforeEach(() => {
    // Clear localStorage and globalThis before each test
    localStorage.clear()
    sessionStorage.clear()
    delete (globalThis as GlobalThisWithCustom)['canary-ui']
    delete (globalThis as GlobalThisWithCustom)['custom-property']
  })

  afterEach(() => {
    // Clean up after each test
    localStorage.clear()
    sessionStorage.clear()
    delete (globalThis as GlobalThisWithCustom)['canary-ui']
    delete (globalThis as GlobalThisWithCustom)['custom-property']
  })

  describe('basic functionality', () => {
    it('should set the canary core on globalThis with default property name', async () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }

      const { result } = renderHook(() => useGlobalCanary(), {
        wrapper: createWrapper([feature]),
      })

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        expect((globalThis as GlobalThisWithCustom)['canary-ui']).toBe(result.current)
        expect(result.current).toBeInstanceOf(CanaryCore)
      })
    })

    it('should set the canary core on globalThis with custom property name', async () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }

      const { result } = renderHook(
        () => useGlobalCanary<GlobalThisWithCustom>('custom-property'),
        {
          wrapper: createWrapper([feature]),
        },
      )

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        expect((globalThis as GlobalThisWithCustom)['custom-property']).toBe(result.current)
        expect(result.current).toBeInstanceOf(CanaryCore)
      })
    })

    it('should return the canary core instance', async () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }

      const { result } = renderHook(() => useGlobalCanary(), {
        wrapper: createWrapper([feature]),
      })

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        expect(result.current).toBeInstanceOf(CanaryCore)
      })
    })

    it('should handle null canary core gracefully', () => {
      const { result } = renderHook(() => useGlobalCanary())

      expect(result.current).toBeNull()
      // Should not throw and should not set anything on globalThis
      expect((globalThis as GlobalThisWithCustom)['canary-ui']).toBeUndefined()
    })
  })

  describe('localStorage synchronization', () => {
    it('should save changes to localStorage when flag value changes', async () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }

      const { result } = renderHook(() => useGlobalCanary(), {
        wrapper: createWrapper([feature]),
      })

      await waitFor(() => {
        expect(result.current).not.toBeNull()
      })

      const coreInstance = result.current

      act(() => {
        if (coreInstance) {
          coreInstance.override('test-feature', true)
        }
      })

      await waitFor(() => {
        const stored = localStorage.getItem('canary-ui')
        expect(stored).not.toBeNull()
        if (stored) {
          const parsed = JSON.parse(stored)
          expect(parsed['test-feature']).toBe(true)
        }
      })
    })

    it('should save multiple flag changes to localStorage', async () => {
      const feature1: CanaryStoreEntry = {
        name: 'feature-1',
        value: false,
        variants: [false, true],
      }
      const feature2: CanaryStoreEntry = {
        name: 'feature-2',
        value: 'initial',
        variants: ['initial', 'updated'],
      }

      const { result } = renderHook(() => useGlobalCanary(), {
        wrapper: createWrapper([feature1, feature2]),
      })

      await waitFor(() => {
        expect(result.current).not.toBeNull()
      })

      const coreInstance = result.current

      act(() => {
        if (coreInstance) {
          coreInstance.override('feature-1', true)
          coreInstance.override('feature-2', 'updated')
        }
      })

      await waitFor(() => {
        const stored = localStorage.getItem('canary-ui')
        expect(stored).not.toBeNull()
        if (stored) {
          const parsed = JSON.parse(stored)
          expect(parsed['feature-1']).toBe(true)
          expect(parsed['feature-2']).toBe('updated')
        }
      })
    })

    it('should remove from localStorage when reset event fires', async () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }

      const { result } = renderHook(() => useGlobalCanary(), {
        wrapper: createWrapper([feature]),
      })

      await waitFor(() => {
        expect(result.current).not.toBeNull()
      })

      const coreInstance = result.current

      // First, set a value
      act(() => {
        if (coreInstance) {
          coreInstance.override('test-feature', true)
        }
      })

      await waitFor(() => {
        expect(localStorage.getItem('canary-ui')).not.toBeNull()
      })

      // Then reset
      act(() => {
        if (coreInstance) {
          coreInstance.reset()
        }
      })

      await waitFor(() => {
        expect(localStorage.getItem('canary-ui')).toBeNull()
      })
    })

    it('should use custom storage when provided', async () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }

      const { result } = renderHook(
        () => useGlobalCanary<GlobalThisWithCustom>('custom-property', sessionStorage),
        {
          wrapper: createWrapper([feature]),
        },
      )

      await waitFor(() => {
        expect(result.current).not.toBeNull()
      })

      const coreInstance = result.current

      act(() => {
        if (coreInstance) {
          coreInstance.override('test-feature', true)
        }
      })

      await waitFor(() => {
        const stored = sessionStorage.getItem('custom-property')
        expect(stored).not.toBeNull()
        if (stored) {
          const parsed = JSON.parse(stored)
          expect(parsed['test-feature']).toBe(true)
        }
        // Should not be in localStorage
        expect(localStorage.getItem('custom-property')).toBeNull()
      })
    })
  })

  describe('localStorage initialization', () => {
    it('should load initial values from localStorage and override core', async () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }

      // Pre-populate localStorage
      localStorage.setItem('canary-ui', JSON.stringify({ 'test-feature': true }))

      const { result } = renderHook(() => useGlobalCanary(), {
        wrapper: createWrapper([feature]),
      })

      await waitFor(() => {
        expect(result.current).not.toBeNull()
      })

      const coreInstance = result.current

      // The core should have the value from localStorage
      await waitFor(() => {
        if (coreInstance) {
          expect(coreInstance.get('test-feature')).toBe(true)
        }
      })
    })

    it('should handle empty localStorage gracefully', async () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }

      const { result } = renderHook(() => useGlobalCanary(), {
        wrapper: createWrapper([feature]),
      })

      await waitFor(() => {
        expect(result.current).not.toBeNull()
      })

      const coreInstance = result.current

      // Should use the default value from config
      await waitFor(() => {
        if (coreInstance) {
          expect(coreInstance.get('test-feature')).toBe(false)
        }
      })
    })
  })

  describe('event handling', () => {
    it('should handle multiple override events correctly', async () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: 'option-1',
        variants: ['option-1', 'option-2', 'option-3'],
      }

      const { result } = renderHook(() => useGlobalCanary(), {
        wrapper: createWrapper([feature]),
      })

      await waitFor(() => {
        expect(result.current).not.toBeNull()
      })

      const coreInstance = result.current

      act(() => {
        if (coreInstance) {
          coreInstance.override('test-feature', 'option-2')
          coreInstance.override('test-feature', 'option-3')
        }
      })

      await waitFor(() => {
        const stored = localStorage.getItem('canary-ui')
        expect(stored).not.toBeNull()
        if (stored) {
          const parsed = JSON.parse(stored)
          expect(parsed['test-feature']).toBe('option-3')
        }
      })
    })

    it('should update globalThis property when core changes', async () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }

      const { result } = renderHook(() => useGlobalCanary(), {
        wrapper: createWrapper([feature]),
      })

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        expect((globalThis as GlobalThisWithCustom)['canary-ui']).toBe(result.current)
      })

      // The global value should remain the same instance
      const initialValue = result.current
      await waitFor(() => {
        expect((globalThis as GlobalThisWithCustom)['canary-ui']).toBe(initialValue)
      })
    })
  })
})
