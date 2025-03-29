import { customColor, TonalPalette } from '@material/material-color-utilities'
import { createDynamicScheme } from './create-dynamic-scheme'
import { resolveSourceColor } from './resolve-source-color'
import { colorToArgb } from '../utils/conversion'
import { Variant } from '../utils/variant'
import type { Seed, Theme, ThemeOptions } from '../types'

function isMaterialThemeOptions(value: ThemeOptions | Seed): value is ThemeOptions {
  return (
    value !== null && typeof value === 'object' && ('primary' in value || 'seed' in value)
  )
}

/**
 * Creates a material theme based on the provided seed or options.
 * @param seedOrOptions - The seed color or theme options.
 * @param options - Additional options if seed is provided separately.
 * @returns A promise that resolves to the generated theme.
 */
export async function createMaterialTheme(
  seedOrOptions: Seed,
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

  const source = await resolveSourceColor(opts.seed || opts.primary!)

  const {
    primary,
    secondary,
    tertiary,
    neutral,
    neutralVariant,
    contrast = 0,
    variant = Variant.TONAL_SPOT,
    staticColors = [],
  } = opts

  const newScheme = (isDark: boolean = false) =>
    createDynamicScheme({
      seed: source,
      isDark,
      primary,
      secondary,
      tertiary,
      neutral,
      neutralVariant,
      contrast,
      variant,
    })

  const lightScheme = newScheme()
  const darkScheme = newScheme(true)

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
    contrastLevel: contrast,
    variant,
    schemes: {
      light: lightScheme,
      dark: darkScheme,
    },
    palettes: {
      primary: TonalPalette.fromInt(colorToArgb(primary || source)),
      secondary: secondary ? TonalPalette.fromInt(colorToArgb(secondary)) : core.a2,
      tertiary: tertiary ? TonalPalette.fromInt(colorToArgb(tertiary)) : core.a3,
      neutral: neutral ? TonalPalette.fromInt(colorToArgb(neutral)) : core.n1,
      neutralVariant: neutralVariant
        ? TonalPalette.fromInt(colorToArgb(neutralVariant))
        : core.n2,
      error: core.error,
    },
    customColors: staticColors.map((color) =>
      customColor(source, {
        name: color.name,
        value: colorToArgb(color.value),
        blend: !!color.blend,
      }),
    ),
  }
}
