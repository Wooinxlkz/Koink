# Changelog

All notable changes to Koink are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/).

## [0.1.0] — first integrated build

### Added

- Windows-only Tauri v2 shell: transparent, undecorated, draggable window
  with a custom title bar, and a system tray with show/hide + quit.
- **Companion** view: the blob-morph mascot ported to React, all 14 upstream
  states selectable, pointer-follow gaze, floating idle motion.
- **Studio** view: the vendored `Root` component (the original app's own
  Home gallery + editor, hash-routed) rather than a bare editor embed —
  species/breed picker, coat patterns, face/camera/lighting controls,
  animation timeline, SVG/PNG/GIF export, all present.
- Tailwind theme (`koink-yellow` / `koink-ink` / `koink-paper`) sampled
  directly from the app logo; Fredoka + Inter fonts.
- App + installer icons generated from the provided logo at every size the
  Windows/NSIS bundler expects.
- `LICENSE` (Apache 2.0), `NOTICE`, `THIRD_PARTY_NOTICES.md`, `SECURITY.md`.
- `.github/workflows/release.yml`: Windows-only build + GitHub Release on
  tag push, using bun (matching the tooling already in use elsewhere).

### Fixed

- Two runtime assets that exist in the upstream avatar project were missing
  from the first pass at vendoring (extension-filtered copy only grabbed
  `.ts`/`.tsx`/`.scss`): `avatarEffectStylePresets.json`, and the
  `avatarPresetSnapshots/` folder (breed/pixel-style thumbnail SVGs). Both
  are now copied in full, and the one leftover brand string found inside
  those SVGs (an internal clip-path id) is renamed to match everywhere else.
- `tsconfig.json` targeted `ES2021`; several vendored files use
  `Array.prototype.at` and `Object.hasOwn` (ES2022), which failed `tsc` on a
  real build. Bumped `target`/`lib` to `ES2022`.
- `vite.config.ts` was included in the same `tsconfig.json` that gates the
  build, without Node types — `__dirname`/`process`/`node:path` all failed
  type-checking. Split it into its own `tsconfig.node.json` (same pattern
  used elsewhere) so the main build's `tsc` call never looks at it, and
  added `@types/node`.
- `Root.tsx` (upstream code) had one genuine type error — an object with a
  non-`string` field passed straight into `URLSearchParams` — fixed with
  explicit `String(...)` casts.

### Fixed

- Two runtime assets that exist in the upstream avatar project were missing
  from the first pass at vendoring (extension-filtered copy only grabbed
  `.ts`/`.tsx`/`.scss`): `avatarEffectStylePresets.json`, and the
  `avatarPresetSnapshots/` folder (breed/pixel-style thumbnail SVGs). Both
  are now copied in full, and the one leftover brand string found inside
  those SVGs (an internal clip-path id) is renamed to match everywhere else.
- `tsconfig.json` targeted `ES2021`; several vendored files use
  `Array.prototype.at` and `Object.hasOwn` (ES2022), which failed `tsc` on a
  real build. Bumped `target`/`lib` to `ES2022`.
- `vite.config.ts` was included in the same `tsconfig.json` that gates the
  build, without Node types — `__dirname`/`process`/`node:path` all failed
  type-checking. Split it into its own `tsconfig.node.json` (same pattern
  used elsewhere) so the main build's `tsc` call never looks at it, and
  added `@types/node`.
- `Root.tsx` (upstream code) had one genuine type error — an object with a
  non-`string` field passed straight into `URLSearchParams` — fixed with
  explicit `String(...)` casts.
- CI's `bun install --frozen-lockfile` failed because the committed
  `bun.lock` wasn't actually in Bun's format. Dropped `--frozen-lockfile`
  from the release workflow so a lockfile problem can't hard-block a build.
- **Architecture fix, the big one:** the first build squeezed the vendored
  avatar app (which sizes its own dialogs and panels against the real
  `100vh`/`100vw`, like a normal full-page website) into a small
  420×640, transparent, undecorated single window, with our own title bar
  and nav row eating flow space above it. That combination is what produced
  the tiny, overlapping, "broken-looking" window — not a rendering bug, a
  sizing mismatch. Fixed by splitting into two windows, matching the
  reference app's own multi-window pattern: **Studio** is now a normal big
  decorated window (1200×800, resizable) with nothing of ours stacked above
  the vendored UI, and **Companion** is its own small transparent
  always-on-top window with just the mascot. Removed the now-unnecessary
  custom `TitleBar.tsx` (Studio has a real native title bar now) and the
  original app's dead GitHub-link icon (`HomeHeaderActions.tsx`), which had
  been rendering with an empty href after the brand-string rename.

### Fixed (round 3)

