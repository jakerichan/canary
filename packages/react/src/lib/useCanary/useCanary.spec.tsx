import { useEffect } from 'react'
import { render, act, waitFor } from '@testing-library/react'
import { CanaryCore } from '@canary-flags/core'
import type { CanaryStoreEntry } from '@canary-flags/core'
import CanaryProvider from '../CanaryProvider/CanaryProvider'
import useCanary from './useCanary'
import useCanaryCore from '../useCanaryCore/useCanaryCore'

// Helper component to expose the core instance for testing
const CoreExposer = ({ onCoreReady }: { onCoreReady: (core: CanaryCore) => void }) => {
  const core = useCanaryCore()
  useEffect(() => {
    if (core) {
      onCoreReady(core)
    }
  }, [core, onCoreReady])
  return null
}

describe('useCanary', () => {
  describe('basic functionality', () => {
    it('should return the initial value from core', () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }

      const TestComponent = () => {
        const value = useCanary('test-feature')
        return <div data-testid="value">{String(value)}</div>
      }

      const { getByTestId } = render(
        <CanaryProvider
          canaryConfig={[feature]}
          renderCanaryUI={() => null}
        >
          <TestComponent />
        </CanaryProvider>,
      )

      expect(getByTestId('value').textContent).toBe('false')
    })

    it('should return undefined when flag does not exist', () => {
      const TestComponent = () => {
        const value = useCanary('non-existent')
        return <div data-testid="value">{value === undefined ? 'undefined' : String(value)}</div>
      }

      const { getByTestId } = render(
        <CanaryProvider
          canaryConfig={[]}
          renderCanaryUI={() => null}
        >
          <TestComponent />
        </CanaryProvider>,
      )

      expect(getByTestId('value').textContent).toBe('undefined')
    })

    it('should update when the flag value changes via assign', async () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }

      let coreInstance: CanaryCore | null = null

      const TestComponent = () => {
        const value = useCanary('test-feature')
        return <div data-testid="value">{String(value)}</div>
      }

      const { getByTestId } = render(
        <CanaryProvider
          canaryConfig={[feature]}
          renderCanaryUI={() => null}
        >
          <CoreExposer onCoreReady={(core) => { coreInstance = core }} />
          <TestComponent />
        </CanaryProvider>,
      )

      expect(getByTestId('value').textContent).toBe('false')

      await waitFor(() => {
        expect(coreInstance).not.toBeNull()
      })

      act(() => {
        if (coreInstance) {
          coreInstance.assign('test-feature', true)
        }
      })

      await waitFor(() => {
        expect(getByTestId('value').textContent).toBe('true')
      })
    })

    it('should update when the flag value changes via override', async () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }

      let coreInstance: CanaryCore | null = null

      const TestComponent = () => {
        const value = useCanary('test-feature')
        return <div data-testid="value">{String(value)}</div>
      }

      const { getByTestId } = render(
        <CanaryProvider
          canaryConfig={[feature]}
          renderCanaryUI={() => null}
        >
          <CoreExposer onCoreReady={(core) => { coreInstance = core }} />
          <TestComponent />
        </CanaryProvider>,
      )

      expect(getByTestId('value').textContent).toBe('false')

      await waitFor(() => {
        expect(coreInstance).not.toBeNull()
      })

      act(() => {
        if (coreInstance) {
          coreInstance.override('test-feature', true)
        }
      })

      await waitFor(() => {
        expect(getByTestId('value').textContent).toBe('true')
      })
    })
  })

  describe('rerender behavior', () => {
    it('should not trigger a rerender when a different flag is updated', async () => {
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

      let renderCount = 0
      const TestComponent = () => {
        renderCount++
        const value = useCanary('feature-1')
        return <div data-testid="value">{String(value)}</div>
      }

      let coreInstance: CanaryCore | null = null

      const { getByTestId } = render(
        <CanaryProvider
          canaryConfig={[feature1, feature2]}
          renderCanaryUI={() => null}
        >
          <CoreExposer onCoreReady={(core) => { coreInstance = core }} />
          <TestComponent />
        </CanaryProvider>,
      )

      expect(getByTestId('value').textContent).toBe('false')

      await waitFor(() => {
        expect(coreInstance).not.toBeNull()
      })

      // Capture render count after initial render
      const initialRenderCount = renderCount

      // Update a different flag (feature-2)
      act(() => {
        if (coreInstance) {
          coreInstance.assign('feature-2', 'updated')
        }
      })

      // Wait a bit to ensure any potential rerenders have completed
      await new Promise(resolve => setTimeout(resolve, 100))

      // The component should not have rerendered because feature-1 didn't change
      expect(renderCount).toBe(initialRenderCount)
      expect(getByTestId('value').textContent).toBe('false')
    })
  })
})
