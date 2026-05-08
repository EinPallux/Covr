import { stageRegistry } from './stageRegistry'
import { useUIStore } from '@/lib/store/uiStore'
import { SOURCE_W, SOURCE_H, type ExportFormat, type FitMode } from './presets'

export interface ExportOptions {
  filename: string
  format: ExportFormat
  // JPEG quality: 0–1. Ignored for PNG.
  quality: number
  // Output pixel dimensions
  width: number
  height: number
  // How to fit the 1920×1080 source into the target if they differ
  fitMode: FitMode
  // PNG only: keep the stage background transparent instead of filling white
  transparent: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Resolve a blob from a canvas element.
 * Wrapper around the callback-based `HTMLCanvasElement.toBlob`.
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('canvas.toBlob() returned null'))
      },
      mimeType,
      quality,
    )
  })
}

/** Trigger a browser file download from a Blob. */
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  // Append, click, remove — required for Firefox
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Revoke on next tick so the download has time to start
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

/**
 * Draw `src` canvas onto `ctx` using the given fit mode.
 *
 * contain — scale uniformly to fit, letterbox with transparency or the
 *           current fill if the caller pre-filled the canvas.
 * cover   — scale uniformly to fill, crop the center.
 * native  — draw at 1:1 (src and target have matching dimensions).
 */
function drawFitted(
  ctx: CanvasRenderingContext2D,
  src: HTMLCanvasElement,
  targetW: number,
  targetH: number,
  fitMode: FitMode,
) {
  if (fitMode === 'native') {
    ctx.drawImage(src, 0, 0, targetW, targetH)
    return
  }

  const scaleW = targetW / SOURCE_W
  const scaleH = targetH / SOURCE_H

  const scale =
    fitMode === 'contain'
      ? Math.min(scaleW, scaleH)
      : Math.max(scaleW, scaleH) // cover

  const drawW = Math.round(SOURCE_W * scale)
  const drawH = Math.round(SOURCE_H * scale)
  const dx = Math.round((targetW - drawW) / 2)
  const dy = Math.round((targetH - drawH) / 2)

  ctx.drawImage(src, dx, dy, drawW, drawH)
}

// ─── Main export function ─────────────────────────────────────────────────────

export async function runExport(options: ExportOptions): Promise<void> {
  const stage = stageRegistry.get()
  if (!stage) throw new Error('Konva stage is not mounted')

  const zoom = useUIStore.getState().zoom
  const { setExporting } = useUIStore.getState()

  setExporting(true)

  // The transformer lives on the second Konva Layer.
  // Hide it before rasterising so selection handles don't appear in the export.
  const konvaLayers = stage.getLayers()
  const transformerLayer = konvaLayers[1] ?? null
  transformerLayer?.hide()
  stage.batchDraw()

  try {
    // ── Step 1: Rasterise the Konva stage at native 1920×1080 ────────────────
    //
    // The Stage element is physically (1920*zoom × 1080*zoom) CSS pixels.
    // pixelRatio = 1/zoom makes toCanvas() produce a 1920×1080 HTMLCanvasElement
    // regardless of the current zoom level, giving us full-resolution pixels.
    const srcCanvas = stage.toCanvas({ pixelRatio: 1 / zoom }) as HTMLCanvasElement

    // ── Step 2: Create the output canvas at target dimensions ────────────────
    const outCanvas = document.createElement('canvas')
    outCanvas.width = options.width
    outCanvas.height = options.height
    const ctx = outCanvas.getContext('2d')!

    // JPEG cannot encode transparency — fill with white first.
    // For PNG with transparency disabled, also fill white.
    const needsBackground = options.format === 'jpg' || !options.transparent
    if (needsBackground) {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, options.width, options.height)
    }

    // ── Step 3: Scale and composite the source into the output ───────────────
    drawFitted(ctx, srcCanvas, options.width, options.height, options.fitMode)

    // ── Step 4: Encode and download ──────────────────────────────────────────
    const mimeType = options.format === 'jpg' ? 'image/jpeg' : 'image/png'
    const blob = await canvasToBlob(outCanvas, mimeType, options.quality)
    downloadBlob(blob, options.filename)
  } finally {
    transformerLayer?.show()
    stage.batchDraw()
    setExporting(false)
  }
}

/** Human-readable file size string (KB / MB). */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
