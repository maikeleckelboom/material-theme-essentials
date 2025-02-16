import { createQuantizeWorker } from './index'
import { QuantizeWorkerOptions, QuantizeWorkerResult } from './types'
import { isDoneEvent } from './guards'
import { QuantizerCelebi } from '@material/material-color-utilities'

export function quantize(pixels: number[], maxColors: number = 200): Map<number, number> {
  return QuantizerCelebi.quantize(pixels, maxColors)
}

export async function quantizeWorker(
  image: ImageBitmap,
  options: QuantizeWorkerOptions = {},
): Promise<QuantizeWorkerResult> {
  const worker = createQuantizeWorker()
  const { abortSignal } = options

  return new Promise<QuantizeWorkerResult>((resolve, reject) => {
    const abortHandler = () => {
      worker.terminate()
      reject(new DOMException('The operation was aborted.', 'AbortError'))
    }

    if (abortSignal?.aborted) return abortHandler()
    abortSignal?.addEventListener('abort', abortHandler, { once: true })

    worker.onmessage = (event) => {
      if (isDoneEvent(event)) {
        abortSignal?.removeEventListener('abort', abortHandler)
        resolve(event.data.colorToCount)
        worker.terminate()
      }
    }

    worker.onerror = (error) => {
      abortSignal?.removeEventListener('abort', abortHandler)
      reject(error)
      worker.terminate()
    }

    worker.postMessage({ type: 'start', image, ...options }, [image])
  })
}
