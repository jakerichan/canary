import { jest } from '@jest/globals'
import { render, screen, fireEvent } from '@testing-library/react'
import { CanaryCore } from '@canary-flags/core'
import type { CanaryStoreEntry } from '@canary-flags/core'
import CanaryFeature from './CanaryFeature'
import useCanary from '../useCanary'

// Mock the useCanary hook
jest.mock('../useCanary')

// Mock lucide-react icons
jest.mock('lucide-react', () => {
  return {
    ChevronDown: ({ size }: { size: number }) => (
      <div
        data-testid="chevron-down"
        data-size={size}
      />
    ),
    ChevronRight: ({ size }: { size: number }) => (
      <div
        data-testid="chevron-right"
        data-size={size}
      />
    ),
    Square: ({ size }: { size: number }) => (
      <div
        data-testid="square-icon"
        data-size={size}
      />
    ),
    SquareCheck: ({ size }: { size: number }) => (
      <div
        data-testid="square-check-icon"
        data-size={size}
      />
    ),
  }
})

const mockUseCanary = useCanary as jest.MockedFunction<typeof useCanary>

describe('CanaryFeature', () => {
  let core: CanaryCore

  beforeEach(() => {
    core = new CanaryCore()
    mockUseCanary.mockReturnValue(false)
  })

  afterEach(() => {
    core.destroy()
    jest.restoreAllMocks()
  })

  describe('rendering', () => {
    it('should render the feature name', () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }
      core.config('test-feature', feature)

      render(
        <CanaryFeature
          name="test-feature"
          core={core}
        />,
      )

      expect(screen.getByText('test-feature')).toBeTruthy()
    })

    it('should render BooleanInput for boolean features', () => {
      const feature: CanaryStoreEntry = {
        name: 'boolean-feature',
        value: false,
        variants: [false, true],
      }
      core.config('boolean-feature', feature)
      mockUseCanary.mockReturnValue(false)

      render(
        <CanaryFeature
          name="boolean-feature"
          core={core}
        />,
      )

      // BooleanInput renders a checkbox button
      const checkboxButton = screen.getByRole('button', { name: /check/i })
      expect(checkboxButton).toBeTruthy()
    })

    it('should render SelectInput for string features', () => {
      const feature: CanaryStoreEntry = {
        name: 'string-feature',
        value: 'option1',
        variants: ['option1', 'option2', 'option3'],
      }
      core.config('string-feature', feature)
      mockUseCanary.mockReturnValue('option1')

      render(
        <CanaryFeature
          name="string-feature"
          core={core}
        />,
      )

      const select = screen.getByRole('combobox') as HTMLSelectElement
      expect(select).toBeTruthy()
      expect(select.value).toBe('option1')
    })

    it('should not render expand button when there is no metadata', () => {
      const feature: CanaryStoreEntry = {
        name: 'no-metadata-feature',
        value: false,
        variants: [false, true],
      }
      core.config('no-metadata-feature', feature)

      render(
        <CanaryFeature
          name="no-metadata-feature"
          core={core}
        />,
      )

      expect(screen.queryByTestId('chevron-down')).not.toBeTruthy()
      expect(screen.queryByTestId('chevron-right')).not.toBeTruthy()
    })

    it('should render expand button when there is metadata', () => {
      const feature: CanaryStoreEntry = {
        name: 'metadata-feature',
        value: false,
        variants: [false, true],
        metadata: {
          description: 'Test feature',
          source: 'config',
        },
      }
      core.config('metadata-feature', feature)

      render(
        <CanaryFeature
          name="metadata-feature"
          core={core}
        />,
      )

      const expandButton = screen.getByTestId('chevron-right')
      expect(expandButton).toBeTruthy()
    })

    it('should render metadata when expanded', () => {
      const feature: CanaryStoreEntry = {
        name: 'metadata-feature',
        value: false,
        variants: [false, true],
        metadata: {
          description: 'Test feature description',
          source: 'config-file',
        },
      }
      core.config('metadata-feature', feature)

      render(
        <CanaryFeature
          name="metadata-feature"
          core={core}
        />,
      )

      // Initially collapsed, metadata div should not have expanded class
      // The metadata container is the parent of the metadataEntry
      const descriptionElement = screen.getByText('description')
      const metadataEntry = descriptionElement.parentElement
      const metadataContainer = metadataEntry?.parentElement
      expect(metadataContainer?.className).not.toContain('expanded')

      // Click to expand
      const expandButton = screen.getByTestId('chevron-right')
      fireEvent.click(expandButton)

      // Metadata should now be expanded - wait for state update
      const expandedDescriptionElement = screen.getByText('description')
      const expandedMetadataEntry = expandedDescriptionElement.parentElement
      const expandedMetadataContainer = expandedMetadataEntry?.parentElement
      expect(expandedMetadataContainer?.className).toContain('expanded')
      expect(screen.getByText('Test feature description')).toBeTruthy()
      expect(screen.getByText('source')).toBeTruthy()
      expect(screen.getByText('config-file')).toBeTruthy()
    })

    it('should toggle metadata visibility when expand button is clicked', () => {
      const feature: CanaryStoreEntry = {
        name: 'metadata-feature',
        value: false,
        variants: [false, true],
        metadata: {
          description: 'Test feature',
        },
      }
      core.config('metadata-feature', feature)

      render(
        <CanaryFeature
          name="metadata-feature"
          core={core}
        />,
      )

      const expandButton = screen.getByTestId('chevron-right')

      // Initially collapsed
      expect(expandButton).toBeTruthy()
      const descriptionElement = screen.getByText('description')
      const initialMetadataEntry = descriptionElement.parentElement
      const initialMetadataContainer = initialMetadataEntry?.parentElement
      expect(initialMetadataContainer?.className).not.toContain('expanded')

      // Expand
      fireEvent.click(expandButton)
      expect(screen.getByTestId('chevron-down')).toBeTruthy()
      const expandedDescriptionElement = screen.getByText('description')
      const expandedMetadataEntry = expandedDescriptionElement.parentElement
      const expandedMetadataContainer = expandedMetadataEntry?.parentElement
      expect(expandedMetadataContainer?.className).toContain('expanded')

      // Collapse
      fireEvent.click(screen.getByTestId('chevron-down'))
      expect(screen.getByTestId('chevron-right')).toBeTruthy()
      const collapsedDescriptionElement = screen.getByText('description')
      const collapsedMetadataEntry = collapsedDescriptionElement.parentElement
      const collapsedMetadataContainer = collapsedMetadataEntry?.parentElement
      expect(collapsedMetadataContainer?.className).not.toContain('expanded')
    })
  })

  describe('boolean features', () => {
    it('should detect boolean feature with [false, true] variants', () => {
      const feature: CanaryStoreEntry = {
        name: 'bool-feature',
        value: false,
        variants: [false, true],
      }
      core.config('bool-feature', feature)
      mockUseCanary.mockReturnValue(false)

      render(
        <CanaryFeature
          name="bool-feature"
          core={core}
        />,
      )

      const checkboxButton = screen.getByRole('button', { name: /check/i })
      expect(checkboxButton).toBeTruthy()
    })

    it('should detect boolean feature with [true, false] variants', () => {
      const feature: CanaryStoreEntry = {
        name: 'bool-feature',
        value: true,
        variants: [true, false],
      }
      core.config('bool-feature', feature)
      mockUseCanary.mockReturnValue(true)

      render(
        <CanaryFeature
          name="bool-feature"
          core={core}
        />,
      )

      const checkboxButton = screen.getByRole('button', { name: /uncheck/i })
      expect(checkboxButton).toBeTruthy()
    })

    it('should call core.override when boolean value changes', () => {
      const feature: CanaryStoreEntry = {
        name: 'bool-feature',
        value: false,
        variants: [false, true],
      }
      core.config('bool-feature', feature)
      mockUseCanary.mockReturnValue(false)
      const overrideSpy = jest.spyOn(core, 'override')

      render(
        <CanaryFeature
          name="bool-feature"
          core={core}
        />,
      )

      const checkboxButton = screen.getByRole('button', { name: /check/i })
      fireEvent.click(checkboxButton)

      expect(overrideSpy).toHaveBeenCalledWith('bool-feature', true)
    })
  })

  describe('string features', () => {
    it('should render select with all options', () => {
      const feature: CanaryStoreEntry = {
        name: 'string-feature',
        value: 'option1',
        variants: ['option1', 'option2', 'option3'],
      }
      core.config('string-feature', feature)
      mockUseCanary.mockReturnValue('option1')

      render(
        <CanaryFeature
          name="string-feature"
          core={core}
        />,
      )

      const select = screen.getByRole('combobox') as HTMLSelectElement
      expect(select).toBeTruthy()
      expect(select.value).toBe('option1')

      const options = screen.getAllByRole('option')
      expect(options).toHaveLength(3)
      expect(options[0].textContent).toBe('option1')
      expect(options[1].textContent).toBe('option2')
      expect(options[2].textContent).toBe('option3')
    })

    it('should call core.override when select value changes', () => {
      const feature: CanaryStoreEntry = {
        name: 'string-feature',
        value: 'option1',
        variants: ['option1', 'option2', 'option3'],
      }
      core.config('string-feature', feature)
      mockUseCanary.mockReturnValue('option1')
      const overrideSpy = jest.spyOn(core, 'override')

      render(
        <CanaryFeature
          name="string-feature"
          core={core}
        />,
      )

      const select = screen.getByRole('combobox')
      fireEvent.change(select, { target: { value: 'option2' } })

      expect(overrideSpy).toHaveBeenCalledWith('string-feature', 'option2')
    })
  })

  describe('edge cases', () => {
    it('should handle feature with no variants', () => {
      const feature: CanaryStoreEntry = {
        name: 'no-variants-feature',
        value: false,
        variants: [], // Explicitly set empty variants
      }
      core.config('no-variants-feature', feature)
      mockUseCanary.mockReturnValue(false)

      render(
        <CanaryFeature
          name="no-variants-feature"
          core={core}
        />,
      )

      // Should still render the feature name
      expect(screen.getByText('no-variants-feature')).toBeTruthy()
      // Should not render any input (neither boolean nor select) when variants is empty
      expect(screen.queryByRole('combobox')).not.toBeTruthy()
      expect(screen.queryByRole('button', { name: /check/i })).not.toBeTruthy()
    })

    it('should handle feature that does not exist in core', () => {
      mockUseCanary.mockReturnValue(null)

      render(
        <CanaryFeature
          name="non-existent-feature"
          core={core}
        />,
      )

      // Should still render the feature name
      expect(screen.getByText('non-existent-feature')).toBeTruthy()
      // Should not render any input
      expect(screen.queryByRole('combobox')).not.toBeTruthy()
      expect(screen.queryByRole('button', { name: /check/i })).not.toBeTruthy()
    })

    it('should handle feature with empty metadata object', () => {
      const feature: CanaryStoreEntry = {
        name: 'empty-metadata-feature',
        value: false,
        variants: [false, true],
        metadata: {},
      }
      core.config('empty-metadata-feature', feature)

      render(
        <CanaryFeature
          name="empty-metadata-feature"
          core={core}
        />,
      )

      // Should not render expand button for empty metadata
      expect(screen.queryByTestId('chevron-down')).not.toBeTruthy()
      expect(screen.queryByTestId('chevron-right')).not.toBeTruthy()
    })

    it('should handle feature with multiple metadata entries', () => {
      const feature: CanaryStoreEntry = {
        name: 'multi-metadata-feature',
        value: false,
        variants: [false, true],
        metadata: {
          description: 'Feature description',
          source: 'config',
          version: '1.0.0',
          author: 'test',
        },
      }
      core.config('multi-metadata-feature', feature)

      render(
        <CanaryFeature
          name="multi-metadata-feature"
          core={core}
        />,
      )

      // Expand to see metadata
      fireEvent.click(screen.getByTestId('chevron-right'))

      // All metadata entries should be visible
      expect(screen.getByText('description')).toBeTruthy()
      expect(screen.getByText('Feature description')).toBeTruthy()
      expect(screen.getByText('source')).toBeTruthy()
      expect(screen.getByText('config')).toBeTruthy()
      expect(screen.getByText('version')).toBeTruthy()
      expect(screen.getByText('1.0.0')).toBeTruthy()
      expect(screen.getByText('author')).toBeTruthy()
      expect(screen.getByText('test')).toBeTruthy()
    })

    it('should use current value from useCanary hook', () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }
      core.config('test-feature', feature)
      mockUseCanary.mockReturnValue(true)

      render(
        <CanaryFeature
          name="test-feature"
          core={core}
        />,
      )

      // Should show checked state based on useCanary return value
      const checkboxButton = screen.getByRole('button', { name: /uncheck/i })
      expect(checkboxButton).toBeTruthy()
    })
  })

  describe('feature detection logic', () => {
    it('should not treat string array with 2 items as boolean', () => {
      const feature: CanaryStoreEntry = {
        name: 'two-option-feature',
        value: 'option1',
        variants: ['option1', 'option2'],
      }
      core.config('two-option-feature', feature)
      mockUseCanary.mockReturnValue('option1')

      render(
        <CanaryFeature
          name="two-option-feature"
          core={core}
        />,
      )

      // Should render select, not boolean input
      expect(screen.getByRole('combobox')).toBeTruthy()
      expect(screen.queryByRole('button', { name: /check/i })).not.toBeTruthy()
    })

    it('should handle number variants as string select', () => {
      const feature: CanaryStoreEntry = {
        name: 'number-feature',
        value: 1,
        variants: [1, 2, 3] as number[],
      }
      core.config('number-feature', feature)
      mockUseCanary.mockReturnValue(1)

      render(
        <CanaryFeature
          name="number-feature"
          core={core}
        />,
      )

      // Number variants are not strings, so should not render select
      // The component only handles boolean and string variants
      expect(screen.queryByRole('combobox')).not.toBeTruthy()
      expect(screen.queryByRole('button', { name: /check/i })).not.toBeTruthy()
    })
  })
})
