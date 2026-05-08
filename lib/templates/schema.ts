import { z } from 'zod'

// ─── Base layer fields shared by all layer types ─────────────────────────────

const BaseLayerSchema = z.object({
  id: z.string(),
  name: z.string(),
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

const TextLayerSchema = BaseLayerSchema.extend({
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

const ImageLayerSchema = BaseLayerSchema.extend({
  type: z.literal('image'),
  src: z.string(),
  objectFit: z.enum(['cover', 'contain', 'fill']).default('cover'),
  brightness: z.number().min(0).max(2).default(1),
  contrast: z.number().min(0).max(2).default(1),
})

const ShapeLayerSchema = BaseLayerSchema.extend({
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
