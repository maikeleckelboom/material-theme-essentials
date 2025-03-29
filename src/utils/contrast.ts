import { argbFromLstar, Contrast, lstarFromArgb } from '@material/material-color-utilities'

function findMaxContrastVariant(baseTone: number, direction: 'darker' | 'lighter'): number {
  const isDarker = direction === 'darker'
  let [low, high] = isDarker ? [0, baseTone] : [baseTone, 100]
  let bestTone = baseTone

  while (low <= high) {
    const mid = Math.round((low + high) / 2)
    const ratio = Contrast.ratioOfTones(baseTone, mid)

    if (ratio > 1) {
      bestTone = mid
      if (isDarker) {
        high = mid - 1
      } else {
        low = mid + 1
      }
    } else {
      if (isDarker) {
        low = mid + 1
      } else {
        high = mid - 1
      }
    }
  }

  return bestTone
}

function selectOptimalContrast(
  darkContrast: number,
  lightContrast: number,
  darkTone: number,
  lightTone: number,
): number {
  return argbFromLstar(darkContrast >= lightContrast ? darkTone : lightTone)
}

export function contrastColor(color: number): number {
  const BASE_TONE = Math.min(Math.max(lstarFromArgb(color), 0), 100)
  const [darkestTone, lightestTone] = (['darker', 'lighter'] as const).map((dir) =>
    findMaxContrastVariant(BASE_TONE, dir),
  )

  return selectOptimalContrast(
    Contrast.ratioOfTones(BASE_TONE, darkestTone),
    Contrast.ratioOfTones(BASE_TONE, lightestTone),
    darkestTone,
    lightestTone,
  )
}

export function ratioOfTones(color1: number, color2: number): number {
  const tone1 = lstarFromArgb(color1)
  const tone2 = lstarFromArgb(color2)
  return Contrast.ratioOfTones(tone1, tone2)
}

export function contrastRatio(color1: number, color2?: number): number {
  if (color2 === undefined) color2 = contrastColor(color1)
  return Math.floor(ratioOfTones(color1, color2) * 100) / 100
}
