import type { QuantizeWorkerData } from './types'
import { QuantizerCelebi } from '@material/material-color-utilities'

export function quantize(pixels: number[], maxColors: number = 200): Map<number, number> {
  return QuantizerCelebi.quantize(pixels, maxColors)
}

export type QuantizeWorker = Omit<Worker, 'postMessage'> & {
  postMessage(message: QuantizeWorkerData): void
}

export function createQuantizeWorker(): QuantizeWorker {
  return new Worker(new URL('./worker.ts', import.meta.url), { type: 'module' })
}
