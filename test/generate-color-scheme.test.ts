import { createMaterialTheme } from '../src/scheme/create-material-theme'
import { beforeEach, describe, expect, it } from 'vitest'
import { generateColorScheme } from '../src/scheme/generate-color-scheme'
import { argbFromHex } from '@material/material-color-utilities'
import { ColorStrategy } from '../src/types'

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

  const strategies: ColorStrategy[] = ['base', 'alternate', 'dual-mode', 'complete']

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
        const strategyTransformations: Record<ColorStrategy, (key: string) => string[]> = {
          base: (key) => [key],
          alternate: (key) => [key, `${key}Dark`],
          'dual-mode': (key) => [`${key}Light`, `${key}Dark`],
          complete: (key) => [key, `${key}Light`, `${key}Dark`],
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
        case 'alternate':
          expectedSchemeKeys.forEach((key) => {
            expect(colorScheme).toHaveProperty(key)
            expect(colorScheme).toHaveProperty(`${key}Dark`)
          })
          break
        case 'dual-mode':
          expectedSchemeKeys.forEach((key) => {
            expect(colorScheme).toHaveProperty(`${key}Light`)
            expect(colorScheme).toHaveProperty(`${key}Dark`)
          })
          break
        case 'complete':
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
          name: 'Hello this is my color2',
          value: argbFromHex('#123456'),
        } as const,
      ],
    })
    const colorScheme = generateColorScheme(theme, { strategy: 'base' })
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
    const colorScheme = generateColorScheme(theme, { strategy: 'base' })
    expect(colorScheme).toHaveProperty('primary')
  })
})
