# Half of Me — a vibe-coding demonstration

*Forking a simple memory game into a short story about leaving home — and a way
to look outward at displacement around the world.*

> You can remember where home was, or how it felt. Not both.

## What this is

A short game poem (about 5–10 minutes) built as a demonstration for vibe-coding
workshops — sessions where people who work on co-ops, community projects, and
social impact turn their own stories into playable browser games, no coding
experience needed.

It shows how, through "vibe coding" — guiding an AI assistant in plain
language — you can take a tiny, generic game and grow it into something that
carries a personal story and points outward to a real cause.

## The fork: from Memory of Home to Half of Me

It starts from
[Memory of Home](https://github.com/PlayableStories/memory-of-home), a bare
memory-matching prototype — the "Level 1" game: flip cards, find pairs, done.

Half of Me is the "Level 2" fork. The same core mechanic is bent until it means
something: two cards match if they share **either** the same *theme* **or** the
same *colour*, so every match returns only *half* a memory — the thing without
the feeling, or the feeling without the thing. Around that, a title, a world
map, an arrival at a house, story fragments, sound, and an ending were added,
turning a card game into a small poem about leaving home.

The point of the demonstration: the distance from "a memory game" to "a game
that says something" is shorter than it looks.

## From one story to many

The fragments are personal — one person's home, half-remembered. But losing home
is not rare. Around the world, disaster — natural and human — uproots millions
of people from the places they belong to.

At the end, the game invites you to read real accounts of that displacement,
gathered by the
[Climate Disaster Project](https://climatedisasterproject.com/stories-archive/),
a teaching newsroom documenting survivors' testimonies of climate disaster and
displacement.

## How it plays

You walk a short path to a house, are met by what is left of it, then play the
memory game inside. The cards are shown face up to study, then turned over; you
flip two at a time, matching by theme or by colour.

**Controls:** click, or arrow keys / WASD to walk; click cards to flip; space or
enter to advance text.

## Built with

Vibe-coded with an AI assistant. React + Vite + TypeScript; DOM + CSS, no game
engine. To run from source:

```bash
nvm use            # Node 24 (see .nvmrc)
npm install
npm run dev        # local dev server
npm run build      # production build → dist/
npm run preview    # preview the production build
```

The built `dist/` is a static site — it runs opened as a file or hosted anywhere
(asset paths are relative).

## Credits & licensing

- **Design, writing, code & art** — William Wong.
- **Fire-crackle ambience** — "Fireplace Sound Loop" by **PagDev**,
  [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/) via
  [OpenGameArt](https://opengameart.org/content/fireplace-sound-loop); trimmed
  and re-encoded.
- **Failure beep** — generated for this game (synthesized tone), no third-party
  rights.

All third-party assets are public domain (CC0); the work as a whole is
distributable under CC BY 4.0.