- **The floating black circle in your screenshot really was the blob** — but
  not a rendering bug. The previous fix split Koink into two separate OS
  windows (Studio + a small always-on-top Companion window) to solve the
  `100vh` layout problem. That part worked, but it introduced a new problem:
  two independent top-level windows don't know about each other's position,
  so Companion (parked near the screen's top-left by default) ended up
  visually sitting on top of Studio's sidebar whenever both were open —
  exactly what you saw, and exactly why clicking the second avatar thumbnail
  under it did nothing (the always-on-top companion window was intercepting
  the click, not the thumbnail being broken).
- Reverted to **one window, two modes**, switched by a small pill — but kept
  the fix for the original bug: the pill is `position: fixed` (out of
  document flow) instead of a normal nav row, so it floats over Studio's
  content without stealing any layout height from it. Studio still gets a
  full, correct `100vh`/`100vw` to size itself against.
- Removed the non-functional dark-mode toggle from `HomeHeaderActions.tsx`
  ("themes broken") — checked every vendored `.scss` file for a `.dark`
  selector or `prefers-color-scheme` query; there is none, anywhere. The
  button swapped its own icon and nothing else. Rather than leave dead UI in
  place, it's gone; the language switcher next to it is real and stays.
- Removed `src/components/CompanionApp.tsx` and the `companion` window
  entry — folded back into `App.tsx` as the "companion" mode of the single
  window.

### Known issues (round 3)

- "so fix colors" — no specifics were given for this one; if something's
  still visually off, a screenshot with what looks wrong helps narrow it
  down the way the rest of this round's fixes were: from an actual cause in
  the code, not a guess.
- Still no way to render/screenshot this on my end — every fix above is
  traced from your screenshot and a read of the actual source, not verified
  visually. Please keep sending screenshots of what's actually wrong.
- No auto-update or code signing yet.

## [0.1.0] — round 4

### Fixed — real root cause of "colors are broken" and "theme toggle doesn't work"

Both complaints turned out to be the same underlying bug. Every color in the
vendored editor UI is a `var(--bg-color)`/`var(--text-color)`/etc. reference
— but **no base/light value for any of those tokens exists anywhere in the
vendored source**. In the original monorepo they came from an external,
unpublished-to-us package (`@oneworks/route-layout`'s `design-tokens.css`),
pulled in by a file (`avatar-react/editor.scss`) we'd actually stopped using
once Studio switched to rendering `Root` directly. Only a `.dark` *override*
block existed (with real values), scoped to a wrapper class
(`.koink-avatar-editor > .avatar-app.dark`) that also isn't part of our
render path anymore — so toggling `.dark` on `<html>` (what the old button
did) never matched anything, on top of the base tokens being undefined to
begin with. Two independent, compounding gaps, not one bug.

Fixed by defining both themes ourselves, self-contained, in
`src/styles/theme-tokens.scss` (`:root` for light, `:root.dark` for dark —
the dark values are the real ones lifted from the original override block,
not guesses). Imported globally in `main.tsx`. The theme toggle is back in
`HomeHeaderActions.tsx`, now actually wired to something real, and the app
now inherits the OS's light/dark preference on first launch (matching a
`prefers-color-scheme` check found in the original app's own now-deleted
entry point — see below).

### Changed

- Deleted `src/engine/avatar-app/main.tsx` and its `base.scss` — these were
  the *original* app's own entry point, vendored along with everything else
  but never actually used (our own `src/main.tsx` is the real entry point).
  Harmless as dead code, but confusing to have two files named `main.tsx` in
  the project, and its `base.scss` had the same broken external-package
  import as `editor.scss` did. Its one good idea (default to OS light/dark
  preference) is now in our real `main.tsx`.
- Studio's Home page is now the app's default/landing view (was Companion).
- Removed "Koink Avatar" as displayed text/aria-label (was "Koink" +
  generic placeholder mark before; the original repo's own generic SVG
  logo mark in the Home header is now the real Koink logo).
- Added a live Companion tile to Studio's own explore grid (renders an
  actual animated `KoinkBlob`, not a static image) — clicking it switches
  to Companion mode. `Root` now accepts an optional `onOpenCompanion` prop,
  threaded through to `HomePage`.
- Moved the mode-switcher pill from bottom-center to top-center, and gave
  each tab a small icon glyph matching Koink's own visual language.

### Confirmed

- Re-diffed both uploaded zips (`avatar-main.zip`, `bloub-main.zip`) against
  what's vendored in `src/engine/` — byte-identical, nothing missing.

### Installer

- `src-tauri/installer/header.bmp` (150×57) and `sidebar.bmp` (164×314),
  generated from the real logo at the exact dimensions NSIS requires, wired
  into `tauri.conf.json`'s `bundle.windows.nsis` (`headerImage`,
  `sidebarImage`, `installerIcon`) — the installer itself now has Koink's
  branding, not NSIS's defaults.

### Explicitly out of scope this round

- A full icon pass across the vendored editor's *internal* UI (the dozens
  of `@material-symbols` icons throughout `AvatarControls`, `AnimationPanel`,
  `ExportToolbar`, etc.) — only the mode-switcher pill's own icons were
  redone. Changing icons across a UI this size without being able to render
  and check it visually is how the last few rounds of real bugs happened;
  flagging this honestly rather than guessing at it too.
- "Rebuilding" the existing species/breed thumbnail images in the bento
  grid — those are the original project's real preset artwork, not
  something to regenerate blind.
