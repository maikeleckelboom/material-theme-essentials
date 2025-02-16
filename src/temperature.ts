import { Hct, TemperatureCache } from '@material/material-color-utilities'
import { toHctArray } from './hct'

export function isCold(color: number) {
  const hct = Hct.fromInt(color)
  const cache = new TemperatureCache(hct)
  return cache.inputRelativeTemperature <= 0.5
}

export function isWarm(color: number) {
  const hct = Hct.fromInt(color)
  const cache = new TemperatureCache(hct)
  return cache.inputRelativeTemperature > 0.5
}

export function getColdestColor(argbColors: number[]): Hct {
  const colors = toHctArray(argbColors)
  return colors.reduce((coldest, current) => {
    const cache = new TemperatureCache(coldest)
    return cache.relativeTemperature(current) < cache.relativeTemperature(coldest)
      ? current
      : coldest
  })
}

export function getWarmestColor(argbColors: number[]): Hct {
  const colors = toHctArray(argbColors)
  return colors.reduce((warmest, current) => {
    const cache = new TemperatureCache(warmest)
    return cache.relativeTemperature(current) > cache.relativeTemperature(warmest)
      ? current
      : warmest
  })
}
export function isComplementaryColor(color1: number, color2: number) {
  const hct1 = Hct.fromInt(color1)
  const hct2 = Hct.fromInt(color2)
  const cache1 = new TemperatureCache(hct1)
  return cache1.complement === hct2
}

export function isAnalogousColor(color1: number, color2: number) {
  const hct1 = Hct.fromInt(color1)
  const hct2 = Hct.fromInt(color2)
  const cache1 = new TemperatureCache(hct1)
  return cache1.analogous().includes(hct2)
}

export function sortColorsByWarmth(colors: Hct[], cache: TemperatureCache): Hct[] {
  return [...colors].sort(
    (a, b) => cache.relativeTemperature(a) - cache.relativeTemperature(b),
  )
}

export function sortColorsByCoolness(colors: Hct[], cache: TemperatureCache): Hct[] {
  return [...colors].sort(
    (a, b) => cache.relativeTemperature(b) - cache.relativeTemperature(a),
  )
}

export function isColorBetween(angle: number, color1: number, color2: number): boolean {
  return TemperatureCache.isBetween(angle, color1, color2)
}

export function getColorsByHueRange(
  cache: TemperatureCache,
  minHue: number,
  maxHue: number,
): Hct[] {
  return cache.hctsByHue.filter((hct) => {
    const hue = hct.hue
    return hue >= minHue && hue <= maxHue
  })
}

export function getClosestColorByTemperature(
  cache: TemperatureCache,
  targetTemp: number,
): Hct | null {
  let closest: Hct | null = null
  let smallestDiff = Infinity

  cache.hctsByTemp.forEach((hct) => {
    const diff = Math.abs(cache.relativeTemperature(hct) - targetTemp)
    if (diff < smallestDiff) {
      closest = hct
      smallestDiff = diff
    }
  })

  return closest
}
