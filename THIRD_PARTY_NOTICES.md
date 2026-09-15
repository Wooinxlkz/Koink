# Third-party notices

Koink's own original code is licensed under Apache License 2.0 (see
`/LICENSE`). It also contains source adapted from two MIT-licensed
open-source projects. Their license terms require keeping the original
copyright notice attached to the code — that's what this file is for. It is
the only place in this repository where the upstream project names appear;
nothing in the app's UI, package names, exports, or comments references them.

---

## 1. Blob-morph engine and animation/timeline logic (`src/companion/engine/`, `src/companion/*.ts(x)`)

The core morph engine (`engine.ts`, `states.ts`, `skins.ts`, `expressions.ts`,
etc.) is vendored unmodified apart from one comment pointing at our own
wrapper component instead of the upstream one. Two more pieces were added
from the same upstream project in round 4 (cycles/timeline editor): the
block/cycle data model (`cycles.ts`) was already part of this vendored
folder and is used as-is; the ruler/zoom layout math
(`timelineLayout.ts`) is a direct port of the upstream project's own
timeline-layout module (originally under a different path in their
source, `src/ui/`, not `src/bot/` — same project, different folder).
Separately, `KoinkBlob.tsx`'s pointer-follow gaze uses tuned constants
(max yaw/pitch, baseline pitch) taken from that project's own gaze
module — the numbers are copied, not the file itself, since the rest of
that module is tightly coupled to features (an intro sequence, a
settings-panel turn) that don't exist here.

```
MIT License

Copyright (c) 2026 Jérémy Perret

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

**Worth knowing, separately from the code license:** the original project
describes itself as a recreation of a third party's (x.ai's "Grok" bot)
visual avatar design, measured frame-by-frame from a reference video, and its
README is explicit that the MIT license covers the *code*, not the *design*
it imitates, and that the project is not affiliated with or endorsed by that
company. Koink's mascot currently reuses that engine's default shapes/colors.
If Koink is ever published or distributed publicly, it's worth either (a)
adjusting the shapes/palette enough that the resemblance to that third
party's avatar is no longer recognizable, or (b) treating this as a real
open question to run past someone with IP expertise — code licensing and
"does this look like someone else's mascot" are two separate questions, and
only the first one is settled by the MIT license above.

## 2. Geometric avatar editor (`src/engine/avatar-core/`, `src/engine/avatar-react/`, `src/engine/avatar-app/`)

Vendored and adapted: all references to the original product/organization
name were mechanically renamed throughout (package scope, CSS class names,
comments, UI strings) before this code became part of Koink. The MIT license
below is reproduced here, covering the original work this was adapted from.

```
MIT License

Copyright (c) 2026-present One Works contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 3. Other bundled open-source packages

Standard runtime/build dependencies (React, Vite, Tailwind CSS, Framer
Motion, Tauri, gifenc, @material-symbols/svg-400, etc.) keep their own
licenses as published on npm/crates.io and are not reproduced here; none of
them are modified, so their own package metadata is the authoritative notice.
