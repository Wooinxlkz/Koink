import { useState, type ReactNode } from 'react'
import { KoinkBlob } from './KoinkBlob'
import { BlobCustomizer } from './BlobCustomizer'
import { AnimationTimeline } from './AnimationTimeline'
import { exportGif, downloadBlob } from './gifExport'
import type { StateId } from './engine/states'
import { type ShapeId, type ColorId } from './engine/skins'
import { type ExpressionId } from './engine/expressions'

type PanelId = 'customize' | 'animations' | 'settings'

const PANELS: Array<{ id: PanelId; label: string }> = [
  { id: 'customize', label: 'Customize' },
  { id: 'animations', label: 'Animations' },
  { id: 'settings', label: 'Settings' }
]

function RailIcon({ id }: { id: PanelId }) {
  if (id === 'animations') {
    return (
      <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M10 9l5 3-5 3V9Z" fill="currentColor" stroke="none" />
      </svg>
    )
  }
  if (id === 'settings') {
    return (
      <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 13a7.6 7.6 0 0 0 0-2l2-1.5-2-3.4-2.3.9a7.6 7.6 0 0 0-1.7-1L15 3.5h-4l-.4 2.4a7.6 7.6 0 0 0-1.7 1l-2.3-.9-2 3.4L6.6 11a7.6 7.6 0 0 0 0 2l-2 1.5 2 3.4 2.3-.9a7.6 7.6 0 0 0 1.7 1l.4 2.4h4l.4-2.4a7.6 7.6 0 0 0 1.7-1l2.3.9 2-3.4-2-1.5Z" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="9" cy="10" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="14.5" cy="9" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="14" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export interface CompanionWorkspaceProps {
  state: StateId
  onStateChange: (state: StateId) => void
  shape: ShapeId
  onShapeChange: (shape: ShapeId) => void
  color: ColorId
  onColorChange: (color: ColorId) => void
  expression: ExpressionId
  onExpressionChange: (expression: ExpressionId) => void
  followPointer: boolean
  onFollowPointerChange: (value: boolean) => void
}

/**
 * A real workspace, not a handful of floating swatches: a left rail
 * switches between Customize / Animations / Settings panels — mirroring
 * the reference engine's own three-view sidebar pattern (see
 * THIRD_PARTY_NOTICES.md) — with the live preview always visible.
 */
export function CompanionWorkspace({
  state,
  onStateChange,
  shape,
  onShapeChange,
  color,
  onColorChange,
  expression,
  onExpressionChange,
  followPointer,
  onFollowPointerChange
}: CompanionWorkspaceProps) {
  const [panel, setPanel] = useState<PanelId>('customize')
  const [stateExportProgress, setStateExportProgress] = useState<number | null>(null)

  const exportStateGif = async () => {
    if (stateExportProgress != null) return
    setStateExportProgress(0)
    try {
      const blob = await exportGif({
        shape,
        color,
        expression,
        size: 320,
        fps: 20,
        background: 'white',
        source: { kind: 'state', state },
        onProgress: setStateExportProgress
      })
      downloadBlob(blob, `koink-${state}.gif`)
    } finally {
      setStateExportProgress(null)
    }
  }

  return (
    <div className="flex h-full w-full bg-koink-yellow dark:bg-koink-ink">
      {/* Left rail — fixed, out of flow, matching the mode-switcher's own
          treatment so it never competes for layout space either. */}
      <nav className="fixed left-4 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-1 rounded-2xl border border-koink-ink/10 bg-koink-paper/85 p-1.5 shadow-koink backdrop-blur dark:border-koink-paper/10 dark:bg-koink-ink-soft/85">
        {PANELS.map(item => (
          <button
            key={item.id}
            onClick={() => setPanel(item.id)}
            title={item.label}
            aria-label={item.label}
            aria-current={panel === item.id ? 'page' : undefined}
            className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors ${
              panel === item.id
                ? 'bg-koink-ink text-koink-paper dark:bg-koink-paper dark:text-koink-ink'
                : 'text-koink-ink/50 hover:bg-koink-ink/5 dark:text-koink-paper/50 dark:hover:bg-koink-paper/10'
            }`}
          >
            <RailIcon id={item.id} />
          </button>
        ))}
      </nav>

      {/* Main scene: the live preview, always visible regardless of panel. */}
      <div className="flex h-full flex-1 flex-col items-center justify-center gap-6 overflow-y-auto py-16 pl-20 pr-6">
        <div className="animate-float-y">
          <KoinkBlob
            state={state}
            shape={shape}
            color={color}
            expression={expression}
            size={130}
            followPointer={followPointer}
          />
        </div>

        <PanelBody panel={panel}>
          {panel === 'customize' && (
            <BlobCustomizer
              shape={shape}
              color={color}
              expression={expression}
              onShapeChange={onShapeChange}
              onColorChange={onColorChange}
              onExpressionChange={onExpressionChange}
            />
          )}

          {panel === 'animations' && (
            <AnimationTimeline shape={shape} color={color} expression={expression} onPreviewStateChange={onStateChange} />
          )}

          {panel === 'settings' && (
            <div className="flex w-full max-w-xs flex-col gap-3 px-6">
              <label className="flex items-center justify-between rounded-xl bg-koink-ink/5 px-4 py-3 text-sm text-koink-ink dark:bg-koink-paper/5 dark:text-koink-paper">
                Follow cursor
                <input
                  type="checkbox"
                  checked={followPointer}
                  onChange={e => onFollowPointerChange(e.target.checked)}
                  className="h-4 w-4 accent-koink-ink dark:accent-koink-paper"
                />
              </label>

              <button
                onClick={exportStateGif}
                disabled={stateExportProgress != null}
                className="flex items-center justify-between rounded-xl bg-koink-ink/5 px-4 py-3 text-sm text-koink-ink transition-colors hover:bg-koink-ink/10 disabled:opacity-60 dark:bg-koink-paper/5 dark:text-koink-paper dark:hover:bg-koink-paper/10"
              >
                Export current state as GIF
                <span>{stateExportProgress != null ? `${Math.round(stateExportProgress * 100)}%` : '↓'}</span>
              </button>
            </div>
          )}
        </PanelBody>
      </div>
    </div>
  )
}

function PanelBody({ panel, children }: { panel: PanelId; children: ReactNode }) {
  return (
    <div key={panel} className="flex w-full flex-col items-center gap-2">
      {children}
    </div>
  )
}
