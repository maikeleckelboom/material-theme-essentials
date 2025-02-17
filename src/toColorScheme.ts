import {
  ColorGroup,
  CustomColorGroup,
  DynamicColor,
  DynamicScheme,
  MaterialDynamicColors,
} from '@material/material-color-utilities'
import { Strategy } from './themeFromSeed'
import { BaseColorScheme } from '../types/color-scheme'

// Helper types to transform the keys.
// type AppendSuffix<T extends string, S extends string> = `${T}${S}`
// type SuffixScheme<T, S extends string> = {
//   [K in keyof T as K extends string ? AppendSuffix<K, S> : never]: T[K]
// }

// Overloads for unpackSchemeColors:
// - When no suffix is provided, we return the BaseColorScheme as is.
// - When a suffix is provided, each key is remapped with the suffix.
// export function unpackSchemeColors(scheme: DynamicScheme): BaseColorScheme
// export function unpackSchemeColors<S extends string>(
//   scheme: DynamicScheme,
//   suffix: S,
// ): SuffixScheme<BaseColorScheme, S>

// Implementation remains the same.
// export function unpackSchemeColors<S extends string>(
//   scheme: DynamicScheme,
//   suffix?: S,
// ): BaseColorScheme | SuffixScheme<BaseColorScheme, S> {
//   const colors: Record<string, number> = {}
//
//   for (const [colorName, ColorClass] of Object.entries(MaterialDynamicColors)) {
//     if (!(ColorClass instanceof DynamicColor)) continue
//
//     const resolvedColorName = `${colorName}${suffix ?? ''}`
//     colors[resolvedColorName] = ColorClass.getArgb(scheme)
//   }
//
//   // If no suffix was provided, we assume the keys already match BaseColorScheme.
//   // Otherwise, we assert the mapped type.
//   return colors as unknown as SuffixScheme<BaseColorScheme, string>
// }

export function unpackSchemeColors(scheme: DynamicScheme, suffix?: string) {
  const colors: Record<string, number> = {}

  for (const [colorName, ColorClass] of Object.entries(MaterialDynamicColors)) {
    if (!(ColorClass instanceof DynamicColor)) continue

    const resolvedColorName = `${colorName}${suffix ?? ''}`
    colors[resolvedColorName] = ColorClass.getArgb(scheme)
  }

  return colors as unknown as BaseColorScheme
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

export interface ColorSchemeSource {
  schemes: {
    light: DynamicScheme
    dark: DynamicScheme
  }
  customColors?: CustomColorGroup[]
}

export interface ToColorSchemeOptions {
  isDark?: boolean
  strategy?: Strategy
}

export function toColorScheme(
  source: ColorSchemeSource,
  options: ToColorSchemeOptions = {},
): Record<string, number> {
  const { schemes, customColors = [] } = source
  const { strategy = 'active-only', isDark = false } = options

  const currentScheme = isDark ? schemes.dark : schemes.light
  const customColorScheme = unpackCustomColorGroups(customColors, {
    isDark,
    strategy,
  })

  switch (strategy) {
    case 'active-only':
      return {
        ...unpackSchemeColors(currentScheme),
        ...customColorScheme,
      }

    case 'active-with-opposite':
      return {
        ...unpackSchemeColors(currentScheme),
        ...unpackSchemeColors(
          isDark ? schemes.light : schemes.dark,
          isDark ? 'Light' : 'Dark',
        ),
        ...customColorScheme,
      }

    case 'split-by-mode':
      return {
        ...unpackSchemeColors(schemes.light, 'Light'),
        ...unpackSchemeColors(schemes.dark, 'Dark'),
        ...customColorScheme,
      }

    case 'all-variants':
      return {
        ...unpackSchemeColors(currentScheme),
        ...unpackSchemeColors(schemes.light, 'Light'),
        ...unpackSchemeColors(schemes.dark, 'Dark'),
        ...customColorScheme,
      }

    default:
      throw new Error(`Invalid strategy: ${strategy}`)
  }
}
