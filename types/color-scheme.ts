export interface MaterialColorScheme {
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

type ColorSchemeLight = {
  [K in keyof MaterialColorScheme as AppendLight<K>]: number
}

type ColorSchemeDark = {
  [K in keyof MaterialColorScheme as AppendDark<K>]: number
}

type ColorSchemeAllVariants = MaterialColorScheme & ColorSchemeLight & ColorSchemeDark

export type ColorSchemeStrategyMap = {
  'active-only': MaterialColorScheme
  'active-with-opposite': MaterialColorScheme & ColorSchemeDark
  'split-by-mode': ColorSchemeAllVariants
  'all-variants': ColorSchemeAllVariants
}

export type ColorScheme<T extends keyof ColorSchemeStrategyMap> =
  ColorSchemeStrategyMap[T] & {
    [key: string]: number
  }
