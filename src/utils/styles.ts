import { hexFromArgb } from '@material/material-color-utilities'
import kebabCase from 'kebab-case'
import type { KebabCase } from 'type-fest'

export function colorsToVariables<T extends Record<string, string | number>>(
  colors: T,
): { [K in keyof T as `--${KebabCase<K & string>}`]: string } {
  const cssVariables = {} as Record<string, string>

  for (const [key, value] of Object.entries(colors)) {
    const cssKey = `--${kebabCase(key)}`
    cssVariables[cssKey] = typeof value === 'number' ? hexFromArgb(value) : value
  }

  return cssVariables as { [K in keyof T as `--${KebabCase<K & string>}`]: string }
}
