import {
  SchemeContent,
  SchemeExpressive,
  SchemeFidelity,
  SchemeFruitSalad,
  SchemeMonochrome,
  SchemeNeutral, SchemeRainbow,
  SchemeTonalSpot,
  SchemeVibrant,
} from '@material/material-color-utilities'

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

export function mapVariantToScheme(
  variant: Variant,
): (typeof VARIANT_TO_SCHEME_MAP)[Variant] {
  return VARIANT_TO_SCHEME_MAP[variant]
}

export function listVariants(){
  return {
    MONOCHROME: Variant.MONOCHROME,
    NEUTRAL: Variant.NEUTRAL,
    TONAL_SPOT: Variant.TONAL_SPOT,
    VIBRANT: Variant.VIBRANT,
    EXPRESSIVE: Variant.EXPRESSIVE,
    FIDELITY: Variant.FIDELITY,
    CONTENT: Variant.CONTENT,
    RAINBOW: Variant.RAINBOW,
    FRUIT_SALAD: Variant.FRUIT_SALAD,
  }
}