import {
  ColorGroup,
  CustomColorGroup,
  DynamicColor,
  DynamicScheme,
  MaterialDynamicColors,
} from '@material/material-color-utilities'
import { MaterialTheme, UnpackStrategy } from './themeFromSeed'

export function camelCase(str: string): string {
  const words = str.match(/\p{Lu}?\p{Ll}+|\p{Lu}+(?!\p{Ll})|\d+/gu) || []
  return words
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join('')
}

export function formatCustomColorName(
  blueprint: string,
  customColorName: string,
  options: { suffix?: string } = {},
): string {
  const { suffix = '' } = options
  const formattedName = blueprint
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/color/g, camelCase(customColorName))
  return camelCase(formattedName + suffix)
}

export function processColorGroup(name: string, group: ColorGroup, suffix?: string) {
  return Object.entries(group).reduce(
    (acc, [key, value]) => {
      const resolvedKey = formatCustomColorName(
        key,
        name,
        suffix ? { suffix } : undefined,
      )
      acc[resolvedKey] = value
      return acc
    },
    {} as Record<string, number>,
  )
}

export function unpackCustomColors(
  colorGroup: CustomColorGroup,
  options: { isDark?: boolean; strategy?: UnpackStrategy } = {},
): Record<string, number> {
  const { isDark = false, strategy = 'current-only' } = options
  const currentGroup = isDark ? colorGroup.dark : colorGroup.light
  const colorName = colorGroup.color.name

  switch (strategy) {
    case 'current-only':
      return processColorGroup(colorName, currentGroup)
    case 'alternate':
      return {
        ...processColorGroup(colorName, currentGroup),
        ...processColorGroup(
          colorName,
          isDark ? colorGroup.light : colorGroup.dark,
          isDark ? '_light' : '_dark',
        ),
      }
    case 'split':
      return {
        ...processColorGroup(colorName, colorGroup.light, '_light'),
        ...processColorGroup(colorName, colorGroup.dark, '_dark'),
      }
    case 'combined':
      return {
        ...processColorGroup(colorName, currentGroup),
        ...processColorGroup(colorName, colorGroup.light, '_light'),
        ...processColorGroup(colorName, colorGroup.dark, '_dark'),
      }
    default:
      throw new Error(`Invalid strategy: ${strategy}`)
  }
}

export function unpackSchemeColors(scheme: DynamicScheme, suffix?: string) {
  const colors: Record<string, number> = {}

  for (const [colorName, ColorClass] of Object.entries(MaterialDynamicColors)) {
    if (!(ColorClass instanceof DynamicColor)) continue

    const resolvedColorName = `${colorName}${suffix ?? ''}`
    colors[resolvedColorName] = ColorClass.getArgb(scheme)
  }

  return colors
}

// Compose the color scheme based on the theme and strategy
export function resolveColorScheme(
  theme: MaterialTheme | Omit<MaterialTheme, 'toColorScheme'>,
  strategy: UnpackStrategy = 'current-only',
): Record<string, number> {
  const currentScheme = theme.schemes[theme.isDark ? 'dark' : 'light']
  const altScheme = theme.schemes[theme.isDark ? 'light' : 'dark']
  const altSuffix = theme.isDark ? 'Light' : 'Dark'

  const customColors = theme.customColors.reduce(
    (acc, customColor) => ({
      ...acc,
      ...unpackCustomColors(customColor, { isDark: theme.isDark, strategy }),
    }),
    {},
  )

  switch (strategy) {
    case 'current-only':
      return {
        ...unpackSchemeColors(currentScheme),
        ...customColors,
      }
    case 'alternate':
      return {
        ...unpackSchemeColors(currentScheme),
        ...unpackSchemeColors(altScheme, altSuffix),
        ...customColors,
      }
    case 'split':
      return {
        ...unpackSchemeColors(theme.schemes.light, 'Light'),
        ...unpackSchemeColors(theme.schemes.dark, 'Dark'),
        ...customColors,
      }
    case 'combined':
      return {
        ...unpackSchemeColors(currentScheme),
        ...unpackSchemeColors(theme.schemes.light, 'Light'),
        ...unpackSchemeColors(theme.schemes.dark, 'Dark'),
        ...customColors,
      }
    default:
      throw new Error(`Invalid strategy: ${strategy}`)
  }
}
