# Half of Me

A short game poem about leaving home and remembering it incompletely. It uses a
memory card game where two cards match if they share **either** the same object
**or** the same colour — so every match returns only *half* a memory: the thing
without the feeling, or the feeling without the thing.

> You can remember where home was, or how it felt. Not both.

Half of Me is a fresh "Level 2" rebuild that takes its core mechanic from the
[Memory of Home](https://github.com/PlayableStories/memory-of-home) prototype and
develops it into a more complete game poem (title, world map, house/NPC framing,
ending).

## The idea

Half of Me is about leaving the place you grew up in and finding that memory
gives it back only in pieces — you can recall *where* something was, or *how it
felt*, never both at once. The game turns that into the rule you play by.

The story fragments are drawn from the author's own writing about leaving home,
so the deck is personal rather than generic: a house seen only in dreams, warm
rain no outsider believed in, books that now smell of ash.

## How it plays

A memory card game on a 12-card board. The cards are shown face up to study,
then turned over; you flip two at a time looking for a match. Two cards match if
they share **either**:

- **the same theme** — the *thing* remembered. Each theme is one memory split
  into two different cards (e.g. *Sun* & *Rain*, *Books* & *Pen*). Matching a
  theme's two halves returns the place or object — but not the feeling.
- **the same colour** — the *feeling* remembered. Four tones: yellow (warmth),
  blue (distance), red (frustration), grey (numbness). Matching two cards of a
  colour returns the feeling — but not where it belongs.

So every match gives back *half* a memory, and which half depends on how the two
cards happened to connect. Theme takes priority when a pair shares both.

**The deck.** 12 cards = 6 themes × 2 members, with 4 colours each appearing 3
times. The two halves of a theme always carry different colours, so both kinds
of match stay reachable and the board never deadlocks.

## The journey

The game is framed as a short sequence, not a bare board:

`title → world map → house → cards → ending`

- **Title** — the name, and a fire crackling in the dark.
- **World map** — a tiny SMB3-style overworld; you walk a gated path
  (the past → the gap → the key → the other side → the present).
- **House** — you arrive at a curtained window that speaks: not your home, but
  something of one left under the ash.
- **Cards** — the memory game itself.
- **Ending** — what you brought back, and what wouldn't come together.

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
| `src/assets/audio/` | Audio assets (fire crackle loop) |

## Roadmap (see the GDD)

- **Phase 1 — Foundation & playable card core** ✅
- **Phase 2 — Title / world map / house / NPC framing scenes** ✅
- **Phase 3 — Refined story fragments & framing copy** ✅
- Phase 4 — Visual transformation (image → symbol) — *deferred*: cards use SVG
  line-art, so there's no detailed image to degrade into a symbol; revisit if
  detailed art is added.
- Phase 5 — Dedicated ending scene — *deferred*: the current in-place end
  screen is enough for now.
- **Phase 6 — Polish (animation, sound, typography, layout)** — in progress
  (audio started: title-scene fire ambience, map failure beep).

The scene manager in `src/App.tsx` is built to host the later scenes without a
rewrite: register a component in `SCENES` and navigate with `goTo('<id>')`.

## Credits

- **Fire crackle loop** (`src/assets/audio/fire-loop.*`) — "Fireplace Sound Loop"
  by **PagDev**, released under [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)
  via [OpenGameArt](https://opengameart.org/content/fireplace-sound-loop).
  Trimmed and re-encoded to a seamless `webm`/`mp3` loop. CC0 requires no
  attribution; credited here with thanks.
