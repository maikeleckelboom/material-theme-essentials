import { beforeAll, describe, expect, it } from 'vitest'
import { createMaterialTheme } from '../src/scheme/create-material-theme'

beforeAll(async () => {})

describe('createMaterialTheme', () => {
  it('should accept an direct argument', async () => {
    const theme = await createMaterialTheme(0xff00ff)
    expect(theme).toBeDefined()
  })

  it('should accept an options object', async () => {
    const theme = await createMaterialTheme({
      seed: 0xff00ff,
    })
    expect(theme).toBeDefined()
  })
})
