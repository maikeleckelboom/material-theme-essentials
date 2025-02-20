import { Score } from '@material/material-color-utilities'

export interface ScoreOptions {
  desired?: number
  filter?: boolean
  fallbackColorARGB?: number
}

export function score(
  colorToCount: Map<number, number>,
  options: ScoreOptions = {},
): [number, ...number[]] {
  return Score.score(colorToCount, options) as [number, ...number[]]
}
