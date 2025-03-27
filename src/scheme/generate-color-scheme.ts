import {
  ColorGroup,
  CustomColorGroup,
  DynamicColor,
  DynamicScheme,
  MaterialDynamicColors,
} from '@material/material-color-utilities'
import { StrategyType } from './create-material-theme'
import { ColorScheme } from '../types'
import { camelCase } from '../utils/camel-case'

const LIGHT_SUFFIX = 'light' as const
const DARK_SUFFIX = 'dark' as const

function processSchemeColors(scheme: DynamicScheme, suffix?: string) {
  return Object.fromEntries(
    Object.entries(MaterialDynamicColors)
      .filter(([, color]) => color instanceof DynamicColor)
      .map(([name, color]) => [
        camelCase(`${name}_${suffix ?? ''}`),
        (color as DynamicColor).getArgb(scheme),
      ]),
  )
}

/**
 * Processes a color group and formats the color names
 * @param colorName
 * @param group
 * @param suffix
 * @param delimiter
 *
 * @example
 */
function processColorGroup(
  colorName: string,
  group: ColorGroup,
  suffix?: string,
  delimiter?: string,
) {
  return Object.fromEntries(
    Object.entries(group).map(([key, value]) => [
      formatColorName(key, colorName, { suffix, delimiter }),
      value,
    ]),
  )
}

/**
 * Formats color names using a template system with explicit token replacement
 * @example
 * formatColorName('colorContainer', 'primary') => 'primaryContainer'
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
  return camelCase(`${formattedName}${delimiter}${suffix}`)
}

export function processCustomColorGroup(
  colorGroup: CustomColorGroup,
  options: { isDark?: boolean; strategy?: StrategyType } = {},
) {
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
          isDark ? LIGHT_SUFFIX : DARK_SUFFIX,
        ),
      }
    case 'split-by-mode':
      return {
        ...processColorGroup(colorName, colorGroup.light, LIGHT_SUFFIX),
        ...processColorGroup(colorName, colorGroup.dark, DARK_SUFFIX),
      }
    case 'all-variants':
      return {
        ...processColorGroup(colorName, currentGroup),
        ...processColorGroup(colorName, colorGroup.light, LIGHT_SUFFIX),
        ...processColorGroup(colorName, colorGroup.dark, DARK_SUFFIX),
      }
    default:
      throw new Error(`Invalid strategy: ${strategy}`)
  }
}

export function processCustomColorGroups(
  customColors?: CustomColorGroup[],
  options: { isDark?: boolean; strategy?: StrategyType } = {},
): Record<string, number> {
  return (customColors || []).reduce(
    (acc, group) => Object.assign(acc, processCustomColorGroup(group, options)),
    {},
  )
}

export function generateColorScheme<S extends StrategyType, V extends 'light' | 'dark'>(
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
  const { strategy = 'active-only', variant = 'light' } = options
  const isDark = variant === 'dark'

  const currentScheme = isDark ? schemes.dark : schemes.light
  const customColorScheme = processCustomColorGroups(customColors, {
    isDark,
    strategy,
  })

  switch (strategy) {
    case 'active-only':
      return {
        ...processSchemeColors(currentScheme),
        ...customColorScheme,
      } as ColorScheme<S, V> & Record<string, number>

    case 'active-with-opposite':
      return {
        ...processSchemeColors(currentScheme),
        ...processSchemeColors(
          isDark ? schemes.light : schemes.dark,
          isDark ? LIGHT_SUFFIX : DARK_SUFFIX,
        ),
        ...customColorScheme,
      } as ColorScheme<S, V> & Record<string, number>

    case 'split-by-mode':
      return {
        ...processSchemeColors(schemes.light, LIGHT_SUFFIX),
        ...processSchemeColors(schemes.dark, DARK_SUFFIX),
        ...customColorScheme,
      } as ColorScheme<S, V> & Record<string, number>

    case 'all-variants':
      return {
        ...processSchemeColors(currentScheme),
        ...processSchemeColors(schemes.light, LIGHT_SUFFIX),
        ...processSchemeColors(schemes.dark, DARK_SUFFIX),
        ...customColorScheme,
      } as ColorScheme<S, V> & Record<string, number>

    default:
      throw new Error(`Unexpected strategy: ${strategy}`)
  }
}
