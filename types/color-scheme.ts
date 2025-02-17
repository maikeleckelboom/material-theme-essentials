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

type Exact<T, U extends T = T> = U & {
  [K in Exclude<keyof U, keyof T>]?: never
}

type AppendSuffix<T extends string, U extends string> = `${T}${U}`

type AppendLight<T extends string> = AppendSuffix<T, 'Light'>

type AppendDark<T extends string> = AppendSuffix<T, 'Dark'>

export type ColorSchemeLight = {
  [K in keyof MaterialColorScheme as AppendLight<K>]: number
}

export type ColorSchemeDark = {
  [K in keyof MaterialColorScheme as AppendDark<K>]: number
}

export type ActiveWithOpposite<T extends 'light' | 'dark'> = T extends 'dark'
  ? ColorSchemeDark
  : ColorSchemeLight

type ColorSchemeStrategyMap<V extends 'light' | 'dark'> = {
  'active-only': MaterialColorScheme
  'active-with-opposite': MaterialColorScheme & ActiveWithOpposite<V>
  'split-by-mode': ColorSchemeLight & ColorSchemeDark
  'all-variants': MaterialColorScheme & ColorSchemeLight & ColorSchemeDark
}

export type StrictColorScheme<
  T extends keyof ColorSchemeStrategyMap<V>,
  V extends 'light' | 'dark' = 'light',
> = ColorSchemeStrategyMap<V>[T]

export type ColorScheme<
  T extends keyof ColorSchemeStrategyMap<V>,
  V extends 'light' | 'dark' = 'light',
> = Partial<Exact<StrictColorScheme<T, V>>>

// eslint-disable-next-line
const testActiveWithOpposite: ColorScheme<'active-with-opposite', 'dark'> = {
  primary: 0,
  primaryDark: 0,
  // @ts-expect-error given 'dark' mode, 'light' keys are not allowed
  primaryLight: 0,
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

// type ExtractBaseKey<T> = T extends `${infer Base}Light` | `${infer Base}Dark` ? Base : T
//
// type ExampleExtractBaseKey = ExtractBaseKey<'primaryLight'> // 'primary'
//
// type ExtractSuffix<T> = T extends `${string}Light`
//   ? 'Light'
//   : T extends `${string}Dark`
//     ? 'Dark'
//     : T
//
// type ExampleExtractSuffix = ExtractSuffix<'primaryDark'> // 'Dark'
