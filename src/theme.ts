import {
  customColor,
  CustomColorGroup,
  DynamicScheme,
  TonalPalette,
} from '@material/material-color-utilities'
import { createMaterialScheme, Variant } from './scheme'
import { resolveSeedToSourceColor } from './resolveSeedToSourceColor'

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

export type Seed = SVGElement | ImageBitmapSource | number | string

export type MaterialSchemeOptions =
  | (BaseMaterialSchemeOptions & { primary: number; seed?: Seed })
  | (BaseMaterialSchemeOptions & { seed: Seed; primary?: number })

export interface MaterialTheme {
  seed: Seed | undefined
  sourceColorArgb: number
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
  staticColors: CustomColorGroup[]
}

export interface StaticColor {
  name: string
  value: number
  blend?: boolean
}

export type MaterialThemeOptions = MaterialSchemeOptions & {
  staticColors?: StaticColor[]
}

// todo make overload that accepts a URL as direct argument
// createMaterialTheme('https://example.com/image.jpg')
// createMaterialTheme('#FFC157')
// createMaterialTheme(0xFFC157)

export async function createMaterialTheme(
  options: MaterialThemeOptions,
): Promise<MaterialTheme> {
  const sourceColor = await resolveSeedToSourceColor(options.seed || options.primary)

  const {
    primary,
    secondary,
    tertiary,
    neutral,
    neutralVariant,
    contrastLevel = 0,
    variant = Variant.TONAL_SPOT,
    staticColors = [],
  } = options

  function createSchemeForMode(isDark: boolean) {
    return createMaterialScheme({
      seed: sourceColor,
      isDark,
      primary,
      secondary,
      tertiary,
      neutral,
      neutralVariant,
      contrastLevel,
      variant,
    })
  }

  const lightScheme = createSchemeForMode(false)

  const core = {
    a1: lightScheme.primaryPalette,
    a2: lightScheme.secondaryPalette,
    a3: lightScheme.tertiaryPalette,
    n1: lightScheme.neutralPalette,
    n2: lightScheme.neutralVariantPalette,
    error: lightScheme.errorPalette,
  }

  return {
    seed: options.seed,
    sourceColorArgb: sourceColor,
    contrastLevel,
    variant,
    schemes: {
      light: lightScheme,
      dark: createSchemeForMode(true),
    },
    palettes: {
      primary: TonalPalette.fromInt(primary || sourceColor),
      secondary: secondary ? TonalPalette.fromInt(secondary) : core.a2,
      tertiary: tertiary ? TonalPalette.fromInt(tertiary) : core.a3,
      neutral: neutral ? TonalPalette.fromInt(neutral) : core.n1,
      neutralVariant: neutralVariant ? TonalPalette.fromInt(neutralVariant) : core.n2,
      error: core.error,
    },
    staticColors: staticColors.map((color) =>
      customColor(sourceColor, {
        ...color,
        blend: !!color.blend,
      }),
    ),
  }
}
