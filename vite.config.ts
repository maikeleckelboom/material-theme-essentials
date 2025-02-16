import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'MaterialColorExtensions',
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: ['@material/material-color-utilities'],
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      include: ['src'],
    }),
  ],
})
