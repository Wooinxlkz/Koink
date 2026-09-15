import { useEffect, useState } from 'react'
import type { Block } from './engine/cycles'
import type { StateId } from './engine/states'

/**
 * Drives which state should be showing at the current point in a cycle's
 * playback. Rather than polling elapsed time every animation frame, this
 * schedules exactly one timer per block transition — cheap, and exact
 * regardless of block duration.
 */
export function useCyclePlayback(blocks: Block[], playing: boolean): StateId {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!playing || blocks.length === 0) return
    let cancelled = false
    let i = 0
    setIndex(0)

    const scheduleNext = () => {
      const duration = blocks[i]?.duration ?? 1
      return setTimeout(() => {
        if (cancelled) return
        i = (i + 1) % blocks.length
        setIndex(i)
        timer = scheduleNext()
      }, duration * 1000)
    }
    let timer = scheduleNext()

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [playing, blocks])

  return blocks[Math.min(index, Math.max(blocks.length - 1, 0))]?.state ?? 'idle'
}
