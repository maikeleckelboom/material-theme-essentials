import { argbFromRgb } from '@material/material-color-utilities'

export function createPixelsArray({ data }: ImageData): number[] {
  const pixels: number[] = []
  const len = data.length
  for (let i = 0; i < len; i += 4) {
    const [r, g, b, a] = data.slice(i, i + 4)
    if (a === 255) pixels.push(argbFromRgb(r!, g!, b!))
  }
  return pixels
}
