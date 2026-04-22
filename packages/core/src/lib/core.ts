import { EventEmitter } from 'eventemitter3'
import { isEqual, assign } from 'radashi'
import type {
  CanaryStoreEntry,
  CanaryValue,
  Overrides,
  CanaryConfig,
} from './types'

const isKeyValueArray = (canaryConfig: CanaryConfig): canaryConfig is ReadonlyArray<[string, CanaryStoreEntry]> => {
  return Array.isArray(canaryConfig[0]) && typeof canaryConfig[0][0] === 'string'
}

class CanaryCore extends EventEmitter {
  constructor(canaryConfig?: CanaryConfig, overrides?: Overrides) {
    super()
    if (canaryConfig) this.initializeConfig(canaryConfig)
    if (overrides) this.overrideValues(overrides)
  }

  private features = new Map<string, CanaryStoreEntry>()

  get _overrides() {
    return Array.from(this.features.values()).reduce((overrides, { name, override }) => {
      return override === undefined
        ? overrides
        : {
            ...overrides,
            [name]: override,
          }
    }, {})
  }

  get overrides() {
    return this._overrides
  }

  get _assignments() {
    return Array.from(this.features.values()).map(({ value }) => value)
  }

  get selections(): { [key: string]: CanaryValue } {
    return Array.from(this.features.values()).reduce((selections, { name, value }) => {
      return {
        ...selections,
        [name]: value,
      }
    }, {})
  }

  private _hasOnEvaluateFlag = false

  get hasOnEvaluateFlag() {
    return this._hasOnEvaluateFlag
  }

  set onEvaluateFlag(value) {
    this._hasOnEvaluateFlag = true
    this._onEvaluateFlag = value
  }

  get onEvaluateFlag() {
    return this._onEvaluateFlag
  }

  private _onEvaluateFlag: (key: string, config?: CanaryStoreEntry) => void = () => {
    console.warn('no onEvaluateFlag implemented for CanaryCore')
  }

  set toggle(value: () => void) {
    this._toggle = value
  }

  get toggle() {
    return this._toggle
  }

  private _toggle: () => void = () => {
    console.warn('no toggle implemented for CanaryCore')
  }

  private set = (key: string, entry: CanaryStoreEntry) => {
    this.features.set(key, {
      ...entry,
      name: key,
      variants: entry.variants || [false, true],
    })
  }

  public get = (key: string): CanaryValue => {
    const feature = this.getFeature(key)
    if (this._hasOnEvaluateFlag) this.onEvaluateFlag(key, feature)
    return feature?.override ?? feature?.value
  }

  public getFeature = (key: string): CanaryStoreEntry | undefined => {
    return this.features.get(key)
  }

  public config = (key: string, entry: CanaryStoreEntry) => {
    const existingEntry = this.features.get(key) || {} as CanaryStoreEntry
    const mergedEntry = assign(existingEntry, entry)

    if (isEqual(existingEntry, mergedEntry)) return this

    this.set(key, mergedEntry)
    this.emit(`config:${key}`, mergedEntry)
    if (existingEntry.value !== mergedEntry.value) {
      this.emit('change', key, mergedEntry.value, this)
    }

    return this
  }

  public initializeConfig = (canaryConfig: CanaryConfig): CanaryCore => {
    if (isKeyValueArray(canaryConfig)) {
      const newConfig = new Map(canaryConfig)
      this.features = new Map([...this.features, ...newConfig])
      return this
    }

    canaryConfig.forEach((entry) => {
      this.config(entry.name, entry)
    })
    this.emit('change:bulk', this)
    return this
  }

  public assign = (key: string, value: CanaryValue): CanaryCore => {
    const feature = this.features.get(key)
    if (feature && value === feature.value) return this
    this.set(key, { ...feature, name: key, value })
    this.emit(`assign:${key}`, value, this)
    if (feature?.value !== value) {
      this.emit('change', key, value, this)
    }
    return this
  }

  public override = (key: string, value: CanaryValue): CanaryCore => {
    const config = this.features.get(key) || ({} as CanaryStoreEntry)
    this.set(key, { ...config, override: value })

    this.emit(`override:${key}`, value, this)
    this.emit('override', key, value, this)
    if (config.override !== value) {
      this.emit('change', key, value, this)
    }

    return this
  }

  public overrideValues = (overrides: Overrides): CanaryCore => {
    Object.keys(overrides).forEach((key) => {
      this.override(key, overrides[key])
    })
    return this
  }

  public overrideSet = (overrides: { [key: string]: CanaryValue }): CanaryCore => {
    Object.keys(overrides).forEach((key) => {
      this.override(key, overrides[key])
    })
    return this
  }

  public hasOverride = (key: string) => {
    const feature = this.features.get(key)
    return feature?.override !== undefined
  }

  public reset = () => {
    Object.keys(this._overrides).forEach((key) => {
      this.override(key, undefined)
    })
    this.emit('reset', this)
    this.emit('change:bulk', this)
    return this
  }

  public merge = (childCore: CanaryCore): CanaryCore => {
    childCore.features.forEach((feature) => {
      const existingFeature = this.features.get(feature.name) || {}

      this.set(feature.name, { ...existingFeature, ...feature })
    })

    this.emit('change:bulk', this)

    return this
  }

  public hasAssignment = (key: string) => {
    const config = this.features.get(key)
    return config?.value !== undefined
  }

  public clear = () => {
    this.features.clear()
  }

  public destroy = () => {
    this.clear()
    this.removeAllListeners()
  }
}

export default CanaryCore
