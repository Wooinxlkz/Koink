import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TitleBar } from './components/TitleBar'
import { KoinkBlob } from './components/KoinkBlob'
import { SEQUENCE, type StateId } from './engine/blob-core/states'
import Root from './engine/avatar-app/Root'
import { AvatarLocaleProvider } from './engine/avatar-app/avatarLocale'

type View = 'companion' | 'studio'

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

export function App() {
  const [view, setView] = useState<View>('companion')
  const [state, setState] = useState<StateId>('idle')

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-blob border border-koink-ink/10 bg-koink-paper/95 font-sans shadow-koink">
      <TitleBar />

      <nav className="flex shrink-0 gap-1 border-b border-koink-ink/10 bg-koink-paper px-3 py-2">
        {(
          [
            ['companion', 'Companion'],
            ['studio', 'Studio']
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`rounded-full px-4 py-1.5 font-display text-sm transition-colors ${
              view === id
                ? 'bg-koink-yellow text-koink-ink shadow-koink'
                : 'text-koink-ink/60 hover:bg-koink-ink/5'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <main className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'companion' ? (
            <motion.div
              key="companion"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="flex h-full flex-col items-center justify-center gap-6 bg-koink-yellow px-6"
            >
              <div className="animate-float-y">
                <KoinkBlob state={state} size={110} />
              </div>

              <div className="flex flex-wrap justify-center gap-2">
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
            </motion.div>
          ) : (
            <motion.div
              key="studio"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="h-full"
            >
              {/*
                Root is the original app's own Home (species/breed/effect-style
                gallery) + editor, hash-routed internally — the full experience,
                not just the bare editor component.
              */}
              <AvatarLocaleProvider initialLocale="en" persist={false}>
                <Root />
              </AvatarLocaleProvider>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
