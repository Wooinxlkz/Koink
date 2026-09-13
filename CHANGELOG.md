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

### Known issues

- No auto-update or code signing yet.
