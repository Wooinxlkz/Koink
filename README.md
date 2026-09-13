# Koink

A small ink-blob desktop companion for Windows, built with Tauri (Rust) +
React + Tailwind + bun (same tooling as our other Tauri app).

Koink has two views:

- **Companion** — a floating morphing mascot (14 states: idle, thinking,
  wink, alert, sleep, burst, orbit, comet...) that follows your cursor with a
  soft gaze.
- **Studio** — the original avatar app's own Home (species/breed/effect-style
  gallery) plus its full geometric avatar editor (coat patterns, face,
  camera, lighting, animation timeline, SVG/PNG/GIF export), hash-routed
  internally exactly like the source project.

## Status

`v0.1.0`. Windows is the only build target for now (see
`src-tauri/tauri.conf.json`'s `bundle.targets`).

## Getting started

Requirements: [Bun](https://bun.sh) 1.3+, Rust (stable) + the
[Tauri prerequisites for Windows](https://v2.tauri.app/start/prerequisites/)
(WebView2, MSVC build tools). npm works too if you'd rather use it.

```bash
bun install
bun run tauri dev      # run it locally
bun run tauri build    # produce the Windows installer (.msi / .exe via NSIS)
```

The installer ends up under `src-tauri/target/release/bundle/`.

## Project layout

```
src/
  App.tsx                 Koink's own shell: title bar, nav, both views
  components/
    TitleBar.tsx           custom draggable title bar (window is undecorated)
    KoinkBlob.tsx           React wrapper around the blob-morph engine
  engine/
    blob-core/              framework-free morph engine (pure sample(t) fn)
    avatar-core/             framework-neutral avatar catalog + definitions
    avatar-react/            React editor/renderer built on avatar-core
    avatar-app/               the editor's own UI: Home gallery, Root router,
                              controls/panels, export — used almost as-is
```

`engine/` holds code adapted from two open-source projects (see
`THIRD_PARTY_NOTICES.md`) — the *engines* are third-party-derived, everything
around them (the app shell, branding, window chrome, packaging) is Koink's
own. `Studio` renders the vendored `Root` component (Home gallery + editor,
hash-routed) rather than a stripped-down embed, so the full original
experience is what's actually in the app.

## Release process

Tag pushes matching `v*` trigger `.github/workflows/release.yml`, which
builds a Windows installer and attaches it to a GitHub Release. The tag's
version must match `src-tauri/tauri.conf.json`'s `version` field exactly, or
the workflow fails fast in its `prepare` job.

## License

Koink's own code: Apache License 2.0 (`LICENSE`). Third-party notices for
vendored code: `THIRD_PARTY_NOTICES.md`. Security policy: `SECURITY.md`.
