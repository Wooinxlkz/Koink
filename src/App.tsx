import { useState } from 'react'
import { KoinkBlob } from './components/KoinkBlob'
import { SEQUENCE, type StateId } from './engine/blob-core/states'
import Root from './engine/avatar-app/Root'
import { AvatarLocaleProvider } from './engine/avatar-app/avatarLocale'

type Mode = 'companion' | 'studio'

const STATE_LABELS: Partial<Record<StateId, string>> = {
  idle: 'Idle',
  thinking: 'Thinking',
  wink: 'Wink',
  wide: 'Surprised',
  alert: 'Alert',
  notify: 'Notify',
  exclaim: 'Exclaim',
  sleep: 'Sleep',
  egg: 'Egg',
  hexagon: 'Hexagon',
  play: 'Play',
  orbit: 'Orbit',
  burst: 'Burst',
  comet: 'Comet'
}

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

/**
 * One window, two modes — Companion (the mascot) and Studio (the vendored
 * avatar editor, its Home page as the app's main landing). The switcher
 * below is deliberately `fixed` (taken out of document flow) rather than a
 * normal nav row: Studio's own CSS sizes several of its elements against
 * the real `100vh`/`100vw`, so anything of ours that consumes *flow*
 * height above it throws that off by exactly that many pixels — that's
 * what caused the broken/overlapping look earlier on. A `fixed` overlay
 * floats on top without shrinking anyone's available height, so Root
 * still sees the full window either way.
 */
export function App() {
  const [mode, setMode] = useState<Mode>('studio')
  const [state, setState] = useState<StateId>('idle')

  return (
    <div className="relative h-full w-full bg-koink-yellow">
      {mode === 'companion' ? (
        <div className="flex h-full w-full flex-col items-center justify-center gap-6">
          <div className="animate-float-y">
            <KoinkBlob state={state} size={140} />
          </div>

          <div className="flex flex-wrap justify-center gap-2 px-6">
            {SEQUENCE.map(id => (
              <button
                key={id}
                onClick={() => setState(id)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  state === id
                    ? 'bg-koink-ink text-koink-paper'
                    : 'bg-koink-ink/10 text-koink-ink hover:bg-koink-ink/20'
                }`}
              >
                {STATE_LABELS[id] ?? id}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="h-full w-full">
          <AvatarLocaleProvider initialLocale="en" persist={false}>
            <Root onOpenCompanion={() => setMode('companion')} />
          </AvatarLocaleProvider>
        </div>
      )}

      {/* Floating mode switcher — fixed, so it never steals flow height
          from Studio's own 100vh-based layout (see the comment above).
          Top-center: Studio's own corner controls sit at the far corners
          (export top-left, language switcher top-right, orientation
          gizmo bottom-right), so top-center stays clear. */}
      <div className="fixed left-1/2 top-3 z-[999999] flex -translate-x-1/2 gap-1 rounded-full bg-koink-ink/90 p-1 shadow-koink backdrop-blur">
        {(
          [
            ['companion', 'Companion'],
            ['studio', 'Studio']
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 font-display text-sm transition-colors ${
              mode === id ? 'bg-koink-yellow text-koink-ink' : 'text-koink-paper/70 hover:text-koink-paper'
            }`}
          >
            {id === 'companion' ? <CompanionGlyph active={mode === id} /> : <StudioGlyph active={mode === id} />}
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
