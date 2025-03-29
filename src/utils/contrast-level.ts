export enum ContrastLevel {
  Reduced = -1,
  Default = 0,
  Medium = 0.25,
  High = 0.5,
}

export function listContrastLevels(){
  return Object.entries(ContrastLevel).map(([key, value]) => ({
    key,
    value,
  }))
}