import { beforeAll, describe, expect, it } from 'vitest'
import { createMaterialTheme, Seed } from '../src/theme'
import { argbFromHex } from '@material/material-color-utilities'
import { createImageDataFromSVG } from '../src/image'

const TEST_IMAGE_URL: string = 'https://i.ibb.co/hV3qmLK/Cloudtion-Example.jpg'
const TEST_VIDEO_URL: string = 'https://www.w3schools.com/html/mov_bbb.mp4'
const TEST_REL_PATH: string = '../../../assets/wallpaper-small.webp'

function createSVGRoot(width = 50, height = 50): SVGSVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.setAttribute('width', width.toString())
  svg.setAttribute('height', height.toString())
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
  return svg
}

function createSVGWithFill(
  fill: string = 'grey',
  width = 50,
  height = 50,
): SVGSVGElement {
  const svg = createSVGRoot()
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  rect.setAttribute('width', width.toString())
  rect.setAttribute('height', height.toString())
  rect.setAttribute('fill', fill)
  svg.appendChild(rect)
  return svg
}

function createCanvasElement(
  fill = '#FFC157',
  width = 50,
  height = 50,
): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')!
  context.fillStyle = fill
  context.fillRect(0, 0, width, height)
  return canvas
}

function createOffscreenCanvas(
  fill = '#FFC157',
  width = 50,
  height = 50,
): OffscreenCanvas {
  const canvas = new OffscreenCanvas(width, height)
  const context = canvas.getContext('2d')!
  context.fillStyle = fill
  context.fillRect(0, 0, width, height)
  return canvas
}

function createImageElement(url: string = TEST_IMAGE_URL): HTMLImageElement {
  const image = new Image()
  image.crossOrigin = 'anonymous'
  image.src = url
  return image
}

function createVideoElement(url: string = TEST_VIDEO_URL): HTMLVideoElement {
  const video = document.createElement('video')
  video.src = url
  video.muted = true
  video.playsInline = true
  return video
}

async function createBlob(): Promise<Blob> {
  const res = await fetch(TEST_IMAGE_URL, { mode: 'cors' })
  return res.blob()
}

let blob: Blob
let htmlImageElement: HTMLImageElement
let htmlVideoElement: HTMLVideoElement
let svgElement: SVGSVGElement

beforeAll(async () => {
  blob = await createBlob()
  htmlImageElement = createImageElement()
  htmlVideoElement = createVideoElement()
  svgElement = createSVGWithFill('red')
})

describe('createMaterialTheme', () => {
  describe('Basic Input Types', () => {
    const basicInputTypes: { name: string; seed: Seed | (() => Seed) }[] = [
      { name: 'ARGB', seed: argbFromHex('#00bbff') },
      { name: 'HEX', seed: '#00bbff' },
      { name: 'Url', seed: TEST_IMAGE_URL },
      { name: 'RelPath', seed: TEST_REL_PATH },
      { name: 'Blob', seed: () => blob },
    ]

    basicInputTypes.forEach(({ name, seed }) => {
      it(`creates a valid theme from ${name}`, async () => {
        const actualSeed = typeof seed === 'function' ? seed() : seed
        const theme = await createMaterialTheme({ seed: actualSeed })
        expect(theme.seed).toBeDefined()
      })
    })
  })

  describe('Media Elements', () => {
    const mediaElements: { name: string; seed: () => Seed }[] = [
      { name: 'SVGElement', seed: () => svgElement },
      { name: 'HTMLImageElement', seed: () => htmlImageElement },
    ]

    mediaElements.forEach(({ name, seed }) => {
      it(`creates a valid theme from ${name}`, async () => {
        const actualSeed = seed()
        const theme = await createMaterialTheme({ seed: actualSeed })
        expect(theme.seed).toBeDefined()
      })
    })

    it('creates a valid theme from HTMLVideoElement', async () => {
      const video = htmlVideoElement
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')!
      video.onseeked = async () => {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight)
        const imageBitmap = await createImageBitmap(canvas)
        const videoFrame = new VideoFrame(imageBitmap)
        const theme = await createMaterialTheme({ seed: videoFrame })
        expect(theme.seed).toBeDefined()
      }
    })
  })

  describe('Color Verification', () => {
    const colorCases = [
      {
        name: 'ImageData from SVG with red fill',
        setup: async () => {
          const svg = createSVGWithFill('red')
          return createImageDataFromSVG(svg)
        },
        expected: [255, 0, 0, 255],
      },
      {
        name: 'HTMLCanvasElement with green fill',
        setup: async () => createCanvasElement('green'),
        expected: [0, 128, 0, 255],
      },
      {
        name: 'OffscreenCanvas with blue fill',
        setup: async () => createOffscreenCanvas('blue'),
        expected: [0, 0, 255, 255],
      },
    ]

    colorCases.forEach(({ name, setup, expected }) => {
      it(name, async () => {
        const seed = await setup()
        const theme = await createMaterialTheme({ seed })
        const color =
          theme.seed instanceof ImageData
            ? theme.seed.data.slice(0, 4)
            : (theme.seed as HTMLCanvasElement)
                .getContext('2d')!
                .getImageData(0, 0, 1, 1)
                .data.slice(0, 4)
        expect(color).toEqual(new Uint8ClampedArray(expected))
      })
    })
  })
})
