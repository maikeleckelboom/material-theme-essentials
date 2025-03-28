import { QuantizerCelebi } from '@material/material-color-utilities'
import {
  createQuantizeWorker,
  isDoneEvent,
  type QuantizeWorkerOptions,
  type QuantizeWorkerResult,
} from './quantize.worker'

export const DEFAULT_QUANTIZE_MAX_COLORS: number = 128 as const

export function quantizePixels(
  pixels: number[],
  maxColors: number = DEFAULT_QUANTIZE_MAX_COLORS,
): Map<number, number> {
  return QuantizerCelebi.quantize(pixels, maxColors)
}

export function quantizeSync(imageBitmap: ImageBitmap): Map<number, number> {
  const imageData = new ImageData(imageBitmap.width, imageBitmap.height)
  const ctx = new OffscreenCanvas(imageBitmap.width, imageBitmap.height).getContext('2d')
  ctx?.drawImage(imageBitmap, 0, 0)
  ctx
    ?.getImageData(0, 0, imageBitmap.width, imageBitmap.height)
    .data.forEach((pixel, index) => {
      imageData.data[index] = pixel
    })

  return quantizePixels(Array.from(imageData.data), DEFAULT_QUANTIZE_MAX_COLORS)
}

export async function quantize(
  imageBitmap: ImageBitmap,
  options: QuantizeWorkerOptions = {},
): Promise<QuantizeWorkerResult> {
  const worker = createQuantizeWorker()
  const { signal } = options

  return new Promise<QuantizeWorkerResult>((resolve, reject) => {
    let isCleanedUp = false

    const cleanup = () => {
      if (isCleanedUp) return
      isCleanedUp = true

      signal?.removeEventListener('abort', abortHandler)

      worker.terminate()
      worker.onmessage = null
      worker.onerror = null
    }

    const abortHandler = () => {
      cleanup()
      reject(signal?.reason || new DOMException('Operation aborted', 'AbortError'))
    }

    worker.onmessage = (event) => {
      if (isDoneEvent(event)) {
        cleanup()
        resolve(event.data.colorToCount)
      }
    }

    worker.onerror = (error) => {
      cleanup()
      reject(error.error || new Error('Worker error'))
    }

    if (signal?.aborted) {
      abortHandler()
      return
    }

    signal?.addEventListener('abort', abortHandler, { once: true })

    try {
      worker.postMessage(
        { type: 'start', image: imageBitmap, maxColors: options.maxColors },
        [imageBitmap],
      )
    } catch (error) {
      cleanup()
      reject(error)
    }
  })
}
