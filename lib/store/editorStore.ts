import { create } from 'zustand'
import type { Layer } from '@/lib/design/schema'
import type { DesignPage, DesignProject } from '@/lib/projects/schema'
import { generateId } from '@/lib/utils/idgen'

interface EditorState {
  project: DesignProject | null
  activePageId: string | null
  layers: Layer[]
  selectedIds: string[]
  editingTextId: string | null
}

interface EditorActions {
  loadProject: (project: DesignProject) => void
  setProjectName: (name: string) => void
  setActivePage: (id: string) => void
  addPage: (page: DesignPage) => void
  duplicateActivePage: () => void
  removeActivePage: () => void
  renamePage: (id: string, name: string) => void
  setPageBackground: (color: string) => void
  addLayer: (layer: Omit<Layer, 'id'>) => void
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
  groupSelected: () => void
  ungroupSelected: () => void
  moveGroup: (groupId: string, dx: number, dy: number, excludeId: string) => void
  addComment: (text: string, x: number, y: number) => void
  removeComment: (id: string) => void
  reset: () => void
}

const initialState: EditorState = {
  project: null,
  activePageId: null,
  layers: [],
  selectedIds: [],
  editingTextId: null,
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function syncLayers(project: DesignProject | null, pageId: string | null, layers: Layer[]) {
  if (!project || !pageId) return project
  return {
    ...project,
    updatedAt: new Date().toISOString(),
    pages: project.pages.map((page) => page.id === pageId ? { ...page, layers } : page),
  }
}

export const useEditorStore = create<EditorState & EditorActions>((set, get) => ({
  ...initialState,

  loadProject: (project) => {
    const fresh = clone(project)
    const firstPage = fresh.pages[0]
    set({ project: fresh, activePageId: firstPage?.id ?? null, layers: firstPage?.layers ?? [], selectedIds: [], editingTextId: null })
  },

  setProjectName: (name) => set((state) => ({
    project: state.project ? { ...state.project, name, updatedAt: new Date().toISOString() } : null,
  })),

  setActivePage: (id) => set((state) => {
    const page = state.project?.pages.find((item) => item.id === id)
    if (!page) return state
    return { activePageId: id, layers: clone(page.layers), selectedIds: [], editingTextId: null }
  }),

  addPage: (page) => set((state) => {
    if (!state.project) return state
    const nextPage = clone(page)
    return {
      project: { ...state.project, pages: [...state.project.pages, nextPage], updatedAt: new Date().toISOString() },
      activePageId: nextPage.id,
      layers: nextPage.layers,
      selectedIds: [],
      editingTextId: null,
    }
  }),

  duplicateActivePage: () => set((state) => {
    const page = state.project?.pages.find((item) => item.id === state.activePageId)
    if (!state.project || !page) return state
    const groupMap = new Map<string, string>()
    const layers = clone(page.layers).map((layer) => {
      const oldGroup = layer.groupId
      const groupId = oldGroup ? (groupMap.get(oldGroup) ?? generateId()) : undefined
      if (oldGroup && !groupMap.has(oldGroup)) groupMap.set(oldGroup, groupId!)
      return { ...layer, id: generateId(), groupId }
    })
    const duplicate = { ...clone(page), id: generateId(), name: `${page.name} Copy`, layers }
    return {
      project: { ...state.project, pages: [...state.project.pages, duplicate], updatedAt: new Date().toISOString() },
      activePageId: duplicate.id,
      layers,
      selectedIds: [],
      editingTextId: null,
    }
  }),

  removeActivePage: () => set((state) => {
    if (!state.project || state.project.pages.length <= 1) return state
    const index = state.project.pages.findIndex((page) => page.id === state.activePageId)
    const pages = state.project.pages.filter((page) => page.id !== state.activePageId)
    const next = pages[Math.min(Math.max(index, 0), pages.length - 1)]
    return {
      project: { ...state.project, pages, updatedAt: new Date().toISOString() },
      activePageId: next.id,
      layers: clone(next.layers),
      selectedIds: [],
      editingTextId: null,
    }
  }),

  renamePage: (id, name) => set((state) => ({
    project: state.project ? { ...state.project, updatedAt: new Date().toISOString(), pages: state.project.pages.map((page) => page.id === id ? { ...page, name } : page) } : null,
  })),

  setPageBackground: (background) => set((state) => ({
    project: state.project && state.activePageId ? { ...state.project, updatedAt: new Date().toISOString(), pages: state.project.pages.map((page) => page.id === state.activePageId ? { ...page, background } : page) } : null,
  })),

  addLayer: (layerWithoutId) => set((state) => {
    const newLayer = { ...layerWithoutId, id: generateId() } as Layer
    const layers = [...state.layers, newLayer]
    return { layers, project: syncLayers(state.project, state.activePageId, layers), selectedIds: [newLayer.id] }
  }),

  updateLayer: (id, patch) => set((state) => {
    const layers = state.layers.map((layer) => layer.id === id ? ({ ...layer, ...patch } as Layer) : layer)
    return { layers, project: syncLayers(state.project, state.activePageId, layers) }
  }),

  reorderLayers: (fromIndex, toIndex) => set((state) => {
    const layers = [...state.layers]
    const [moved] = layers.splice(fromIndex, 1)
    layers.splice(toIndex, 0, moved)
    return { layers, project: syncLayers(state.project, state.activePageId, layers) }
  }),

  setSelectedIds: (selectedIds) => set({ selectedIds }),
  toggleSelectedId: (id, multi) => {
    const { selectedIds } = get()
    set({ selectedIds: multi ? (selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : [...selectedIds, id]) : [id] })
  },
  setEditingText: (editingTextId) => set({ editingTextId }),

  duplicateLayer: (id) => set((state) => {
    const layer = state.layers.find((item) => item.id === id)
    if (!layer) return state
    const duplicate = { ...clone(layer), id: generateId(), name: `${layer.name} Copy`, x: layer.x + 20, y: layer.y + 20 } as Layer
    const index = state.layers.findIndex((item) => item.id === id)
    const layers = [...state.layers]
    layers.splice(index + 1, 0, duplicate)
    return { layers, project: syncLayers(state.project, state.activePageId, layers), selectedIds: [duplicate.id] }
  }),

  removeLayer: (id) => set((state) => {
    const layers = state.layers.filter((layer) => layer.id !== id)
    return { layers, project: syncLayers(state.project, state.activePageId, layers), selectedIds: state.selectedIds.filter((item) => item !== id), editingTextId: state.editingTextId === id ? null : state.editingTextId }
  }),

  setLayerVisibility: (id, visible) => get().updateLayer(id, { visible }),
  setLayerLock: (id, locked) => get().updateLayer(id, { locked }),
  replaceLayerImage: (id, src) => {
    const layer = get().layers.find((item) => item.id === id)
    if (layer?.type === 'image') get().updateLayer(id, { src })
  },

  groupSelected: () => set((state) => {
    if (state.selectedIds.length < 2) return state
    const groupId = generateId()
    const layers = state.layers.map((layer) => state.selectedIds.includes(layer.id) ? { ...layer, groupId } : layer) as Layer[]
    return { layers, project: syncLayers(state.project, state.activePageId, layers) }
  }),

  ungroupSelected: () => set((state) => {
    const selectedGroups = new Set(state.layers.filter((layer) => state.selectedIds.includes(layer.id)).map((layer) => layer.groupId).filter(Boolean))
    if (!selectedGroups.size) return state
    const layers = state.layers.map((layer) => layer.groupId && selectedGroups.has(layer.groupId) ? { ...layer, groupId: undefined } : layer) as Layer[]
    return { layers, project: syncLayers(state.project, state.activePageId, layers) }
  }),

  addComment: (text, x, y) => set((state) => ({
    project: state.project && state.activePageId ? { ...state.project, updatedAt: new Date().toISOString(), pages: state.project.pages.map((page) => page.id === state.activePageId ? { ...page, comments: [...(page.comments ?? []), { id: generateId(), text, x, y, createdAt: new Date().toISOString() }] } : page) } : state.project,
  })),

  removeComment: (id) => set((state) => ({
    project: state.project && state.activePageId ? { ...state.project, updatedAt: new Date().toISOString(), pages: state.project.pages.map((page) => page.id === state.activePageId ? { ...page, comments: (page.comments ?? []).filter((comment) => comment.id !== id) } : page) } : state.project,
  })),

  moveGroup: (groupId, dx, dy, excludeId) => set((state) => {
    const layers = state.layers.map((layer) => layer.groupId === groupId && layer.id !== excludeId ? { ...layer, x: layer.x + dx, y: layer.y + dy } : layer) as Layer[]
    return { layers, project: syncLayers(state.project, state.activePageId, layers) }
  }),

  reset: () => set(initialState),
}))
