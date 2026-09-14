# Koink

A small ink-blob desktop companion for Windows, built with Tauri (Rust) +
React + Tailwind + bun (same tooling as our other Tauri app).

One window, three modes, switched with a small floating pill at the
top-center (theme toggle and language switcher live right next to it,
shared across all three):

- **Home** — the app's front door: two cards, pick Companion or Studio.
- **Companion** — the morphing mascot in its own real workspace (a left
  sidebar rail, like Studio's), not just floating controls: Customize
  (shape × 8, color × 12, expression × 16 — all live previews of the actual
  engine, see `src/components/BlobCustomizer.tsx`), Animations (the 14
  states), and Settings (follow-cursor toggle). See
  `src/components/CompanionWorkspace.tsx`.
- **Studio** — the original avatar app's own Home (species/breed/effect-style
  gallery, plus a live Companion tile right in that same grid) plus its
  full geometric avatar editor (coat patterns, face, camera, lighting,
  animation timeline, SVG/PNG/GIF export), rendered full-bleed, hash-routed
  internally exactly like the source project.

The mode switcher is `position: fixed` rather than a normal nav bar — see
the comment at the top of `src/App.tsx` for why that specific detail
matters here (short version: Studio's own CSS sizes things against the
real `100vh`/`100vw`, so anything of ours that consumes actual layout
height above it throws that off).

## Status

`v0.1.2`. Windows is the only build target for now (see
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
  App.tsx                     three modes, one window, floating pill + theme/lang
  components/
    KoinkBlob.tsx               React wrapper around the blob-morph engine
    BlobCustomizer.tsx           shape/color/expression picker
    CompanionWorkspace.tsx        Companion's sidebar-rail workspace layout
    HomeLanding.tsx               the app's own front-door tab
  styles/
    theme-tokens.scss            light/dark color tokens for the whole app
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

- Species/breed names in Studio (Bear, Tiger, Panda, etc.) always display
  in English regardless of language — the original app generates these
  from internal IDs rather than passing them through translation, so
  there's no dictionary entry to add. Everything else in the UI is fully
  covered in both languages (verified by diffing every `t()` call site
  against the dictionary programmatically, not by spot-checking).
- The bottom-right rainbow ring in Studio isn't ours — it's the original
  app's own camera-orientation gizmo (`AvatarOrientationControl.tsx`); drag
  it to rotate the avatar's view.
- The reference engine's animation timeline editor, GIF/video export, and
  saved-preset gallery aren't ported — Companion's workspace covers shape/color/
  expression (Customize), the 14 built-in states (Animations), and a
  follow-cursor toggle (Settings), matching the reference engine's own
  three-panel sidebar structure, but not those three larger features.

## Release process

Tag pushes matching `v*` trigger `.github/workflows/release.yml`, which
builds a Windows installer and attaches it to a GitHub Release. The tag's
version must match `src-tauri/tauri.conf.json`'s `version` field exactly, or
the workflow fails fast in its `prepare` job.

## License

Koink's own code: Apache License 2.0 (`LICENSE`). Third-party notices for
vendored code: `THIRD_PARTY_NOTICES.md`. Security policy: `SECURITY.md`.
