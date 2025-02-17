import {
  ColorGroup,
  CustomColorGroup,
  DynamicColor,
  DynamicScheme,
  MaterialDynamicColors,
} from '@material/material-color-utilities'
import { Strategy } from './themeFromSeed'
import { ColorScheme } from '../types/color-scheme'

export function unpackSchemeColors(scheme: DynamicScheme, suffix?: string) {
  const colors: Record<string, number> = {}

  for (const [colorName, ColorClass] of Object.entries(MaterialDynamicColors)) {
    if (!(ColorClass instanceof DynamicColor)) continue

    const resolvedColorName = `${colorName}${suffix ?? ''}`
    colors[resolvedColorName] = ColorClass.getArgb(scheme)
  }

  return colors
}

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

export function formatColorName(
  template: string,
  colorName: string,
  options: { suffix?: string; delimiter?: string } = {},
): string {
  const { suffix = '', delimiter = '_' } = options
  const formattedName = template
    .replace(/([A-Z])/g, `${delimiter}$1`)
    .toLowerCase()
    .replace(/color/g, camelCase(colorName))
  return camelCase(formattedName + suffix)
}

export function processColorGroup(
  colorName: string,
  colorGroup: ColorGroup,
  suffix?: string,
) {
  return Object.entries(colorGroup).reduce(
    (acc, [key, value]) => {
      const resolvedKey = formatColorName(key, colorName, suffix ? { suffix } : undefined)
      acc[resolvedKey] = value
      return acc
    },
    {} as Record<string, number>,
  )
}

export function unpackCustomColorGroup(
  colorGroup: CustomColorGroup,
  options: { isDark?: boolean; strategy?: Strategy } = {},
): Record<string, number> {
  const { isDark = false, strategy = 'active-only' } = options
  const currentGroup = isDark ? colorGroup.dark : colorGroup.light
  const colorName = colorGroup.color.name

  switch (strategy) {
    case 'active-only':
      return processColorGroup(colorName, currentGroup)
    case 'active-with-opposite':
      return {
        ...processColorGroup(colorName, currentGroup),
        ...processColorGroup(
          colorName,
          isDark ? colorGroup.light : colorGroup.dark,
          isDark ? '_light' : '_dark',
        ),
      }
    case 'split-by-mode':
      return {
        ...processColorGroup(colorName, colorGroup.light, '_light'),
        ...processColorGroup(colorName, colorGroup.dark, '_dark'),
      }
    case 'all-variants':
      return {
        ...processColorGroup(colorName, currentGroup),
        ...processColorGroup(colorName, colorGroup.light, '_light'),
        ...processColorGroup(colorName, colorGroup.dark, '_dark'),
      }
    default:
      throw new Error(`Invalid strategy: ${strategy}`)
  }
}

function unpackCustomColorGroups(
  customColors?: CustomColorGroup[],
  options: { isDark?: boolean; strategy?: Strategy } = {},
): Record<string, number> {
  return (customColors || []).reduce(
    (acc, customColorGroup) => ({
      ...acc,
      ...unpackCustomColorGroup(customColorGroup, options),
    }),
    {},
  )
}

export interface GenerateColorSchemeSource {
  isDark: boolean
  schemes: {
    light: DynamicScheme
    dark: DynamicScheme
  }
  customColors?: CustomColorGroup[]
}

export function generateColorScheme(
  source: GenerateColorSchemeSource,
  strategy: Strategy = 'active-only',
): ColorScheme<
  typeof strategy,
  (typeof source)['isDark'] extends true ? 'dark' : 'light'
> {
  const { isDark = false } = source
  const currentScheme = source.schemes[isDark ? 'dark' : 'light']
  const altScheme = source.schemes[isDark ? 'light' : 'dark']
  const altSuffix = isDark ? 'Light' : 'Dark'

  const customColors = unpackCustomColorGroups(source.customColors, { isDark, strategy })

  switch (strategy) {
    case 'active-only':
      return {
        ...unpackSchemeColors(currentScheme),
        ...customColors,
      } as ColorScheme<'active-only'>
    case 'active-with-opposite':
      return {
        ...unpackSchemeColors(currentScheme),
        ...unpackSchemeColors(altScheme, altSuffix),
        ...customColors,
      } as ColorScheme<'active-with-opposite'>
    case 'split-by-mode':
      return {
        ...unpackSchemeColors(source.schemes.light, 'Light'),
        ...unpackSchemeColors(source.schemes.dark, 'Dark'),
        ...customColors,
      } as ColorScheme<'split-by-mode'>
    case 'all-variants':
      return {
        ...unpackSchemeColors(currentScheme),
        ...unpackSchemeColors(source.schemes.light, 'Light'),
        ...unpackSchemeColors(source.schemes.dark, 'Dark'),
        ...customColors,
      } as ColorScheme<'all-variants'>
    default:
      throw new Error(`Invalid strategy: ${strategy}`)
  }
}
