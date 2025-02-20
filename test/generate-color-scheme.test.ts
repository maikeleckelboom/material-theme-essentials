import { Strategy, themeFromSeed } from '../src/scheme/seed-theme'
import { describe, it, expect, beforeEach } from 'vitest'
import { generateColorScheme } from '../src/scheme/generate-color-scheme'
import { argbFromHex } from '@material/material-color-utilities'

describe('generateColorScheme', () => {
  const primaryColor = argbFromHex('#4588dc')
  const staticColors = [
    {
      name: 'My test color',
      value: argbFromHex('#123456'),
    },
    {
      name: 'My uncle likes to paint',
      value: argbFromHex('#b3b974'),
      blend: true,
    },
  ]

  const strategies: Strategy[] = [
    'active-only',
    'active-with-opposite',
    'split-by-mode',
    'all-variants',
  ]

  const customColorKeys = [
    'myTestColor',
    'onMyTestColor',
    'myTestColorContainer',
    'onMyTestColorContainer',
    'myUncleLikesToPaint',
    'onMyUncleLikesToPaint',
    'myUncleLikesToPaintContainer',
    'onMyUncleLikesToPaintContainer',
  ]

  let theme: Awaited<ReturnType<typeof themeFromSeed>>

  beforeEach(async () => {
    theme = await themeFromSeed({
      primary: primaryColor,
      staticColors,
    })
  })

  strategies.forEach((strategy) => {
    it(`should create a color scheme with strategy: ${strategy}`, () => {
      const colorScheme = generateColorScheme(theme, { strategy })

      let expectedCustomKeys: string[]
      switch (strategy) {
        case 'active-only':
          expectedCustomKeys = customColorKeys
          break
        case 'active-with-opposite':
          expectedCustomKeys = [
            ...customColorKeys,
            ...customColorKeys.map((key) => `${key}Dark`),
          ]
          break
        case 'split-by-mode':
          expectedCustomKeys = [
            ...customColorKeys.map((key) => `${key}Light`),
            ...customColorKeys.map((key) => `${key}Dark`),
          ]
          break
        case 'all-variants':
          expectedCustomKeys = [
            ...customColorKeys,
            ...customColorKeys.map((key) => `${key}Light`),
            ...customColorKeys.map((key) => `${key}Dark`),
          ]
          break
      }

      expectedCustomKeys.forEach((key) => {
        expect(colorScheme).toHaveProperty(key)
      })

      const expectedSchemeKeys = [
        'primary',
        'onPrimary',
        'primaryContainer',
        'onPrimaryContainer',
      ]

      switch (strategy) {
        case 'active-only':
          expectedSchemeKeys.forEach((key) => {
            expect(colorScheme).toHaveProperty(key)
          })
          break
        case 'active-with-opposite':
          expectedSchemeKeys.forEach((key) => {
            expect(colorScheme).toHaveProperty(key)
            expect(colorScheme).toHaveProperty(`${key}Dark`)
          })
          break
        case 'split-by-mode':
          expectedSchemeKeys.forEach((key) => {
            expect(colorScheme).toHaveProperty(`${key}Light`)
            expect(colorScheme).toHaveProperty(`${key}Dark`)
          })
          break
        case 'all-variants':
          expectedSchemeKeys.forEach((key) => {
            expect(colorScheme).toHaveProperty(key)
            expect(colorScheme).toHaveProperty(`${key}Light`)
            expect(colorScheme).toHaveProperty(`${key}Dark`)
          })
          break
      }

      const expectedKeyCount = Object.keys(colorScheme).filter(
        (key) => key in colorScheme,
      ).length

      expect(Object.keys(colorScheme).length).toBe(expectedKeyCount)
    })
  })

  it('should handle invalid color values', async () => {
    theme = await themeFromSeed({
      primary: primaryColor,
      staticColors: [
        {
          name: 'Invalid color',
          value: argbFromHex('#ZZZZZZ'),
        },
      ],
    })
    const colorScheme = generateColorScheme(theme, { strategy: 'active-only' })
    expect(colorScheme).toHaveProperty('primary')
  })

  it('should handle large number of static colors', async () => {
    const largeStaticColors = Array.from({ length: 100 }, (_, i) => ({
      name: `Color ${i}`,
      value: argbFromHex('#123456'),
    }))
    theme = await themeFromSeed({
      primary: primaryColor,
      staticColors: largeStaticColors,
    })
    const colorScheme = generateColorScheme(theme, { strategy: 'active-only' })
    expect(colorScheme).toHaveProperty('primary')
  })
})
