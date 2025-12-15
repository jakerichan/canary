import { jest } from '@jest/globals'
import { render, screen, fireEvent } from '@testing-library/react'
import { CanaryCore } from '@canary-flags/core'
import type { CanaryStoreEntry } from '@canary-flags/core'
import CanaryUi from './CanaryUi'

// Mock the hooks
jest.mock('./useDrag', () => {
  return jest.fn(() => ({
    position: null,
    handlers: {
      onMouseDown: jest.fn(),
    },
  }))
})

jest.mock('./useResize', () => {
  return jest.fn(() => ({
    size: null,
    handlers: {
      onMouseDown: jest.fn(),
    },
  }))
})

// Mock CanaryFeature component
jest.mock('../CanaryFeature', () => {
  return jest.fn(({ name }: { name: string }) => (
    <div data-testid={`canary-feature-${name}`}>{name}</div>
  ))
})

// Mock lucide-react icons
jest.mock('lucide-react', () => {
  return {
    Minus: ({ size }: { size: number }) => (
      <div
        data-testid="minus-icon"
        data-size={size}
      />
    ),
    Search: ({ size }: { size: number }) => (
      <div
        data-testid="search-icon"
        data-size={size}
      />
    ),
    X: ({ size }: { size: number }) => (
      <div
        data-testid="x-icon"
        data-size={size}
      />
    ),
  }
})

// Mock CornerGrip
jest.mock('./CornerGrip', () => {
  return jest.fn(() => <div data-testid="corner-grip" />)
})

import useDrag from './useDrag'
import useResize from './useResize'

const mockUseDrag = useDrag as jest.MockedFunction<typeof useDrag>
const mockUseResize = useResize as jest.MockedFunction<typeof useResize>

