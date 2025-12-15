# CanaryCore

A powerful feature flag and configuration management library for JavaScript/TypeScript applications. CanaryCore provides a flexible, event-driven system for managing feature flags, configuration values, and runtime overrides.

## Features

- 🚀 **Feature Flag Management** - Enable/disable features dynamically
- ⚡ **Runtime Overrides** - Override values at runtime without restarts
- 📡 **Event-Driven** - Listen to configuration changes in real-time
- 🔄 **Configuration Merging** - Merge configurations from multiple sources
- 🎯 **Type Safety** - Full TypeScript support with type-safe values
- 🧪 **Testing Support** - Easy mocking and testing utilities

## Installation

```bash
npm install @canary-flags/core
# or
yarn add @canary-flags/core
```

## Basic Usage

### Creating a CanaryCore Instance

```typescript
import CanaryCore from '@canary-flags/core'

// Create an empty instance
const canary = new CanaryCore()

// Create with initial configuration
const canary = new CanaryCore([
  { name: 'new-feature', value: true },
  { name: 'beta-mode', value: false }
])

// Create with overrides
const canary = new CanaryCore(undefined, {
  'new-feature': true,
  'beta-mode': true
})
```

### Setting and Getting Values

```typescript
// Assign a value to a feature
canary.assign('my-feature', true)

// Get a feature value
const isEnabled = canary.get('my-feature') // true

// Override a value (takes precedence over assigned value)
canary.assign('my-feature', false)
canary.override('my-feature', true)
const value = canary.get('my-feature') // true (override takes precedence)
```

### Configuration Management

```typescript
// Set a complete feature configuration
canary.config('advanced-feature', {
  name: 'advanced-feature',
  value: 'enabled',
  variants: ['disabled', 'enabled', 'premium'],
  metadata: {
    description: 'Advanced feature with multiple variants'
  }
})

// Get the full feature configuration
const config = canary.getFeature('advanced-feature')
// Returns: { name: 'advanced-feature', value: 'enabled', variants: [...], metadata: {...} }

// Initialize multiple features at once
canary.initializeConfig([
  { name: 'feature-1', value: true },
  { name: 'feature-2', value: 'beta' },
  { name: 'feature-3', value: 42 }
])
```

## Advanced Features

### Event System

CanaryCore is built on EventEmitter and provides real-time notifications for configuration changes:

```typescript
// Listen to specific feature changes
canary.on('assign:my-feature', (value, instance) => {
  console.log(`my-feature assigned to: ${value}`)
})

canary.on('override:my-feature', (value, instance) => {
  console.log(`my-feature overridden to: ${value}`)
})

canary.on('config:my-feature', (config) => {
  console.log('my-feature configuration updated:', config)
})

// Listen to any override
canary.on('override', (key, value, instance) => {
  console.log(`Feature ${key} changed to: ${value}`)
})

// Listen to all changes
canary.on('change', (key, value, instance) => {
  console.log(`Feature ${key} changed to: ${value}`)
})

// Listen to bulk changes
canary.on('change:bulk', (instance) => {
  console.log('Multiple features changed')
})

// Listen to reset events
canary.on('reset', (instance) => {
  console.log('All overrides have been reset')
})
```

### Runtime Overrides

```typescript
// Override multiple values at once
canary.overrideValues({
  'feature-1': true,
  'feature-2': 'enabled',
  'feature-3': 100
})

// Check if a feature has an override
const hasOverride = canary.hasOverride('my-feature') // boolean

// Reset all overrides
canary.reset()

// Check if a feature has an assignment
const hasAssignment = canary.hasAssignment('my-feature') // boolean
```

### Merging Configurations

```typescript
// Create a child configuration
const childCore = new CanaryCore([
  { name: 'child-feature', value: true },
  { name: 'shared-feature', value: 'child-value' }
])

// Merge child into parent
canary.merge(childCore)

// Child values take precedence over existing values
```

### Custom Callbacks

