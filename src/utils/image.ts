import { argbFromRgb } from '@material/material-color-utilities'
import { PATH_PATTERN } from './constants'

export function createPixelsArray({ data }: ImageData): number[] {
  const pixels: number[] = []
  const len = data.length
  for (let i = 0; i < len; i += 4) {
    const [r, g, b, a] = data.slice(i, i + 4)
    if (a === 255) pixels.push(argbFromRgb(r!, g!, b!))
  }
  return pixels
}

function createCanvasContext(
  width: number,
  height: number,
): OffscreenCanvasRenderingContext2D {
  const canvas = new OffscreenCanvas(width, height)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D context unavailable')
  return context
}

export function createImageDataFromBitmap(bitmap: ImageBitmap): ImageData {
  const context = createCanvasContext(bitmap.width, bitmap.height)
  context.drawImage(bitmap, 0, 0)
  return context.getImageData(0, 0, bitmap.width, bitmap.height)
}

export async function createImageBitmapFromUrl(
  url: string,
  signal?: AbortSignal,
): Promise<ImageBitmap> {
  if (!createImageBitmap) throw new Error('createImageBitmap API unavailable')
  const pathRegex = new RegExp(PATH_PATTERN, 'i')
  const resolvedUrl = pathRegex.test(url) ? new URL(url, location.href).href : url
  const response = await fetch(resolvedUrl, { signal, mode: 'cors' })
  const blob = await response.blob()
  return createImageBitmap(blob)
}

export async function createImageDataFromSvg(
  svg: SVGElement,
  signal?: AbortSignal,
): Promise<ImageData> {
  const url = URL.createObjectURL(
    new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml' }),
  )

  try {
    const img = await Promise.race([
      new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve(image)
        image.onerror = reject
        image.src = url
        signal?.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')),
        )
      }),
      new Promise<never>((_, reject) => {
        signal?.addEventListener('abort', () =>
          reject(new DOMException('Aborted', 'AbortError')),
        )
      }),
    ])

    const context = createCanvasContext(img.naturalWidth, img.naturalHeight)
    context.drawImage(img, 0, 0)
    return context.getImageData(0, 0, img.naturalWidth, img.naturalHeight)
  } finally {
    URL.revokeObjectURL(url)
  }
}
