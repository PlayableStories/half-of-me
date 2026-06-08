# Half of Me

*A short game poem about leaving home and remembering it incompletely.*

> You can remember where home was, or how it felt. Not both.

## Artist statement

Half of Me is about leaving the place you grew up in and discovering that memory
returns it only in pieces. You can recall *where* something was, or *how it
felt* — never both at once. The game makes that loss its rule.

It is played as a memory card game, but every match gives back only half a
memory: the thing without the feeling, or the feeling without the thing. The
fragments are drawn from my own writing about leaving home — a house I now see
only in dreams, warm rain no outsider believed in, books that smell of ash.
Remembering, here, is an act that completes nothing.

## Content note

Quiet themes of loss, homesickness, and leaving home. No graphic or distressing
content.

## How to play

A single sitting, about 5–10 minutes. No fail state, nothing to score.

You walk a short path to a house, are met by what is left of it, then play the
memory game inside. The cards are shown face up to study, then turned over; you
flip two at a time. Two cards match if they share **either** the same *theme*
(the thing remembered) **or** the same *colour* (the feeling remembered) — so
each match returns one half and withholds the other.

**Controls:** click, or arrow keys / WASD to walk; click cards to flip; space or
enter to advance text.

## The journey

`title → world map → house → cards → ending`

- **Title** — the name, and a fire crackling in the dark.
- **World map** — a small overworld; you walk a gated path
  (the past → the gap → the key → the other side → the present).
- **House** — you arrive at a curtained window that speaks: not your home, but
  something of one left under the ash.
- **Cards** — the memory game itself.
- **Ending** — what you brought back, and what wouldn't come together.

## Credits & licensing

- **Design, writing, code & art** — William Wong. The poem and the line-art are
  original to this work.
- **Fire-crackle ambience** — "Fireplace Sound Loop" by **PagDev**,
  [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) via
  [OpenGameArt](https://opengameart.org/content/fireplace-sound-loop); trimmed
  and re-encoded.
- **Failure beep** — generated for this game (synthesized tone), no third-party
  rights.

All third-party assets are public domain (CC0); the work as a whole is
distributable under CC BY 4.0.

## Run it

A web app (React + Vite + TypeScript). To run from source:

```bash
nvm use            # Node 24 (see .nvmrc)
npm install
npm run dev        # local dev server
npm run build      # production build → dist/
npm run preview    # preview the production build
```

The built `dist/` is a static site — open it in any modern browser.
