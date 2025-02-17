// import { BaseColorScheme } from '../types/color-scheme'
//
// type AppendSuffix<T extends string, U extends string> = `${T}${U}`
// type AppendLight<T extends string> = AppendSuffix<T, 'Light'>
// type AppendDark<T extends string> = AppendSuffix<T, 'Dark'>
//
// export type ColorSchemeLight = {
//   [K in keyof BaseColorScheme as AppendLight<K>]: number
// }
// export type ColorSchemeDark = {
//   [K in keyof BaseColorScheme as AppendDark<K>]: number
// }
//
// // Corrected to return the opposite scheme
// export type ActiveWithOpposite<T extends 'light' | 'dark'> = T extends 'dark'
//   ? ColorSchemeLight
//   : ColorSchemeDark
//
// export type ColorSchemeStrategyMap<V extends 'light' | 'dark'> = {
//   'active-only': BaseColorScheme
//   'active-with-opposite': BaseColorScheme & ActiveWithOpposite<V>
//   'split-by-mode': ColorSchemeLight & ColorSchemeDark
//   'all-variants': BaseColorScheme & ColorSchemeLight & ColorSchemeDark
// }

// export type Strategy = keyof ColorSchemeStrategyMap<never>

// export type ColorScheme<
//   T extends Strategy,
//   V extends 'light' | 'dark' = 'light' | 'dark',
// > = ColorSchemeStrategyMap<V>[T]

// Example usage with correct types
// declare function toColorScheme<V extends 'light' | 'dark'>(
//   theme: ColorSchemeSource,
//   options: { strategy: 'active-with-opposite', dark: V }
// ): ColorScheme<'active-with-opposite', V>;
