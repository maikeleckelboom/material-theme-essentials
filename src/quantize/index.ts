import type { QuantizeWorkerData } from './types'

export type QuantizeWorker = Omit<Worker, 'postMessage'> & {
  postMessage(message: QuantizeWorkerData, transfer?: Transferable[]): void
}

export function createQuantizeWorker(): QuantizeWorker {
  return new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
}
