# Koink

A small ink-blob desktop companion for Windows, built with Tauri (Rust) +
React + Tailwind + bun (same tooling as our other Tauri app).

Koink is **two windows**, not one:

- **Studio** (`main` window) — a normal, big, native-decorated window
  (1200×800 by default, resizable), exactly the original avatar app's own
  Home (species/breed/effect-style gallery) + full geometric editor (coat
  patterns, face, camera, lighting, animation timeline, SVG/PNG/GIF export),
  rendered full-bleed. This UI was built as a normal full-page website that
  sizes several of its own elements against the real window — it needs a
  real, roomy window to look right, so that's what it gets.
- **Companion** (`companion` window) — a small (260×260), transparent,
  undecorated, always-on-top window: just the morphing mascot. Drag it
  anywhere, click it to cycle a few states, double-click to bring Studio
  forward.

Both are declared in `src-tauri/tauri.conf.json`; a single Vite bundle
serves both (`src/main.tsx` checks which window it's in via a `?window=`
query flag and renders the right React tree — see `src/App.tsx` vs.
`src/components/CompanionApp.tsx`).

## Status

`v0.1.0`. Windows is the only build target for now (see
`src-tauri/tauri.conf.json`'s `bundle.targets`).

## Getting started

Requirements: [Bun](https://bun.sh) 1.3+, Rust (stable) + the
[Tauri prerequisites for Windows](https://v2.tauri.app/start/prerequisites/)
(WebView2, MSVC build tools).

```bash
bun install
bun run tauri dev      # run it locally
bun run tauri build    # produce the Windows installer (.msi / .exe via NSIS)
```

The installer ends up under `src-tauri/target/release/bundle/`.

## Project layout

```
src/
  App.tsx                     Studio window content (full-bleed Root)
  components/
    CompanionApp.tsx           Companion window content (just the mascot)
    KoinkBlob.tsx               React wrapper around the blob-morph engine
  engine/
    blob-core/                  framework-free morph engine (pure sample(t) fn)
    avatar-core/                 framework-neutral avatar catalog + definitions
    avatar-react/                 React editor/renderer built on avatar-core
    avatar-app/                   the editor's own UI: Home gallery, Root
                                  router, controls/panels, export — used
                                  almost as-is, full-bleed in its own window
```

`engine/` holds code adapted from two open-source projects (see
`THIRD_PARTY_NOTICES.md`) — the *engines* are third-party-derived, everything
around them (the two-window shell, branding, packaging) is Koink's own.

## Release process

Tag pushes matching `v*` trigger `.github/workflows/release.yml`, which
builds a Windows installer and attaches it to a GitHub Release. The tag's
version must match `src-tauri/tauri.conf.json`'s `version` field exactly, or
the workflow fails fast in its `prepare` job.

## License

Koink's own code: Apache License 2.0 (`LICENSE`). Third-party notices for
vendored code: `THIRD_PARTY_NOTICES.md`. Security policy: `SECURITY.md`.
