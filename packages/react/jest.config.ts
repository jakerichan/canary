export default {
  displayName: '@canary-flags/react',
  preset: '../../jest.preset.js',
  transform: {
    '^(?!.*\\.(js|jsx|ts|tsx|css|json)$)': '@nx/react/plugins/jest',
    '^.+\\.[tj]sx?$': ['babel-jest', { presets: ['@nx/react/babel'] }],
  },
  // Core is published as ESM only; Jest must transpile it like app code.
  transformIgnorePatterns: ['/node_modules/(?!@canary-flags/core/)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: 'test-output/jest/coverage',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
}
