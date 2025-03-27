export type StrategyName =
  | 'adaptive'         // Auto light/dark (system)
  | 'forced-contrast'  // Explicit light + dark
  | 'design-system';    // All variants (Figma-like)

type StrategyType =
  | 'current'          // Only active theme variant
  | 'with-contrast'    // Active + opposite theme colors
  | 'split'            // Separate light/dark variants
  | 'all';             // All possible variants