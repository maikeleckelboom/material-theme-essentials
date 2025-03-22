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

export function processSchemeColors(scheme: DynamicScheme, suffix?: string) {
  const colors: Record<string, number> = {}

  for (const [colorName, ColorClass] of Object.entries(MaterialDynamicColors)) {
    if (!(ColorClass instanceof DynamicColor)) continue

    const resolvedColorName = camelCase(`${colorName}${suffix ?? ''}`)
    colors[resolvedColorName] = ColorClass.getArgb(scheme)
  }

  return colors
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

export function processCustomColorGroup(
  colorGroup: CustomColorGroup,
  options: { isDark?: boolean; strategy?: StrategyType } = {},
){
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
          isDark ? '_light' : '_dark',
        ),
        ...customColorScheme,
      } as ColorScheme<S, V> & Record<string, number>

    case 'split-by-mode':
      return {
        ...processSchemeColors(schemes.light, '_light'),
        ...processSchemeColors(schemes.dark, '_dark'),
        ...customColorScheme,
      } as ColorScheme<S, V> & Record<string, number>

    case 'all-variants':
      return {
        ...processSchemeColors(currentScheme),
        ...processSchemeColors(schemes.light, '_light'),
        ...processSchemeColors(schemes.dark, '_dark'),
        ...customColorScheme,
      } as ColorScheme<S, V> & Record<string, number>

    default:
      return assertNever(strategy)
  }
}

function assertNever(x: never): never {
  throw new Error(`Unexpected strategy: ${x}`)
}
