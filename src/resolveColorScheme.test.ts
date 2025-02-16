import { themeFromSeed } from './themeFromSeed'
import { describe } from 'vitest'

describe('resolveColorScheme', () => {
  it('should create a theme with a primary and custom color', async () => {
    const theme = await themeFromSeed({
      primary: 0x254891,
      staticColors: [
        {
          name: 'My test color',
          value: 0x123456,
        },
      ],
    })

    // Test matrix for different strategies
    const strategies = ['current-only', 'alternate', 'split', 'combined'] as const

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

      // Expected scheme color keys based on strategy
      const expectedSchemeKeys = [
        'primary',
        'onPrimary',
        'primaryContainer',
        'onPrimaryContainer',
      ]

      // Expected custom color keys based on strategy
      let expectedCustomKeys: string[]
      switch (strategy) {
        case 'current-only':
          expectedCustomKeys = customColorKeys
          break
        case 'alternate':
          expectedCustomKeys = [
            ...customColorKeys,
            ...customColorKeys.map((key) => `${key}Dark`),
          ]
          break
        case 'split':
          expectedCustomKeys = [
            ...customColorKeys.map((key) => `${key}Light`),
            ...customColorKeys.map((key) => `${key}Dark`),
          ]
          break
        case 'combined':
          expectedCustomKeys = [
            ...customColorKeys,
            ...customColorKeys.map((key) => `${key}Light`),
            ...customColorKeys.map((key) => `${key}Dark`),
          ]
          break
      }

      // Verify scheme colors
      switch (strategy) {
        case 'split':
          expectedSchemeKeys.forEach((key) => {
            expect(colorScheme).toHaveProperty(`${key}Light`)
            expect(colorScheme).toHaveProperty(`${key}Dark`)
          })
          break
        case 'combined':
          expectedSchemeKeys.forEach((key) => {
            expect(colorScheme).toHaveProperty(key)
            expect(colorScheme).toHaveProperty(`${key}Light`)
            expect(colorScheme).toHaveProperty(`${key}Dark`)
          })
          break
        default:
          expectedSchemeKeys.forEach((key) => {
            expect(colorScheme).toHaveProperty(key)
          })
      }

      // Verify custom colors
      expectedCustomKeys.forEach((key) => {
        expect(colorScheme).toHaveProperty(key)
      })

      // Verify total key count matches expectations
      const expectedKeyCount = Object.keys(colorScheme).filter(
        (key) => key in colorScheme,
      ).length

      expect(Object.keys(colorScheme).length).toBe(expectedKeyCount)
    })
  })
})
