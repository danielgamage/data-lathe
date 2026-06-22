import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const root = path.dirname(fileURLToPath(import.meta.url))

const siteConfig = defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'TS_ERROR') return
        warn(warning)
      },
    },
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
})

const libConfig = defineConfig({
  publicDir: false,
  build: {
    lib: {
      entry: path.join(root, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index',
    },
    outDir: root,
    emptyOutDir: false,
    minify: false,
    rollupOptions: {
      onwarn(warning, warn) {
        if (warning.code === 'TS_ERROR') return
        warn(warning)
      },
    },
  },
})

export default defineConfig(({ mode }) => (mode === 'lib' ? libConfig : siteConfig))
