import { Strategy } from '../src/themeFromSeed'
import { ColorSchemeSource } from '../src/toColorScheme'

export interface BaseColorScheme {
  primaryPaletteKeyColor: number
  secondaryPaletteKeyColor: number
  tertiaryPaletteKeyColor: number
  neutralPaletteKeyColor: number
  neutralVariantPaletteKeyColor: number
  background: number
  onBackground: number
  surface: number
  surfaceDim: number
  surfaceBright: number
  surfaceContainerLowest: number
  surfaceContainerLow: number
  surfaceContainer: number
  surfaceContainerHigh: number
  surfaceContainerHighest: number
  onSurface: number
  surfaceVariant: number
  onSurfaceVariant: number
  inverseSurface: number
  inverseOnSurface: number
  outline: number
  outlineVariant: number
  shadow: number
  scrim: number
  surfaceTint: number
  primary: number
  onPrimary: number
  primaryContainer: number
  onPrimaryContainer: number
  inversePrimary: number
  secondary: number
  onSecondary: number
  secondaryContainer: number
  onSecondaryContainer: number
  tertiary: number
  onTertiary: number
  tertiaryContainer: number
  onTertiaryContainer: number
  error: number
  onError: number
  errorContainer: number
  onErrorContainer: number
  primaryFixed: number
  primaryFixedDim: number
  onPrimaryFixed: number
  onPrimaryFixedVariant: number
  secondaryFixed: number
  secondaryFixedDim: number
  onSecondaryFixed: number
  onSecondaryFixedVariant: number
  tertiaryFixed: number
  tertiaryFixedDim: number
  onTertiaryFixed: number
  onTertiaryFixedVariant: number
}

type AppendSuffix<T extends string, U extends string> = `${T}${U}`

type AppendLight<T extends string> = AppendSuffix<T, 'Light'>

type AppendDark<T extends string> = AppendSuffix<T, 'Dark'>

export type ColorSchemeLight = {
  [K in keyof BaseColorScheme as AppendLight<K>]: number
}

export type ColorSchemeDark = {
  [K in keyof BaseColorScheme as AppendDark<K>]: number
}

export type OppositeColorScheme<T extends 'light' | 'dark'> = T extends 'dark'
  ? ColorSchemeDark
  : ColorSchemeLight

export type ColorSchemeStrategyMap<V extends 'light' | 'dark'> = {
  'active-only': BaseColorScheme
  'active-with-opposite': BaseColorScheme & OppositeColorScheme<V>
  'split-by-mode': ColorSchemeLight & ColorSchemeDark
  'all-variants': BaseColorScheme & ColorSchemeLight & ColorSchemeDark
}

export type ColorScheme<
  T extends Strategy,
  V extends 'light' | 'dark' = 'light' | 'dark',
> = ColorSchemeStrategyMap<V>[T]

// eslint-disable-next-line
const testActiveWithOppositeDark: ColorScheme<'active-with-opposite', 'dark'> = {
  primary: 0,
  primaryDark: 0,
  // @ts-expect-error given 'dark' variant, 'light' keys are not allowed
  primaryLight: 0,
}

// eslint-disable-next-line
const testActiveWithOppositeLight: ColorScheme<'active-with-opposite', 'light'> = {
  primary: 0,
  primaryLight: 0,
  // @ts-expect-error given 'light' variant, 'dark' keys are not allowed
  primaryDark: 0,
}

// eslint-disable-next-line
const testActiveOnly: ColorScheme<'active-only'> = {
  primary: 0,
  // @ts-expect-error 'active-only' never returns suffixed keys
  primaryDark: 0,
}

// eslint-disable-next-line
const testActiveWithSplitByMode: ColorScheme<'split-by-mode'> = {
  primaryDark: 0,
  primaryLight: 0,
  // @ts-expect-error 'split-by-mode' never returns un-suffixed keys
  primary: 0,
}

export function toColorScheme2<S extends Strategy, V extends 'light' | 'dark' | never>(
  theme: ColorSchemeSource,
  options: { strategy: S; colorMode: V },
): ColorScheme<S, V> {
  const { strategy } = options

  if (strategy === 'active-only') {
    return {
      primary: 0,
      secondary: 0,
    } as ColorScheme<'active-only'>
  }

  if (strategy === 'active-with-opposite') {
    return {
      primary: 0,
      primaryLight: 0,
    } as ColorScheme<'active-with-opposite', 'light'>
  }

  if (strategy === 'split-by-mode') {
    return {
      primaryDark: 0,
      primaryLight: 0,
    } as ColorScheme<'split-by-mode', 'dark' | 'light'>
  }

  if (strategy === 'all-variants') {
    return {
      primary: 0,
      primaryDark: 0,
      primaryLight: 0,
    } as ColorScheme<'all-variants'>
  }

  throw new Error('Invalid strategy')
}
