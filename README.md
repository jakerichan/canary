# Canary

A powerful feature flag and configuration management library for JavaScript/TypeScript applications.

## Core Package

The main package provides a flexible, event-driven system for managing feature flags, configuration values, and runtime overrides. See the [full documentation](./packages/core/README.md) for API reference and examples.

### Key Features

- **Feature Flag Management** - Enable/disable features dynamically
- **Runtime Overrides** - Override values at runtime without restarts
- **Event-Driven** - Listen to configuration changes in real-time
- **Configuration Merging** - Merge configurations from multiple sources
- **Type Safety** - Full TypeScript support with type-safe values
- **Testing Support** - Easy mocking and testing utilities

### Quick Start

```bash
npm install @canary-flags/core
# or
yarn add @canary-flags/core
```

```typescript
import CanaryCore from '@canary-flags/core'

// Create an instance
const canary = new CanaryCore([
  { name: 'new-feature', value: true },
  { name: 'beta-mode', value: false }
])

// Get a feature value
const isEnabled = canary.get('new-feature') // true

// Override at runtime
canary.override('new-feature', false)
const value = canary.get('new-feature') // false
```

## React Package

For React applications, use `@canary-flags/react` which provides components and hooks for seamless integration. See the [full documentation](./packages/react/README.md) for API reference and examples.

```bash
npm install @canary-flags/react
# or
yarn add @canary-flags/react
```

```tsx
import { CanaryProvider, useCanary } from '@canary-flags/react'

const canaryConfig = [
  { name: 'new-feature', value: false }
]

function App() {
  return (
    <CanaryProvider canaryConfig={canaryConfig}>
      <MyComponent />
    </CanaryProvider>
  )
}

function MyComponent() {
  const isEnabled = useCanary('new-feature')
  return <div>{isEnabled ? 'Feature enabled!' : 'Feature disabled'}</div>
}
```

## Documentation

For comprehensive documentation, examples, and API reference, see:

- **[Core Package Documentation](./packages/core/README.md)**
- **[React Package Documentation](./packages/react/README.md)**

## Testing

```bash
# Run tests for all affected packages
yarn test

# Run tests for a specific package
yarn nx test core
yarn nx test react

# Build the libraries
yarn nx build core
yarn nx build react
```

## Packages

- **`@canary-flags/core`** - Core feature flag management library
- **`@canary-flags/react`** - React components and hooks for feature flag management

## Contributing

This project uses [Nx](https://nx.dev) for monorepo management. See the [Nx documentation](https://nx.dev) for more information about the workspace setup.

## License

MIT
