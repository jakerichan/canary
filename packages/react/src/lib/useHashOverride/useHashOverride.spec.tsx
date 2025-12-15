import { renderHook, act, waitFor } from '@testing-library/react'
import type { CanaryStoreEntry } from '@canary-flags/core'
import CanaryProvider from '../CanaryProvider/CanaryProvider'
import useHashOverride from './useHashOverride'
import useCanaryCore from '../useCanaryCore/useCanaryCore'

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

// Mock event listeners
const mockAddEventListener = jest.fn()
const mockRemoveEventListener = jest.fn()

// Helper to set hash for tests - use native location.hash which jsdom supports
const setMockHash = (value: string) => {
  window.location.hash = value
}

// Helper to get current hash
const getMockHash = () => window.location.hash

describe('useHashOverride', () => {
  beforeEach(() => {
    // Clear hash
    window.location.hash = ''

    // Mock globalThis.addEventListener and removeEventListener
    jest.spyOn(globalThis, 'addEventListener').mockImplementation(mockAddEventListener)
    jest.spyOn(globalThis, 'removeEventListener').mockImplementation(mockRemoveEventListener)
    mockAddEventListener.mockClear()
    mockRemoveEventListener.mockClear()
  })

  afterEach(() => {
    // Clear hash
    window.location.hash = ''
    // Restore original event listeners
    jest.restoreAllMocks()
  })

  describe('basic functionality', () => {
    it('should apply hash overrides on mount', async () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }

      const hashValue = encodeURIComponent(encodeURIComponent(JSON.stringify({ 'test-feature': true })))
      setMockHash(`#canary=${hashValue}`)

      const { result } = renderHook(
        () => {
          useHashOverride('canary')
          return useCanaryCore()
        },
        {
          wrapper: createWrapper([feature]),
        },
      )

      await waitFor(() => {
        expect(result.current).not.toBeNull()
      })

      await waitFor(() => {
        if (result.current) {
          expect(result.current.get('test-feature')).toBe(true)
        }
      })
    })

    it('should return undefined (void hook)', () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }

      const { result } = renderHook(() => useHashOverride('canary'), {
        wrapper: createWrapper([feature]),
      })

      expect(result.current).toBeUndefined()
    })

    it('should handle null canary core gracefully', () => {
      setMockHash('#canary=%7B%22test-feature%22%3Atrue%7D')
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      expect(() => {
        renderHook(() => useHashOverride('canary'))
      }).not.toThrow()

      consoleErrorSpy.mockRestore()
    })

    it('should handle empty hash gracefully', async () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }

      setMockHash('')

      const { result } = renderHook(
        () => {
          useHashOverride('canary')
          return useCanaryCore()
        },
        {
          wrapper: createWrapper([feature]),
        },
      )

      await waitFor(() => {
        expect(result.current).not.toBeNull()
      })

      // Should use default value
      await waitFor(() => {
        if (result.current) {
          expect(result.current.get('test-feature')).toBe(false)
        }
      })
    })
  })

  describe('hash parsing', () => {
    it('should parse single hash parameter', async () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }

      const hashValue = encodeURIComponent(encodeURIComponent(JSON.stringify({ 'test-feature': true })))
      setMockHash(`#canary=${hashValue}`)

      const { result } = renderHook(
        () => {
          useHashOverride('canary')
          return useCanaryCore()
        },
        {
          wrapper: createWrapper([feature]),
        },
      )

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        if (result.current) {
          expect(result.current.get('test-feature')).toBe(true)
        }
      })
    })

    it('should parse hash parameter from multiple parameters', async () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }

      const hashValue = encodeURIComponent(encodeURIComponent(JSON.stringify({ 'test-feature': true })))
      setMockHash(`#other=value&canary=${hashValue}&another=param`)

      const { result } = renderHook(
        () => {
          useHashOverride('canary')
          return useCanaryCore()
        },
        {
          wrapper: createWrapper([feature]),
        },
      )

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        if (result.current) {
          expect(result.current.get('test-feature')).toBe(true)
        }
      })
    })

    it('should handle hash parameter that does not match hashName', async () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }

      const hashValue = encodeURIComponent(encodeURIComponent(JSON.stringify({ 'test-feature': true })))
      setMockHash(`#other=${hashValue}`)

      const { result } = renderHook(
        () => {
          useHashOverride('canary')
          return useCanaryCore()
        },
        {
          wrapper: createWrapper([feature]),
        },
      )

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        // Should use default value since hash parameter doesn't match
        if (result.current) {
          expect(result.current.get('test-feature')).toBe(false)
        }
      })
    })

    it('should double-decode URL-encoded values', async () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }

      // Double-encode the JSON string
      const jsonString = JSON.stringify({ 'test-feature': true })
      const hashValue = encodeURIComponent(encodeURIComponent(jsonString))
      setMockHash(`#canary=${hashValue}`)

      const { result } = renderHook(
        () => {
          useHashOverride('canary')
          return useCanaryCore()
        },
        {
          wrapper: createWrapper([feature]),
        },
      )

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        if (result.current) {
          expect(result.current.get('test-feature')).toBe(true)
        }
      })
    })
  })

  describe('override application', () => {
    it('should apply multiple flag overrides', async () => {
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

      const hashValue = encodeURIComponent(
        encodeURIComponent(JSON.stringify({
          'feature-1': true,
          'feature-2': 'updated',
        })),
      )
      setMockHash(`#canary=${hashValue}`)

      const { result } = renderHook(
        () => {
          useHashOverride('canary')
          return useCanaryCore()
        },
        {
          wrapper: createWrapper([feature1, feature2]),
        },
      )

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        if (result.current) {
          expect(result.current.get('feature-1')).toBe(true)
          expect(result.current.get('feature-2')).toBe('updated')
        }
      })
    })

    it('should override string values', async () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: 'default',
        variants: ['default', 'override'],
      }

      const hashValue = encodeURIComponent(
        encodeURIComponent(JSON.stringify({ 'test-feature': 'override' })),
      )
      setMockHash(`#canary=${hashValue}`)

      const { result } = renderHook(
        () => {
          useHashOverride('canary')
          return useCanaryCore()
        },
        {
          wrapper: createWrapper([feature]),
        },
      )

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        if (result.current) {
          expect(result.current.get('test-feature')).toBe('override')
        }
      })
    })

    it('should override number values', async () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: 0,
        variants: [0, 1, 2],
      }

      const hashValue = encodeURIComponent(
        encodeURIComponent(JSON.stringify({ 'test-feature': 2 })),
      )
      setMockHash(`#canary=${hashValue}`)

      const { result } = renderHook(
        () => {
          useHashOverride('canary')
          return useCanaryCore()
        },
        {
          wrapper: createWrapper([feature]),
        },
      )

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        if (result.current) {
          expect(result.current.get('test-feature')).toBe(2)
        }
      })
    })
  })

  describe('clearHash option', () => {
    it('should clear hash by default after applying overrides', async () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }

      const hashValue = encodeURIComponent(encodeURIComponent(JSON.stringify({ 'test-feature': true })))
      setMockHash(`#canary=${hashValue}`)

      renderHook(() => useHashOverride('canary'), {
        wrapper: createWrapper([feature]),
      })

      await waitFor(() => {
        expect(getMockHash()).toBe('')
      })
    })

    it('should not clear hash when clearHash is false', async () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }

      const hashValue = encodeURIComponent(encodeURIComponent(JSON.stringify({ 'test-feature': true })))
      const originalHash = `#canary=${hashValue}`
      setMockHash(originalHash)

      renderHook(() => useHashOverride('canary', { clearHash: false }), {
        wrapper: createWrapper([feature]),
      })

      // Wait a bit to ensure hash isn't cleared
      await new Promise(resolve => setTimeout(resolve, 100))

      expect(getMockHash()).toBe(originalHash)
    })
  })

  describe('hashchange event handling', () => {
    it('should listen for hashchange events', () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }

      renderHook(() => useHashOverride('canary'), {
        wrapper: createWrapper([feature]),
      })

      expect(mockAddEventListener).toHaveBeenCalledWith(
        'hashchange',
        expect.any(Function),
      )
    })

    it('should remove hashchange listener on unmount', () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }

      const { unmount } = renderHook(() => useHashOverride('canary'), {
        wrapper: createWrapper([feature]),
      })

      const addEventListenerCall = mockAddEventListener.mock.calls.find(
        (call: unknown[]) => call[0] === 'hashchange',
      )
      const handler = addEventListenerCall?.[1]

      unmount()

      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        'hashchange',
        handler,
      )
    })

    it('should apply overrides when hash changes', async () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }

      const { result } = renderHook(
        () => {
          useHashOverride('canary')
          return useCanaryCore()
        },
        {
          wrapper: createWrapper([feature]),
        },
      )

      await waitFor(() => {
        expect(result.current).not.toBeNull()
      })

      // Get the LAST hashchange handler (after core is available, the handler is re-registered)
      const hashchangeCalls = mockAddEventListener.mock.calls.filter(
        (call: unknown[]) => call[0] === 'hashchange',
      )
      const handler = hashchangeCalls[hashchangeCalls.length - 1]?.[1] as () => void

      // Change the hash
      const hashValue = encodeURIComponent(encodeURIComponent(JSON.stringify({ 'test-feature': true })))
      setMockHash(`#canary=${hashValue}`)

      // Trigger the handler
      act(() => {
        handler()
      })

      await waitFor(() => {
        if (result.current) {
          expect(result.current.get('test-feature')).toBe(true)
        }
      })
    })
  })

  describe('error handling', () => {
    it('should handle invalid JSON gracefully', async () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      setMockHash('#canary=invalid-json')

      const { result } = renderHook(
        () => {
          useHashOverride('canary')
          return useCanaryCore()
        },
        {
          wrapper: createWrapper([feature]),
        },
      )

      await waitFor(() => {
        expect(result.current).not.toBeNull()
      })

      // Should use default value
      await waitFor(() => {
        if (result.current) {
          expect(result.current.get('test-feature')).toBe(false)
        }
      })

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error applying hash override',
        'invalid-json',
        expect.any(Error),
      )

      consoleErrorSpy.mockRestore()
    })

    it('should handle malformed hash parameter gracefully', async () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }

      setMockHash('#canary=')

      const { result } = renderHook(
        () => {
          useHashOverride('canary')
          return useCanaryCore()
        },
        {
          wrapper: createWrapper([feature]),
        },
      )

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        // Should use default value
        if (result.current) {
          expect(result.current.get('test-feature')).toBe(false)
        }
      })
    })

    it('should handle decode errors gracefully', async () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }

      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

      // Invalid URL encoding
      setMockHash('#canary=%')

      const { result } = renderHook(
        () => {
          useHashOverride('canary')
          return useCanaryCore()
        },
        {
          wrapper: createWrapper([feature]),
        },
      )

      await waitFor(() => {
        expect(result.current).not.toBeNull()
        // Should use default value
        if (result.current) {
          expect(result.current.get('test-feature')).toBe(false)
        }
      })

      consoleErrorSpy.mockRestore()
    })
  })
})
