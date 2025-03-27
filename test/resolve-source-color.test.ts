import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { resolveSourceColor } from '../src/scheme/resolve-source-color'
import { argbFromHex } from '@material/material-color-utilities'

const IMAGE_PATH: string = new URL('./assets/webp_image.webp', import.meta.url).href
const IMAGE_URL: string =  new URL('./assets/jpeg_image.jpg', import.meta.url).href
const VIDEO_URL: string = new URL('./assets/mp4_video.mp4', import.meta.url).href

let blob: Blob

beforeAll(async () => {
  const res = await fetch(IMAGE_URL, { mode: 'cors' })
  blob = await res.blob()
})

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('resolveSourceColor', () => {
  it('returns the seed if it is a number', async () => {
    const seed = 0xff00ff
    const result = await resolveSourceColor(seed)
    expect(result).toBe(seed)
  })

  it('processes a hex string seed', async () => {
    const seed = '#ff00ff'
    const expected = argbFromHex(seed)
    const result = await resolveSourceColor(seed)
    expect(result).toBe(expected)
  })

  it('processes a URL seed', async () => {
    const result = await resolveSourceColor(IMAGE_URL)
    expect(result).toBeDefined()
  })

  it('processes a relative path seed', async () => {
    const result = await resolveSourceColor(IMAGE_PATH)
    expect(result).toBeDefined()
  })

  it('throws an error for an invalid string seed', async () => {
    const invalidSeed = 'invalid-seed'
    await expect(resolveSourceColor(invalidSeed)).rejects.toThrow()
  })

  it('processes a Blob seed', async () => {
    const result = await resolveSourceColor(blob)
    expect(result).toBeDefined()
  })

  it('processes an ImageBitmap seed', async () => {
    const image = new Image()
    image.src = IMAGE_URL
    image.crossOrigin = 'anonymous'
    await image.decode()
    const bitmap = await createImageBitmap(image)
    const result = await resolveSourceColor(bitmap)
    expect(result).toBeDefined()
  })

  it('processes an HTMLImageElement seed', async () => {
    const image = new Image()
    image.src = IMAGE_URL
    image.crossOrigin = 'anonymous'
    await image.decode()
    const result = await resolveSourceColor(image)
    expect(result).toBeDefined()
  })

  it('processes an HTMLVideoElement seed', async () => {
    const video = document.createElement('video')
    video.src = VIDEO_URL
    video.muted = true
    video.playsInline = true
    video.onload = () => {
      const result = resolveSourceColor(video)
      expect(result).toBeDefined()
    }
  })

  it('processes a VideoFrame seed', async () => {
    const video = document.createElement('video')
    video.src = VIDEO_URL
    video.muted = true
    video.playsInline = true
    video.onload = () => {
      const frame = new VideoFrame(video)
      const result = resolveSourceColor(frame)
      expect(result).toBeDefined()
    }
  })

  it('processes an SVGElement seed', async () => {
    const svgSeed = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('width', '100')
    rect.setAttribute('height', '100')
    rect.setAttribute('fill', '#ff9b00')
    svgSeed.appendChild(rect)
    const expected = 0xffff9b00
    const result = await resolveSourceColor(svgSeed)
    expect(result).toBe(expected)
  })

  it('processes an OffscreenCanvas seed', async () => {
    const canvas = new OffscreenCanvas(100, 100)
    const context = canvas.getContext('2d')!
    context.fillStyle = '#ff0000'
    context.fillRect(0, 0, 100, 100)
    const result = await resolveSourceColor(canvas)
    expect(result).toBe(0xffff0000)
  })

  it('processes an HTMLCanvasElement seed', async () => {
    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 100
    const context = canvas.getContext('2d')!
    context.fillStyle = '#00ff00'
    context.fillRect(0, 0, 100, 100)
    const result = await resolveSourceColor(canvas)
    expect(result).toBe(0xff00ff00)
  })

  it('processes an ImageData seed', async () => {
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    context.fillStyle = '#0000ff'
    context.fillRect(0, 0, 100, 100)
    const imageData = context.getImageData(0, 0, 100, 100)
    const result = await resolveSourceColor(imageData)
    expect(result).toBe(0xff0000ff)
  })
})
