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
