import { quantizeWorker } from './quantize/utils'
import { score } from './score'
import {
  createImageBitmapFromUrl,
  createImageDataFromSvg,
  HEX_PATTERN,
  PATH_PATTERN,
  URL_PATTERN,
} from './image'
import { argbFromHex } from '@material/material-color-utilities'
import type { Seed } from './themeFromSeed'

const hexRegex = new RegExp(HEX_PATTERN, 'i')
const urlOrPathRegex = new RegExp(`(?:${URL_PATTERN})|(?:${PATH_PATTERN})`, 'i')

async function analyzeImageForDominantColor(
  bitmap: ImageBitmap,
  maxColors?: number,
): Promise<number> {
  const colorToCount = await quantizeWorker(bitmap, { maxColors })
  const [seedColor] = score(colorToCount, { desired: 1 })
  return seedColor
}

export async function resolveColorFromSeed(seed: Seed): Promise<number> {
  if (typeof seed === 'number') return seed

  if (typeof seed === 'string') {
    if (hexRegex.test(seed)) return argbFromHex(seed)
    if (urlOrPathRegex.test(seed)) {
      return analyzeImageForDominantColor(await createImageBitmapFromUrl(seed))
    }
    throw new Error('Invalid string seed')
  }

  if (seed instanceof SVGElement) {
    return analyzeImageForDominantColor(
      await createImageBitmap(await createImageDataFromSvg(seed)),
    )
  }

  if (seed instanceof HTMLImageElement || seed instanceof SVGImageElement) {
    return analyzeImageForDominantColor(await createImageBitmap(seed))
  }

  if (!seed) throw new Error('Invalid seed')

  return seed instanceof ImageBitmap
    ? analyzeImageForDominantColor(seed)
    : analyzeImageForDominantColor(await createImageBitmap(seed))
}
