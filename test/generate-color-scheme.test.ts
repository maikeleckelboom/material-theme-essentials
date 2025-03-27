import { StrategyType, createMaterialTheme } from '../src/scheme/create-material-theme'
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

  const strategies: StrategyType[] = [
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

  let theme: Awaited<ReturnType<typeof createMaterialTheme>>

  beforeEach(async () => {
    theme = await createMaterialTheme({
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
    theme = await createMaterialTheme({
      primary: primaryColor,
      staticColors: [
        {
          name: 'Hello this is my color 1',
          value: argbFromHex('#ffffff'),
        } as const,
        {
          name: 'Hello this is my color 2',
          value: argbFromHex('#123456'),
        } as const,
      ],
    })
    const colorScheme = generateColorScheme(theme, { strategy: 'active-only' })
    expect(colorScheme).toHaveProperty('primary')
    expect(colorScheme).toHaveProperty('helloThisIsMyColor1')
    expect(colorScheme).toHaveProperty('helloThisIsMyColor2')
  })

  it('should handle large number of static colors', async () => {
    const staticColors = Array.from({ length: 100 }, (_, i) => ({
      name: `Color ${i}`,
      value: argbFromHex('#123456'),
    }))
    theme = await createMaterialTheme({
      primary: primaryColor,
      staticColors,
    })
    const colorScheme = generateColorScheme(theme, { strategy: 'active-only' })
    expect(colorScheme).toHaveProperty('primary')
  })
})
