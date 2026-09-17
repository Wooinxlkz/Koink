import { useEffect, useRef, useState } from 'react'
import {
  MAX_CYCLES,
  STEP,
  blocksWith,
  clampDuration,
  defaultCycle,
  makeBlock,
  moveBlock,
  nextCycleId,
  parseCycles,
  totalDuration,
  uniqueName,
  type Block,
  type Cycle
} from './engine/cycles'
import { SEQUENCE, type StateId } from './engine/states'
import type { ShapeId, ColorId } from './engine/skins'
import type { ExpressionId } from './engine/expressions'
import { BASE_SCALE, mmss, ticksFor } from './engine/timelineLayout'
import { exportGif, downloadBlob } from './gifExport'
import { readStorage, writeStorage } from './cycleStorage'
import { useCyclePlayback } from './useCyclePlayback'
import { KoinkBlob } from './KoinkBlob'

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

function loadInitialCycles(): Cycle[] {
  const stored = parseCycles(readStorage('cycles'))
  return stored.length ? stored : [defaultCycle()]
}

function loadInitialActiveId(cycles: Cycle[]): string {
  const stored = readStorage('activeCycle')
  return stored != null && cycles.some(c => c.id === stored) ? stored : cycles[0]!.id
}

export interface AnimationTimelineProps {
  shape: ShapeId
  color: ColorId
  eyeColor: ColorId | 'auto'
  expression: ExpressionId
  onPreviewStateChange: (state: StateId) => void
}

/**
 * The real "Animations" panel: build a named sequence of states, each held
 * for a chosen duration, save/switch between several such cycles. This is
 * what the reference engine's own Animations view actually is (see
 * THIRD_PARTY_NOTICES.md) — not a flat list of the 14 built-in states,
 * which is what stood in for it before.
 *
 * Block reordering is drag-and-drop, duration is a drag handle on each
 * block's right edge, and renaming a cycle uses a real dialog — the
 * underlying data model (blocks, cycles, storage, validation) is the same
 * vetted logic throughout, not a reimplementation.
 */
