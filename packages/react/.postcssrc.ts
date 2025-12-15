import type { Config } from 'postcss-load-config'

const config: Config = {
  plugins: {
    // Allows @import in your CSS files
    'postcss-import': {},

    'postcss-nested': {},

    // Enables modern CSS features (nesting, custom media, etc.)
    'postcss-preset-env': {
      stage: 3,
      features: {
        'nesting-rules': true,
      },
    },

    'autoprefixer': {},

    'postcss-prefix-selector': {
      prefix: '.cui',
      transform(prefix, selector) {
        // Avoid double-prefixing
        if (selector.startsWith(prefix)) return selector

        // Keep :root untouched (for CSS variables)
        if (selector === ':root') return selector

        return `${prefix} ${selector}`
      },
    },

    // Minify CSS for production builds
    'cssnano': {
      preset: 'default',
    },
  },
}

export default config
