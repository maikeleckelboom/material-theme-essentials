import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    extends: 'vitest.config.ts',
    test: {
      browser: {
        enabled: true,
        headless: true,
        provider: 'playwright',
        viewport: { width: 1920, height: 1080 },
        instances: [{ browser: 'chromium' }],
        screenshotFailures: false,
      },
    },
  },
])
