import { create } from 'zustand'

export type ActiveTool = 'select' | 'hand' | 'text' | 'comment'
export interface GuideLine { id: string; orientation: 'horizontal' | 'vertical'; position: number }
const ZOOM_MIN = 0.05
const ZOOM_MAX = 4
const ZOOM_STEP = 0.1
const clampZoom = (zoom: number) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round(zoom * 100) / 100))

interface UIState {
  zoom: number
  panOffset: { x: number; y: number }
  activeTool: ActiveTool
  isExporting: boolean
  snapEnabled: boolean
  panels: { layers: boolean; properties: boolean }
  guideLines: GuideLine[]
  containerSize: { width: number; height: number }
  canvasSize: { width: number; height: number }
}

interface UIActions {
  setZoom: (zoom: number) => void
  zoomIn: () => void
  zoomOut: () => void
  fitToScreen: (containerWidth?: number, containerHeight?: number) => void
  resetZoom: () => void
  setPanOffset: (offset: { x: number; y: number }) => void
  setActiveTool: (tool: ActiveTool) => void
  setExporting: (exporting: boolean) => void
  toggleSnap: () => void
  setGuideLines: (lines: GuideLine[]) => void
  clearGuideLines: () => void
  togglePanel: (panel: 'layers' | 'properties') => void
  setContainerSize: (width: number, height: number) => void
  setCanvasSize: (width: number, height: number) => void
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
  canvasSize: { width: 1080, height: 1080 },
  setZoom: (zoom) => set({ zoom: clampZoom(zoom) }),
  zoomIn: () => set((state) => ({ zoom: clampZoom(state.zoom + ZOOM_STEP) })),
  zoomOut: () => set((state) => ({ zoom: clampZoom(state.zoom - ZOOM_STEP) })),
  fitToScreen: (containerWidth, containerHeight) => {
    const state = get()
    const width = containerWidth ?? state.containerSize.width
    const height = containerHeight ?? state.containerSize.height
    if (!width || !height) return
    const padding = 96
    const zoom = Math.min((width - padding) / state.canvasSize.width, (height - padding) / state.canvasSize.height)
    set({ zoom: clampZoom(zoom), panOffset: { x: 0, y: 0 } })
  },
  resetZoom: () => get().fitToScreen(),
  setPanOffset: (panOffset) => set({ panOffset }),
  setActiveTool: (activeTool) => set({ activeTool }),
  setExporting: (isExporting) => set({ isExporting }),
  toggleSnap: () => set((state) => ({ snapEnabled: !state.snapEnabled })),
  setGuideLines: (guideLines) => set({ guideLines }),
  clearGuideLines: () => set({ guideLines: [] }),
  togglePanel: (panel) => set((state) => ({ panels: { ...state.panels, [panel]: !state.panels[panel] } })),
  setContainerSize: (width, height) => set({ containerSize: { width, height } }),
  setCanvasSize: (width, height) => set({ canvasSize: { width, height } }),
}))
