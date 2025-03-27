import { createImageDataFromBitmap, createPixelsArray } from '../utils/image'
import { isStartEvent, quantize } from './quantize'

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

function onMessage(event: QuantizeWorkerEvent) {
  if (!isStartEvent(event)) return
  const imageData = createImageDataFromBitmap(event.data.image)
  const pixels = createPixelsArray(imageData)
  const colorToCount = quantize(pixels, event.data.maxColors)
  self.postMessage({
    type: 'done',
    colorToCount,
  })
}

if (typeof self !== 'undefined') {
  self.addEventListener('message', onMessage)
}
