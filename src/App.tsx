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

/**
 * One window, two modes — Companion (the mascot) and Studio (the vendored
 * avatar editor). The switcher below is deliberately `fixed` (taken out of
 * document flow) rather than a normal nav row: Studio's own CSS sizes
 * several of its elements against the real `100vh`/`100vw`, so anything of
 * ours that consumes *flow* height above it throws that off by exactly
 * that many pixels — that's what caused the broken/overlapping look
 * before. A `fixed` overlay floats on top without shrinking anyone's
 * available height, so Root still sees the full window either way.
 */
export function App() {
  const [mode, setMode] = useState<Mode>('companion')
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
            <Root />
          </AvatarLocaleProvider>
        </div>
      )}

      {/* Floating mode switcher — fixed, so it never steals flow height
          from Studio's own 100vh-based layout. Bottom-center avoids
          Studio's own corner controls (export/github-slot/theme/language
          top corners, the orientation gizmo bottom-right). */}
      <div className="fixed bottom-4 left-1/2 z-[999999] flex -translate-x-1/2 gap-1 rounded-full bg-koink-ink/90 p-1 shadow-koink backdrop-blur">
        {(
          [
            ['companion', 'Companion'],
            ['studio', 'Studio']
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setMode(id)}
            className={`rounded-full px-4 py-1.5 font-display text-sm transition-colors ${
              mode === id ? 'bg-koink-yellow text-koink-ink' : 'text-koink-paper/70 hover:text-koink-paper'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
