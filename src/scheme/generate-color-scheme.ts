import {
  type ColorGroup,
  customColor,
  type CustomColorGroup,
  DynamicColor,
  DynamicScheme,
  MaterialDynamicColors,
} from '@material/material-color-utilities'
import { ColorScheme, SchemeGenerationParams, Strategy } from '../types'
import camelCase from 'camelcase'
import {  StaticColor } from './create-material-theme'

// Constants
const DELIM = '_' as const
const LT_SUF = 'light' as const
const DK_SUF = 'dark' as const

/** Process scheme colors with optional suffix */
export function processScheme(
  scheme: DynamicScheme,
  suffix: string = '',
) {
  return Object.fromEntries(
    Object.entries(MaterialDynamicColors)
      .filter(([, color]) => color instanceof DynamicColor)
      .map(([name, color]) => [camelCase(`${name}${DELIM}${suffix}`), color.getArgb(scheme)]),
  ) as Record<string, number>
}

/** Format color name using template pattern */
export function formatName(
  pattern: string,
  baseName: string,
  suffix: string = '',
) {
  return camelCase(
    `${pattern
      .replace(/([A-Z])/g, `${DELIM}$1`)
      .toLowerCase()
      .replace(/color/g, camelCase(baseName))}${DELIM}${suffix}`,
  )
}

/** Process a single color group */
function processColorGroup(base: string, group: ColorGroup, suffix?: string) {
  const result: Record<string, number> = {}
  for (const key in group) {
    result[formatName(key, base, suffix)] = group[key as keyof ColorGroup]
  }
  return result
}

/** Process custom color group with strategy */
export function processCustomColorGroup(
  group: CustomColorGroup,
  opts: { isDark?: boolean; strategy?: Strategy } = {},
): Record<string, number> {
  const { isDark = false, strategy = 'default' } = opts
  const currGroup = isDark ? group.dark : group.light
  const name = group.color.name

  switch (strategy) {
    case 'default':
      return processColorGroup(name, currGroup)
    case 'contextual': {
      const main = processColorGroup(name, currGroup)
      const altGroup = isDark ? group.light : group.dark
      const alt = processColorGroup(name, altGroup, isDark ? LT_SUF : DK_SUF)
      return { ...main, ...alt }
    }
    case 'dual':
      return {
        ...processColorGroup(name, group.light, LT_SUF),
        ...processColorGroup(name, group.dark, DK_SUF),
      }
    case 'comprehensive':
      return {
        ...processCustomColorGroup(group, { ...opts, strategy: 'default' }),
        ...processCustomColorGroup(group, { ...opts, strategy: 'dual' }),
      }
    default:
      throw new Error(`Invalid strategy: ${strategy}`)
  }
}

/** Process multiple custom color groups */
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

export function staticColor(sourceColor: number, staticColor: StaticColor):CustomColorGroup{
  return customColor(sourceColor, {
    name: staticColor.name,
    value: staticColor.value,
    blend: !!staticColor.blend,
  })
}


/** Strategy configuration setup */
type StrategySetup = { scheme: DynamicScheme; suffix?: string }[]

/** Get strategy configuration */
function getStrategySetup<S extends Strategy>(
  strategy: S,
  isDark: boolean,
  palettes: { light: DynamicScheme; dark: DynamicScheme },
): StrategySetup {
  const mainScheme = isDark ? palettes.dark : palettes.light
  const altScheme = isDark ? palettes.light : palettes.dark
  const altSuffix = isDark ? LT_SUF : DK_SUF

  const configs: Record<Strategy, StrategySetup> = {
    default: [{ scheme: mainScheme }],
    contextual: [{ scheme: mainScheme }, { scheme: altScheme, suffix: altSuffix }],
    dual: [
      { scheme: palettes.light, suffix: LT_SUF },
      { scheme: palettes.dark, suffix: DK_SUF },
    ],
    comprehensive: [
      { scheme: mainScheme },
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
export function generateColorScheme<S extends Strategy, M extends 'light' | 'dark'>(
  config: SchemeGenerationParams,
  opts: { strategy?: S; isDark?: boolean } = {},
): ColorScheme<S, M> & Record<string, number> {
  const { schemes, customColors = [] } = config
  const { strategy = 'default', isDark = false } = opts
  const setup = getStrategySetup(strategy, isDark, schemes)
  const schemesProcessed = setup.map(({ scheme, suffix }) => processScheme(scheme, suffix))
  const customProcessed = processCustomGroups(customColors, { isDark, strategy })
  return { ...Object.assign({}, ...schemesProcessed), ...customProcessed }
}
