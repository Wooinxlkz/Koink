import { GIFEncoder, applyPalette, quantize } from 'gifenc'
import { BotEngine, type BotFrame } from './engine/engine'
import { SHAPE_BY_ID, COLOR_BY_ID, type ShapeId, type ColorId } from './engine/skins'
import { EXPRESSION_BY_ID, type ExpressionId } from './engine/expressions'
import type { StateId } from './engine/states'
import type { Block } from './engine/cycles'
import { blockAt } from './engine/cycles'
import { relativeLuminance } from './KoinkBlob'

const GIF_PALETTE_SIZE = 256
const GIF_PALETTE_FORMAT = 'rgba4444' as const
const FIXED_STATE_SECONDS = 3

/**
 * Builds the same SVG markup KoinkBlob renders, directly from a sampled
 * frame — no need to mount a React tree offscreen just to read it back out
 * (that's the reference project's own approach, needed there because
 * their frame data feeds a much larger component; the blob's SVG is just
 * a body path and two eye paths, cheap to build directly).
 *
 * `pixelSize` is the full output width/height in px. The engine's own
 * `scale` parameter (see BotEngine construction below) is a *radius* —
 * half of this — matching KoinkBlob's own viewBox convention exactly
 * (`viewSize = size * 2`, viewBox spans `-size..size`). Getting this
 * relationship wrong makes every exported frame render at half scale.
 */
function frameToSvgMarkup(frame: BotFrame, ink: string, eyeFill: string, pixelSize: number): string {
  const half = pixelSize / 2
  const eyes = frame.eyes
    .map(eye => `<path d="${eye.d}" transform="${eye.matrix}" fill="${eyeFill}" opacity="${eye.alpha}" />`)
    .join('')
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-half} ${-half} ${pixelSize} ${pixelSize}" width="${pixelSize}" height="${pixelSize}">` +
    `<path d="${frame.bodyPath}" fill="${ink}" opacity="${frame.bodyAlpha}" />${eyes}</svg>`
  )
}

async function svgMarkupToCanvas(markup: string, size: number, background: string | null): Promise<HTMLCanvasElement> {
  const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml' }))
  try {
    const img = new Image()
    img.src = url
    await img.decode()
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Unable to get canvas context for GIF export')
    if (background) {
      ctx.fillStyle = background
      ctx.fillRect(0, 0, size, size)
    }
    ctx.drawImage(img, 0, 0, size, size)
    return canvas
  } finally {
    URL.revokeObjectURL(url)
  }
}

export interface GifExportOptions {
  shape: ShapeId
  color: ColorId | string
  eyeColor: ColorId | 'auto' | string
  expression: ExpressionId
  size: number
  fps: number
  background: 'white' | 'transparent'
  /** Fixed state to loop, or a cycle's blocks to play through in full. */
  source: { kind: 'state'; state: StateId } | { kind: 'cycle'; blocks: Block[] }
  /** Called with 0..1 progress as frames are captured, for a progress bar. */
  onProgress?: (fraction: number) => void
}

/**
 * Renders a short looping GIF of the mascot — either one state's natural
 * idle motion (blinks, subtle wander) or a full custom cycle. Same
 * gifenc call shape as this project's own Studio export code
 * (`avatarGifExport.tsx`): quantize -> applyPalette -> writeFrame per
 * frame, transparent-index handling included.
 */
export async function exportGif(options: GifExportOptions): Promise<Blob> {
  const shapeRadii = SHAPE_BY_ID.get(options.shape)?.radii ?? null
  const expr = EXPRESSION_BY_ID.get(options.expression) ?? null
  const ink = COLOR_BY_ID.get(options.color as ColorId)?.hex ?? options.color
  const eyeFill =
    options.eyeColor === 'auto'
      ? relativeLuminance(ink) > 0.6 ? '#141014' : '#ffffff'
      : COLOR_BY_ID.get(options.eyeColor as ColorId)?.hex ?? options.eyeColor
  const background = options.background === 'white' ? '#ffffff' : null

  const initialState = options.source.kind === 'state' ? options.source.state : options.source.blocks[0]?.state ?? 'idle'
  const engine = new BotEngine(options.size / 2, initialState, shapeRadii, expr)

  const totalDuration =
    options.source.kind === 'state'
      ? FIXED_STATE_SECONDS
      : Math.max(0.1, options.source.blocks.reduce((sum, b) => sum + b.duration, 0))

  const dt = 1 / options.fps
  const totalFrames = Math.max(1, Math.round(totalDuration * options.fps))
  const encoder = GIFEncoder()
  let lastBlockIndex = -1

  for (let i = 0; i < totalFrames; i++) {
    const t = i * dt

    if (options.source.kind === 'cycle') {
      const { index } = blockAt(options.source.blocks, t)
      if (index !== lastBlockIndex) {
        const block = options.source.blocks[index]
        if (block) engine.setState(block.state, t)
        lastBlockIndex = index
      }
    }

    const frame = engine.sample(t)
    const markup = frameToSvgMarkup(frame, ink, eyeFill, options.size)
    const canvas = await svgMarkupToCanvas(markup, options.size, background)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Unable to read GIF frame')
    const pixels = ctx.getImageData(0, 0, options.size, options.size).data

    const palette = quantize(pixels, GIF_PALETTE_SIZE, {
      format: GIF_PALETTE_FORMAT,
      oneBitAlpha: true,
      clearAlpha: true,
      clearAlphaThreshold: 127
    })
    const indexed = applyPalette(pixels, palette, GIF_PALETTE_FORMAT)
    const transparentIndex = palette.findIndex(c => c[3] === 0)

    encoder.writeFrame(indexed, options.size, options.size, {
      delay: Math.round(dt * 1000),
      dispose: transparentIndex >= 0 ? 2 : 1,
      palette,
      repeat: 0,
      transparent: transparentIndex >= 0,
      transparentIndex
    })

    options.onProgress?.((i + 1) / totalFrames)
    // Yield to the browser periodically so the UI (and the progress bar)
    // actually gets to update instead of the whole export running as one
    // long synchronous block.
    if (i % 4 === 0) await new Promise(resolve => setTimeout(resolve, 0))
  }

  encoder.finish()
  // encoder.bytes() types as Uint8Array<ArrayBufferLike>, which newer
  // TS DOM lib types reject for BlobPart (it wants a concrete ArrayBuffer,
  // not the wider ArrayBufferLike that also covers SharedArrayBuffer).
  // Same fix this project's own Studio export code already uses.
  return new Blob([Uint8Array.from(encoder.bytes()).buffer], { type: 'image/gif' })
}

/** Triggers a browser download for a Blob — no extra dependency needed. */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
