import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import * as path from 'node:path'

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'MaterialColorExtensions',
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // Exclude test files and external dependencies from the bundle
      external: [/\.test\.ts$/, '@material/material-color-utilities'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ['src'],
    }),
  ],
})
