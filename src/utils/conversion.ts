import { argbFromHex } from '@material/material-color-utilities'

/** Convert color to ARGB format */
export function colorToArgb(color: string | number) {
  return typeof color === 'string' ? argbFromHex(color) : color
}
