# Material Theme Essentials (WIP)

## NOT READY FOR USE - WORK IN PROGRESS - DO NOT USE YET

Enhanced utilities for working with Material Design colors, supporting dynamic theme generation from various seed types
and color scheme transformations.

## Features

- 🎨 Convert multiple seed types to color values (images, videos, canvases, etc.)
- 🌗 Generate complete Material Design color schemes
- 🛠 Custom color blending and strategy-based scheme generation
- 📱 Cross-environment support (Browser, Node.js with polyfills)

## Installation

```bash
npm install @material/material-color-utilities material-theme-essentials
```
---

## resolveColor

Convert the seed value to a color value:

```ts
import { resolveColor, argbFromHex } from 'material-theme-essentials'

// Numeric color
const numericColor = await resolveColor(0xff00ff)

// Hex string
const hexColor = await resolveColor('#ff00ff')

// Image URL
const imageColor = await resolveColor('https://example.com/image.jpg')

// SVG element
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
// ... draw on SVG ...
const svgColor = await resolveColor(svg)

// Canvas element
const canvas = document.createElement('canvas')
// ... draw on canvas ...
const canvasColor = await resolveColor(canvas)

// Video frame
const video = document.createElement('video')
video.src = 'https://example.com/video.mp4'
video.onloadeddata = async () => {
  const videoColor = await resolveColor(video)
}
```

## seedTheme & toColorScheme

Create complete color schemes with different generation strategies:

```ts
import { seedTheme, toColorScheme, MaterialColorStrategy } from 'material-theme-essentials'

// Create theme
const theme = await seedTheme('https://example.com/image.jpg', {
  primary: 0xff00ff,
  secondary: '#00ff00',
  tertiary: 0x0000ff,
  staticColors: [
    { name: 'accent', value: '#ff0000' },
    { name: 'background', value: 0x000000, blend: true }
  ]
})

// Or pass a seed object directly
// const theme = await seedTheme('https://example.com/image.jpg')
```

## API Reference

### resolveColor(seed: Seed): Promise<Color>

__Converts a seed value to an ARGB color value.__

Supported seed types:
  * Numeric color value
  * Hex color string
  * Image URL
  * Local file path
  * Blob
  * HTMLImageElement
  * HTMLVideoElement
  * VideoFrame
  * SVG element
  * HTMLCanvasElement
  * OffscreenCanvas
  * ImageData
  * ImageBitmap

---

### seedTheme(seed: ThemeSeed): Promise<Theme>

__Generates a base theme from a seed object.__

```ts
export interface MaterialTheme {
  source: Seed
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
```

### toColorScheme(theme: Theme, options?: SchemeOptions)

__Generates a complete color scheme from a base theme.__

Configuration options:

```ts
import { MaterialColorStrategy } from 'material-theme-essentials'

const scheme = toColorScheme(theme, {
  strategy: MaterialColorStrategy
})
```

## TypeScript Reference
```ts
import type { MaterialColorStrategy } from 'material-theme-essentials'

export interface BaseColorScheme {
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
  [K in keyof BaseColorScheme as `${K}Light`]: number
}

export type ColorSchemeDark = {
  [K in keyof BaseColorScheme as `${K}Dark`]: number
}

export type OppositeColorScheme<T extends 'light' | 'dark'> = T extends 'dark'
  ? ColorSchemeDark
  : ColorSchemeLight

export type ColorSchemeStrategyMap<V extends 'light' | 'dark'> = {
  'active-only': BaseColorScheme
  'active-with-opposite': BaseColorScheme & OppositeColorScheme<V>
  'split-by-mode': ColorSchemeLight & ColorSchemeDark
  'all-variants': BaseColorScheme & ColorSchemeLight & ColorSchemeDark
  'adaptive': BaseColorScheme
  'forced-contrast': BaseColorScheme & OppositeColorScheme<V>
  'design-system': BaseColorScheme & ColorSchemeLight & ColorSchemeDark
}

export type ColorScheme<
  T extends MaterialColorStrategy,
  V extends 'light' | 'dark' = 'light' | 'dark',
> = ColorSchemeStrategyMap<V>[T]
```

---

## To install dependencies:

```bash
bun install
```

To run:

```bash
bun run ./dist/index.js
```

This project was created using `bun init` in bun v1.1.42. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
