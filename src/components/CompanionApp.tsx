import { useState } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { WebviewWindow } from '@tauri-apps/api/webviewWindow'
import { KoinkBlob } from './KoinkBlob'
import type { StateId } from '../engine/blob-core/states'

const CLICK_STATES: StateId[] = ['idle', 'thinking', 'wink', 'alert', 'burst', 'sleep']

async function openStudio() {
  const existing = await WebviewWindow.getByLabel('main')
  if (existing) {
    await existing.show()
    await existing.setFocus()
  }
}

/**
 * The floating companion: just the mascot, on a fully transparent,
 * undecorated, always-on-top window (see the "companion" window in
 * src-tauri/tauri.conf.json). Drag it anywhere via the window itself;
 * double-click to bring the Studio window forward; click the mascot to
 * cycle through a few states for fun.
 */
export function CompanionApp() {
  const [stateIndex, setStateIndex] = useState(0)
  const state = CLICK_STATES[stateIndex]

  return (
    <div
      data-tauri-drag-region
      onDoubleClick={openStudio}
      className="relative flex h-full w-full items-center justify-center"
    >
      <button
        aria-label="Koink"
        onClick={() => setStateIndex(i => (i + 1) % CLICK_STATES.length)}
        className="cursor-pointer rounded-full bg-transparent"
      >
        <KoinkBlob state={state} size={90} />
      </button>

      <button
        aria-label="Close companion"
        title="Hide companion"
        onClick={() => getCurrentWindow().hide()}
        className="absolute right-1 top-1 h-5 w-5 rounded-full bg-koink-ink/10 text-xs text-koink-ink/60 opacity-0 transition-opacity hover:opacity-100"
      >
        &times;
      </button>
    </div>
  )
}
