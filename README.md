# Material Theme Essentials

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

# Usage

## resolveColorFromSeed

Convert various seed types to ARGB color values:

```ts
import { resolveColorFromSeed, argbFromHex } from 'material-theme-essentials'

// Numeric color
const numericColor = await resolveColorFromSeed(0xff00ff)

// Hex string
const hexColor = await resolveColorFromSeed('#ff00ff')

// Image URL
const imageColor = await resolveColorFromSeed('https://example.com/image.jpg')

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

// SVG element
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
// ... add SVG elements ...
const svgColor = await resolveColorFromSeed(svg)
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
