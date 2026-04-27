import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { peerDependencies } from './package.json'
// import { analyzer } from 'vite-bundle-analyzer'
import dts from 'vite-plugin-dts'
import * as path from 'path'

const peerDependencyNames = Object.keys(peerDependencies).sort(
  (a, b) => b.length - a.length,
)

function isPeerDependency(id: string): boolean {
  if (id.startsWith('\0')) return false
  const normalizedId = id.replace(/\\/g, '/')
  return peerDependencyNames.some(dep => (
    normalizedId === dep
    || normalizedId.startsWith(`${dep}/`)
    || normalizedId.includes(`/node_modules/${dep}/`)
    || normalizedId.endsWith(`/node_modules/${dep}`)
  ))
}

export default defineConfig(() => ({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/packages/react',
  plugins: [
    react(),
    dts({
      entryRoot: 'src',
      tsconfigPath: path.join(__dirname, 'tsconfig.lib.json'),
    }),
    // analyzer(),
  ],
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
  },
  build: {
    outDir: './dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    cssCodeSplit: false,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    lib: {
      entry: 'src/index.ts',
      name: '@canary-flags/react',
      fileName: 'index',
      formats: ['es' as const, 'cjs' as const],
    },
    rollupOptions: {
      external: isPeerDependency,
    },
  },
}))