describe('CanaryUi', () => {
  let core: CanaryCore

  beforeEach(() => {
    core = new CanaryCore()
    // Reset mocks
    mockUseDrag.mockReturnValue({
      position: null,
      handlers: {
        onMouseDown: jest.fn(),
      },
    })
    mockUseResize.mockReturnValue({
      size: null,
      handlers: {
        onMouseDown: jest.fn(),
      },
    })
  })

  afterEach(() => {
    core.destroy()
    jest.clearAllMocks()
  })

  describe('rendering', () => {
    it('should render the CanaryUi component', () => {
      render(<CanaryUi core={core} />)

      expect(screen.getByText('CanaryUi')).toBeTruthy()
    })

    it('should render header with title and action buttons', () => {
      render(<CanaryUi core={core} />)

      expect(screen.getByText('CanaryUi')).toBeTruthy()
      expect(screen.getByTestId('minus-icon')).toBeTruthy()
      expect(screen.getByTestId('x-icon')).toBeTruthy()
    })

    it('should render search input when not minimized', () => {
      render(<CanaryUi core={core} />)

      const searchInput = screen.getByPlaceholderText('Search')
      expect(searchInput).toBeTruthy()
      expect(screen.getByTestId('search-icon')).toBeTruthy()
    })

    it('should render feature list when features exist', () => {
      const feature1: CanaryStoreEntry = {
        name: 'feature-1',
        value: false,
        variants: [false, true],
      }
      const feature2: CanaryStoreEntry = {
        name: 'feature-2',
        value: 'option1',
        variants: ['option1', 'option2'],
      }
      core.config('feature-1', feature1)
      core.config('feature-2', feature2)

      render(<CanaryUi core={core} />)

      expect(screen.getByTestId('canary-feature-feature-1')).toBeTruthy()
      expect(screen.getByTestId('canary-feature-feature-2')).toBeTruthy()
    })

    it('should render empty feature list when no features exist', () => {
      render(<CanaryUi core={core} />)

      const featureList = screen.getByRole('list')
      expect(featureList).toBeTruthy()
      expect(featureList.children).toHaveLength(0)
    })

    it('should render resize handle when not minimized', () => {
      render(<CanaryUi core={core} />)

      expect(screen.getByTestId('corner-grip')).toBeTruthy()
    })
  })

  describe('minimize functionality', () => {
    it('should hide search input when minimized', () => {
      render(<CanaryUi core={core} />)

      const minimizeButton = screen.getByTestId('minus-icon').closest('button')
      expect(minimizeButton).toBeTruthy()
      if (!minimizeButton) return

      fireEvent.click(minimizeButton)

      expect(screen.queryByPlaceholderText('Search')).not.toBeTruthy()
      expect(screen.queryByTestId('search-icon')).not.toBeTruthy()
    })

    it('should hide resize handle when minimized', () => {
      render(<CanaryUi core={core} />)

      const minimizeButton = screen.getByTestId('minus-icon').closest('button')
      expect(minimizeButton).toBeTruthy()
      if (!minimizeButton) return

      fireEvent.click(minimizeButton)

      expect(screen.queryByTestId('corner-grip')).not.toBeTruthy()
    })

    it('should toggle minimize state when minimize button is clicked', () => {
      render(<CanaryUi core={core} />)

      const minimizeButton = screen.getByTestId('minus-icon').closest('button')
      expect(minimizeButton).toBeTruthy()
      if (!minimizeButton) return

      // Initially not minimized
      expect(screen.getByPlaceholderText('Search')).toBeTruthy()

      // Click to minimize
      fireEvent.click(minimizeButton)
      expect(screen.queryByPlaceholderText('Search')).not.toBeTruthy()

      // Click again to restore
      fireEvent.click(minimizeButton)
      expect(screen.getByPlaceholderText('Search')).toBeTruthy()
    })

    it('should apply minimized class to content when minimized', () => {
      render(<CanaryUi core={core} />)

      const minimizeButton = screen.getByTestId('minus-icon').closest('button')
      const content = screen.getByRole('list').parentElement
      if (!minimizeButton) return

      // Initially not minimized
      expect(content?.className).not.toContain('minimized')

      // Minimize
      fireEvent.click(minimizeButton)
      expect(content?.className).toContain('minimized')
    })
  })

  describe('close functionality', () => {
    it('should call core.toggle when close button is clicked', () => {
      const toggleSpy = jest.spyOn(core, 'toggle')

      render(<CanaryUi core={core} />)

      const closeButton = screen.getByTestId('x-icon').closest('button')
      expect(closeButton).toBeTruthy()
      if (!closeButton) return

      fireEvent.click(closeButton)

      expect(toggleSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('search functionality', () => {
    it('should filter features based on search input', () => {
      const feature1: CanaryStoreEntry = {
        name: 'feature-alpha',
        value: false,
        variants: [false, true],
      }
      const feature2: CanaryStoreEntry = {
        name: 'feature-beta',
        value: false,
        variants: [false, true],
      }
      const feature3: CanaryStoreEntry = {
        name: 'other-feature',
        value: false,
        variants: [false, true],
      }
      core.config('feature-alpha', feature1)
      core.config('feature-beta', feature2)
      core.config('other-feature', feature3)

      render(<CanaryUi core={core} />)

      // All features should be visible initially
      expect(screen.getByTestId('canary-feature-feature-alpha')).toBeTruthy()
      expect(screen.getByTestId('canary-feature-feature-beta')).toBeTruthy()
      expect(screen.getByTestId('canary-feature-other-feature')).toBeTruthy()

      // Search for "alpha"
      const searchInput = screen.getByPlaceholderText('Search')
      fireEvent.change(searchInput, { target: { value: 'alpha' } })

      // Only feature-alpha should be visible
      expect(screen.getByTestId('canary-feature-feature-alpha')).toBeTruthy()
      expect(screen.queryByTestId('canary-feature-feature-beta')).not.toBeTruthy()
      expect(screen.queryByTestId('canary-feature-other-feature')).not.toBeTruthy()
    })

    it('should show all features when search is cleared', () => {
      const feature1: CanaryStoreEntry = {
        name: 'feature-alpha',
        value: false,
        variants: [false, true],
      }
      const feature2: CanaryStoreEntry = {
        name: 'feature-beta',
        value: false,
        variants: [false, true],
      }
      core.config('feature-alpha', feature1)
      core.config('feature-beta', feature2)

      render(<CanaryUi core={core} />)

      const searchInput = screen.getByPlaceholderText('Search') as HTMLInputElement

      // Search for "alpha"
      fireEvent.change(searchInput, { target: { value: 'alpha' } })
      expect(screen.getByTestId('canary-feature-feature-alpha')).toBeTruthy()
      expect(screen.queryByTestId('canary-feature-feature-beta')).not.toBeTruthy()

      // Clear search
      fireEvent.change(searchInput, { target: { value: '' } })
      expect(screen.getByTestId('canary-feature-feature-alpha')).toBeTruthy()
      expect(screen.getByTestId('canary-feature-feature-beta')).toBeTruthy()
    })

    it('should filter case-sensitively', () => {
      const feature1: CanaryStoreEntry = {
        name: 'Feature-Alpha',
        value: false,
        variants: [false, true],
      }
      const feature2: CanaryStoreEntry = {
        name: 'feature-beta',
        value: false,
        variants: [false, true],
      }
      core.config('Feature-Alpha', feature1)
      core.config('feature-beta', feature2)

      render(<CanaryUi core={core} />)

      const searchInput = screen.getByPlaceholderText('Search')

      // Search for "Feature" (capital F)
      fireEvent.change(searchInput, { target: { value: 'Feature' } })
      expect(screen.getByTestId('canary-feature-Feature-Alpha')).toBeTruthy()
      expect(screen.queryByTestId('canary-feature-feature-beta')).not.toBeTruthy()

      // Search for "feature" (lowercase f)
      fireEvent.change(searchInput, { target: { value: 'feature' } })
      expect(screen.queryByTestId('canary-feature-Feature-Alpha')).not.toBeTruthy()
      expect(screen.getByTestId('canary-feature-feature-beta')).toBeTruthy()
    })
  })

  describe('drag functionality', () => {
    it('should pass containerRef to useDrag hook', () => {
      render(<CanaryUi core={core} />)

      expect(mockUseDrag).toHaveBeenCalled()
      const callArgs = mockUseDrag.mock.calls[0]
      expect(callArgs[0]).toBeTruthy()
      expect(callArgs[0].current).toBeTruthy()
    })

    it('should apply position styles when position is set', () => {
      mockUseDrag.mockReturnValue({
        position: { x: 100, y: 200 },
        handlers: {
          onMouseDown: jest.fn(),
        },
      })

      render(<CanaryUi core={core} />)

      const container = screen.getByText('CanaryUi').closest('[class*="canary"]') as HTMLElement
      expect(container).toBeTruthy()
      expect(container.style.left).toBe('100px')
      expect(container.style.top).toBe('200px')
    })

    it('should attach drag handler to header', () => {
      const mockOnMouseDown = jest.fn()
      mockUseDrag.mockReturnValue({
        position: null,
        handlers: {
          onMouseDown: mockOnMouseDown,
        },
      })

      render(<CanaryUi core={core} />)

      const header = screen.getByText('CanaryUi').closest('header')
      expect(header).toBeTruthy()
      if (!header) return

      fireEvent.mouseDown(header)
      expect(mockOnMouseDown).toHaveBeenCalled()
    })
  })

  describe('resize functionality', () => {
    it('should pass containerRef to useResize hook', () => {
      render(<CanaryUi core={core} />)

      expect(mockUseResize).toHaveBeenCalled()
      const callArgs = mockUseResize.mock.calls[0]
      expect(callArgs[0]).toBeTruthy()
      expect(callArgs[0].current).toBeTruthy()
    })

    it('should apply size styles when size is set', () => {
      mockUseResize.mockReturnValue({
        size: { width: 400, height: 500 },
        handlers: {
          onMouseDown: jest.fn(),
        },
      })

      render(<CanaryUi core={core} />)

      const container = screen.getByText('CanaryUi').closest('[class*="container"]') as HTMLElement
      expect(container).toBeTruthy()
      expect(container.style.width).toBe('400px')
      expect(container.style.height).toBe('500px')
    })

    it('should not apply height style when minimized', () => {
      mockUseResize.mockReturnValue({
        size: { width: 400, height: 500 },
        handlers: {
          onMouseDown: jest.fn(),
        },
      })

      render(<CanaryUi core={core} />)

      const minimizeButton = screen.getByTestId('minus-icon').closest('button')
      if (!minimizeButton) return
      fireEvent.click(minimizeButton)

      const container = screen.getByText('CanaryUi').closest('[class*="container"]') as HTMLElement
      expect(container).toBeTruthy()
      expect(container.style.width).toBe('400px')
      expect(container.style.height).toBe('')
    })

    it('should attach resize handler to resize handle', () => {
      const mockOnResizeMouseDown = jest.fn()
      mockUseResize.mockReturnValue({
        size: null,
        handlers: {
          onMouseDown: mockOnResizeMouseDown,
        },
      })

      render(<CanaryUi core={core} />)

      const resizeHandle = screen.getByTestId('corner-grip').closest('[class*="resizeHandle"]')
      expect(resizeHandle).toBeTruthy()
      if (!resizeHandle) return

      fireEvent.mouseDown(resizeHandle)
      expect(mockOnResizeMouseDown).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('should handle empty search gracefully', () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }
      core.config('test-feature', feature)

      render(<CanaryUi core={core} />)

      const searchInput = screen.getByPlaceholderText('Search')
      fireEvent.change(searchInput, { target: { value: '' } })

      expect(screen.getByTestId('canary-feature-test-feature')).toBeTruthy()
    })

    it('should handle search that matches no features', () => {
      const feature: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }
      core.config('test-feature', feature)

      render(<CanaryUi core={core} />)

      const searchInput = screen.getByPlaceholderText('Search')
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } })

      expect(screen.queryByTestId('canary-feature-test-feature')).not.toBeTruthy()
      const featureList = screen.getByRole('list')
      expect(featureList.children).toHaveLength(0)
    })

    it('should handle core with no selections', () => {
      render(<CanaryUi core={core} />)

      const featureList = screen.getByRole('list')
      expect(featureList).toBeTruthy()
      expect(featureList.children).toHaveLength(0)
    })

    it('should handle position being null', () => {
      mockUseDrag.mockReturnValue({
        position: null,
        handlers: {
          onMouseDown: jest.fn(),
        },
      })

      render(<CanaryUi core={core} />)

      const container = screen.getByText('CanaryUi').closest('[class*="canary"]') as HTMLElement
      expect(container).toBeTruthy()
      expect(container.style.left).toBe('')
      expect(container.style.top).toBe('')
    })

    it('should handle size being null', () => {
      mockUseResize.mockReturnValue({
        size: null,
        handlers: {
          onMouseDown: jest.fn(),
        },
      })

      render(<CanaryUi core={core} />)

      const container = screen.getByText('CanaryUi').closest('[class*="container"]') as HTMLElement
      expect(container).toBeTruthy()
      expect(container.style.width).toBe('')
      expect(container.style.height).toBe('')
    })
  })
})
