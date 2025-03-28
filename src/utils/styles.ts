import {hexFromArgb} from '@material/material-color-utilities'
import kebabCase from 'kebab-case'

export function tokensFromColorScheme(
    colorScheme: Record<string, string | number>,
    prefix = '',
    suffix = '',
) {
    const cssVariables: Record<string, string> = {}
    for (const [key, value] of Object.entries(colorScheme)) {
        const cssKey = kebabCase(`${prefix}${key}${suffix}`)
        cssVariables[`--${cssKey}`] = typeof value === 'number' ? hexFromArgb(value) : value
    }
    return cssVariables
}
