import { beforeAll, describe, expect, it } from 'vitest'
import { themeFromSeed } from '../src/scheme/seed-theme'

beforeAll(async () => {})

describe('themeFromSeed', () => {
  it('should accept an direct argument', async () => {
    const theme = await themeFromSeed(0xff00ff)
    expect(theme).toBeDefined()
  })

  it('should accept an options object', async () => {
    const theme = await themeFromSeed({
      seed: 0xff00ff,
    })
    expect(theme).toBeDefined()
  })
})
