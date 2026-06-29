import type { DesignProject } from './schema'

const INDEX_KEY = 'covr.projects'
const PROJECT_PREFIX = 'covr.project.'

export interface ProjectSummary {
  id: string
  name: string
  width: number
  height: number
  updatedAt: string
}

function projectKey(id: string) {
  return `${PROJECT_PREFIX}${id}`
}

export function saveProject(project: DesignProject) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(projectKey(project.id), JSON.stringify(project))
  const summaries = listProjectSummaries().filter((item) => item.id !== project.id)
  const firstPage = project.pages[0]
  summaries.unshift({
    id: project.id,
    name: project.name,
    width: firstPage?.width ?? 0,
    height: firstPage?.height ?? 0,
    updatedAt: project.updatedAt,
  })
  window.localStorage.setItem(INDEX_KEY, JSON.stringify(summaries.slice(0, 24)))
}

export function loadProject(id: string): DesignProject | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(projectKey(id))
  if (!raw) return null
  try { return JSON.parse(raw) as DesignProject } catch { return null }
}

export function listProjectSummaries(): ProjectSummary[] {
  if (typeof window === 'undefined') return []
  const raw = window.localStorage.getItem(INDEX_KEY)
  if (!raw) return []
  try { return JSON.parse(raw) as ProjectSummary[] } catch { return [] }
}
