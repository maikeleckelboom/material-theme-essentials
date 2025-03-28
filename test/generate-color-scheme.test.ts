import { beforeEach, describe, expect, it } from 'vitest'
import { argbFromHex } from '@material/material-color-utilities'
import { createMaterialTheme, generateColorScheme, type Strategy } from '../src'

describe('generateColorScheme', () => {
  const primaryColor = argbFromHex('#4588dc')
  const staticColors = [
    {
      name: 'My test color',
      value: argbFromHex('#123456'),
    },
    {
      name: 'My Uncle Likes To Paint',
      value: argbFromHex('#b3b974'),
      blend: true,
    },
  ]

  const strategies: Strategy[] = ['base', 'contextual', 'split', 'comprehensive']

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

      const expectedCustomKeys: string[] = (() => {
        const strategyTransformations: Record<Strategy, (key: string) => string[]> = {
          base: (key) => [key],
          contextual: (key) => [key, `${key}Dark`],
          split: (key) => [`${key}Light`, `${key}Dark`],
          comprehensive: (key) => [key, `${key}Light`, `${key}Dark`],
        }

        return customColorKeys.flatMap((key) => strategyTransformations[strategy](key))
      })()

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
        case 'base':
          expectedSchemeKeys.forEach((key) => {
            expect(colorScheme).toHaveProperty(key)
          })
          break
        case 'contextual':
          expectedSchemeKeys.forEach((key) => {
            expect(colorScheme).toHaveProperty(key)
            expect(colorScheme).toHaveProperty(`${key}Dark`)
          })
          break
        case 'split':
          expectedSchemeKeys.forEach((key) => {
            expect(colorScheme).toHaveProperty(`${key}Light`)
            expect(colorScheme).toHaveProperty(`${key}Dark`)
          })
          break
        case 'comprehensive':
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

  it('should create a color scheme with base strategy', async () => {
    theme = await createMaterialTheme({
      primary: primaryColor,
      staticColors: [
        {
          name: 'Hello this is my color 1',
          value: argbFromHex('#ffffff'),
        },
        {
          name: 'Hello this is my color2',
          value: argbFromHex('#123456'),
        },
        {
          name: 'MY UNCLE LIKES THE PAINT',
          value: argbFromHex('#b3b974'),
          blend: true,
        },
      ],
    })
    const colorScheme = generateColorScheme(theme)
    expect(colorScheme).toHaveProperty('primary')
    expect(colorScheme).toHaveProperty('helloThisIsMyColor1')
    expect(colorScheme).toHaveProperty('helloThisIsMyColor2')
    expect(colorScheme).toHaveProperty('myUncleLikesThePaint')
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
    const colorScheme = generateColorScheme(theme, { strategy: 'base' })
    expect(colorScheme).toHaveProperty('primary')
  })
})
