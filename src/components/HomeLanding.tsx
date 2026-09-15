import { KoinkBlob } from '../companion/KoinkBlob'

export interface HomeLandingProps {
  onOpenCompanion: () => void
  onOpenStudio: () => void
}

/**
 * The app's actual landing page — separate from Studio's own internal Home
 * (the species/breed gallery), which is still there once you're inside
 * Studio. This one just answers "which of the two do you want".
 */
export function HomeLanding({ onOpenCompanion, onOpenStudio }: HomeLandingProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-10 bg-koink-yellow px-6 dark:bg-koink-ink">
      <div className="flex flex-col items-center gap-2 text-center">
        <img src="/favicon.png" alt="" width={56} height={56} />
        <h1 className="font-display text-3xl text-koink-ink dark:text-koink-paper">Koink</h1>
        <p className="text-sm text-koink-ink/60 dark:text-koink-paper/60">Pick where you want to go</p>
      </div>

      <div className="flex flex-wrap justify-center gap-6">
        <button
          onClick={onOpenCompanion}
          className="group flex w-64 flex-col items-center gap-4 rounded-3xl border-2 border-koink-ink/10 bg-koink-paper p-8 text-center shadow-koink transition-transform hover:-translate-y-1 dark:border-koink-paper/10 dark:bg-koink-ink-soft"
        >
          <KoinkBlob state="idle" size={56} followPointer={false} />
          <div>
            <div className="font-display text-lg text-koink-ink dark:text-koink-paper">Companion</div>
            <div className="text-xs text-koink-ink/60 dark:text-koink-paper/60">
              The mascot — shape, color, expression, states
            </div>
          </div>
        </button>

        <button
          onClick={onOpenStudio}
          className="group flex w-64 flex-col items-center gap-4 rounded-3xl border-2 border-koink-ink/10 bg-koink-paper p-8 text-center shadow-koink transition-transform hover:-translate-y-1 dark:border-koink-paper/10 dark:bg-koink-ink-soft"
        >
          <svg viewBox="0 0 24 24" width={56} height={56} fill="none" stroke="currentColor" strokeWidth={1.4} className="text-koink-ink dark:text-koink-paper">
            <rect x="3" y="3" width="18" height="18" rx="4" />
            <circle cx="9" cy="10" r="2" />
            <path d="M4 17l5-5 4 4 3-3 4 4" />
          </svg>
          <div>
            <div className="font-display text-lg text-koink-ink dark:text-koink-paper">Studio</div>
            <div className="text-xs text-koink-ink/60 dark:text-koink-paper/60">
              The full geometric avatar editor
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
