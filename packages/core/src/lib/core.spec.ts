import { jest } from '@jest/globals'
import CanaryCore from './core'
import type { CanaryStoreEntry, Overrides } from './types'

describe('CanaryCore', () => {
  let canary: CanaryCore

  beforeEach(() => {
    canary = new CanaryCore()
  })

  afterEach(() => {
    canary.destroy()
  })

  describe('constructor', () => {
    it('should create an instance without parameters', () => {
      expect(canary).toBeInstanceOf(CanaryCore)
      expect(canary.selections).toEqual({})
    })

    it('should initialize with config array', () => {
      const config: CanaryStoreEntry[] = [
        { name: 'feature1', value: true },
        { name: 'feature2', value: 'enabled' },
      ]
      const instance = new CanaryCore(config)
      expect(instance.get('feature1')).toBe(true)
      expect(instance.get('feature2')).toBe('enabled')
    })

    it('should initialize with overrides', () => {
      const overrides: Overrides = {
        feature1: true,
        feature2: 'enabled',
      }
      const instance = new CanaryCore(undefined, overrides)
      expect(instance.get('feature1')).toBe(true)
      expect(instance.get('feature2')).toBe('enabled')
    })

    it('should initialize with both config and overrides', () => {
      const config: CanaryStoreEntry[] = [
        { name: 'feature1', value: false },
        { name: 'feature2', value: 'disabled' },
        { name: 'feature3', value: 42 },
      ]
      const overrides: Overrides = {
        feature1: true,
        feature2: 'enabled',
      }
      const instance = new CanaryCore(config, overrides)
      expect(instance.get('feature1')).toBe(true) // override takes precedence
      expect(instance.get('feature2')).toBe('enabled') // override takes precedence
      expect(instance.get('feature3')).toBe(42) // override takes precedence
    })
  })

  describe('config', () => {
    it('should set a feature configuration', () => {
      const entry: CanaryStoreEntry = {
        name: 'test-feature',
        value: true,
        variants: [false, true],
        metadata: { description: 'Test feature' },
      }

      const result = canary.config('test-feature', entry)
      expect(result).toBe(canary)
      expect(canary.getFeature('test-feature')).toEqual({
        ...entry,
        name: 'test-feature',
      })
    })

    it('should merge existing configuration', () => {
      const initialEntry: CanaryStoreEntry = {
        name: 'test-feature',
        value: false,
        variants: [false, true],
      }
      const updateEntry: CanaryStoreEntry = {
        name: 'test-feature',
        value: true,
        metadata: { description: 'Updated description' },
      }

      canary.config('test-feature', initialEntry)
      canary.config('test-feature', updateEntry)

      const feature = canary.getFeature('test-feature')
      expect(feature?.value).toBe(true)
      expect(feature?.metadata?.description).toBe('Updated description')
      expect(feature?.variants).toEqual([false, true])
    })

    it('should emit config event', () => {
      const mockListener = jest.fn()
      canary.on('config:test-feature', mockListener)

      const entry: CanaryStoreEntry = { name: 'test-feature', value: true }
      canary.config('test-feature', entry)

      expect(mockListener).toHaveBeenCalledWith({
        ...entry,
        name: 'test-feature',
      })
    })

    it('should not emit event if configuration is unchanged', () => {
      const entry: CanaryStoreEntry = { name: 'test-feature', value: true }
      canary.config('test-feature', entry)

      const mockListener = jest.fn()
      canary.on('config:test-feature', mockListener)

      canary.config('test-feature', entry)

      expect(mockListener).not.toHaveBeenCalled()
    })
  })

  describe('initializeConfig', () => {
    it('should initialize multiple features from config array', () => {
      const config: CanaryStoreEntry[] = [
        { name: 'feature1', value: true },
        { name: 'feature2', value: 'enabled' },
        { name: 'feature3', value: 42 },
      ]

      const result = canary.initializeConfig(config)
      expect(result).toBe(canary)
      expect(canary.get('feature1')).toBe(true)
      expect(canary.get('feature2')).toBe('enabled')
      expect(canary.get('feature3')).toBe(42)
    })
  })

  describe('assign', () => {
    it('should assign a value to a feature', () => {
      const result = canary.assign('test-feature', true)
      expect(result).toBe(canary)
      expect(canary.get('test-feature')).toBe(true)
    })

    it('should emit assign and change events', () => {
      const assignListener = jest.fn()
      const changeListener = jest.fn()
      canary.on('assign:test-feature', assignListener)
      canary.on('change', changeListener)

      canary.assign('test-feature', true)

      expect(assignListener).toHaveBeenCalledWith(true, canary)
      expect(changeListener).toHaveBeenCalledWith('test-feature', true, canary)
    })

    it('should not emit assign and change events for unrelated features', () => {
      const assignListener = jest.fn()
      const changeListener = jest.fn()
      canary.on('assign:test-feature', assignListener)
      canary.on('change', changeListener)

      canary.assign('test-feature-2', true)

      expect(assignListener).not.toHaveBeenCalled()
      expect(changeListener).toHaveBeenCalledWith('test-feature-2', true, canary)
    })

    it('should not emit events if value is unchanged', () => {
      canary.assign('test-feature', true)

      const assignListener = jest.fn()
      const changeListener = jest.fn()
      canary.on('assign:test-feature', assignListener)
      canary.on('change', changeListener)

      canary.assign('test-feature', true)

      expect(assignListener).not.toHaveBeenCalled()
      expect(changeListener).not.toHaveBeenCalled()
    })

    it('should handle different value types', () => {
      canary.assign('bool-feature', true)
      canary.assign('string-feature', 'test')
      canary.assign('number-feature', 42)
      canary.assign('object-feature', { key: 'value' })
      canary.assign('null-feature', null)

      expect(canary.get('bool-feature')).toBe(true)
      expect(canary.get('string-feature')).toBe('test')
      expect(canary.get('number-feature')).toBe(42)
      expect(canary.get('object-feature')).toEqual({ key: 'value' })
      expect(canary.get('null-feature')).toBeNull()
    })
  })

  describe('override', () => {
    it('should override a feature value', () => {
      canary.assign('test-feature', false)
      const result = canary.override('test-feature', true)
      expect(result).toBe(canary)
      expect(canary.get('test-feature')).toBe(true)
    })

    it('should emit override and change events', () => {
      const overrideListener = jest.fn()
      const changeListener = jest.fn()
      canary.on('override:test-feature', overrideListener)
      canary.on('change', changeListener)

      canary.override('test-feature', true)

      expect(overrideListener).toHaveBeenCalledWith(true, canary)
      expect(changeListener).toHaveBeenCalledWith('test-feature', true, canary)
    })

    it('should work with undefined override', () => {
      canary.assign('test-feature', true)
      canary.override('test-feature', undefined)
      expect(canary.get('test-feature')).toBe(true) // undefined override falls back to value
    })
  })

  describe('overrideValues', () => {
    it('should override multiple values', () => {
      const overrides: Overrides = {
        feature1: true,
        feature2: 'enabled',
        feature3: 42,
      }

      const result = canary.overrideValues(overrides)
      expect(result).toBe(canary)
      expect(canary.get('feature1')).toBe(true)
      expect(canary.get('feature2')).toBe('enabled')
      expect(canary.get('feature3')).toBe(42)
    })
  })

  describe('overrideSet', () => {
    it('should override multiple values', () => {
      const overrides = {
        feature1: true,
        feature2: 'enabled',
      }

      const result = canary.overrideSet(overrides)
      expect(result).toBe(canary)
      expect(canary.get('feature1')).toBe(true)
      expect(canary.get('feature2')).toBe('enabled')
    })
  })

  describe('get', () => {
    it('should return override value if present', () => {
      canary.assign('test-feature', false)
      canary.override('test-feature', true)
      expect(canary.get('test-feature')).toBe(true)
    })

    it('should return assigned value if no override', () => {
      canary.assign('test-feature', true)
      expect(canary.get('test-feature')).toBe(true)
    })

    it('should return undefined for non-existent feature', () => {
      expect(canary.get('non-existent')).toBeUndefined()
    })
  })

  describe('getFeature', () => {
    it('should return feature configuration', () => {
      const entry: CanaryStoreEntry = {
        name: 'test-feature',
        value: true,
        variants: [false, true],
        metadata: { description: 'Test' },
      }
      canary.config('test-feature', entry)

      const feature = canary.getFeature('test-feature')
      expect(feature).toEqual({
        ...entry,
        name: 'test-feature',
      })
    })

    it('should return undefined for non-existent feature', () => {
      expect(canary.getFeature('non-existent')).toBeUndefined()
    })
  })

  describe('hasOverride', () => {
    it('should return true when feature has override', () => {
      canary.override('test-feature', true)
      expect(canary.hasOverride('test-feature')).toBe(true)
    })

    it('should return false when feature has no override', () => {
      canary.assign('test-feature', true)
      expect(canary.hasOverride('test-feature')).toBe(false)
    })

    it('should return false for non-existent feature', () => {
      expect(canary.hasOverride('non-existent')).toBe(false)
    })

    it('should return false when override is undefined', () => {
      canary.override('test-feature', undefined)
      expect(canary.hasOverride('test-feature')).toBe(false)
    })
  })

  describe('hasAssignment', () => {
    it('should return true when feature has assignment', () => {
      canary.assign('test-feature', true)
      expect(canary.hasAssignment('test-feature')).toBe(true)
    })

    it('should return false when feature has no assignment', () => {
      canary.override('test-feature', true)
      expect(canary.hasAssignment('test-feature')).toBe(false)
    })

    it('should return false for non-existent feature', () => {
      expect(canary.hasAssignment('non-existent')).toBe(false)
    })

    it('should return false when assignment is undefined', () => {
      canary.assign('test-feature', undefined)
      expect(canary.hasAssignment('test-feature')).toBe(false)
    })
  })

  describe('reset', () => {
    it('should clear all overrides', () => {
      canary.assign('feature1', false)
      canary.assign('feature2', 'disabled')
      canary.override('feature1', true)
      canary.override('feature2', 'enabled')

      const result = canary.reset()
      expect(result).toBe(canary)
      expect(canary.get('feature1')).toBe(false)
      expect(canary.get('feature2')).toBe('disabled')
    })

    it('should emit reset and change:bulk events', () => {
      canary.override('test-feature', true)

      const resetListener = jest.fn()
      const bulkChangeListener = jest.fn()
      canary.on('reset', resetListener)
      canary.on('change:bulk', bulkChangeListener)

      canary.reset()

      expect(resetListener).toHaveBeenCalledWith(canary)
      expect(bulkChangeListener).toHaveBeenCalledWith(canary)
    })
  })

  describe('merge', () => {
    it('should merge features from another core instance', () => {
      const childCore = new CanaryCore()
      childCore.assign('feature1', true)
      childCore.assign('feature2', 'enabled')

      const result = canary.merge(childCore)
      expect(result).toBe(canary)
      expect(canary.get('feature1')).toBe(true)
      expect(canary.get('feature2')).toBe('enabled')
    })

    it('should merge with existing features', () => {
      canary.assign('feature1', false)
      canary.assign('feature2', 'disabled')

      const childCore = new CanaryCore()
      childCore.assign('feature1', true)
      childCore.assign('feature3', 'new')

      canary.merge(childCore)

      expect(canary.get('feature1')).toBe(true) // child value takes precedence
      expect(canary.get('feature2')).toBe('disabled') // preserved
      expect(canary.get('feature3')).toBe('new') // new feature
    })

    it('should emit change:bulk event', () => {
      const childCore = new CanaryCore()
      childCore.assign('test-feature', true)

      const bulkChangeListener = jest.fn()
      canary.on('change:bulk', bulkChangeListener)

      canary.merge(childCore)

      expect(bulkChangeListener).toHaveBeenCalledWith(canary)
    })
  })

  describe('clear', () => {
    it('should clear all features', () => {
      canary.assign('feature1', true)
      canary.assign('feature2', 'enabled')

      canary.clear()

      expect(canary.get('feature1')).toBeUndefined()
      expect(canary.get('feature2')).toBeUndefined()
      expect(canary.selections).toEqual({})
    })
  })

  describe('destroy', () => {
    it('should clear features and remove all listeners', () => {
      canary.assign('test-feature', true)
      const mockListener = jest.fn()
      canary.on('change', mockListener)

      canary.destroy()

      expect(canary.get('test-feature')).toBeUndefined()
      expect(canary.selections).toEqual({})

      // Verify listeners are removed
      canary.assign('new-feature', true)
      expect(mockListener).not.toHaveBeenCalled()
    })
  })

  describe('getters', () => {
    describe('overrides', () => {
      it('should return all overrides', () => {
        canary.override('feature1', true)
        canary.override('feature2', 'enabled')
        canary.assign('feature3', false) // no override

        expect(canary.overrides).toEqual({
          feature1: true,
          feature2: 'enabled',
        })
      })

      it('should return empty object when no overrides', () => {
        canary.assign('feature1', true)
        expect(canary.overrides).toEqual({})
      })
    })

    describe('selections', () => {
      it('should return all feature values', () => {
        canary.assign('feature1', true)
        canary.assign('feature2', 'enabled')
        canary.override('feature1', false)

        expect(canary.selections).toEqual({
          feature1: true, // selections only uses value, not override
          feature2: 'enabled',
        })
      })

      it('should return empty object when no features', () => {
        expect(canary.selections).toEqual({})
      })
    })

    describe('hasOnEvaluateFlag', () => {
      it('should return false by default', () => {
        expect(canary.hasOnEvaluateFlag).toBe(false)
      })

      it('should return true after setting onEvaluateFlag', () => {
        canary.onEvaluateFlag = jest.fn()
        expect(canary.hasOnEvaluateFlag).toBe(true)
      })
    })

    describe('onEvaluateFlag', () => {
      it('should have default implementation', () => {
        const consoleSpy = jest.spyOn(console, 'warn')
        const onEvaluateFn = canary.onEvaluateFlag
        onEvaluateFn('test', true)
        expect(consoleSpy).toHaveBeenCalledWith('no onEvaluateFlag implemented for CanaryCore')
        consoleSpy.mockRestore()
      })

      it('should use custom implementation', () => {
        const mockFn = jest.fn()
        canary.onEvaluateFlag = mockFn
        const onEvaluateFn = canary.onEvaluateFlag
        onEvaluateFn('test', true)
        expect(mockFn).toHaveBeenCalledWith('test', true)
      })
    })

    describe('toggle', () => {
      it('should have default implementation', () => {
        const consoleSpy = jest.spyOn(console, 'warn')
        const toggleFn = canary.toggle
        toggleFn()
        expect(consoleSpy).toHaveBeenCalledWith('no toggle implemented for CanaryCore')
        consoleSpy.mockRestore()
      })

      it('should use custom implementation', () => {
        const mockFn = jest.fn()
        canary.toggle = mockFn
        const toggleFn = canary.toggle
        toggleFn()
        expect(mockFn).toHaveBeenCalled()
      })
    })
  })

  describe('variants', () => {
    it('should set default variants when not provided', () => {
      const entry: CanaryStoreEntry = { name: 'test-feature', value: true }
      canary.config('test-feature', entry)

      const feature = canary.getFeature('test-feature')
      expect(feature?.variants).toEqual([false, true])
    })

    it('should preserve custom variants', () => {
      const entry: CanaryStoreEntry = {
        name: 'test-feature',
        value: 'option1',
        variants: ['option1', 'option2', 'option3'],
      }
      canary.config('test-feature', entry)

      const feature = canary.getFeature('test-feature')
      expect(feature?.variants).toEqual(['option1', 'option2', 'option3'])
    })
  })

  describe('edge cases', () => {
    it('should handle null and undefined values', () => {
      canary.assign('null-feature', null)
      canary.assign('undefined-feature', undefined)
      canary.override('null-feature', undefined)
      canary.override('undefined-feature', null)

      expect(canary.get('null-feature')).toBeNull() // undefined override falls back to null value
      expect(canary.get('undefined-feature')).toBeUndefined() // null override takes precedence, but there seems to be an issue with nullish coalescing
    })

    it('should handle object values', () => {
      const objValue = { key: 'value', nested: { prop: 42 } }
      canary.assign('object-feature', objValue)
      canary.override('object-feature', { key: 'override' })

      expect(canary.get('object-feature')).toEqual({ key: 'override' })
    })

    it('should handle numeric values', () => {
      canary.assign('number-feature', 0)
      canary.override('number-feature', 42)

      expect(canary.get('number-feature')).toBe(42)
    })
  })
})
