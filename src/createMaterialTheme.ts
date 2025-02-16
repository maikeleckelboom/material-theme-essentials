import {
  customColor,
  CustomColorGroup,
  TonalPalette,
} from '@material/material-color-utilities'
import { createMaterialScheme, Variant } from './scheme'
import { resolveSeedToSource } from './resolveSeedToSource'
import { extractColorsFromDynamicScheme } from './colorScheme'

export interface CorePaletteColors {
  primary?: number
  secondary?: number
  tertiary?: number
  neutral?: number
  neutralVariant?: number
}

export interface BaseMaterialSchemeOptions extends CorePaletteColors {
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
  | undefined

export type MaterialSchemeOptions =
  | (BaseMaterialSchemeOptions & { primary: number; seed?: Seed })
  | (BaseMaterialSchemeOptions & { seed: Seed; primary?: number })

export type ColorScheme = Record<string, number>

export interface StaticColor {
  name: string
  value: number
  blend?: boolean
}

export type MaterialThemeOptions = MaterialSchemeOptions & {
  staticColors?: StaticColor[]
}

export interface MaterialTheme {
  source: Seed
  contrastLevel: number
  variant: Variant
  schemes: {
    light: ColorScheme
    dark: ColorScheme
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

function isMaterialThemeOptions(
  value: MaterialThemeOptions | Seed,
): value is MaterialThemeOptions {
  return (
    value !== null && typeof value === 'object' && ('primary' in value || 'seed' in value)
  )
}

export async function createMaterialTheme(
  optionsOrSeed: MaterialThemeOptions | Seed,
): Promise<MaterialTheme> {
  const opts: MaterialThemeOptions = isMaterialThemeOptions(optionsOrSeed)
    ? optionsOrSeed
    : { seed: optionsOrSeed }

  const source = await resolveSeedToSource(opts.seed || opts.primary)

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

  const createSchemeForMode = (isDark: boolean = false) =>
    createMaterialScheme({
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

  const lightScheme = createSchemeForMode()
  const darkScheme = createSchemeForMode(true)

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
      light: extractColorsFromDynamicScheme(lightScheme, false),
      dark: extractColorsFromDynamicScheme(darkScheme, true),
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
