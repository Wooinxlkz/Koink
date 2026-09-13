import { useEffect, useRef, useState } from 'react'
import { BotEngine, type BotFrame } from '../engine/blob-core/engine'
import { SHAPE_BY_ID, COLOR_BY_ID, DEFAULT_SHAPE, DEFAULT_COLOR } from '../engine/blob-core/skins'
import { EXPRESSION_BY_ID } from '../engine/blob-core/expressions'
import type { StateId } from '../engine/blob-core/states'
import type { ShapeId, ColorId } from '../engine/blob-core/skins'
import type { ExpressionId } from '../engine/blob-core/expressions'

export interface KoinkBlobProps {
  /** which of the 14 states to play, e.g. 'idle' | 'thinking' | 'alert' | 'burst' ... */
  state?: StateId
  /** body shape preset (defaults to the round 'cercle') */
  shape?: ShapeId
  /** ink color preset (defaults to 'encre') */
  color?: ColorId
  /** rest-look expression (defaults to 'neutre'/neutral) */
  expression?: ExpressionId
  /** viewBox radius in px; the component itself is responsive via CSS */
  size?: number
  /** follow the pointer with a subtle gaze, like the reference bot does */
  followPointer?: boolean
  /**
   * When false, renders one static frame instead of running its own
   * animation loop — for cheap picker swatches (customizer grids) where
   * dozens of instances would otherwise all animate at once for no reason.
   * Defaults to true (the normal, animated mascot).
   */
  animate?: boolean
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
  expression,
  size = 120,
  followPointer = true,
  animate = true,
  className
}: KoinkBlobProps) {
  const engineRef = useRef<BotEngine | null>(null)
  const rafRef = useRef<number>(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [frame, setFrame] = useState<BotFrame | null>(null)

  if (engineRef.current === null) {
    const shapeRadii = SHAPE_BY_ID.get(shape)?.radii ?? null
    const expr = expression != null ? EXPRESSION_BY_ID.get(expression) ?? null : null
    engineRef.current = new BotEngine(size, state, shapeRadii ?? null, expr)
  }

  // state changes -> tell the engine, it morphs on its own
  useEffect(() => {
    engineRef.current?.setState(state, performance.now() / 1000)
  }, [state])

  useEffect(() => {
    const shapeRadii = SHAPE_BY_ID.get(shape)?.radii ?? null
    engineRef.current?.setShape(shapeRadii ?? null, performance.now() / 1000)
  }, [shape])

  useEffect(() => {
    const expr = expression != null ? EXPRESSION_BY_ID.get(expression) ?? null : null
    engineRef.current?.setExpression(expr, performance.now() / 1000)
  }, [expression])

  // render loop (or a single static sample for non-animated swatches)
  useEffect(() => {
    const engine = engineRef.current
    if (!engine) return

    if (!animate) {
      setFrame(engine.sample(performance.now() / 1000))
      return
    }

    const tick = () => {
      setFrame(engine.sample(performance.now() / 1000))
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [animate])

  // static swatches still need to re-sample when their props change, since
  // there's no running loop to pick that up on its own
  useEffect(() => {
    if (animate) return
    const engine = engineRef.current
    if (!engine) return
    // let the setState/setShape/setExpression effects above run first
    const id = requestAnimationFrame(() => setFrame(engine.sample(performance.now() / 1000)))
    return () => cancelAnimationFrame(id)
  }, [animate, state, shape, expression])

  // optional pointer-follow gaze
  useEffect(() => {
    if (!followPointer || !animate) return
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
  }, [followPointer, animate])

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
