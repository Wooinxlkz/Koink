# blob-core

Framework-free morph engine that drives Koink's floating mascot (the small
morphing ink-blob companion). Vendored from an MIT-licensed reference project
and kept as-is: it has no brand strings in it and no framework dependency, so
it didn't need renaming — only `KoinkBlob.tsx` (in `src/components/`) wraps it
for React.

## API you actually use

```ts
import { BotEngine } from '../engine/blob-core/engine'

const engine = new BotEngine(100 /* scale */, 'idle' /* initial state */)
engine.setState('listen', performance.now() / 1000)   // change state
const frame = engine.sample(performance.now() / 1000)  // pure fn of time
// frame.bodyPath, frame.eyes, frame.dots, frame.arcs -> feed into <svg>
```

`sample(t)` is a pure function of time — no internal clock — so you drive it
from a `requestAnimationFrame` loop in the wrapper component. See
`KoinkBlob.tsx` for the full render loop.

State ids, shapes and colors live in `states.ts` and `skins.ts`.

Third-party origin and license: see `/THIRD_PARTY_NOTICES.md` at the project root.
