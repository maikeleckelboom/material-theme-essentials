import { Strategy, themeFromSeed } from './themeFromSeed'
import { describe } from 'vitest'

describe('generateColorScheme', () => {
  it('should create a theme with a primary and custom color', async () => {
    const theme = await themeFromSeed({
      primary: 0x254891,
      staticColors: [
        {
          name: 'my Test Color',
          // name: 'm¥ t€§† cØlØ®\n',
          value: 0x123456,
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
    ]

    // Test each strategy
    strategies.forEach((strategy) => {
      const colorScheme = theme.toColorScheme(strategy)

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

      // Verify custom colors
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
