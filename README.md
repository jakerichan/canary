# Canary

A powerful feature flag and configuration management library for JavaScript/TypeScript applications.

## 🚀 Core Package

The main package provides a flexible, event-driven system for managing feature flags, configuration values, and runtime overrides.

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

## 📚 Documentation

For comprehensive documentation, examples, and API reference, see:

**[📖 Core Package Documentation](./packages/core/README.md)**

## 🧪 Testing

```bash
# Run all tests
yarn nx test core

# Build the library
yarn nx build core
```

## 📦 Packages

- **`@canary-flags/core`** - Core feature flag management library

## 🤝 Contributing

This project uses [Nx](https://nx.dev) for monorepo management. See the [Nx documentation](https://nx.dev) for more information about the workspace setup.

## 📄 License

MIT
