import { create } from 'zustand'

export type ActiveTool = 'select' | 'hand' | 'text'

export interface GuideLine {
  id: string
  orientation: 'horizontal' | 'vertical'
  position: number
}

const CANVAS_WIDTH = 1920
const CANVAS_HEIGHT = 1080
const ZOOM_MIN = 0.05
const ZOOM_MAX = 4.0
const ZOOM_STEP = 0.1

function clampZoom(z: number) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(z * 100) / 100))
}

interface UIState {
  zoom: number
  panOffset: { x: number; y: number }
  activeTool: ActiveTool
  isExporting: boolean
  snapEnabled: boolean
  panels: { layers: boolean; properties: boolean }
  guideLines: GuideLine[]
  containerSize: { width: number; height: number }
}

interface UIActions {
  setZoom: (zoom: number) => void
  zoomIn: () => void
  zoomOut: () => void
  fitToScreen: (containerWidth: number, containerHeight: number) => void
  resetZoom: () => void
  setPanOffset: (offset: { x: number; y: number }) => void
  setActiveTool: (tool: ActiveTool) => void
  setExporting: (exporting: boolean) => void
  toggleSnap: () => void
  setGuideLines: (lines: GuideLine[]) => void
  clearGuideLines: () => void
  togglePanel: (panel: 'layers' | 'properties') => void
  setContainerSize: (width: number, height: number) => void
}

export const useUIStore = create<UIState & UIActions>((set, get) => ({
  zoom: 0.5,
  panOffset: { x: 0, y: 0 },
  activeTool: 'select',
  isExporting: false,
  snapEnabled: true,
  panels: { layers: true, properties: true },
  guideLines: [],
  containerSize: { width: 0, height: 0 },

  setZoom: (zoom) => set({ zoom: clampZoom(zoom) }),

  zoomIn: () =>
    set((s) => ({ zoom: clampZoom(parseFloat((s.zoom + ZOOM_STEP).toFixed(2))) })),

  zoomOut: () =>
    set((s) => ({ zoom: clampZoom(parseFloat((s.zoom - ZOOM_STEP).toFixed(2))) })),

  fitToScreen: (containerWidth, containerHeight) => {
    const padding = 80
    const zoom = Math.min(
      (containerWidth - padding) / CANVAS_WIDTH,
      (containerHeight - padding) / CANVAS_HEIGHT,
    )
    set({ zoom: clampZoom(zoom), panOffset: { x: 0, y: 0 } })
  },

  resetZoom: () => {
    const { containerSize } = get()
    if (containerSize.width > 0) {
      const padding = 80
      const zoom = Math.min(
        (containerSize.width - padding) / CANVAS_WIDTH,
        (containerSize.height - padding) / CANVAS_HEIGHT,
      )
      set({ zoom: clampZoom(zoom), panOffset: { x: 0, y: 0 } })
    } else {
      set({ zoom: 0.5, panOffset: { x: 0, y: 0 } })
    }
  },

  setPanOffset: (panOffset) => set({ panOffset }),
  setActiveTool: (activeTool) => set({ activeTool }),
  setExporting: (isExporting) => set({ isExporting }),
  toggleSnap: () => set((s) => ({ snapEnabled: !s.snapEnabled })),
  setGuideLines: (guideLines) => set({ guideLines }),
  clearGuideLines: () => set({ guideLines: [] }),
  togglePanel: (panel) =>
    set((s) => ({ panels: { ...s.panels, [panel]: !s.panels[panel] } })),
  setContainerSize: (width, height) => set({ containerSize: { width, height } }),
}))
