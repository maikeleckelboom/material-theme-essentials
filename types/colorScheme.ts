import { Strategy } from '../src/themeFromSeed'

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
