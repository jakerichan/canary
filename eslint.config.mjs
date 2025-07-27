import nx from '@nx/eslint-plugin'
import eslint from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import stylistic from '@stylistic/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import tseslint from 'typescript-eslint'

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  eslint.configs.recommended,
  importPlugin.flatConfigs.recommended,
  importPlugin.flatConfigs.typescript,
  stylistic.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      '**/dist',
    ],
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.js',
      '**/*.jsx',
    ],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [
            '^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$',
          ],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: [
                '*',
              ],
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      '**/*.ts',
      '**/*.tsx',
      '**/*.cts',
      '**/*.mts',
      '**/*.js',
      '**/*.jsx',
      '**/*.cjs',
      '**/*.mjs',
    ],
    rules: {},
  },
  {
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
    },
  },
  {
    files: ['packages/**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    settings: {
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
      'import/resolver': {
        typescript: {},
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
      'import/external-module-folders': ['node_modules'],
    },
    rules: {
      'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-exports': 'error',
      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          'groups': [
            ['builtin', 'external'],
            ['internal', 'parent', 'sibling', 'index'],
          ],
        },
      ],
    },
  },
  {
    files: ['./eslint.config.mjs'],
    rules: {
      'import/no-unresolved': 'off',
    },
  },
]
