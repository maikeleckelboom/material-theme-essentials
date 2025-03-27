import { createImageDataFromBitmap, createPixelsArray } from '../utils/image'
import { quantizePixels } from './quantize'

export interface QuantizeWorkerOptions {
  maxColors?: number
  signal?: AbortSignal
}

export interface QuantizeWorkerStartData extends QuantizeWorkerOptions {
  type: 'start'
  image: ImageBitmap
}

export interface QuantizeWorkerDoneData {
  type: 'done'
  colorToCount: Map<number, number>
}

export type QuantizeWorkerStartEvent = MessageEvent<QuantizeWorkerStartData>

export type QuantizeWorkerDoneEvent = MessageEvent<QuantizeWorkerDoneData>

export type QuantizeWorkerEvent = QuantizeWorkerStartEvent | QuantizeWorkerDoneEvent

export type QuantizeWorkerResult = QuantizeWorkerDoneData['colorToCount']

export type QuantizeWorker = Omit<Worker, 'postMessage'> & {
  postMessage(message: QuantizeWorkerEvent['data'], transfer?: Transferable[]): void
}

export function createQuantizeWorker(): QuantizeWorker {
  return new Worker(new URL('./quantize.worker.ts', import.meta.url), { type: 'module' })
}

export function isStartEvent(event: QuantizeWorkerEvent): event is QuantizeWorkerStartEvent {
  return event.data.type === 'start'
}

export function isDoneEvent(event: QuantizeWorkerEvent): event is QuantizeWorkerDoneEvent {
  return event.data.type === 'done'
}

function onMessage(event: QuantizeWorkerEvent) {
  if (isStartEvent(event)) {
    const imageData = createImageDataFromBitmap(event.data.image)
    const pixels = createPixelsArray(imageData)
    const colorToCount = quantizePixels(pixels, event.data.maxColors)
    self.postMessage({
      type: 'done',
      colorToCount,
    })
  }
}

if (typeof self !== 'undefined') {
  self.addEventListener('message', onMessage)
}
