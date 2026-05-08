import { create } from 'zustand'
import type { Template, Layer } from '@/lib/templates/schema'
import { generateId } from '@/lib/utils/idgen'

interface EditorState {
  template: Template | null
  layers: Layer[]
  selectedIds: string[]
  editingTextId: string | null
}

interface EditorActions {
  loadTemplate: (template: Template) => void
  updateLayer: (id: string, patch: Partial<Layer>) => void
  reorderLayers: (fromIndex: number, toIndex: number) => void
  setSelectedIds: (ids: string[]) => void
  toggleSelectedId: (id: string, multi: boolean) => void
  setEditingText: (id: string | null) => void
  duplicateLayer: (id: string) => void
  removeLayer: (id: string) => void
  setLayerVisibility: (id: string, visible: boolean) => void
  setLayerLock: (id: string, locked: boolean) => void
  replaceLayerImage: (id: string, src: string) => void
  reset: () => void
}

const initialState: EditorState = {
  template: null,
  layers: [],
  selectedIds: [],
  editingTextId: null,
}

export const useEditorStore = create<EditorState & EditorActions>((set, get) => ({
  ...initialState,

  loadTemplate: (template) => {
    set({
      template,
      layers: JSON.parse(JSON.stringify(template.layers)),
      selectedIds: [],
      editingTextId: null,
    })
  },

  updateLayer: (id, patch) => {
    set((state) => ({
      layers: state.layers.map((l) => (l.id === id ? ({ ...l, ...patch } as Layer) : l)),
    }))
  },

  reorderLayers: (fromIndex, toIndex) => {
    set((state) => {
      const layers = [...state.layers]
      const [moved] = layers.splice(fromIndex, 1)
      layers.splice(toIndex, 0, moved)
      return { layers }
    })
  },

  setSelectedIds: (ids) => set({ selectedIds: ids }),

  toggleSelectedId: (id, multi) => {
    const { selectedIds } = get()
    if (multi) {
      set({
        selectedIds: selectedIds.includes(id)
          ? selectedIds.filter((sid) => sid !== id)
          : [...selectedIds, id],
      })
    } else {
      set({ selectedIds: [id] })
    }
  },

  setEditingText: (id) => set({ editingTextId: id }),

  duplicateLayer: (id) => {
    const state = get()
    const layer = state.layers.find((l) => l.id === id)
    if (!layer) return

    const duplicate: Layer = {
      ...JSON.parse(JSON.stringify(layer)),
      id: generateId(),
      name: `${layer.name} Copy`,
      x: layer.x + 20,
      y: layer.y + 20,
    }

    const idx = state.layers.findIndex((l) => l.id === id)
    const layers = [...state.layers]
    layers.splice(idx + 1, 0, duplicate)
    set({ layers, selectedIds: [duplicate.id] })
  },

  removeLayer: (id) => {
    set((state) => ({
      layers: state.layers.filter((l) => l.id !== id),
      selectedIds: state.selectedIds.filter((sid) => sid !== id),
      editingTextId: state.editingTextId === id ? null : state.editingTextId,
    }))
  },

  setLayerVisibility: (id, visible) => {
    set((state) => ({
      layers: state.layers.map((l) => (l.id === id ? { ...l, visible } : l)),
    }))
  },

  setLayerLock: (id, locked) => {
    set((state) => ({
      layers: state.layers.map((l) => (l.id === id ? { ...l, locked } : l)),
    }))
  },

  replaceLayerImage: (id, src) => {
    set((state) => ({
      layers: state.layers.map((l) => (l.id === id && l.type === 'image' ? { ...l, src } : l)),
    }))
  },

  reset: () => set(initialState),
}))
