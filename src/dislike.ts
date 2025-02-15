import { DislikeAnalyzer, Hct } from '@material/material-color-utilities'

export function isDisliked(color: number) {
  const hct = Hct.fromInt(color)
  return DislikeAnalyzer.isDisliked(hct)
}

export function fixIfDisliked(color: number) {
  const hct = Hct.fromInt(color)
  return DislikeAnalyzer.fixIfDisliked(hct).toInt()
}
