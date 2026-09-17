import { useState, lazy, Suspense } from 'react'
import { CompanionWorkspace } from './companion/CompanionWorkspace'
import type { StateId } from './companion/engine/states'
import { DEFAULT_SHAPE, DEFAULT_COLOR, type ShapeId, type ColorId } from './companion/engine/skins'
import { DEFAULT_EXPRESSION, type ExpressionId } from './companion/engine/expressions'
import { AvatarLocaleProvider } from './engine/avatar-app/avatarLocale'
import { HomeHeaderActions } from './engine/avatar-app/HomeHeaderActions'

// Studio is the vendored avatar editor — tens of thousands of lines across
// dozens of components. Code-split so Companion (which never needs it)
// still starts instantly. Home and Studio both use it now (Home shows its
// real species/breed gallery, Studio jumps straight into editing — see the
// startInEditor prop below) so the two don't show two different, redundant
// "pick where to start" screens; both pay Studio's load cost, but only
// once, since it's the same lazy chunk either way.
const Root = lazy(() => import('./engine/avatar-app/Root'))

type Mode = 'home' | 'companion' | 'studio'

/** Small glyph for the Companion tab — echoes the mascot's own silhouette. */
function CompanionGlyph({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 20 20" width={14} height={14} aria-hidden="true">
      <circle cx="10" cy="10" r="8.5" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={active ? 0 : 1.6} />
      <rect x="6.6" y="8.4" width="1.8" height="4" rx="0.9" fill={active ? '#fcc802' : 'currentColor'} />
      <rect x="11.6" y="8.4" width="1.8" height="4" rx="0.9" fill={active ? '#fcc802' : 'currentColor'} />
    </svg>
  )
}

/** Small glyph for the Studio tab — a simple palette/edit mark. */
function StudioGlyph({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 20 20" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
      <path d="M3 17 14 6l3 3-11 11H3v-3Z" fill={active ? '#fcc802' : 'none'} />
      <path d="M11.5 8.5 14.5 11.5" />
    </svg>
  )
}

/** Small glyph for the Home tab — a simple house mark. */
function HomeGlyph({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 20 20" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
      <path d="M3 10.5 10 4l7 6.5" />
      <path d="M5 9v7h10V9" fill={active ? '#fcc802' : 'none'} />
    </svg>
  )
}

/** Shown briefly the first time Studio's (large, code-split) bundle loads. */
function StudioLoading() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-koink-paper dark:bg-koink-ink-soft">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-koink-ink/20 border-t-koink-ink dark:border-koink-paper/20 dark:border-t-koink-paper" />
    </div>
  )
}

const TABS: Array<{ id: Mode; label: string; glyph: (active: boolean) => JSX.Element }> = [
  { id: 'home', label: 'Home', glyph: active => <HomeGlyph active={active} /> },
  { id: 'companion', label: 'Companion', glyph: active => <CompanionGlyph active={active} /> },
  { id: 'studio', label: 'Studio', glyph: active => <StudioGlyph active={active} /> }
]

/**
 * One window, three modes — Home (Studio's own species/breed gallery, plus
 * a live Companion tile in that same grid — Koink's actual front door),
 * Companion (the mascot's real workspace: shape/color/expression +
 * animations, see CompanionWorkspace), and Studio (jumps straight into the
 * editor with a random avatar, via Root's `startInEditor` — no second
 * "pick a template" screen redundant with Home's). The switcher below is
 * deliberately `fixed` (taken out of document flow) rather than a normal
 * nav row: the vendored editor's own CSS sizes several of its elements
 * against the real `100vh`/`100vw`, so anything of ours that consumes
 * *flow* height above it throws that off by exactly that many pixels —
 * that's what caused the broken/overlapping look earlier on. A `fixed`
 * overlay floats on top without shrinking anyone's available height, so
 * Root still sees the full window either way.
 */
export function App() {
  const [mode, setMode] = useState<Mode>('home')
  const [state, setState] = useState<StateId>('idle')
  const [shape, setShape] = useState<ShapeId>(DEFAULT_SHAPE as ShapeId)
  const [color, setColor] = useState<ColorId>(DEFAULT_COLOR as ColorId)
  const [eyeColor, setEyeColor] = useState<ColorId | 'auto'>('auto')
  const [expression, setExpression] = useState<ExpressionId>(DEFAULT_EXPRESSION as ExpressionId)
  const [followPointer, setFollowPointer] = useState(true)

  return (
    <AvatarLocaleProvider>
      <div className="relative h-full w-full">
        {mode === 'home' && (
          <div className="h-full w-full">
            <Suspense fallback={<StudioLoading />}>
              <Root onOpenCompanion={() => setMode('companion')} startAtHome />
            </Suspense>
          </div>
        )}

        {mode === 'companion' && (
          <CompanionWorkspace
            state={state}
            onStateChange={setState}
            shape={shape}
            onShapeChange={setShape}
            color={color}
            onColorChange={setColor}
            eyeColor={eyeColor}
            onEyeColorChange={setEyeColor}
            expression={expression}
            onExpressionChange={setExpression}
            followPointer={followPointer}
            onFollowPointerChange={setFollowPointer}
          />
        )}

        {mode === 'studio' && (
          <div className="h-full w-full">
            <Suspense fallback={<StudioLoading />}>
              <Root onOpenCompanion={() => setMode('companion')} startInEditor />
            </Suspense>
          </div>
        )}

        {/* Floating top bar — fixed, so it never steals flow height from
            Studio's own 100vh-based layout (see the comment above). Mode
            switcher + theme/language controls grouped together, visible in
            every mode (previously theme/language only existed inside
            Studio's own Home page). */}
        <div className="fixed left-1/2 top-3 z-[999999] flex -translate-x-1/2 items-center gap-3">
          <div className="flex gap-1 rounded-full bg-koink-ink/90 p-1 shadow-koink backdrop-blur">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setMode(tab.id)}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 font-display text-sm transition-colors ${
                  mode === tab.id ? 'bg-koink-yellow text-koink-ink' : 'text-koink-paper/70 hover:text-koink-paper'
                }`}
              >
                {tab.glyph(mode === tab.id)}
                {tab.label}
              </button>
            ))}
          </div>

          <div className="avatar-home__header-actions">
            <HomeHeaderActions />
          </div>
        </div>
      </div>
    </AvatarLocaleProvider>
  )
}
