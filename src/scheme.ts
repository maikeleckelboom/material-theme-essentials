import {
  DynamicScheme,
  SchemeContent,
  SchemeExpressive,
  SchemeFidelity,
  SchemeFruitSalad,
  SchemeMonochrome,
  SchemeNeutral,
  SchemeRainbow,
  SchemeTonalSpot,
  SchemeVibrant,
  TonalPalette,
} from '@material/material-color-utilities'
import { MaterialSchemeOptions } from './createMaterialTheme'
import { toHct } from './hct'

export enum Variant {
  MONOCHROME,
  NEUTRAL,
  TONAL_SPOT,
  VIBRANT,
  EXPRESSIVE,
  FIDELITY,
  CONTENT,
  RAINBOW,
  FRUIT_SALAD,
}

const VARIANT_TO_SCHEME_MAP = {
  [Variant.MONOCHROME]: SchemeMonochrome,
  [Variant.NEUTRAL]: SchemeNeutral,
  [Variant.TONAL_SPOT]: SchemeTonalSpot,
  [Variant.VIBRANT]: SchemeVibrant,
  [Variant.EXPRESSIVE]: SchemeExpressive,
  [Variant.FIDELITY]: SchemeFidelity,
  [Variant.CONTENT]: SchemeContent,
  [Variant.RAINBOW]: SchemeRainbow,
  [Variant.FRUIT_SALAD]: SchemeFruitSalad,
} as const

export function schemeForVariant(
  variant: Variant,
): (typeof VARIANT_TO_SCHEME_MAP)[Variant] {
  return VARIANT_TO_SCHEME_MAP[variant]
}

function isSeedColorBased(options: MaterialSchemeOptions): boolean {
  const hasColorSource = !!options.seed || !!options.primary
  return (
    hasColorSource &&
    !Object.values({
      secondary: options.secondary,
      tertiary: options.tertiary,
      neutral: options.neutral,
      neutralVariant: options.neutralVariant,
    }).some(Boolean)
  )
}

function tryCreateTonalPalette(
  color: number | undefined,
  fallback: TonalPalette,
): TonalPalette {
  return typeof color === 'number' ? TonalPalette.fromInt(color) : fallback
}

function getSeedColor(options: MaterialSchemeOptions): number | undefined {
  if (typeof options.seed === 'number') {
    return options.seed
  }
}

/**
 * Generates a dynamic color scheme based on the provided configuration options.
 */
export function createMaterialScheme(options: MaterialSchemeOptions): DynamicScheme {
  const { contrastLevel = 0, isDark = false, variant = Variant.TONAL_SPOT } = options

  const seedColor = getSeedColor(options)
  const sourceColorArgb = Number(seedColor || options.primary)

  const SchemeVariant = schemeForVariant(variant)
  const scheme = new SchemeVariant(toHct(sourceColorArgb), isDark, contrastLevel)

  if (isSeedColorBased(options)) {
    return scheme
  }

  const core = {
    a1: scheme.primaryPalette,
    a2: scheme.secondaryPalette,
    a3: scheme.tertiaryPalette,
    n1: scheme.neutralPalette,
    n2: scheme.neutralVariantPalette,
  }

  return new DynamicScheme({
    sourceColorArgb,
    isDark,
    contrastLevel,
    variant,
    primaryPalette: tryCreateTonalPalette(options.primary, core.a1),
    secondaryPalette: tryCreateTonalPalette(options.secondary, core.a2),
    tertiaryPalette: tryCreateTonalPalette(options.tertiary, core.a3),
    neutralPalette: tryCreateTonalPalette(options.neutral, core.n1),
    neutralVariantPalette: tryCreateTonalPalette(options.neutralVariant, core.n2),
  })
}
