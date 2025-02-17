import { beforeAll, describe, expect, it } from 'vitest'
import { themeFromSeed } from '../src/themeFromSeed'

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

  it('should create a theme with a primary color', async () => {
    const theme = await themeFromSeed({
      primary: 0xff00ff,
    })
    expect(theme).toBeDefined()
  })

  it('should create a theme with a primary color and a variant', async () => {
    const theme = await themeFromSeed({
      primary: 0x254891,
      staticColors: [
        {
          name: 'My test color',
          value: 0x123456,
        },
      ],
    })
    expect(theme).toBeDefined()
  })
})
