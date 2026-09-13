# Koink

A small ink-blob desktop companion for Windows, built with Tauri (Rust) +
React + Tailwind + bun (same tooling as our other Tauri app).

One window, two modes, switched with a small floating pill at the bottom:

- **Companion** — the morphing mascot (14 states: idle, thinking, wink,
  alert, sleep, burst, orbit, comet...), centered and idly floating.
- **Studio** — the original avatar app's own Home (species/breed/effect-style
  gallery) plus its full geometric avatar editor (coat patterns, face,
  camera, lighting, animation timeline, SVG/PNG/GIF export), rendered
  full-bleed, hash-routed internally exactly like the source project.

The mode switcher is `position: fixed` rather than a normal nav bar — see
the comment at the top of `src/App.tsx` for why that specific detail
matters here (short version: Studio's own CSS sizes things against the
real `100vh`/`100vw`, so anything of ours that consumes actual layout
height above it throws that off).

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
  App.tsx                     both modes, one window, floating pill switcher
  components/
    KoinkBlob.tsx               React wrapper around the blob-morph engine
  engine/
    blob-core/                  framework-free morph engine (pure sample(t) fn)
    avatar-core/                 framework-neutral avatar catalog + definitions
    avatar-react/                 React editor/renderer built on avatar-core
    avatar-app/                   the editor's own UI: Home gallery, Root
                                  router, controls/panels, export — used
                                  almost as-is
```

`engine/` holds code adapted from two open-source projects (see
`THIRD_PARTY_NOTICES.md`) — the *engines* are third-party-derived, everything
around them (the app shell, branding, packaging) is Koink's own.

## Known gaps in the vendored editor

- The original theme toggle (moon icon) was removed — nothing in the
  vendored CSS actually responds to a `.dark` class, so it did nothing but
  swap its own icon. Language switching is real and still there.
- The bottom-right rainbow ring in Studio isn't ours — it's the original
  app's own camera-orientation gizmo (`AvatarOrientationControl.tsx`); drag
  it to rotate the avatar's view.

## Release process

Tag pushes matching `v*` trigger `.github/workflows/release.yml`, which
builds a Windows installer and attaches it to a GitHub Release. The tag's
version must match `src-tauri/tauri.conf.json`'s `version` field exactly, or
the workflow fails fast in its `prepare` job.

## License

Koink's own code: Apache License 2.0 (`LICENSE`). Third-party notices for
vendored code: `THIRD_PARTY_NOTICES.md`. Security policy: `SECURITY.md`.
