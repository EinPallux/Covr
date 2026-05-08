import { z } from 'zod'

// ─── Layer role ───────────────────────────────────────────────────────────────
// Explicit semantic role carried by each layer.
// background: locked full-canvas image, always at the bottom
// overlay:    locked tint/vignette shape sitting above the background
// content:    user-editable text, image, or shape
// decoration: non-editable accent element (bars, badges, etc.)

export const LayerRoleSchema = z.enum(['background', 'overlay', 'content', 'decoration'])
export type LayerRole = z.infer<typeof LayerRoleSchema>

// ─── Base layer fields shared by all layer types ──────────────────────────────

const BaseLayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: LayerRoleSchema.default('content'),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number().default(0),
  opacity: z.number().min(0).max(1).default(1),
  visible: z.boolean().default(true),
  locked: z.boolean().default(false),
  editable: z.boolean().default(false),
  replaceable: z.boolean().default(false),
})

// ─── Layer type schemas ───────────────────────────────────────────────────────

export const TextLayerSchema = BaseLayerSchema.extend({
  type: z.literal('text'),
  text: z.string(),
  fontFamily: z.string().default('Inter'),
  fontSize: z.number(),
  fontStyle: z.enum(['normal', 'bold', 'italic', 'bold italic']).default('normal'),
  color: z.string().default('#ffffff'),
  align: z.enum(['left', 'center', 'right']).default('left'),
  lineHeight: z.number().default(1.2),
  letterSpacing: z.number().default(0),
  stroke: z.string().optional(),
  strokeWidth: z.number().default(0),
})

export const ImageLayerSchema = BaseLayerSchema.extend({
  type: z.literal('image'),
  src: z.string(),
  objectFit: z.enum(['cover', 'contain', 'fill']).default('cover'),
  brightness: z.number().min(0).max(2).default(1),
  contrast: z.number().min(0).max(2).default(1),
})

export const ShapeLayerSchema = BaseLayerSchema.extend({
  type: z.literal('shape'),
  shapeType: z.enum(['rect', 'ellipse', 'triangle']).default('rect'),
  fill: z.string().default('#000000'),
  stroke: z.string().optional(),
  strokeWidth: z.number().default(0),
  cornerRadius: z.number().default(0),
})

// ─── Discriminated union ──────────────────────────────────────────────────────

export const LayerSchema = z.discriminatedUnion('type', [
  TextLayerSchema,
  ImageLayerSchema,
  ShapeLayerSchema,
])

// ─── Category enum ────────────────────────────────────────────────────────────

export const TemplateCategorySchema = z.enum([
  'adventure',
  'pvp',
  'survival',
  'creative',
  'minigame',
  'roleplay',
  'horror',
  'other',
])

// ─── Full template schema ─────────────────────────────────────────────────────

export const TemplateSchema = z.object({
  id: z.string(),
  version: z.number().default(1),
  name: z.string(),
  category: TemplateCategorySchema,
  thumbnail: z.string(),
  canvas: z.object({
    width: z.number().default(1920),
    height: z.number().default(1080),
  }),
  layers: z.array(LayerSchema),
})

// ─── Exported types ───────────────────────────────────────────────────────────

export type BaseLayer = z.infer<typeof BaseLayerSchema>
export type TextLayer = z.infer<typeof TextLayerSchema>
export type ImageLayer = z.infer<typeof ImageLayerSchema>
export type ShapeLayer = z.infer<typeof ShapeLayerSchema>
export type Layer = z.infer<typeof LayerSchema>
export type TemplateCategory = z.infer<typeof TemplateCategorySchema>
export type Template = z.infer<typeof TemplateSchema>

// ─── Type guards ──────────────────────────────────────────────────────────────

export const isTextLayer = (layer: Layer): layer is TextLayer => layer.type === 'text'
export const isImageLayer = (layer: Layer): layer is ImageLayer => layer.type === 'image'
export const isShapeLayer = (layer: Layer): layer is ShapeLayer => layer.type === 'shape'

export const isBackgroundLayer = (layer: Layer): boolean => layer.role === 'background'
export const isOverlayLayer = (layer: Layer): boolean => layer.role === 'overlay'
export const isContentLayer = (layer: Layer): boolean => layer.role === 'content'
export const isDecorationLayer = (layer: Layer): boolean => layer.role === 'decoration'

// ─── Layer factory defaults ───────────────────────────────────────────────────
// Used by addLayer to create new layers with sensible defaults.

export function makeTextLayer(overrides: Partial<TextLayer> = {}): Omit<TextLayer, 'id'> {
  return {
    name: 'Text',
    role: 'content',
    type: 'text',
    x: 240,
    y: 440,
    width: 1440,
    height: 120,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    editable: true,
    replaceable: false,
    text: 'Your Text Here',
    fontFamily: 'Inter',
    fontSize: 80,
    fontStyle: 'bold',
    color: '#ffffff',
    align: 'center',
    lineHeight: 1.2,
    letterSpacing: 0,
    strokeWidth: 0,
    ...overrides,
  }
}

export function makeImageLayer(overrides: Partial<ImageLayer> = {}): Omit<ImageLayer, 'id'> {
  return {
    name: 'Image',
    role: 'content',
    type: 'image',
    x: 560,
    y: 240,
    width: 800,
    height: 600,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    editable: false,
    replaceable: true,
    src: '',
    objectFit: 'cover',
    brightness: 1,
    contrast: 1,
    ...overrides,
  }
}

export function makeShapeLayer(overrides: Partial<ShapeLayer> = {}): Omit<ShapeLayer, 'id'> {
  return {
    name: 'Shape',
    role: 'content',
    type: 'shape',
    x: 660,
    y: 390,
    width: 600,
    height: 300,
    rotation: 0,
    opacity: 1,
    visible: true,
    locked: false,
    editable: false,
    replaceable: false,
    shapeType: 'rect',
    fill: '#3f3f46',
    strokeWidth: 0,
    cornerRadius: 0,
    ...overrides,
  }
}
