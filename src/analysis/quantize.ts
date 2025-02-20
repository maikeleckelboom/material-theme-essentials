import { QuantizerCelebi } from '@material/material-color-utilities'
import type {
  QuantizeWorker,
  QuantizeWorkerDoneEvent,
  QuantizeWorkerEvent,
  QuantizeWorkerOptions,
  QuantizeWorkerResult,
  QuantizeWorkerStartEvent,
} from './quantize-worker'

export function createQuantizeWorker(): QuantizeWorker {
  return new Worker(new URL('./quantize-worker.ts', import.meta.url), { type: 'module' })
}

export function isStartEvent(event: QuantizeWorkerEvent): event is QuantizeWorkerStartEvent {
  return event.data.type === 'start'
}

export function isDoneEvent(event: QuantizeWorkerEvent): event is QuantizeWorkerDoneEvent {
  return event.data.type === 'done'
}

export function quantize(pixels: number[], maxColors: number = 200): Map<number, number> {
  return QuantizerCelebi.quantize(pixels, maxColors)
}

export async function quantizeAsync(
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
