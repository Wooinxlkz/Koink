import type { ReactNode } from 'react'
import { SHAPES, COLORS, type ShapeId, type ColorId } from './engine/skins'
import { EXPRESSIONS, type ExpressionId } from './engine/expressions'
import { KoinkBlob } from './KoinkBlob'

const SHAPE_LABELS: Record<ShapeId, string> = {
  cercle: 'Circle',
  galet: 'Pebble',
  squircle: 'Squircle',
  capsule: 'Capsule',
  triangle: 'Triangle',
  hexagone: 'Hexagon',
  nuage: 'Cloud',
  goutte: 'Droplet'
}

const COLOR_LABELS: Record<ColorId, string> = {
  encre: 'Ink',
  creme: 'Cream',
  brun: 'Brown',
  rouge: 'Red',
  orange: 'Orange',
  ambre: 'Amber',
  vert: 'Green',
  turquoise: 'Turquoise',
  bleu: 'Blue',
  violet: 'Violet',
  rose: 'Pink',
  gris: 'Grey'
}

const EXPRESSION_LABELS: Record<ExpressionId, string> = {
  neutre: 'Neutral',
  attentif: 'Attentive',
  surpris: 'Surprised',
  excite: 'Excited',
  heureux: 'Happy',
  hilare: 'Laughing',
  colere: 'Angry',
  triste: 'Sad',
  effraye: 'Scared',
  mefiant: 'Suspicious',
  confus: 'Confused',
  curieux: 'Curious',
  fier: 'Proud',
  timide: 'Shy',
  blase: 'Unimpressed',
  somnolent: 'Sleepy'
}

export interface BlobCustomizerProps {
  shape: ShapeId
  color: ColorId
  eyeColor: ColorId | 'auto'
  expression: ExpressionId
  onShapeChange: (shape: ShapeId) => void
  onColorChange: (color: ColorId) => void
  onEyeColorChange: (color: ColorId | 'auto') => void
  onExpressionChange: (expression: ExpressionId) => void
}

function SwatchGrid<T extends string>({
  items,
  value,
  onChange,
  label,
  render
}: {
  items: T[]
  value: T
  onChange: (v: T) => void
  label: (item: T) => string
  render: (item: T, active: boolean) => ReactNode
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {items.map(item => (
        <button
          key={item}
          onClick={() => onChange(item)}
          title={label(item)}
          aria-label={label(item)}
          aria-pressed={item === value}
          className={`flex h-11 w-11 items-center justify-center rounded-xl border-2 transition-colors ${
            item === value
              ? 'border-koink-ink dark:border-koink-paper'
              : 'border-transparent hover:border-koink-ink/20 dark:hover:border-koink-paper/30'
          }`}
        >
          {render(item, item === value)}
        </button>
      ))}
    </div>
  )
}

/**
 * The blob's real edit mode: shape, color, and rest-expression pickers.
 * Shape and expression swatches are live (non-animated) previews of the
 * actual engine output, not icons standing in for it — see KoinkBlob's
 * `animate={false}` mode.
 */
export function BlobCustomizer({
  shape,
  color,
  eyeColor,
  expression,
  onShapeChange,
  onColorChange,
  onEyeColorChange,
  onExpressionChange
}: BlobCustomizerProps) {
  return (
    <div className="flex w-full max-w-xl flex-col gap-5 px-6">
      <section className="flex flex-col items-center gap-2">
        <h3 className="font-display text-sm text-koink-ink/70 dark:text-koink-paper/70">Shape</h3>
        <SwatchGrid
          items={SHAPES.map(s => s.id)}
          value={shape}
          onChange={onShapeChange}
          label={id => SHAPE_LABELS[id]}
          render={id => (
            <KoinkBlob shape={id} color={color} eyeColor={eyeColor} size={16} animate={false} followPointer={false} />
          )}
        />
      </section>

      <section className="flex flex-col items-center gap-2">
        <h3 className="font-display text-sm text-koink-ink/70 dark:text-koink-paper/70">Color</h3>
        <SwatchGrid
          items={COLORS.map(c => c.id)}
          value={color}
          onChange={onColorChange}
          label={id => COLOR_LABELS[id]}
          render={(id, active) => (
            <span
              className={`block h-7 w-7 rounded-full ${
                active ? 'ring-2 ring-koink-ink ring-offset-2 ring-offset-white dark:ring-koink-paper dark:ring-offset-koink-ink' : ''
              }`}
              style={{ background: COLORS.find(c => c.id === id)?.hex }}
            />
          )}
        />
      </section>

      <section className="flex flex-col items-center gap-2">
        <h3 className="font-display text-sm text-koink-ink/70 dark:text-koink-paper/70">Eye color</h3>
        <SwatchGrid
          items={['auto', ...COLORS.map(c => c.id)] as Array<ColorId | 'auto'>}
          value={eyeColor}
          onChange={onEyeColorChange}
          label={id => (id === 'auto' ? 'Auto (matches body)' : COLOR_LABELS[id])}
          render={(id, active) =>
            id === 'auto'
              ? (
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-koink-ink/20 text-[9px] font-semibold text-koink-ink dark:border-koink-paper/30 dark:text-koink-paper"
                  style={{ background: 'conic-gradient(from 180deg, #fff 0 50%, #141014 50% 100%)' }}
                >
                  <span className="rounded-full bg-koink-paper px-1 py-0.5 leading-none dark:bg-koink-ink">A</span>
                </span>
              )
              : (
                <span
                  className={`block h-7 w-7 rounded-full ${
                    active ? 'ring-2 ring-koink-ink ring-offset-2 ring-offset-white dark:ring-koink-paper dark:ring-offset-koink-ink' : ''
                  }`}
                  style={{ background: COLORS.find(c => c.id === id)?.hex }}
                />
              )}
        />
      </section>

      <section className="flex flex-col items-center gap-2">
        <h3 className="font-display text-sm text-koink-ink/70 dark:text-koink-paper/70">Expression</h3>
        <SwatchGrid
          items={EXPRESSIONS.map(e => e.id)}
          value={expression}
          onChange={onExpressionChange}
          label={id => EXPRESSION_LABELS[id]}
          render={id => (
            <KoinkBlob
              shape={shape}
              color={color}
              eyeColor={eyeColor}
              expression={id}
              size={16}
              animate={false}
              followPointer={false}
            />
          )}
        />
      </section>
    </div>
  )
}

export { SHAPE_LABELS, COLOR_LABELS, EXPRESSION_LABELS }
