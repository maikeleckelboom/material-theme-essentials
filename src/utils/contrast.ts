export enum Contrast {
  Reduced = -1,
  Default = 0,
  Medium = 0.5,
  High = 1,
}

export const contrastLevels = Object.values(Contrast).filter(
  (value) => typeof value === 'number',
) as number[]
