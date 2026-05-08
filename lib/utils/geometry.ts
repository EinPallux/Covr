export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface Point {
  x: number
  y: number
}

export function getRectCenter(rect: Rect): Point {
  return {
    x: rect.x + rect.width / 2,
    y: rect.y + rect.height / 2,
  }
}

export function getRectEdges(rect: Rect) {
  return {
    left: rect.x,
    right: rect.x + rect.width,
    top: rect.y,
    bottom: rect.y + rect.height,
    centerX: rect.x + rect.width / 2,
    centerY: rect.y + rect.height / 2,
  }
}

export function rectsOverlap(a: Rect, b: Rect): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize
}

/** Nearest snap distance from a value to a set of targets. Returns null if nothing is within threshold. */
export function findSnapTarget(
  value: number,
  targets: number[],
  threshold: number,
): { snapped: number; delta: number } | null {
  let best: { snapped: number; delta: number } | null = null

  for (const target of targets) {
    const delta = Math.abs(value - target)
    if (delta <= threshold && (!best || delta < best.delta)) {
      best = { snapped: target, delta }
    }
  }

  return best
}

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export function radToDeg(rad: number): number {
  return (rad * 180) / Math.PI
}
