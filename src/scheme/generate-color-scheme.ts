import {
  type ColorGroup,
  type CustomColorGroup,
  DynamicColor,
  DynamicScheme,
  MaterialDynamicColors,
} from '@material/material-color-utilities'
import { camelCase } from '../utils/camel-case'
import type { ColorScheme, ColorStrategy } from '../types'

/**
 * @internal Constants
 */
const DELIMITER = '_' as const
const LIGHT_SUFFIX = 'light' as const
const DARK_SUFFIX = 'dark' as const

// Precompute valid DynamicColor entries
const validDynamicColors = Object.entries(MaterialDynamicColors).filter(
  ([, color]) => color instanceof DynamicColor,
) as [string, DynamicColor][]

/**
 * Processes the colors in a scheme and formats them with a suffix
 */
function processSchemeColors(
  scheme: DynamicScheme,
  suffix: string = '',
  delimiter: string = DELIMITER,
) {
  return Object.fromEntries(
    validDynamicColors.map(([name, color]) => [
      camelCase(`${name}${delimiter}${suffix}`),
      color.getArgb(scheme),
    ]),
  )
}

/**
 * Formats color names using a template system with explicit token replacement
 */
export function formatColorName(
  template: string,
  colorName: string,
  suffix: string = '',
  delimiter: string = DELIMITER,
) {
  const camelColor = camelCase(colorName)
  const formattedName = template
    .replace(/([A-Z])/g, `${delimiter}$1`)
    .toLowerCase()
    .replace(/color/g, camelColor)
  return camelCase(`${formattedName}${delimiter}${suffix}`)
}

/**
 * Processes a color group and formats the color names
 */
function processColorGroup(
  baseName: string,
  colorGroup: ColorGroup,
  suffix?: string,
  delimiter?: string,
) {
  const result: Record<string, number> = {}
  for (const key in colorGroup) {
    result[formatColorName(key, baseName, suffix, delimiter)] =
      colorGroup[key as keyof ColorGroup]
  }
  return result
}

export function processCustomColorGroup(
  colorGroup: CustomColorGroup,
  options: { isDark?: boolean; strategy?: ColorStrategy } = {},
) {
  const { isDark = false, strategy = 'base' } = options
  const adaptiveColorGroup = isDark ? colorGroup.dark : colorGroup.light
  const colorName = colorGroup.color.name

  switch (strategy) {
    case 'base': {
      return processColorGroup(colorName, adaptiveColorGroup)
    }
    case 'alternate': {
      const main = processColorGroup(colorName, adaptiveColorGroup)
      const alternateGroup = isDark ? colorGroup.light : colorGroup.dark
      const alternate = processColorGroup(
        colorName,
        alternateGroup,
        isDark ? LIGHT_SUFFIX : DARK_SUFFIX,
      )
      return Object.assign(main, alternate)
    }
    case 'dual-mode': {
      const light = processColorGroup(colorName, colorGroup.light, LIGHT_SUFFIX)
      const dark = processColorGroup(colorName, colorGroup.dark, DARK_SUFFIX)
      return Object.assign(light, dark)
    }
    case 'complete': {
      const base = processColorGroup(colorName, adaptiveColorGroup)
      const light = processColorGroup(colorName, colorGroup.light, LIGHT_SUFFIX)
      const dark = processColorGroup(colorName, colorGroup.dark, DARK_SUFFIX)
      return Object.assign(base, light, dark)
    }
    default:
      throw new Error(`Invalid strategy: ${strategy}`)
  }
}

export function processCustomColorGroups(
  customColors?: CustomColorGroup[],
  options: { isDark?: boolean; strategy?: ColorStrategy } = {},
): Record<string, number> {
  const result: Record<string, number> = {}
  if (!customColors) return result

  for (const group of customColors) {
    const processed = processCustomColorGroup(group, options)
    for (const key in processed) {
      result[key] = processed[key]
    }
  }
  return result
}

export function generateColorScheme<S extends ColorStrategy, M extends 'light' | 'dark'>(
  theme: {
    schemes: {
      light: DynamicScheme
      dark: DynamicScheme
    }
    customColors?: CustomColorGroup[]
  },
  options: { strategy?: S; mode?: M },
): ColorScheme<S, M> & Record<string, number> {
  const { schemes, customColors = [] } = theme
  const { strategy = 'base', mode = 'light' } = options
  const isDark = mode === 'dark'

  const currentScheme = isDark ? schemes.dark : schemes.light
  const customColorScheme = processCustomColorGroups(customColors, { isDark, strategy })

  switch (strategy) {
    case 'base':
      return Object.assign(
        processSchemeColors(currentScheme),
        customColorScheme,
      ) as ColorScheme<S, M> & Record<string, number>

    case 'alternate': {
      const alternateScheme = isDark ? schemes.light : schemes.dark
      const alternateSuffix = isDark ? LIGHT_SUFFIX : DARK_SUFFIX
      return Object.assign(
        processSchemeColors(currentScheme),
        processSchemeColors(alternateScheme, alternateSuffix),
        customColorScheme,
      ) as ColorScheme<S, M> & Record<string, number>
    }

    case 'dual-mode':
      return Object.assign(
        processSchemeColors(schemes.light, LIGHT_SUFFIX),
        processSchemeColors(schemes.dark, DARK_SUFFIX),
        customColorScheme,
      ) as ColorScheme<S, M> & Record<string, number>

    case 'complete':
      return Object.assign(
        processSchemeColors(currentScheme),
        processSchemeColors(schemes.light, LIGHT_SUFFIX),
        processSchemeColors(schemes.dark, DARK_SUFFIX),
        customColorScheme,
      ) as ColorScheme<S, M> & Record<string, number>

    default:
      throw new Error(`Unexpected strategy: ${strategy}`)
  }
}
