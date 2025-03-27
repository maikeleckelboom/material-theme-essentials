import { score } from '../analysis/score'
import { createImageBitmapFromUrl, createImageDataFromSvg } from './image'
import { argbFromHex } from '@material/material-color-utilities'
import type { Seed } from '../scheme/create-material-theme'
import { HEX_PATTERN, PATH_PATTERN, URL_PATTERN } from './constants'
import { quantize } from '../analysis/quantize'

async function getMostSuitableColor(bitmap: ImageBitmap): Promise<number> {
  const colorToCount = await quantize(bitmap)
  const [seedColor] = score(colorToCount, { desired: 1 })
  return seedColor
}

export async function resolveSourceColor(seed: Seed): Promise<number> {
  if (typeof seed === 'number') return seed

  if (typeof seed === 'string') {
    if (new RegExp(HEX_PATTERN, 'i').test(seed)) return argbFromHex(seed)
    if (new RegExp(`(?:${URL_PATTERN})|(?:${PATH_PATTERN})`, 'i').test(seed)) {
      return getMostSuitableColor(await createImageBitmapFromUrl(seed))
    }
    throw new Error('Invalid string seed')
  }

  if (seed instanceof SVGElement) {
    return getMostSuitableColor(await createImageBitmap(await createImageDataFromSvg(seed)))
  }

  if (seed instanceof HTMLImageElement || seed instanceof SVGImageElement) {
    return getMostSuitableColor(await createImageBitmap(seed))
  }

  if (!seed) throw new Error('Invalid seed')

  return seed instanceof ImageBitmap
    ? getMostSuitableColor(seed)
    : getMostSuitableColor(await createImageBitmap(seed))
}
