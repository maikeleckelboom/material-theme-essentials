import { Score } from '@material/material-color-utilities'

/**
 * Default options for ranking colors based on usage counts.
 * desired: is the max count of the colors returned.
 * fallbackColorARGB: Is the default color that should be used if no
 *                    other colors are suitable.
 * filter: controls if the resulting colors should be filtered to not include
 *         hues that are not used often enough, and colors that are effectively
 *         grayscale.
 */
export interface ScoreOptions {
  desired?: number
  fallbackColorARGB?: number
  filter?: boolean
}

/**
 * Ranks colors based on usage counts; previously known as 'scoreByMostSuitable'.
 *
 * @param colorToCount - A map of color ARGB values to their usage counts.
 * @param options - Options for ranking colors based on usage counts.
 * @returns The top colors based on usage counts.
 */
export function score(
  colorToCount: Map<number, number>,
  options: ScoreOptions = {},
): [number, ...number[]] {
  return Score.score(colorToCount, options) as [number, ...number[]]
}
