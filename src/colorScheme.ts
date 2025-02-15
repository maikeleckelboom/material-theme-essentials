import {
  CustomColorGroup,
  DynamicColor,
  DynamicScheme,
  MaterialDynamicColors,
} from '@material/material-color-utilities'

export function camelCase(str: string): string {
  const words = str.match(/\p{Lu}?\p{Ll}+|\p{Lu}+(?!\p{Ll})|\d+/gu) || []
  return words
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join('')
}

export function formatCustomColorName(
  blueprint: string,
  customColorName: string,
  options: { suffix?: string } = {},
): string {
  const { suffix = '' } = options
  const formattedName = blueprint
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/color/g, camelCase(customColorName))
  return camelCase(formattedName + suffix)
}

export function extractColorsFromColorGroup(
  colorGroup: CustomColorGroup,
  { isDark = false, brightnessVariants = true } = {},
): Record<string, number> {
  const baseColorName = colorGroup.color.name

  // Build colors from the main theme using reduce
  const colors = Object.entries(isDark ? colorGroup.dark : colorGroup.light).reduce(
    (acc, [key, value]) => {
      acc[formatCustomColorName(key, baseColorName)] = value
      return acc
    },
    {} as Record<string, number>,
  )

  // If brightness variants are enabled, add colors for both variants
  if (brightnessVariants) {
    ;(['light', 'dark'] as const).forEach((variant) => {
      Object.entries(colorGroup[variant]).forEach(([key, value]) => {
        colors[formatCustomColorName(key, baseColorName, { suffix: `_${variant}` })] =
          value
      })
    })
  }

  return colors
}

export function extractColorsFromDynamicScheme(
  dynamicScheme: DynamicScheme,
  appendBrightnessSuffix: boolean = false,
): Record<string, number> {
  const colors: Record<string, number> = {}

  for (const [colorName, ColorClass] of Object.entries(MaterialDynamicColors)) {
    // Skip non-DynamicColor entries
    if (!(ColorClass instanceof DynamicColor)) {
      continue
    }

    // Avoid adding suffix to palette colors to prevent duplication
    const isPaletteColor = colorName.toLowerCase().includes('palette')
    if (appendBrightnessSuffix && isPaletteColor) {
      continue
    }

    // Generate final color name and store ARGB value
    const brightnessSuffix = appendBrightnessSuffix
      ? dynamicScheme.isDark
        ? 'Dark'
        : 'Light'
      : ''
    const resolvedColorName = `${colorName}${brightnessSuffix}`
    colors[resolvedColorName] = ColorClass.getArgb(dynamicScheme)
  }

  return colors
}
