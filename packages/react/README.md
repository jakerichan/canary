# @canary-flags/react

React bindings for the Canary Flags feature flag library. This package provides React components and hooks for managing and using feature flags in your React applications.

## Installation

```bash
npm install @canary-flags/react
# or
yarn add @canary-flags/react
# or
pnpm add @canary-flags/react
```

## Quick Start

### 1. Wrap your app with `CanaryProvider`

```tsx
import { CanaryProvider } from '@canary-flags/react'

const canaryConfig = [
  {
    name: 'new-feature',
    value: false,
    metadata: {
      description: 'Enable the new feature',
      source: 'canaryConfig',
    },
  },
]

function App() {
  return (
    <CanaryProvider canaryConfig={canaryConfig}>
      <YourApp />
    </CanaryProvider>
  )
}
```

### 2. Use feature flags in your components

```tsx
import { useCanary } from '@canary-flags/react'

function MyComponent() {
  const newFeatureEnabled = useCanary('new-feature')

  return (
    <div>
      {newFeatureEnabled && <NewFeatureComponent />}
    </div>
  )
}
```

## API Reference

### `CanaryProvider`

A React context provider that initializes and manages the canary flags system.

#### Props

- `canaryConfig` (required): `CanaryConfig` - An array of feature flag configurations
- `children` (required): `React.ReactNode` - Your application components
- `parentCore` (optional): `CanaryCore` - A parent CanaryCore instance to merge with
- `renderCanaryUI` (optional): `(core: CanaryCore) => React.ReactNode` - Custom render function for the UI panel (defaults to the built-in `CanaryUi` component)
- `urlConfigParam` (optional): `string` - URL parameter name for configuration overrides
- `onEvaluateFlag` (optional): `(key: string, feature?: CanaryStoreEntry) => void` - Callback fired when a flag is evaluated

#### Example

```tsx
<CanaryProvider
  canaryConfig={canaryConfig}
  onEvaluateFlag={(key, feature) => {
    console.log('Flag evaluated:', key, feature?.value)
    // Track flag usage in analytics
  }}
>
  <App />
</CanaryProvider>
```

### `useCanary`

A React hook that returns the current value of a feature flag. The hook automatically re-renders when the flag value changes.

#### Parameters

- `flag`: `string` - The name of the feature flag

#### Returns

- `CanaryValue | null` - The current value of the flag, or `null` if the flag doesn't exist

#### Example

```tsx
function FeatureComponent() {
  const isEnabled = useCanary('my-feature')
  
  if (isEnabled === null) {
    return <div>Flag not found</div>
  }
  
  return <div>Feature is {isEnabled ? 'enabled' : 'disabled'}</div>
}
```

### `useCanaryCore`

A React hook that returns the underlying `CanaryCore` instance. Useful for advanced use cases where you need direct access to the core API.

#### Returns

- `CanaryCore | null` - The CanaryCore instance, or `null` if not available

#### Example

```tsx
function AdvancedComponent() {
  const core = useCanaryCore()
  
  const handleOverride = () => {
    core?.override('my-feature', true)
  }
  
  return <button onClick={handleOverride}>Override Flag</button>
}
```

### `useGlobalCanary`

A React hook that exposes the `CanaryCore` instance to the global scope (typically `window`) and syncs flag overrides with localStorage. This is useful for debugging and testing.

#### Parameters

- `propertyName` (optional): `keyof T` - The property name to use on the global object (default: `'canary-ui'`)
- `storage` (optional): `Storage` - The storage object to use (default: `localStorage`)

#### Returns

- `CanaryCore | null` - The CanaryCore instance

#### Example

```tsx
function App() {
  useGlobalCanary('canary')
  
  // Now you can access it in the browser console:
  // window.canary.override('my-feature', true)
  
  return <YourApp />
}
```

### `useHashOverride`

A React hook that reads feature flag overrides from the URL hash and applies them. Useful for sharing specific flag configurations via URL.

#### Parameters

- `hashName`: `string` - The hash parameter name to look for
- `options` (optional): `{ clearHash?: boolean }` - Options object
  - `clearHash` (optional): `boolean` - Whether to clear the hash after reading (default: `true`)

#### Example

```tsx
function App() {
  useHashOverride('canary')
  
  // Now you can use URLs like:
  // https://example.com/#canary=%7B%22my-feature%22%3Atrue%7D
  // The hash value should be double-encoded JSON
  
  return <YourApp />
}
```

## Configuration Format

The `canaryConfig` prop accepts an array of feature flag entries. Each entry has the following structure:

```typescript
interface CanaryStoreEntry {
  name: string                    // Required: unique identifier for the flag
  value: CanaryValue              // Required: default value
  variants?: CanaryValue[]        // Optional: allowed values for the flag
  override?: CanaryValue          // Optional: override value
  metadata?: Metadata             // Optional: additional metadata
}

type CanaryValue = boolean | string | number | object | null | undefined

interface Metadata {
  source?: string
  description?: string
  [key: string]: string           // Additional custom metadata fields
}
```

### Configuration Examples

#### Boolean Flag

```typescript
{
  name: 'enable-dark-mode',
  value: false,
  metadata: {
    description: 'Enable dark mode theme',
    source: 'theme.ts',
  },
}
```

#### String Flag with Variants

```typescript
{
  name: 'theme',
  value: 'light',
  variants: ['light', 'dark', 'auto'],
  metadata: {
    description: 'Application theme',
    source: 'theme.ts',
  },
}
```

#### Boolean Flag with Variants

```typescript
{
  name: 'feature-toggle',
  value: false,
  variants: [true, false],
  metadata: {
    description: 'Toggle feature on/off',
  },
}
```

## Complete Example

```tsx
import { 
  CanaryProvider, 
  useCanary, 
  useGlobalCanary, 
  useHashOverride 
} from '@canary-flags/react'

const canaryConfig = [
  {
    name: 'new-dashboard',
    value: false,
    metadata: {
      description: 'Enable the new dashboard UI',
      source: 'dashboard.tsx',
    },
  },
  {
    name: 'api-version',
    value: 'v1',
    variants: ['v1', 'v2', 'v3'],
    metadata: {
      description: 'API version to use',
      source: 'api.ts',
    },
  },
]

function App() {
  return (
    <CanaryProvider
      canaryConfig={canaryConfig}
      onEvaluateFlag={(key, value) => {
        console.log(`Flag ${key} evaluated:`, value)
      }}
    >
      <GlobalCanarySetup />
      <Dashboard />
    </CanaryProvider>
  )
}

function GlobalCanarySetup() {
  // Expose canary to window for debugging
  useGlobalCanary('canary')
  // Enable hash-based overrides
  useHashOverride('canary')
  return null
}

function Dashboard() {
  const newDashboardEnabled = useCanary('new-dashboard')
  const apiVersion = useCanary('api-version')
  
  return (
    <div>
      {newDashboardEnabled ? (
        <NewDashboard apiVersion={apiVersion} />
      ) : (
        <OldDashboard apiVersion={apiVersion} />
      )}
    </div>
  )
}
```

## Canary UI

By default, `CanaryProvider` renders a draggable, resizable UI panel (`CanaryUi`) that allows you to:

- View all feature flags
- Toggle boolean flags
- Select values for flags with variants
- Search and filter flags
- View flag metadata
- Minimize or close the panel

The UI can be toggled programmatically using `core.toggle()` or customized by providing a `renderCanaryUI` prop.

## TypeScript Support

This package is written in TypeScript and includes full type definitions. All exports are properly typed, and the configuration format is type-safe.

## Requirements

- React 18.0.0 or higher
- React DOM 18.0.0 or higher
