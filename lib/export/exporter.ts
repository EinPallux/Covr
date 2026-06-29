import { stageRegistry } from './stageRegistry'
import { useUIStore } from '@/lib/store/uiStore'
import type { ExportFormat } from './presets'

export interface ExportOptions {
  filename: string
  format: ExportFormat
  quality: number
  width: number
  height: number
  transparent: boolean
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not encode this image')), mimeType, quality)
  })
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

export async function runExport(options: ExportOptions): Promise<void> {
  const stage = stageRegistry.get()
  if (!stage) throw new Error('Canvas is not ready')
  const { zoom, setExporting } = useUIStore.getState()
  const transformerLayer = stage.getLayers()[1] ?? null
  const frameBackground = stage.findOne('#__frame-background')
  setExporting(true)
  transformerLayer?.hide()
  if (options.transparent) frameBackground?.hide()
  stage.batchDraw()

  try {
    const source = stage.toCanvas({ pixelRatio: 1 / zoom }) as HTMLCanvasElement
    const output = document.createElement('canvas')
    output.width = options.width
    output.height = options.height
    const context = output.getContext('2d')!
    if (options.format === 'jpg' || !options.transparent) {
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, output.width, output.height)
    }
    context.drawImage(source, 0, 0, output.width, output.height)
    const mimeType = options.format === 'jpg' ? 'image/jpeg' : options.format === 'webp' ? 'image/webp' : 'image/png'
    downloadBlob(await canvasToBlob(output, mimeType, options.quality), options.filename)
  } finally {
    transformerLayer?.show()
    frameBackground?.show()
    stage.batchDraw()
    setExporting(false)
  }
}
