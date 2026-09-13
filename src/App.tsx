import Root from './engine/avatar-app/Root'
import { AvatarLocaleProvider } from './engine/avatar-app/avatarLocale'

/**
 * Studio window content. This is the original avatar app's own Home
 * (species/breed/effect-style gallery) + editor, hash-routed internally —
 * rendered full-bleed, with nothing of ours stacked above it.
 *
 * Why full-bleed matters here specifically: this vendored UI sizes several
 * of its own elements (dialogs, the controls rail, the home hero) against
 * `100vh`/`100vw` directly, the way a normal full-page website does. Any
 * chrome of ours consuming flow space above it — a title bar, a nav row —
 * throws that math off by exactly that many pixels, which is what produced
 * the overlapping/cut-off look before. The window itself now has a native
 * title bar (see src-tauri/tauri.conf.json's "main" window), so nothing
 * needs to be added here at all.
 */
export function App() {
  return (
    <AvatarLocaleProvider initialLocale="en" persist={false}>
      <Root />
    </AvatarLocaleProvider>
  )
}
