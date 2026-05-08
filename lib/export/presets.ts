export type ExportFormat = 'png' | 'jpg'

// How to fit the 1920×1080 source canvas into a different target size.
// contain — scale to fit, add transparent/white bars (no cropping)
// cover   — scale to fill, crop the excess from center
// native  — source and target are the same size, no scaling needed
export type FitMode = 'contain' | 'cover' | 'native'

export interface ExportPreset {
  readonly id: string
  readonly label: string
  readonly sublabel: string
  readonly width: number
  readonly height: number
  readonly defaultFormat: ExportFormat
  readonly defaultQuality: number // 0–1, used for JPG
  readonly fitMode: FitMode
}

// Canvas source dimensions (must match CanvasStage constants)
export const SOURCE_W = 1920
export const SOURCE_H = 1080

export const EXPORT_PRESETS: readonly ExportPreset[] = [
  {
    id: 'buildbybbit',
    label: 'BuiltByBit Cover',
    sublabel: '1024 × 512',
    width: 1024,
    height: 512,
    defaultFormat: 'png',
    defaultQuality: 1.0,
    fitMode: 'contain',
  },
  {
    id: 'native',
    label: 'Full Resolution',
    sublabel: '1920 × 1080',
    width: 1920,
    height: 1080,
    defaultFormat: 'png',
    defaultQuality: 1.0,
    fitMode: 'native',
  },
] as const

export const DEFAULT_PRESET = EXPORT_PRESETS[0]
