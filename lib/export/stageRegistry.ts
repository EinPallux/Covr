import type Konva from 'konva'

// Module-level reference to the active Konva Stage.
// CanvasStage registers itself here on mount and clears on unmount,
// so the export function can access the stage without prop-drilling.
let _stage: Konva.Stage | null = null

export const stageRegistry = {
  set(stage: Konva.Stage | null) {
    _stage = stage
  },
  get(): Konva.Stage | null {
    return _stage
  },
}