export function AnimationTimeline({ shape, color, eyeColor, expression, onPreviewStateChange }: AnimationTimelineProps) {
  const [cycles, setCycles] = useState<Cycle[]>(loadInitialCycles)
  const [activeId, setActiveId] = useState<string>(() => loadInitialActiveId(cycles))
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [exportProgress, setExportProgress] = useState<number | null>(null)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  const [resizingIndex, setResizingIndex] = useState<number | null>(null)
  const [renameTarget, setRenameTarget] = useState<Cycle | null>(null)
  const [renameDraft, setRenameDraft] = useState('')
  const resizeStartRef = useRef<{ x: number; duration: number } | null>(null)

  const active = cycles.find(c => c.id === activeId) ?? cycles[0]!

  useEffect(() => {
    writeStorage('cycles', JSON.stringify(cycles))
  }, [cycles])

  useEffect(() => {
    writeStorage('activeCycle', activeId)
  }, [activeId])

  useEffect(() => {
    setSelectedIndex(0)
    setPlaying(false)
  }, [activeId])

  const playbackState = useCyclePlayback(active.blocks, playing)
  const previewState = playing ? playbackState : active.blocks[selectedIndex]?.state ?? 'idle'

  useEffect(() => {
    onPreviewStateChange(previewState)
  }, [previewState, onPreviewStateChange])

  const updateActiveBlocks = (next: Block[]) => {
    setCycles(prev => prev.map(c => (c.id === activeId ? { ...c, blocks: next } : c)))
  }

  const addBlock = (state: StateId) => {
    updateActiveBlocks(blocksWith(active.blocks, state))
  }

  const removeBlock = (index: number) => {
    if (active.blocks.length <= 1) return
    updateActiveBlocks(active.blocks.filter((_, i) => i !== index))
    setSelectedIndex(i => Math.max(0, Math.min(i, active.blocks.length - 2)))
  }

  const reorder = (from: number, to: number) => {
    if (to < 0 || to >= active.blocks.length || from === to) return
    updateActiveBlocks(moveBlock(active.blocks, from, to))
    setSelectedIndex(to)
  }

  const handleDrop = (dropIndex: number) => {
    if (dragIndex != null) reorder(dragIndex, dropIndex)
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const changeDuration = (index: number, delta: number) => {
    const block = active.blocks[index]
    if (!block) return
    const next = active.blocks.slice()
    next[index] = { ...block, duration: clampDuration(block.state, block.duration + delta) }
    updateActiveBlocks(next)
  }

  const setDuration = (index: number, duration: number) => {
    const block = active.blocks[index]
    if (!block) return
    const next = active.blocks.slice()
    next[index] = { ...block, duration: clampDuration(block.state, duration) }
    updateActiveBlocks(next)
  }

  const beginResize = (index: number, startX: number) => {
    const block = active.blocks[index]
    if (!block) return
    resizeStartRef.current = { x: startX, duration: block.duration }
    setResizingIndex(index)

    const onMove = (e: PointerEvent) => {
      const start = resizeStartRef.current
      if (start == null) return
      const deltaSeconds = (e.clientX - start.x) / BASE_SCALE
      setDuration(index, start.duration + deltaSeconds)
    }
    const onUp = () => {
      resizeStartRef.current = null
      setResizingIndex(null)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
  }

  const createCycle = () => {
    if (cycles.length >= MAX_CYCLES) return
    const id = nextCycleId(cycles)
    const name = uniqueName('New cycle', cycles)
    const fresh: Cycle = { id, name, blocks: [makeBlock('idle')] }
    setCycles(prev => [...prev, fresh])
    setActiveId(id)
    setMenuOpen(false)
  }

  const renameCycle = (id: string) => {
    const target = cycles.find(c => c.id === id)
    if (!target) return
    setRenameTarget(target)
    setRenameDraft(target.name || cycleDisplayName(target))
  }

  const confirmRename = () => {
    if (renameTarget == null) return
    const name = renameDraft.trim()
    if (name !== '') {
      setCycles(prev => prev.map(c => (c.id === renameTarget.id ? { ...c, name } : c)))
    }
    setRenameTarget(null)
  }

  const deleteCycle = (id: string) => {
    if (cycles.length <= 1) return
    setCycles(prev => prev.filter(c => c.id !== id))
    if (activeId === id) setActiveId(cycles.find(c => c.id !== id)!.id)
  }

  const exportCycleGif = async () => {
    if (exportProgress != null) return
    setPlaying(false)
    setExportProgress(0)
    try {
      const blob = await exportGif({
        shape,
        color,
        eyeColor,
        expression,
        size: 320,
        fps: 20,
        background: 'white',
        source: { kind: 'cycle', blocks: active.blocks },
        onProgress: setExportProgress
      })
      downloadBlob(blob, `koink-${cycleDisplayName(active).toLowerCase().replace(/[^a-z0-9]+/g, '-')}.gif`)
    } finally {
      setExportProgress(null)
    }
  }

  const total = totalDuration(active.blocks)
  const ticks = ticksFor(total, BASE_SCALE)

  return (
    <div className="flex w-full max-w-2xl flex-col gap-4 px-6">
      {/* Cycle switcher */}
      <div className="relative flex items-center justify-center gap-2">
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="flex max-w-56 items-center gap-1.5 truncate rounded-full bg-koink-ink/10 px-3 py-1 text-sm font-medium text-koink-ink dark:bg-koink-paper/10 dark:text-koink-paper"
        >
          {cycleDisplayName(active)}
          <span aria-hidden>▾</span>
        </button>

        {menuOpen && (
          <div className="absolute top-full z-10 mt-1 w-56 rounded-xl border border-koink-ink/10 bg-koink-paper p-1 text-sm shadow-koink dark:border-koink-paper/10 dark:bg-koink-ink-soft">
            {cycles.map(c => (
              <div key={c.id} className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setActiveId(c.id)
                    setMenuOpen(false)
                  }}
                  className="flex min-w-0 flex-1 items-center gap-2 truncate rounded-lg px-2 py-1.5 text-left text-koink-ink hover:bg-koink-ink/5 dark:text-koink-paper dark:hover:bg-koink-paper/10"
                >
                  <span className="w-3 shrink-0">{c.id === activeId ? '✓' : ''}</span>
                  <span className="truncate">{cycleDisplayName(c)}</span>
                </button>
                <button
                  onClick={() => renameCycle(c.id)}
                  title="Rename"
                  className="h-6 w-6 shrink-0 rounded-md text-koink-ink/50 hover:bg-koink-ink/5 dark:text-koink-paper/50 dark:hover:bg-koink-paper/10"
                >
                  ✎
                </button>
                {cycles.length > 1 && (
                  <button
                    onClick={() => deleteCycle(c.id)}
                    title="Delete"
                    className="mr-1 h-6 w-6 shrink-0 rounded-md text-koink-ink/50 hover:bg-koink-ink/5 hover:text-red-500 dark:text-koink-paper/50 dark:hover:bg-koink-paper/10"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <div className="my-1 h-px bg-koink-ink/10 dark:bg-koink-paper/10" />
            <button
              onClick={createCycle}
              disabled={cycles.length >= MAX_CYCLES}
              className="w-full rounded-lg px-2 py-1.5 text-left text-koink-ink hover:bg-koink-ink/5 disabled:opacity-40 dark:text-koink-paper dark:hover:bg-koink-paper/10"
            >
              + New cycle
            </button>
          </div>
        )}

        <button
          onClick={() => setPlaying(p => !p)}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-koink-ink text-koink-paper dark:bg-koink-paper dark:text-koink-ink"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? '❚❚' : '▶'}
        </button>

        <button
          onClick={exportCycleGif}
          disabled={exportProgress != null}
          title="Export this cycle as a GIF"
          className="flex h-8 items-center gap-1 rounded-full bg-koink-ink/10 px-3 text-xs font-medium text-koink-ink disabled:opacity-60 dark:bg-koink-paper/10 dark:text-koink-paper"
        >
          {exportProgress != null ? `${Math.round(exportProgress * 100)}%` : 'Export GIF'}
        </button>
      </div>

      {/* Ruler */}
      <div className="relative h-4 w-full overflow-hidden text-[10px] text-koink-ink/40 dark:text-koink-paper/40">
        {ticks.map(tick => (
          <span key={tick.t} className="absolute top-0" style={{ left: tick.t * BASE_SCALE }}>
            {tick.major ? mmss(tick.t) : '·'}
          </span>
        ))}
      </div>

      {/* Block track */}
      <div className="flex w-full gap-1 overflow-x-auto pb-2">
        {active.blocks.map((block, i) => (
          <div
            key={i}
            draggable
            onDragStart={e => {
              setDragIndex(i)
              e.dataTransfer.effectAllowed = 'move'
            }}
            onDragOver={e => {
              e.preventDefault()
              if (dragOverIndex !== i) setDragOverIndex(i)
            }}
            onDragLeave={() => setDragOverIndex(current => (current === i ? null : current))}
            onDrop={e => {
              e.preventDefault()
              handleDrop(i)
            }}
            onDragEnd={() => {
              setDragIndex(null)
              setDragOverIndex(null)
            }}
            onClick={() => {
              setPlaying(false)
              setSelectedIndex(i)
            }}
            style={{ width: Math.max(56, block.duration * BASE_SCALE) }}
            className={`relative flex shrink-0 cursor-grab flex-col items-center gap-1 rounded-xl border-2 p-2 pr-3 transition-colors active:cursor-grabbing ${
              i === selectedIndex && !playing
                ? 'border-koink-ink dark:border-koink-paper'
                : 'border-transparent bg-koink-ink/5 dark:bg-koink-paper/5'
            } ${dragIndex === i ? 'opacity-40' : ''} ${
              dragOverIndex === i && dragIndex !== null && dragIndex !== i ? 'border-dashed border-koink-ink/60 dark:border-koink-paper/60' : ''
            }`}
          >
            <KoinkBlob state={block.state} shape={shape} color={color} eyeColor={eyeColor} size={16} animate={false} followPointer={false} />
            <span className="truncate text-[10px] font-medium text-koink-ink dark:text-koink-paper">
              {STATE_LABELS[block.state] ?? block.state}
            </span>
            <span className="text-[10px] text-koink-ink/50 dark:text-koink-paper/50">{block.duration.toFixed(1)}s</span>
            <div className="flex gap-0.5">
              <IconButton label="Shorter" onClick={() => changeDuration(i, -STEP)}>
                −
              </IconButton>
              <IconButton label="Longer" onClick={() => changeDuration(i, STEP)}>
                +
              </IconButton>
              <IconButton label="Move earlier" onClick={() => reorder(i, i - 1)} disabled={i === 0}>
                ←
              </IconButton>
              <IconButton label="Move later" onClick={() => reorder(i, i + 1)} disabled={i === active.blocks.length - 1}>
                →
              </IconButton>
              <IconButton label="Remove" onClick={() => removeBlock(i)} disabled={active.blocks.length <= 1}>
                ✕
              </IconButton>
            </div>

            {/* Drag handle: resize this block's duration by dragging its
                right edge, in addition to the +/− buttons above. */}
            <div
              draggable={false}
              onPointerDown={e => {
                e.stopPropagation()
                e.preventDefault()
                beginResize(i, e.clientX)
              }}
              title="Drag to change duration"
              className={`absolute -right-0.5 top-0 h-full w-2 cursor-ew-resize rounded-r-xl ${
                resizingIndex === i ? 'bg-koink-ink/30 dark:bg-koink-paper/30' : 'hover:bg-koink-ink/10 dark:hover:bg-koink-paper/10'
              }`}
            />
          </div>
        ))}
      </div>

      {/* Add-block palette */}
      <div className="flex flex-wrap justify-center gap-1.5">
        {SEQUENCE.map(id => (
          <button
            key={id}
            onClick={() => addBlock(id)}
            disabled={active.blocks.length >= 200}
            title={`Add ${STATE_LABELS[id] ?? id}`}
            className="rounded-full bg-koink-ink/10 px-2.5 py-1 text-[11px] font-medium text-koink-ink hover:bg-koink-ink/20 disabled:opacity-40 dark:bg-koink-paper/10 dark:text-koink-paper dark:hover:bg-koink-paper/20"
          >
            + {STATE_LABELS[id] ?? id}
          </button>
        ))}
      </div>

      {renameTarget && (
        <div
          className="fixed inset-0 z-[9999999] flex items-center justify-center bg-black/30"
          onClick={() => setRenameTarget(null)}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="flex w-72 flex-col gap-3 rounded-2xl bg-koink-paper p-4 shadow-koink dark:bg-koink-ink-soft"
          >
            <h3 className="font-display text-sm text-koink-ink dark:text-koink-paper">Rename cycle</h3>
            <input
              autoFocus
              value={renameDraft}
              onChange={e => setRenameDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') confirmRename()
                if (e.key === 'Escape') setRenameTarget(null)
              }}
              maxLength={60}
              className="rounded-lg border border-koink-ink/15 bg-white px-3 py-1.5 text-sm text-koink-ink outline-none focus:border-koink-ink/40 dark:border-koink-paper/15 dark:bg-koink-ink dark:text-koink-paper dark:focus:border-koink-paper/40"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRenameTarget(null)}
                className="rounded-full px-3 py-1 text-sm text-koink-ink/60 hover:bg-koink-ink/5 dark:text-koink-paper/60 dark:hover:bg-koink-paper/10"
              >
                Cancel
              </button>
              <button
                onClick={confirmRename}
                disabled={renameDraft.trim() === ''}
                className="rounded-full bg-koink-ink px-4 py-1 text-sm text-koink-paper disabled:opacity-40 dark:bg-koink-paper dark:text-koink-ink"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function cycleDisplayName(cycle: Cycle): string {
  return cycle.name.trim() !== '' ? cycle.name : 'Default cycle'
}

function IconButton({
  label,
  onClick,
  disabled,
  children
}: {
  label: string
  onClick: () => void
  disabled?: boolean
  children: string
}) {
  return (
    <button
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={e => {
        e.stopPropagation()
        onClick()
      }}
      className="flex h-5 w-5 items-center justify-center rounded text-[10px] text-koink-ink/60 hover:bg-koink-ink/10 disabled:opacity-30 dark:text-koink-paper/60 dark:hover:bg-koink-paper/10"
    >
      {children}
    </button>
  )
}