```typescript
// Set custom evaluation callback
canary.onEvaluateFlag = (key, config) => {
  console.log(`Feature ${key} evaluated:`, config?.value)
  // Custom logic here
}

// Set custom toggle callback
canary.toggle = () => {
  console.log('Toggle called')
  // Custom toggle logic
}

// Check if callbacks are set
const hasCallback = canary.hasOnEvaluateFlag // boolean
```

## Data Types

CanaryCore supports various data types for feature values:

```typescript
// Boolean flags
canary.assign('boolean-feature', true)

// String values
canary.assign('string-feature', 'enabled')

// Numeric values
canary.assign('numeric-feature', 42)

// Object values
canary.assign('object-feature', { 
  mode: 'advanced', 
  settings: { timeout: 5000 } 
})

// Null and undefined
canary.assign('null-feature', null)
canary.assign('undefined-feature', undefined)
```

## Variants

Features can have predefined variants:

```typescript
// Boolean variants (default)
canary.config('simple-flag', {
  name: 'simple-flag',
  value: true
  // variants: [false, true] (default)
})

// String variants
canary.config('theme-feature', {
  name: 'theme-feature',
  value: 'dark',
  variants: ['light', 'dark', 'auto']
})

// Numeric variants
canary.config('timeout-feature', {
  name: 'timeout-feature',
  value: 5000,
  variants: [1000, 5000, 10000]
})
```

## Getters and State

```typescript
// Get all current overrides
const overrides = canary.overrides
// Returns: { 'feature-1': true, 'feature-2': 'enabled' }

// Get all feature values (including overrides)
const selections = canary.selections
// Returns: { 'feature-1': true, 'feature-2': 'enabled', 'feature-3': false }

// Get all assignments (without overrides)
const assignments = canary._assignments
// Returns: [true, 'enabled', false]
```

## Error Handling

```typescript
// Handle non-existent features gracefully
const value = canary.get('non-existent') // undefined

// Check if feature exists before using
if (canary.hasAssignment('my-feature')) {
  const value = canary.get('my-feature')
  // Use value safely
}
```

## Performance Considerations

- CanaryCore uses Map for O(1) feature lookups
- Event listeners are automatically cleaned up when calling `destroy()`
- Configuration merging is optimized to avoid unnecessary updates
- Memory usage is minimal for typical feature flag scenarios

## API Reference

### Constructor

```typescript
new CanaryCore(configArray?: CanaryStoreEntry[], overrides?: Overrides)
```

### Core Methods

- `assign(key: string, value: CanaryValue): CanaryCore`
- `override(key: string, value: CanaryValue): CanaryCore`
- `get(key: string): CanaryValue`
- `config(key: string, entry: CanaryStoreEntry): CanaryCore`
- `getFeature(key: string): CanaryStoreEntry | undefined`
- `hasOverride(key: string): boolean`
- `hasAssignment(key: string): boolean`
- `reset(): CanaryCore`
- `merge(childCore: CanaryCore): CanaryCore`
- `clear(): void`
- `destroy(): void`

### Getters

- `overrides: Overrides`
- `selections: { [key: string]: CanaryValue }`
- `hasOnEvaluateFlag: boolean`

### Setters

- `onEvaluateFlag: (key: string, config?: CanaryStoreEntry) => void`
- `toggle: () => void`

### Events

- `assign:${key}` - Emitted when a feature is assigned
- `override:${key}` - Emitted when a feature is overridden
- `config:${key}` - Emitted when a feature configuration is updated
- `change` - Emitted for any feature change
- `change:bulk` - Emitted for bulk changes
- `reset` - Emitted when all overrides are reset

## TypeScript Types

```typescript
interface CanaryStoreEntry {
  name: string
  value: CanaryValue
  variants?: [true, false] | [false, true] | string[] | number[] | object[]
  override?: CanaryValue
  metadata?: {
    description: string
  }
}

type CanaryValue = boolean | string | number | object | null | undefined

interface Overrides {
  [key: string]: CanaryValue
}
```

## License

MIT
