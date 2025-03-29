import {
  type ColorGroup,
  customColor,
  type CustomColorGroup,
  DynamicColor,
  DynamicScheme,
  MaterialDynamicColors,
} from '@material/material-color-utilities'
import type {
  ColorScheme,
  ColorSchemeStrategy,
  SchemeGenerationParams,
  StaticColor,
  Strategy,
  Theme,
} from '../types'
import camelCase from 'camelcase'
import { colorToArgb } from '../utils/conversion'

// Constants
const DELIM = '_' as const
const LT_SUF = 'light' as const
const DK_SUF = 'dark' as const

/**
 * Process a dynamic scheme and return a record of color names and their ARGB values.
 *
 * @param scheme The dynamic scheme to process.
 * @param suffix An optional suffix to append to the color names.
 * @returns A record of color names and their ARGB values.
 */
export function colorsFromScheme(scheme: DynamicScheme, suffix: string = '') {
  return Object.fromEntries(
    Object.entries(MaterialDynamicColors)
      .filter(([, color]) => color instanceof DynamicColor)
      .map(([name, color]) => [camelCase(`${name}${DELIM}${suffix}`), color.getArgb(scheme)]),
  ) as Record<keyof ColorScheme, number>
}

/**
 * Format color name using template pattern
 *
 * @param pattern The example template pattern to format the color name to
 * @param name The default name to use in the template
 * @param suffix The suffix to append to the formatted name
 * @returns The formatted color name
 */
export function formatName(pattern: string, name: string, suffix: string = '') {
  return camelCase(
    `${pattern
      .replace(/([A-Z])/g, `${DELIM}$1`)
      .toLowerCase()
      .replace(/color/g, camelCase(name))}${DELIM}${suffix}`,
  )
}

/**
 * Process a color group and return a record of color names and their ARGB values.
 *
 * @param name The default name to use in the template
 * @param colorGroup The color group to process
 * @param suffix An optional suffix to append to the color names
 * @returns A record of color names and their ARGB values
 */
export function processColorGroup(name: string, colorGroup: ColorGroup, suffix?: string) {
  // todo: make name the second parameter, colorGroup the first
  const result: Record<string, number> = {}
  for (const key in colorGroup) {
    result[formatName(key, name, suffix)] = colorGroup[key as keyof ColorGroup]
  }
  return result
}

/**
 * Process a custom color group and return a record of color names and their ARGB values.
 *
 * @param group The custom color group to process.
 * @param opts Options for processing the color group.
 * @returns A record of color names and their ARGB values.
 */
export function processCustomColorGroup(
  group: CustomColorGroup,
  opts: { isDark?: boolean; strategy?: Strategy } = {},
): Record<string, number> {
  const { isDark = false, strategy = 'default' } = opts
  const { name } = group.color

  switch (strategy) {
    case 'default':
      return processColorGroup(name, isDark ? group.dark : group.light)
    case 'combined': {
      const main = processColorGroup(name, isDark ? group.dark : group.light)
      const alt = processColorGroup(
        name,
        isDark ? group.light : group.dark,
        isDark ? LT_SUF : DK_SUF,
      )
      return { ...main, ...alt }
    }
    case 'separated':
      return {
        ...processColorGroup(name, group.light, LT_SUF),
        ...processColorGroup(name, group.dark, DK_SUF),
      }
    case 'comprehensive':
      return {
        ...processCustomColorGroup(group, { ...opts, strategy: 'default' }),
        ...processCustomColorGroup(group, { ...opts, strategy: 'separated' }),
      }
    default:
      throw new Error(`Invalid strategy: ${strategy}`)
  }
}

/**
 * Process multiple custom color groups and return a record of color names and their ARGB values.
 *
 * @param groups The custom color groups to process.
 * @param opts Options for processing the color groups.
 * @returns A record of color names and their ARGB values.
 */
export function processCustomGroups(
  groups?: CustomColorGroup[],
  opts: { isDark?: boolean; strategy?: Strategy } = {},
) {
  const result: Record<string, number> = {}
  groups?.forEach((group) => {
    Object.entries(processCustomColorGroup(group, opts)).forEach(([k, v]) => {
      result[k] = v
    })
  })
  return result
}

/**
 * Create a custom color group with a static color.
 *
 * @param designColor The design color used when blending.
 * @param staticColor The static color to use in the custom color group.
 */
export function staticColor(
  designColor: string | number,
  staticColor: StaticColor,
): CustomColorGroup {
  const { name, blend = false } = staticColor
  const value = colorToArgb(staticColor.value)
  return customColor(colorToArgb(designColor), { name, value, blend })
}

export function listStrategies(): Strategy[] {
  return ['default', 'combined', 'separated', 'comprehensive']
}

export type StrategyConfig = { scheme: DynamicScheme; suffix?: string }[]

/**
 * Get strategy configuration
 *
 * @param strategy
 * @param isDark
 * @param palettes
 * @return
 */
function getStrategySetup<S extends Strategy>(
  strategy: S,
  isDark: boolean,
  palettes: { light: DynamicScheme; dark: DynamicScheme },
) {
  const scheme = isDark ? palettes.dark : palettes.light
  const altScheme = isDark ? palettes.light : palettes.dark
  const altSuffix = isDark ? LT_SUF : DK_SUF

  const configs: Record<Strategy, StrategyConfig> = {
    default: [{ scheme }],
    combined: [{ scheme }, { scheme: altScheme, suffix: altSuffix }],
    separated: [
      { scheme: palettes.light, suffix: LT_SUF },
      { scheme: palettes.dark, suffix: DK_SUF },
    ],
    comprehensive: [
      { scheme: scheme },
      { scheme: palettes.light, suffix: LT_SUF },
      { scheme: palettes.dark, suffix: DK_SUF },
    ],
  }

  return (
    configs[strategy] ??
    (() => {
      throw new Error(`Invalid strategy: ${strategy}`)
    })()
  )
}

/** Generate color scheme with specified strategy */
export function generateColorScheme<S extends Strategy>(
  config: Theme | SchemeGenerationParams,
  opts: { strategy?: S; isDark?: boolean } = {},
): ColorSchemeStrategy<S, (typeof opts)['isDark'] extends true ? 'dark' : 'light'> &
  Record<string, number> {
  const { schemes, customColors = [] } = config
  const { strategy = 'default', isDark = false } = opts
  const setup = getStrategySetup(strategy, isDark, schemes)
  const schemesProcessed = setup.map(({ scheme, suffix }) => colorsFromScheme(scheme, suffix))
  const customProcessed = processCustomGroups(customColors, { isDark, strategy })
  return { ...Object.assign({}, ...schemesProcessed), ...customProcessed }
}
