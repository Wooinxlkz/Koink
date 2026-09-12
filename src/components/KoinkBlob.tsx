import { useEffect, useRef, useState } from 'react'
import { BotEngine, type BotFrame } from '../engine/blob-core/engine'
import { SHAPE_BY_ID, COLOR_BY_ID, DEFAULT_SHAPE, DEFAULT_COLOR } from '../engine/blob-core/skins'
import type { StateId } from '../engine/blob-core/states'
import type { ShapeId, ColorId } from '../engine/blob-core/skins'

export interface KoinkBlobProps {
  /** which of the 14 states to play, e.g. 'idle' | 'thinking' | 'alert' | 'burst' ... */
  state?: StateId
  /** body shape preset (defaults to the round 'cercle') */
  shape?: ShapeId
  /** ink color preset (defaults to 'encre') */
  color?: ColorId
  /** viewBox radius in px; the component itself is responsive via CSS */
  size?: number
  /** follow the pointer with a subtle gaze, like the reference bot does */
  followPointer?: boolean
  className?: string
}

/**
 * Koink's mascot: a single morphing ink-black shape with two independent eye
 * shapes, driven by a pure `sample(t)` engine (see engine/blob-core). This
 * component owns the requestAnimationFrame loop and pointer tracking; the
 * engine itself has no clock and no DOM dependency.
 */
export function KoinkBlob({
  state = 'idle',
  shape = DEFAULT_SHAPE as ShapeId,
  color = DEFAULT_COLOR as ColorId,
  size = 120,
  followPointer = true,
  className
}: KoinkBlobProps) {
  const engineRef = useRef<BotEngine | null>(null)
  const rafRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [frame, setFrame] = useState<BotFrame | null>(null)

  if (engineRef.current === null) {
    const shapeRadii = SHAPE_BY_ID.get(shape)?.radii ?? null
    engineRef.current = new BotEngine(size, state, shapeRadii ?? null, null)
  }

  // state changes -> tell the engine, it morphs on its own
  useEffect(() => {
    engineRef.current?.setState(state, performance.now() / 1000)
  }, [state])

  useEffect(() => {
    const shapeRadii = SHAPE_BY_ID.get(shape)?.radii ?? null
    engineRef.current?.setShape(shapeRadii ?? null, performance.now() / 1000)
  }, [shape])

  // render loop
  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return
    const tick = () => {
      setFrame(engine.sample(performance.now() / 1000))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  // optional pointer-follow gaze
  useEffect(() => {
    if (!followPointer) return
    const el = containerRef.current
    if (!el) return
    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = (e.clientX - cx) / (rect.width / 2)
      const dy = (e.clientY - cy) / (rect.height / 2)
      // The engine expects yaw/pitch in degrees via its `look` model; we
      // clamp softly so the gaze never swings wildly at the window edges.
      engineRef.current?.setLook(
        { yaw: dx * 22, pitch: dy * 18, mix: 0.6, spin: 0, wander: 0.4 },
        performance.now() / 1000
      )
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [followPointer])

  const ink = COLOR_BY_ID.get(color)?.hex ?? '#0a0a0a'
  const viewSize = size * 2

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: size * 2, height: size * 2 }}
      aria-hidden
    >
      {frame && (
        <svg
          viewBox={`${-viewSize / 2} ${-viewSize / 2} ${viewSize} ${viewSize}`}
          width={size * 2}
          height={size * 2}
        >
          <path d={frame.bodyPath} fill={ink} opacity={frame.bodyAlpha} />
          {frame.eyes.map((eye, i) => (
            <path key={i} d={eye.d} transform={eye.matrix} fill="#ffffff" opacity={eye.alpha} />
          ))}
        </svg>
      )}
    </div>
  )
}
