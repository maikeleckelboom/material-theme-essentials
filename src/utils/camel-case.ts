import type { CamelCase } from 'type-fest'

export function camelCase<S extends string>(str: S): CamelCase<S> {
  const words = str.match(/\p{Lu}?\p{Ll}+|\p{Lu}+(?!\p{Ll})|\d+/gu) || []
  return words
    .map((word, index) =>
      index === 0
        ? word.toLowerCase()
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
    )
    .join('') as CamelCase<S>
}