import type { CanaryCore } from '@canary-flags/core'

declare global {
  interface Window {
    canary: CanaryCore
  }
}
