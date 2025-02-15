import { isStartEvent } from './guards'
import type { QuantizeWorkerEvent } from './types'
import { createImageDataFromBitmap, pixelsFromImageData } from '../image'
import { quantize } from './index'

async function onMessage(event: QuantizeWorkerEvent) {
  if (!isStartEvent(event)) return
  const imageData = createImageDataFromBitmap(event.data.image)
  const pixels = pixelsFromImageData(imageData)
  const colorToCount = quantize(pixels, event.data.maxColors)
  self.postMessage({
    type: 'done',
    colorToCount,
  })
}

if (typeof self !== 'undefined') {
  self.addEventListener('message', onMessage)
}
