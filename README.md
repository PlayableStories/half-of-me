# Half of Me

A short game poem about leaving home and remembering it incompletely. It uses a
memory card game where two cards match if they share **either** the same object
**or** the same colour — so every match returns only *half* a memory: the thing
without the feeling, or the feeling without the thing.

> You can remember where home was, or how it felt. Not both.

Half of Me is a fresh "Level 2" rebuild that takes its core mechanic from the
[Memory of Home](https://github.com/PlayableStories/memory-of-home) prototype and
develops it into a more complete game poem (title, world map, house/NPC framing,
fading visuals, ending).

## Stack

- React 18 + Vite + TypeScript
- DOM + CSS for cards and scenes (no canvas / game engine)
- **Node 24** (see `.nvmrc`)

## Develop

```bash
nvm use            # Node 24
npm install
npm run dev        # dev server with hot reload
npm run build      # typecheck (tsc -b) + production build
npm run lint
npm run preview    # preview the production build
```

## Where things live

| Path | What |
|------|------|
| `src/content.ts` | All player-facing text + the 12-card deck (single source of truth) |
| `src/theme.css` | Palette, card colours (`--colour-<id>`), fonts |
| `src/styles.css` | Layout, card flip, overlays |
| `src/game/` | Engine: deck, match logic, story lookup, types |
| `src/components/` | Board, CardView, Hud, StoryOverlay, EndScreen |
| `src/scenes/` | Scene manager types + scenes (`Title`, `WorldMap`, `House`, `CardGame`) |
| `src/icons/` | Per-object line-art SVGs |

## Roadmap (see the GDD)

- **Phase 1 — Foundation & playable card core** ✅
- **Phase 2 — Title / world map / house / NPC framing scenes** ✅
- Phase 3 — Refined story fragments
- Phase 4 — Visual transformation (image → symbol)
- Phase 5 — Ending screen
- Phase 6 — Polish (animation, sound, typography, layout)

The scene manager in `src/App.tsx` is built to host the later scenes without a
rewrite: register a component in `SCENES` and navigate with `goTo('<id>')`.
