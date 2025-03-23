import { customColor, TonalPalette } from '@material/material-color-utilities'
import { createDynamicScheme, Variant } from './create-dynamic-scheme'
import { resolveColor } from '../utils/resolve-color'
import { Theme } from '../types'

export interface CorePaletteColors {
  primary?: number
  secondary?: number
  tertiary?: number
  neutral?: number
  neutralVariant?: number
}

export interface BaseSchemeOptions extends CorePaletteColors {
  variant?: Variant
  contrastLevel?: number
  isDark?: boolean
  isAmoled?: boolean
}

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
  | (BaseSchemeOptions & { primary: number; seed?: Seed })
  | (BaseSchemeOptions & { seed: Seed; primary?: number })

export interface StaticColor {
  name: string
  value: number
  blend?: boolean
}

export type ThemeOptions = Omit<MaterialSchemeOptions, 'isDark'> & {
  staticColors?: StaticColor[]
}

export type MaterialColorStrategy =
  | 'adaptive'         // Auto light/dark (system)
  | 'forced-contrast'  // Explicit light + dark
  | 'design-system'    // All variants (Figma-like)

function isMaterialThemeOptions(value: ThemeOptions | Seed): value is ThemeOptions {
  return (
    value !== null && typeof value === 'object' && ('primary' in value || 'seed' in value)
  )
}

export async function createMaterialTheme(
  seed: Seed,
  options?: Omit<ThemeOptions, 'seed'>,
): Promise<Theme>
export async function createMaterialTheme(options: ThemeOptions): Promise<Theme>
export async function createMaterialTheme(
  optionsOrSeed: ThemeOptions | Seed,
  options?: Omit<ThemeOptions, 'seed'>,
): Promise<Theme> {
  const opts: ThemeOptions = isMaterialThemeOptions(optionsOrSeed)
    ? optionsOrSeed
    : { seed: optionsOrSeed, ...options }

  const source = await resolveColor(opts.seed || opts.primary!)

  const {
    primary,
    secondary,
    tertiary,
    neutral,
    neutralVariant,
    contrastLevel = 0,
    variant = Variant.TONAL_SPOT,
    staticColors = [],
  } = opts

  const createScheme = (isDark: boolean = false) =>
    createDynamicScheme({
      seed: source,
      isDark,
      primary,
      secondary,
      tertiary,
      neutral,
      neutralVariant,
      contrastLevel,
      variant,
    })

  const lightScheme = createScheme()
  const darkScheme = createScheme(true)

  const core = {
    a1: lightScheme.primaryPalette,
    a2: lightScheme.secondaryPalette,
    a3: lightScheme.tertiaryPalette,
    n1: lightScheme.neutralPalette,
    n2: lightScheme.neutralVariantPalette,
    error: lightScheme.errorPalette,
  }

  return {
    source,
    contrastLevel,
    variant,
    schemes: {
      light: lightScheme,
      dark: darkScheme,
    },
    palettes: {
      primary: TonalPalette.fromInt(primary || source),
      secondary: secondary ? TonalPalette.fromInt(secondary) : core.a2,
      tertiary: tertiary ? TonalPalette.fromInt(tertiary) : core.a3,
      neutral: neutral ? TonalPalette.fromInt(neutral) : core.n1,
      neutralVariant: neutralVariant ? TonalPalette.fromInt(neutralVariant) : core.n2,
      error: core.error,
    },
    customColors: staticColors.map((color) =>
      customColor(source, {
        ...color,
        blend: !!color.blend,
      }),
    ),
  }
}
