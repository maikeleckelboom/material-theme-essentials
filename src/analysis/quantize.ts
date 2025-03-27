import { QuantizerCelebi } from '@material/material-color-utilities'
import {
  createQuantizeWorker,
  isDoneEvent,
  QuantizeWorkerOptions,
  QuantizeWorkerResult,
} from './quantize.worker'

export const DEFAULT_QUANTIZE_MAX_COLORS: number = 128 as const

export function quantizeSync(
  pixels: number[],
  maxColors: number = DEFAULT_QUANTIZE_MAX_COLORS,
): Map<number, number> {
  return QuantizerCelebi.quantize(pixels, maxColors)
}

export async function quantize(
  imageBitmap: ImageBitmap,
  options: QuantizeWorkerOptions = {},
): Promise<QuantizeWorkerResult> {
  const worker = createQuantizeWorker()
  const { signal } = options

  return new Promise<QuantizeWorkerResult>((resolve, reject) => {
    const abortHandler = () => {
      worker.terminate()
      reject(new DOMException('The operation was aborted.', 'AbortError'))
    }

    if (signal?.aborted) return abortHandler()
    signal?.addEventListener('abort', abortHandler, { once: true })

    worker.onmessage = (event) => {
      if (isDoneEvent(event)) {
        signal?.removeEventListener('abort', abortHandler)
        resolve(event.data.colorToCount)
        worker.terminate()
      }
    }

    worker.onerror = (error) => {
      signal?.removeEventListener('abort', abortHandler)
      reject(error)
      worker.terminate()
    }

    worker.postMessage({ type: 'start', image: imageBitmap, ...options }, [imageBitmap])
  })
}
