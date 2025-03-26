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

function processColorGroup(colorName: string, group: ColorGroup, suffix?: string) {
  return Object.fromEntries(
    Object.entries(group).map(([key, value]) => [
      formatColorName(key, colorName, { suffix }),
      value,
    ]),
  )
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
          isDark ? 'light' : 'dark',
        ),
      }
    case 'split-by-mode':
      return {
        ...processColorGroup(colorName, colorGroup.light, 'light'),
        ...processColorGroup(colorName, colorGroup.dark, 'dark'),
      }
    case 'all-variants':
      return {
        ...processColorGroup(colorName, currentGroup),
        ...processColorGroup(colorName, colorGroup.light, 'light'),
        ...processColorGroup(colorName, colorGroup.dark, 'dark'),
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
    (acc, customColorGroup) => ({
      ...acc,
      ...processCustomColorGroup(customColorGroup, options),
    }),
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
          isDark ? 'light' : 'dark',
        ),
        ...customColorScheme,
      } as ColorScheme<S, V> & Record<string, number>

    case 'split-by-mode':
      return {
        ...processSchemeColors(schemes.light, 'light'),
        ...processSchemeColors(schemes.dark, 'dark'),
        ...customColorScheme,
      } as ColorScheme<S, V> & Record<string, number>

    case 'all-variants':
      return {
        ...processSchemeColors(currentScheme),
        ...processSchemeColors(schemes.light, 'light'),
        ...processSchemeColors(schemes.dark, 'dark'),
        ...customColorScheme,
      } as ColorScheme<S, V> & Record<string, number>

    default:
      return assertNever(strategy)
  }
}

function assertNever(x: never): never {
  throw new Error(`Unexpected strategy: ${x}`)
}
