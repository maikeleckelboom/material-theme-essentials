import { quantizeImage } from './quantize/utils'
import { score } from './score'
import {
  createImageBitmapFromURL,
  createImageDataFromSVGElement,
  hexRegex,
  urlOrPathRegex,
} from './image'
import { argbFromHex } from '@material/material-color-utilities'

async function analyzeImageForDominantColor(bitmap: ImageBitmap): Promise<number> {
  const colorToCount = await quantizeImage(bitmap)
  const [seedColor] = score(colorToCount, { desired: 1 })
  return seedColor
}

export async function resolveSeedToSourceColor(
  seed: ImageBitmapSource | SVGElement | number | string | undefined,
): Promise<number> {
  // Handle simple numeric case immediately
  if (typeof seed === 'number') return seed

  // Handle string inputs (hex colors or URLs)
  if (typeof seed === 'string') {
    if (hexRegex.test(seed)) return argbFromHex(seed)
    if (urlOrPathRegex.test(seed)) {
      return analyzeImageForDominantColor(await createImageBitmapFromURL(seed))
    }
  }

  // Handle canvas and blob inputs directly
  if (seed instanceof HTMLCanvasElement || seed instanceof Blob) {
    return analyzeImageForDominantColor(await createImageBitmap(seed))
  }

  // Handle image elements with URL sources
  if (seed instanceof HTMLImageElement || seed instanceof SVGImageElement) {
    const url = seed instanceof HTMLImageElement ? seed.src : seed.href.baseVal
    return analyzeImageForDominantColor(await createImageBitmapFromURL(url))
  }

  // Handle SVG elements through intermediate ImageData
  if (seed instanceof SVGElement) {
    const imageData = await createImageDataFromSVGElement(seed)
    return analyzeImageForDominantColor(await createImageBitmap(imageData))
  }

  // Handle raw image data
  if (seed instanceof ImageData) {
    return analyzeImageForDominantColor(await createImageBitmap(seed))
  }

  // Handle already prepared image bitmaps
  if (seed instanceof ImageBitmap) {
    return analyzeImageForDominantColor(seed)
  }

  // Handle video elements
  if (seed instanceof HTMLVideoElement) {
    return analyzeImageForDominantColor(await createImageBitmap(seed))
  }

  // Handle OffscreenCanvas
  if (seed instanceof OffscreenCanvas) {
    return analyzeImageForDominantColor(await createImageBitmap(seed))
  }

  throw new Error('Invalid seed')
}
