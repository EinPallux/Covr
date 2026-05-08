'use client'

import { useRef, useEffect } from 'react'
import { Image, Rect } from 'react-konva'
import useImage from 'use-image'
import type Konva from 'konva'
import type { ImageLayer } from '@/lib/templates/schema'

interface Props {
  layer: ImageLayer
  isSelected: boolean
  onSelect: (id: string, multi: boolean) => void
  onDragStart: () => void
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void
}

/** Compute Konva `crop` values for CSS `object-fit: cover` behaviour. */
function getCoverCrop(
  imgW: number,
  imgH: number,
  destW: number,
  destH: number,
): { x: number; y: number; width: number; height: number } {
  const imgAR = imgW / imgH
  const destAR = destW / destH

  if (imgAR > destAR) {
    // Image wider than dest — crop left/right
    const cropW = imgH * destAR
    return { x: (imgW - cropW) / 2, y: 0, width: cropW, height: imgH }
  } else {
    // Image taller than dest — crop top/bottom
    const cropH = imgW / destAR
    return { x: 0, y: (imgH - cropH) / 2, width: imgW, height: cropH }
  }
}

export default function ImageLayerNode({
  layer,
  onSelect,
  onDragStart,
  onDragEnd,
  onTransformEnd,
}: Props) {
  const nodeRef = useRef<Konva.Image>(null)
  const [image, status] = useImage(layer.src, 'anonymous')

  // Apply brightness/contrast filters
  useEffect(() => {
    const node = nodeRef.current
    if (!node || !image) return
    const needsFilter = layer.brightness !== 1 || layer.contrast !== 1
    if (needsFilter) {
      node.filters([window.Konva?.Filters?.Brighten, window.Konva?.Filters?.Contrast].filter(Boolean) as import('konva/lib/Node').Filter[])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(node as any).brightness(layer.brightness - 1) // Konva Brighten: -1 to 1
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(node as any).contrast((layer.contrast - 1) * 100) // Konva Contrast: -100 to 100
      node.cache()
    } else {
      node.clearCache()
      node.filters([])
    }
  }, [image, layer.brightness, layer.contrast])

  const crop =
    image && layer.objectFit === 'cover'
      ? getCoverCrop(image.naturalWidth, image.naturalHeight, layer.width, layer.height)
      : undefined

  const sharedProps = {
    id: layer.id,
    x: layer.x,
    y: layer.y,
    width: layer.width,
    height: layer.height,
    rotation: layer.rotation,
    opacity: layer.opacity,
    visible: layer.visible,
    listening: !layer.locked,
    draggable: !layer.locked,
    perfectDrawEnabled: false,
    onClick: (e: Konva.KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true
      onSelect(layer.id, e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey)
    },
    onTap: (e: Konva.KonvaEventObject<TouchEvent>) => {
      e.cancelBubble = true
      onSelect(layer.id, false)
    },
    onDragStart,
    onDragEnd,
    onTransformEnd,
  }

  // Loading / error placeholder
  if (status !== 'loaded' || !image) {
    return (
      <Rect
        {...sharedProps}
        fill={status === 'failed' ? '#3f3f46' : '#27272a'}
        stroke="#52525b"
        strokeWidth={1}
      />
    )
  }

  return (
    // eslint-disable-next-line jsx-a11y/alt-text
    <Image
      ref={nodeRef}
      {...sharedProps}
      image={image}
      crop={crop}
    />
  )
}

// Extend window for Konva global access in filters
declare global {
  interface Window {
    Konva?: {
      Filters?: {
        Brighten?: (imageData: ImageData) => void
        Contrast?: (imageData: ImageData) => void
      }
    }
  }
}
