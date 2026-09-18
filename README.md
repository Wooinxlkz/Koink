# Koink

A small ink-blob desktop companion for Windows, built with Tauri (Rust) +
React + Tailwind + bun (same tooling as our other Tauri app).

One window, three modes, switched with a small floating pill at the
top-center (theme toggle and language switcher — English, Chinese, Arabic,
kept explicitly left-to-right — live right next to it, shared across all
three, and fully translated for both Home/Studio and Companion):

- **Home** — the app's front door: Studio's real species/breed gallery
  (the same screen Studio itself opens into, see below), including a live
  Companion tile in that grid. Not a separate simplified page anymore.
- **Companion** — the morphing mascot in its own real workspace (a left
  sidebar rail, like Studio's), not just floating controls: Customize
  (shape × 8, color × 12 + a custom color picker, eye color × 12 + auto +
  custom, expression × 16 — all live previews of the actual engine, see
  `src/companion/BlobCustomizer.tsx`), Animations (a real cycle/timeline
  editor — build named sequences of states with custom durations, not a
  flat list of 14 buttons, see `src/companion/AnimationTimeline.tsx`), and
  Settings (a real, working follow-cursor toggle, using the reference
  engine's own tuned gaze constants). See
  `src/companion/CompanionWorkspace.tsx`. Companion has its own dedicated
  folder (`src/companion/`) — components and engine together, separate
  from Studio's.
- **Studio** — jumps straight into the full geometric avatar editor (coat
  patterns, face, camera, lighting, animation timeline, SVG/PNG/GIF
  export) with a random avatar — no gallery screen first, since Home
  already is that gallery now. `Root.tsx`'s `startInEditor` prop is what
  makes this tab behave differently from Home despite both rendering the
  same underlying component.

The mode switcher is `position: fixed` rather than a normal nav bar — see
the comment at the top of `src/App.tsx` for why that specific detail
matters here (short version: Studio's own CSS sizes things against the
real `100vh`/`100vw`, so anything of ours that consumes actual layout
height above it throws that off).

## Status

`v0.1.9`. Windows is the only build target for now (see
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
  styles/
    theme-tokens.scss            light/dark color tokens for the whole app
  companion/                   Companion's own folder — components + engine
    KoinkBlob.tsx                 React wrapper around the blob-morph engine
    BlobCustomizer.tsx             shape/color/expression picker
    CompanionWorkspace.tsx          sidebar-rail workspace layout
    AnimationTimeline.tsx           real cycle/timeline editor (the Animations panel)
    useCyclePlayback.ts             drives playback state from a cycle's blocks
    cycleStorage.ts                 guarded localStorage for saved cycles
    gifExport.ts                    GIF export (states or full cycles)
    engine/                        framework-free morph + cycle/timeline-layout logic
  engine/
    avatar-core/                 framework-neutral avatar catalog + definitions
    avatar-react/                 React editor/renderer built on avatar-core
    avatar-app/                   the editor's own UI: Home gallery, Root
                                  router, controls/panels, export — used
                                  almost as-is
```

`companion/engine/` and `engine/` hold code adapted from two open-source
projects between them (see `THIRD_PARTY_NOTICES.md`) — the *engines* are
third-party-derived, everything around them (the app shell, workspace
layout, branding, packaging) is Koink's own.

## Known gaps in the vendored editor

- Species/breed names in Studio (Bear, Tiger, Panda, etc.) always display
  in English regardless of language — the original app generates these
  from internal IDs rather than passing them through translation, so
  there's no dictionary entry to add.
- Language coverage differs by area: Companion's own UI (tabs, panels,
  every shape/color/expression/state label) is fully covered in all three
  languages (English, Chinese, Arabic — verified programmatically, not by
  spot-checking). Studio's much larger, separate string set has full
  Chinese coverage (shipped with the original project) but only partial
  Arabic — untranslated strings there fall back to English, same as any
  locale's own gaps elsewhere.
- The bottom-right rainbow ring in Studio isn't ours — it's the original
  app's own camera-orientation gizmo (`AvatarOrientationControl.tsx`); drag
  it to rotate the avatar's view.
- The animation/cycle timeline editor *is* ported (round 4) — real cycles,
  real blocks, real storage, drag-and-drop reordering, drag-to-resize
  duration, and a real rename dialog (round 8; the first pass used buttons
  and a browser prompt instead — closed out once named explicitly). GIF
  export *is* also ported (round 5) — export a state's idle loop or a full
  custom cycle, same `gifenc` pattern already used elsewhere in this
  project. **MP4/video export is not ported** — the reference's video
  encoder depends on an external library (`mediabunny`) this project
  doesn't have and can't add without network access in the build
  environment. That's a structural constraint, not a scope choice.

## Release process

Tag pushes matching `v*` trigger `.github/workflows/release.yml`, which
builds a Windows installer and attaches it to a GitHub Release. The tag's
version must match `src-tauri/tauri.conf.json`'s `version` field exactly, or
the workflow fails fast in its `prepare` job.

## License

Koink's own code: Apache License 2.0 (`LICENSE`). Third-party notices for
vendored code: `THIRD_PARTY_NOTICES.md`. Security policy: `SECURITY.md`.
