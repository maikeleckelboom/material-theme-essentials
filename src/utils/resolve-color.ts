import { score } from '../analysis/score'
import { createImageBitmapFromUrl, createImageDataFromSvg } from './image'
import { argbFromHex } from '@material/material-color-utilities'
import type { Seed } from '../scheme/seed-theme'
import { HEX_PATTERN, PATH_PATTERN, URL_PATTERN } from './constants'
import { quantizeAsync } from '../analysis/quantize'

async function getDominantColor(bitmap: ImageBitmap, maxColors?: number): Promise<number> {
  const colorToCount = await quantizeAsync(bitmap, { maxColors })
  const [seedColor] = score(colorToCount, { desired: 1 })
  return seedColor
}

export async function resolveColor(seed: Seed): Promise<number> {
  if (typeof seed === 'number') return seed

  if (typeof seed === 'string') {
    if (new RegExp(HEX_PATTERN, 'i').test(seed)) return argbFromHex(seed)
    if (new RegExp(`(?:${URL_PATTERN})|(?:${PATH_PATTERN})`, 'i').test(seed)) {
      return getDominantColor(await createImageBitmapFromUrl(seed))
    }
    throw new Error('Invalid string seed')
  }

  if (seed instanceof SVGElement) {
    return getDominantColor(await createImageBitmap(await createImageDataFromSvg(seed)))
  }

  if (seed instanceof HTMLImageElement || seed instanceof SVGImageElement) {
    return getDominantColor(await createImageBitmap(seed))
  }

  if (!seed) throw new Error('Invalid seed')

  return seed instanceof ImageBitmap
    ? getDominantColor(seed)
    : getDominantColor(await createImageBitmap(seed))
}
