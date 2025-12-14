import baseConfig from '../../eslint.config.mjs'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  ...baseConfig,
  {
    files: ['**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      '@stylistic/jsx-max-props-per-line': ['error', {
        maximum: 1,
      }],
      '@stylistic/max-len': ['error', {
        code: 80,
        tabWidth: 2,
        ignoreComments: true,
        ignoreUrls: true,
      }],
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
]
