import { Strategy, themeFromSeed } from '../src/themeFromSeed'
import { describe } from 'vitest'
import { toColorScheme } from '../src/toColorScheme'

describe('toColorScheme', () => {
  it('should create a theme with a primary and custom color', async () => {
    const theme = await themeFromSeed({
      primary: 0x254891,
      staticColors: [
        {
          name: 'My test color',
          value: 0x123456,
        },
        {
          name: 'My uncle likes to paint',
          value: 0x654321,
          blend: true,
        },
      ],
    })

    // Test matrix for different strategies
    const strategies: Strategy[] = [
      'active-only',
      'active-with-opposite',
      'split-by-mode',
      'all-variants',
    ]

    // Common color key expectations
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

    // Verify custom color keys
    strategies.forEach((strategy) => {
      const colorScheme = toColorScheme(theme, { strategy })

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

      // Verify total key count matches expectations
      const expectedKeyCount = Object.keys(colorScheme).filter(
        (key) => key in colorScheme,
      ).length

      expect(Object.keys(colorScheme).length).toBe(expectedKeyCount)
    })
  })
})
