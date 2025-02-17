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

## NOT READY FOR USE - WORK IN PROGRESS - DO NOT USE YET

---

## resolveColorFromSeed

Convert the seed value to a color value:

```ts
import { resolveColorFromSeed, argbFromHex } from 'material-theme-essentials'

// Numeric color
const numericColor = await resolveColorFromSeed(0xff00ff)

// Hex string
const hexColor = await resolveColorFromSeed('#ff00ff')

// Image URL
const imageColor = await resolveColorFromSeed('https://example.com/image.jpg')

// SVG element
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
// ... draw on SVG ...
const svgColor = await resolveColorFromSeed(svg)

// Canvas element
const canvas = document.createElement('canvas')
// ... draw on canvas ...
const canvasColor = await resolveColorFromSeed(canvas)

// Video frame
const video = document.createElement('video')
video.src = 'https://example.com/video.mp4'
video.onloadeddata = async () => {
  const videoColor = await resolveColorFromSeed(video)
}
```

## themeFromSeed & toColorScheme

Create complete color schemes with different generation strategies:

```ts
import { themeFromSeed, toColorScheme, Strategy } from 'material-theme-essentials'

// Create theme
const theme = await themeFromSeed('https://example.com/image.jpg', {
  primary: 0xff00ff,
  secondary: '#00ff00',
  tertiary: 0x0000ff,
  staticColors: [
    { name: 'accent', value: '#ff0000' },
    { name: 'background', value: 0x000000, blend: true }
  ]
})

// Or pass a seed object directly
const theme2 = await themeFromSeed(0x254891)
```

## API Reference

### resolveColorFromSeed(seed: Seed): Promise<Color>

__Converts a seed value to an ARGB color value.__

* Supported seed types:
* Numeric color values
* Hex color strings
* Image URLs
* Local file paths (Node.js)
* Blobs
* ImageBitmaps
* ImageData
* HTMLImageElements
* HTMLVideoElements
* VideoFrames
* SVG elements
* Canvas elements (both HTML and Offscreen)

---

### themeFromSeed(seed: ThemeSeed): Promise<Theme>

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

const scheme = toColorScheme(theme, {
  strategy: Strategy
})
````

## TypeScript Reference
```ts
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

type AppendSuffix<T extends string, U extends string> = `${T}${U}`

type AppendLight<T extends string> = AppendSuffix<T, 'Light'>

type AppendDark<T extends string> = AppendSuffix<T, 'Dark'>

export type ColorSchemeLight = {
  [K in keyof BaseColorScheme as AppendLight<K>]: number
}

export type ColorSchemeDark = {
  [K in keyof BaseColorScheme as AppendDark<K>]: number
}

export type OppositeColorScheme<T extends 'light' | 'dark'> = T extends 'dark'
  ? ColorSchemeDark
  : ColorSchemeLight

export type ColorSchemeStrategyMap<V extends 'light' | 'dark'> = {
  'active-only': BaseColorScheme
  'active-with-opposite': BaseColorScheme & OppositeColorScheme<V>
  'split-by-mode': ColorSchemeLight & ColorSchemeDark
  'all-variants': BaseColorScheme & ColorSchemeLight & ColorSchemeDark
}

export type ColorScheme<
  T extends Strategy,
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
