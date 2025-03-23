import {
  ColorGroup,
  CustomColorGroup,
  DynamicColor,
  DynamicScheme,
  MaterialDynamicColors,
} from '@material/material-color-utilities'
import { MaterialColorStrategy } from './create-material-theme'
import { ColorScheme } from '../types'
import { camelCase } from '../utils/camel-case'

/** Suffix constants to avoid magic strings */
const LIGHT_SUFFIX: string = '_light' as const
const DARK_SUFFIX: string = '_dark' as const

/**
 * Processes scheme colors by iterating over MaterialDynamicColors.
 *
 * @param scheme - The dynamic color scheme.
 * @param suffix - Optional suffix to append to color names.
 * @returns A record mapping processed color names to ARGB values.
 */
export function processSchemeColors(
  scheme: DynamicScheme,
  suffix?: string,
): Record<string, number> {
  const colors: Record<string, number> = {}

  for (const [colorName, ColorClass] of Object.entries(MaterialDynamicColors)) {
    if (!(ColorClass instanceof DynamicColor)) continue

    const resolvedColorName = camelCase(`${colorName}${suffix ?? ''}`)
    colors[resolvedColorName] = ColorClass.getArgb(scheme)
  }

  return colors
}

/**
 * Formats color names using a template system with explicit token replacement.
 *
 * @param template - A template string that includes a placeholder 'color'.
 * @param colorName - The base color name.
 * @param options - Optional formatting options including suffix and delimiter.
 * @returns The formatted color name.
 * @example
 * formatColorName('{color}Container', 'primary') => 'primaryContainer'
 */
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

/**
 * Processes a group of colors by applying formatting to each key.
 *
 * @param colorName - The base color name.
 * @param colorGroup - The color group containing key-value pairs.
 * @param suffix - Optional suffix for formatting.
 * @returns A record mapping formatted keys to ARGB values.
 */
export function processColorGroup(
  colorName: string,
  colorGroup: ColorGroup,
  suffix?: string,
): Record<string, number> {
  const entries = Object.entries(colorGroup).map(([key, value]) => [
    formatColorName(key, colorName, suffix ? { suffix } : undefined),
    value
  ])
  return Object.fromEntries(entries)
}

/**
 * Processes a custom color group based on the provided strategy.
 *
 * @param colorGroup - The custom color group.
 * @param options - Options including whether the current mode is dark and the strategy to use.
 * @returns A record mapping processed color names to ARGB values.
 */
export function processCustomColorGroup(
  colorGroup: CustomColorGroup,
  options: { isDark?: boolean; strategy?: MaterialColorStrategy } = {},
): Record<string, number> {
  const { isDark = false, strategy = 'adaptive' } = options
  const currentGroup = isDark ? colorGroup.dark : colorGroup.light
  const colorName = colorGroup.color.name

  switch (strategy) {
    case 'adaptive':
      return processColorGroup(colorName, currentGroup)
    case 'forced-contrast':
      return {
        ...processColorGroup(colorName, currentGroup),
        ...processColorGroup(
          colorName,
          isDark ? colorGroup.light : colorGroup.dark,
          isDark ? LIGHT_SUFFIX : DARK_SUFFIX,
        ),
      }
    case 'design-system':
      return {
        ...processColorGroup(colorName, currentGroup),
        ...processColorGroup(colorName, colorGroup.light, LIGHT_SUFFIX),
        ...processColorGroup(colorName, colorGroup.dark, DARK_SUFFIX),
      }
    default:
      throw new Error(`Invalid strategy: ${strategy}`)
  }
}

/**
 * Processes an array of custom color groups.
 *
 * @param customColors - Optional array of custom color groups.
 * @param options - Options including whether the current mode is dark and the strategy to use.
 * @returns A merged record of all processed custom color groups.
 */
export function processCustomColorGroups(
  customColors?: CustomColorGroup[],
  options: { isDark?: boolean; strategy?: MaterialColorStrategy } = {},
): Record<string, number> {
  return (customColors || []).reduce<Record<string, number>>(
    (acc, customColorGroup) => ({
      ...acc,
      ...processCustomColorGroup(customColorGroup, options),
    }),
    {},
  )
}

/**
 * Merges multiple color scheme records into one.
 *
 * @param schemes - Array of color scheme records to merge.
 * @returns A single merged color scheme record.
 */
function mergeColorSchemes(...schemes: Record<string, number>[]): Record<string, number> {
  return schemes.reduce((acc, scheme) => ({ ...acc, ...scheme }), {})
}

/**
 * Generates a complete color scheme based on the provided theme and options.
 *
 * @param theme - The theme containing light/dark dynamic schemes and optional custom colors.
 * @param options - Options including the strategy and variant ('light' or 'dark').
 * @returns A merged color scheme record with processed color values.
 */
export function generateColorScheme<S extends MaterialColorStrategy, V extends 'light' | 'dark'>(
  theme: {
    schemes: {
      light: DynamicScheme
      dark: DynamicScheme
    }
    customColors?: CustomColorGroup[]
  },
  options: { strategy?: S; variant?: V },
): ColorScheme<S, V> & Record<string, number> {
  const { schemes, customColors = [] } = theme
  const { strategy = 'adaptive', variant = 'light' } = options
  const isDark = variant === 'dark'
  const currentScheme = isDark ? schemes.dark : schemes.light
  const customColorScheme = processCustomColorGroups(customColors, { isDark, strategy })

  switch (strategy) {
    case 'adaptive':
      return mergeColorSchemes(
        processSchemeColors(currentScheme),
        customColorScheme,
      ) as ColorScheme<S, V> & Record<string, number>
    case 'forced-contrast':
      return mergeColorSchemes(
        processSchemeColors(currentScheme),
        processSchemeColors(
          isDark ? schemes.light : schemes.dark,
          isDark ? LIGHT_SUFFIX : DARK_SUFFIX,
        ),
        customColorScheme,
      ) as ColorScheme<S, V> & Record<string, number>
    case 'design-system':
      return mergeColorSchemes(
        processSchemeColors(currentScheme),
        processSchemeColors(schemes.light, LIGHT_SUFFIX),
        processSchemeColors(schemes.dark, DARK_SUFFIX),
        customColorScheme,
      ) as ColorScheme<S, V> & Record<string, number>
    default:
      return assertNever(strategy)
  }
}

/**
 * A type-safety helper to ensure all strategies are handled.
 *
 * @param x - A value that should be of type never.
 * @throws An error if an unexpected strategy is encountered.
 */
function assertNever(x: never): never {
  throw new Error(`Unexpected strategy: ${x}`)
}
