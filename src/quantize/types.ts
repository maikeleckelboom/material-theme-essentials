export interface QuantizeWorkerOptions {
  maxColors?: number
  abortSignal?: AbortSignal
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

export type QuantizeWorkerData = QuantizeWorkerEvent['data']

export type QuantizeWorkerResult = QuantizeWorkerDoneData['colorToCount']
