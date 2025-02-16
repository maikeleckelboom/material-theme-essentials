import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['src/**/*.test.ts'],
    // setupFiles: ['./vitest.shims.d.ts'],
  },
})
