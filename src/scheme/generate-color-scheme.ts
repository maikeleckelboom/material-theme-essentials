import {
  type ColorGroup,
  type CustomColorGroup,
  DynamicColor,
  DynamicScheme,
  MaterialDynamicColors,
} from '@material/material-color-utilities'
import { camelCase } from '../utils/camel-case'
import { ColorScheme, SchemeGenerationParams, Strategy } from '../types'

// Constants
const DELIM = '_' as const
const LT_SUF = 'light' as const
const DK_SUF = 'dark' as const

/** Process scheme colors with optional suffix */
function processScheme(scheme: DynamicScheme, suffix: string = '', delim: string = DELIM) {
  return Object.fromEntries(
    Object.entries(MaterialDynamicColors)
      .filter(([, color]) => color instanceof DynamicColor)
      .map(([name, color]) => [camelCase(`${name}${delim}${suffix}`), color.getArgb(scheme)]),
  ) as Record<string, number>
}

/** Format color name using template pattern */
export function formatName(
  pattern: string,
  baseName: string,
  suffix: string = '',
  delim: string = DELIM,
) {
  return camelCase(
    pattern
      .replace(/([A-Z])/g, `${delim}$1`)
      .toLowerCase()
      .replace(/color/g, camelCase(baseName)) + `${delim}${suffix}`,
  )
}

/** Process a single color group */
function processGroup(base: string, group: ColorGroup, suffix?: string, delim?: string) {
  const result: Record<string, number> = {}
  for (const key in group) {
    result[formatName(key, base, suffix, delim)] = group[key as keyof ColorGroup]
  }
  return result
}

/** Process custom color group with strategy */
export function processCustomGroup(
  group: CustomColorGroup,
  opts: { isDark?: boolean; strategy?: Strategy } = {},
): Record<string, number> {
  const { isDark = false, strategy = 'system' } = opts
  const currGroup = isDark ? group.dark : group.light
  const name = group.color.name

  switch (strategy) {
    case 'system':
      return processGroup(name, currGroup)
    case 'adaptive': {
      const main = processGroup(name, currGroup)
      const altGroup = isDark ? group.light : group.dark
      const alt = processGroup(name, altGroup, isDark ? LT_SUF : DK_SUF)
      return { ...main, ...alt }
    }
    case 'split':
      return {
        ...processGroup(name, group.light, LT_SUF),
        ...processGroup(name, group.dark, DK_SUF),
      }
    case 'full':
      return {
        ...processCustomGroup(group, { ...opts, strategy: 'system' }),
        ...processCustomGroup(group, { ...opts, strategy: 'split' }),
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
    Object.entries(processCustomGroup(group, opts)).forEach(([k, v]) => {
      result[k] = v
    })
  })
  return result
}

/** Strategy configuration setup */
type StrategySetup = { scheme: DynamicScheme; suffix?: string }[]

/** Get strategy configuration */
function getStrategySetup<S extends Strategy>(
  strategy: S,
  mode: 'light' | 'dark',
  palettes: { light: DynamicScheme; dark: DynamicScheme },
): StrategySetup {
  const isDark = mode === 'dark'
  const mainScheme = isDark ? palettes.dark : palettes.light
  const altScheme = isDark ? palettes.light : palettes.dark
  const altSuffix = isDark ? LT_SUF : DK_SUF

  const configs: Record<Strategy, StrategySetup> = {
    system: [{ scheme: mainScheme }],
    adaptive: [{ scheme: mainScheme }, { scheme: altScheme, suffix: altSuffix }],
    split: [
      { scheme: palettes.light, suffix: LT_SUF },
      { scheme: palettes.dark, suffix: DK_SUF },
    ],
    full: [
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
  opts: { strategy?: S; mode?: M } = {},
): ColorScheme<S, M> & Record<string, number> {
  const { schemes, customColors = [] } = config
  const { strategy = 'system', mode = 'light' } = opts
  const isDark = mode === 'dark'
  const setup = getStrategySetup(strategy, mode, schemes)
  const schemesProcessed = setup.map(({ scheme, suffix }) => processScheme(scheme, suffix))
  const customProcessed = processCustomGroups(customColors, { isDark, strategy })
  return { ...Object.assign({}, ...schemesProcessed), ...customProcessed }
}
