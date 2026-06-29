import type { Layer } from '@/lib/design/schema'

export interface DesignComment {
  id: string
  x: number
  y: number
  text: string
  createdAt: string
}

export interface DesignPage {
  id: string
  name: string
  width: number
  height: number
  background: string
  layers: Layer[]
  comments: DesignComment[]
}

export interface DesignProject {
  id: string
  version: 1
  name: string
  createdAt: string
  updatedAt: string
  pages: DesignPage[]
}

export interface DesignPreset {
  id: string
  name: string
  description: string
  platform: 'Instagram' | 'TikTok' | 'LinkedIn' | 'YouTube' | 'Custom'
  width: number
  height: number
  accent: string
}
