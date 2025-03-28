import { Variant } from '../scheme'
import {
  type CustomColorGroup,
  DynamicScheme,
  TonalPalette,
} from '@material/material-color-utilities'

export interface ColorScheme {
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
  [K in keyof ColorScheme as `${K}Light`]: number
}

export type ColorSchemeDark = {
  [K in keyof ColorScheme as `${K}Dark`]: number
}

export type ColorSchemeAlternate<T extends 'light' | 'dark'> = T extends 'dark'
  ? ColorSchemeDark
  : ColorSchemeLight

export type ColorSchemeStrategyMap<V extends 'light' | 'dark' = 'light' | 'dark'> = {
  base: ColorScheme
  contextual: ColorScheme & ColorSchemeAlternate<V>
  split: ColorSchemeLight & ColorSchemeDark
  comprehensive: ColorScheme & ColorSchemeLight & ColorSchemeDark
}

export type Strategy = keyof ColorSchemeStrategyMap

export type ColorSchemeStrategy<
  T extends Strategy,
  K extends 'light' | 'dark',
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

export type SchemeGenerationParams = Pick<Theme, 'schemes'> & {
  customColors?: Theme['customColors']
}

export type PaletteGenerationParams = {
  palettes?: Partial<Theme['palettes']>
  customColors?: Theme['customColors']
}

export interface CorePaletteColors {
  primary?: string | number
  secondary?: string | number
  tertiary?: string | number
  neutral?: string | number
  neutralVariant?: string | number
}

export interface BaseSchemeOptions extends CorePaletteColors {
  variant?: Variant
  contrast?: number
  isDark?: boolean
  withAmoled?: boolean
}

// TODO: Refactor to name it to: source
export type Seed =
  | number
  | string
  | SVGElement
  | HTMLOrSVGImageElement
  | HTMLVideoElement
  | HTMLCanvasElement
  | ImageBitmap
  | OffscreenCanvas
  | VideoFrame
  | Blob
  | ImageData
  | ImageBitmapSource

export type MaterialSchemeOptions =
  | (BaseSchemeOptions & { primary: string | number; seed?: Seed })
  | (BaseSchemeOptions & { seed: Seed; primary?: string | number })

export interface StaticColor {
  name: string
  value: string | number
  blend?: boolean
}

export type ThemeOptions = MaterialSchemeOptions & {
  staticColors?: StaticColor[]
}
