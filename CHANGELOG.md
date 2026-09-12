# Changelog

All notable changes to Koink are documented here. Format loosely follows
[Keep a Changelog](https://keepachangelog.com/).

## [0.1.0] — first integrated build

### Added

- Windows-only Tauri v2 shell: transparent, undecorated, draggable window
  with a custom title bar, and a system tray with show/hide + quit.
- **Companion** view: the blob-morph mascot ported to React, all 14 upstream
  states selectable, pointer-follow gaze, floating idle motion.
- **Studio** view: the full geometric avatar editor (species/breed picker,
  coat patterns, face/camera/lighting controls, animation timeline, SVG/PNG/
  GIF export) embedded via its React `<AvatarEditor />` component.
- Tailwind theme (`koink-yellow` / `koink-ink` / `koink-paper`) sampled
  directly from the app logo; Fredoka + Inter fonts.
- App + installer icons generated from the provided logo at every size the
  Windows/NSIS bundler expects.
- `LICENSE` (Apache 2.0), `NOTICE`, `THIRD_PARTY_NOTICES.md`, `SECURITY.md`.

### Known issues

- Not yet built end-to-end (`npm install` / `cargo build` haven't been run
  against a live registry) — see `README.md`'s **Known rough edges**.
- No auto-update, code signing, or CI/CD release pipeline yet.
