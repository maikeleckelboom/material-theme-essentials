import {
  DynamicScheme,
  TonalPalette,
} from '@material/material-color-utilities'
import type { MaterialSchemeOptions } from '../types'
import { toHct } from '../utils'
import { colorToArgb } from '../utils/conversion'
import { mapVariantToScheme, Variant } from '../utils/variant'

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
  color: string | number | undefined,
  fallback: TonalPalette,
): TonalPalette {
  if (color === undefined) {
    return fallback
  }
  color = colorToArgb(color)
  const tonalPalette = TonalPalette.fromInt(color)
  if (tonalPalette === undefined) {
    return fallback
  }
  return tonalPalette
}

/**
 * Generates a dynamic color scheme based on the provided configuration options.
 * Overloaded to accept either a seed color + options or a comprehensive options object.
 */
export function createDynamicScheme(
  seed: string | number,
  options?: Omit<MaterialSchemeOptions, 'seed' | 'primary'>,
): DynamicScheme
export function createDynamicScheme(options: MaterialSchemeOptions): DynamicScheme
export function createDynamicScheme(
  seedOrOptions: string | number | MaterialSchemeOptions,
  maybeOptions?: Omit<MaterialSchemeOptions, 'seed' | 'primary'>,
): DynamicScheme {
  const options: MaterialSchemeOptions =
    typeof seedOrOptions === 'number' || typeof seedOrOptions === 'string'
      ? { ...maybeOptions, seed: seedOrOptions }
      : seedOrOptions

  const { contrast = 0, isDark = false, variant = Variant.TONAL_SPOT } = options

  const numericSeed = typeof options.seed === 'number' ? options.seed : undefined
  const sourceColorArgb = colorToArgb(numericSeed || options.primary || 0)

  const SchemeVariant = mapVariantToScheme(variant)
  const scheme = new SchemeVariant(toHct(sourceColorArgb), isDark, contrast)

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
    contrastLevel: contrast,
    variant,
    primaryPalette: tryCreateTonalPalette(options.primary, core.a1),
    secondaryPalette: tryCreateTonalPalette(options.secondary, core.a2),
    tertiaryPalette: tryCreateTonalPalette(options.tertiary, core.a3),
    neutralPalette: tryCreateTonalPalette(options.neutral, core.n1),
    neutralVariantPalette: tryCreateTonalPalette(options.neutralVariant, core.n2),
  })
}
