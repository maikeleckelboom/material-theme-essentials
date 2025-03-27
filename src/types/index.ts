import { Variant } from '../scheme/create-dynamic-scheme'
import {
  CustomColorGroup,
  DynamicScheme,
  TonalPalette,
} from '@material/material-color-utilities'

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

export type ColorSchemeLight = {
  [K in keyof MaterialColorScheme as `${K}Light`]: number
}

export type ColorSchemeDark = {
  [K in keyof MaterialColorScheme as `${K}Dark`]: number
}

export type ColorSchemeOpposite<T extends 'light' | 'dark'> = T extends 'dark'
  ? ColorSchemeDark
  : ColorSchemeLight

export type ColorSchemeStrategyMap<V extends 'light' | 'dark'> = {
  'base': MaterialColorScheme
  'alternate': MaterialColorScheme & ColorSchemeOpposite<V>
  'dual-mode': ColorSchemeLight & ColorSchemeDark
  'complete': MaterialColorScheme & ColorSchemeLight & ColorSchemeDark
}


export type ColorStrategy =
  | 'base'
  | 'alternate'
  | 'dual-mode'
  | 'complete'

export type ColorScheme<
  T extends ColorStrategy,
  K extends 'light' | 'dark' = 'light' | 'dark',
> = ColorSchemeStrategyMap<K>[T]

export interface Theme {
  source: number
  contrastLevel: number
  variant: Variant
  schemes: {
    light: DynamicScheme
    dark: DynamicScheme
  }
  palettes: {
    primary: TonalPalette
    secondary: TonalPalette
    tertiary: TonalPalette
    neutral: TonalPalette
    neutralVariant: TonalPalette
    error: TonalPalette
  }
  customColors: CustomColorGroup[]
}
