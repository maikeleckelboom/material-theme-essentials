export enum ContrastLevel {
  Reduced = -1,
  Default = 0,
  Medium = 0.3,
  High = 0.6,
}

export function listContrastLevels(){
  return Object.entries(ContrastLevel).map(([key, value]) => ({
    key,
    value,
  }))
}