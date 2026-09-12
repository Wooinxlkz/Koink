# Koink

A small ink-blob desktop companion for Windows, built with Tauri (Rust) +
React + Tailwind.

Koink has two views:

- **Companion** — a floating morphing mascot (14 states: idle, thinking,
  wink, alert, sleep, burst, orbit, comet...) that follows your cursor with a
  soft gaze.
- **Studio** — a full geometric avatar customizer: species/breed, coat
  patterns, face, camera, lighting, and an animation timeline, exportable to
  SVG / PNG / GIF.

## Status

`v0.1.0` — first integrated build. Windows is the only target for now (see
`src-tauri/tauri.conf.json`'s `bundle.targets`).

## Getting started

Requirements: Node 18+, pnpm or npm, Rust (stable) + the
[Tauri prerequisites for Windows](https://v2.tauri.app/start/prerequisites/)
(WebView2, MSVC build tools).

```bash
npm install
npm run tauri dev      # run it locally
npm run tauri build    # produce the Windows installer (.msi / .exe via NSIS)
```

The installer ends up under `src-tauri/target/release/bundle/`.

> This scaffold was assembled without network access to fetch crates/npm
> packages or run a build, so `npm install` / `cargo build` haven't been
> exercised end-to-end yet. See **Known rough edges** below before your
> first build.

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
    avatar-app/               the editor's actual UI (controls, panels, export)
src-tauri/
  src/lib.rs               Tauri builder: window, system tray, commands
  tauri.conf.json           window config, Windows-only bundle targets
  icons/                    generated from public/koink-logo.png
```

`engine/` holds code adapted from two open-source projects (see
`THIRD_PARTY_NOTICES.md`) — the *engines* are third-party-derived, everything
around them (the app shell, branding, window chrome, packaging) is Koink's
own.

## Known rough edges

Since this was built without a working npm/cargo toolchain in the loop:

- Dependency versions in `package.json`/`Cargo.toml` are pinned to what was
  current when this was written — bump anything `npm install`/`cargo build`
  complains about.
- The vendored avatar editor is a large codebase (see `src/engine/avatar-app`)
  moved out of its original monorepo; if `tsc`/Vite surfaces a missing import
  on first build, it's almost certainly one relative path that needs
  adjusting, not a design problem — see `THIRD_PARTY_NOTICES.md` for what was
  changed vs. left as-is.
- Icons were generated from `public/koink-logo.png` at all the sizes Tauri's
  Windows bundler expects; run `npm run tauri icon public/koink-logo.png` if
  you ever swap the logo, to regenerate them properly instead of by hand.

## License

Koink's own code: Apache License 2.0 (`LICENSE`). Third-party notices for
vendored code: `THIRD_PARTY_NOTICES.md`. Security policy: `SECURITY.md`.
