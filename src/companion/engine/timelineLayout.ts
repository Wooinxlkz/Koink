/**
 * Layout math for the animation track: ruler ticks, zoom bounds, mm:ss
 * formatting. Pure — no DOM, no framework — ported directly from the
 * reference engine's own timeline-layout module (see
 * /THIRD_PARTY_NOTICES.md), which was framework-free in the original too.
 */

/** Width of one second of track, in pixels, before zoom is applied. */
export const BASE_SCALE = 44

export const MIN_ZOOM = 0.45
export const MAX_ZOOM = 2.4

/** Minimum spacing between numbered ruler ticks, in pixels. */
const TICK_SPACING = 52

/** Candidate tick steps, finest to widest. */
const STEPS = [0.5, 1, 2, 5, 10, 15, 30, 60]

const MAX_TICKS = 2000

export function clampZoom(v: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v))
}

/** `0:04` */
export function mmss(t: number) {
  const s = Math.max(0, Math.floor(t))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export interface Tick {
  t: number
  major: boolean
}

/**
 * Ruler tick positions for a given total duration and pixel scale. The
 * numbered step is the first of STEPS that leaves at least TICK_SPACING
 * between labels, so zooming out goes 1s -> 5s -> 10s instead of stacking
 * unreadable numbers.
 */
export function ticksFor(total: number, scale: number): Tick[] {
  const major = STEPS.find(s => s * scale >= TICK_SPACING) ?? STEPS[STEPS.length - 1]!
  const step = (major / 5) * scale >= 7 ? major / 5 : major
  const out: Tick[] = []
  for (let i = 0; i * step <= total + 1e-6 && out.length < MAX_TICKS; i++) {
    const t = i * step
    out.push({ t, major: Math.abs(t / major - Math.round(t / major)) < 1e-6 })
  }
  return out
}
