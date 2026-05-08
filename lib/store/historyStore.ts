import { create } from 'zustand'
import type { Layer } from '@/lib/templates/schema'
import { useEditorStore } from './editorStore'

const MAX_HISTORY = 100

interface HistoryState {
  past: Layer[][]
  future: Layer[][]
}

interface HistoryActions {
  /** Call with the layer state BEFORE making a change. */
  commit: (layersBefore: Layer[]) => void
  undo: () => void
  redo: () => void
  clear: () => void
  canUndo: () => boolean
  canRedo: () => boolean
}

export const useHistoryStore = create<HistoryState & HistoryActions>((set, get) => ({
  past: [],
  future: [],

  commit: (layersBefore) => {
    set((state) => {
      const snapshot: Layer[] = JSON.parse(JSON.stringify(layersBefore))
      const past = [...state.past, snapshot]
      return {
        past: past.length > MAX_HISTORY ? past.slice(-MAX_HISTORY) : past,
        future: [],
      }
    })
  },

  undo: () => {
    const { past } = get()
    if (past.length === 0) return

    // Current layers before undo become the future
    const currentLayers: Layer[] = JSON.parse(
      JSON.stringify(useEditorStore.getState().layers),
    )

    const previous = past[past.length - 1]

    set((state) => ({
      past: state.past.slice(0, -1),
      future: [currentLayers, ...state.future],
    }))

    useEditorStore.setState({ layers: JSON.parse(JSON.stringify(previous)), selectedIds: [] })
  },

  redo: () => {
    const { future } = get()
    if (future.length === 0) return

    const currentLayers: Layer[] = JSON.parse(
      JSON.stringify(useEditorStore.getState().layers),
    )

    const next = future[0]

    set((state) => ({
      future: state.future.slice(1),
      past: [...state.past, currentLayers],
    }))

    useEditorStore.setState({ layers: JSON.parse(JSON.stringify(next)), selectedIds: [] })
  },

  clear: () => set({ past: [], future: [] }),

  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
}))

/** Helper: snapshot current layers, then run a mutating action. */
export function withHistory(action: () => void) {
  const before = useEditorStore.getState().layers
  useHistoryStore.getState().commit(before)
  action()
}
