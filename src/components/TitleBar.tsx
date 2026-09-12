import { getCurrentWindow } from '@tauri-apps/api/window'

const appWindow = getCurrentWindow()

export function TitleBar({ title = 'Koink' }: { title?: string }) {
  return (
    <div
      data-tauri-drag-region
      className="flex h-9 w-full shrink-0 items-center justify-between bg-koink-ink/90 px-3 text-koink-paper"
    >
      <div data-tauri-drag-region className="flex items-center gap-2 text-xs font-display tracking-wide">
        <img src="/favicon.png" alt="" className="h-4 w-4 rounded-full" />
        {title}
      </div>
      <div className="flex items-center gap-1">
        <button
          aria-label="Minimize"
          className="h-6 w-6 rounded hover:bg-white/10"
          onClick={() => appWindow.minimize()}
        >
          &#8211;
        </button>
        <button
          aria-label="Close"
          className="h-6 w-6 rounded hover:bg-white/10"
          onClick={() => appWindow.close()}
        >
          &times;
        </button>
      </div>
    </div>
  )
}
