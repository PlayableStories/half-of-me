/**
 * ============================================================================
 *  Half of Me — CONTENT
 * ============================================================================
 *
 *  Single source of truth for ALL player-facing TEXT and the DECK. Re-skinning
 *  is mostly editing values here, plus the colours/fonts in `src/theme.css` and
 *  the icons in `src/icons/index.tsx`. You do not need to touch the engine.
 *
 *  The mechanic to preserve: two cards match if they share the same THEME or
 *  the same COLOUR. Each match reveals half a memory — the thing without the
 *  feeling (theme match), or the feeling without the thing (colour match).
 *
 *  A THEME is one memory split into two different cards (its `members`) — e.g.
 *  "Sun & rain" is a Sun card and a Rain card that match each other. Matching a
 *  theme's two halves reveals that theme's fragment. The fragments below are
 *  drawn from the author's own writing about leaving home.
 * ============================================================================
 */

export const content = {
  /** Shown as the game title (and the browser tab). */
  title: 'Half of Me',
  /** Small subtitle under the title. */
  tagline: 'a place I only reach now in dreams',
  /** Line shown beneath the deck during the face-up preview phase. */
  previewCaption:
    "Look as long as you like. The associations you catch now are the clues I'll remember them by.",
  /** Label on the button that starts the game. */
  startButton: 'Start remembering',

  /**
   * THEMES — each is one memory split into two different cards (`members`).
   * A theme appears twice in the deck (once per member).
   *  - id:      internal slug, referenced by `deck` (via its members) and matching.
   *  - label:   the theme's name (used for accessibility, not shown on the board).
   *  - story:   shown on a THEME match — the thing remembered, the feeling lost.
   *             ("\n" is a line break.)
   *  - members: the two cards that make up the theme; each has its own slug
   *             (referenced by `deck` and the icon map) and player-visible label.
   */
  objects: [
    {
      id: 'home',
      label: 'House & living room',
      story:
        "I remember the house exactly — the pictures, the sofa by the window.\nI only ever see it now when I'm asleep.",
      members: [
        { id: 'house', label: 'House' },
        { id: 'livingroom', label: 'Living room' },
      ],
    },
    {
      id: 'weather',
      label: 'Sun & rain',
      story:
        "I remember the rain coming down warm.\nNo one who wasn't from there ever believed me.",
      members: [
        { id: 'sun', label: 'Sun' },
        { id: 'rain', label: 'Rain' },
      ],
    },
    {
      id: 'library',
      label: 'Books & pen',
      story:
        'I kept every book I ever owned, for the smell of the pages.\nThey smell of ash now.',
      members: [
        { id: 'books', label: 'Books' },
        { id: 'pen', label: 'Pen' },
      ],
    },
    {
      id: 'travel',
      label: 'Arrival & departure',
      story:
        "I remember the clocks, the queues, the gates.\nThere was never enough time for goodbye — and I can't tell if I was arriving or leaving.",
      members: [
        { id: 'arrival', label: 'Arrival' },
        { id: 'departure', label: 'Departure' },
      ],
    },
    {
      id: 'harbour',
      label: 'Ferris wheel & ferry',
      story:
        'I remember the ferry, the Ferris wheel, the wind off the harbour.\nThe smoke from the chimney is still inside me.',
      members: [
        { id: 'ferriswheel', label: 'Ferris wheel' },
        { id: 'ferry', label: 'Ferry' },
      ],
    },
    {
      id: 'hearth',
      label: 'Fireplace & Christmas tree',
      story:
        'They say a fire crackling sounds like home.\nI could never make it mean anything warm.',
      members: [
        { id: 'fireplace', label: 'Fireplace' },
        { id: 'tree', label: 'Christmas tree' },
      ],
    },
  ],

  /**
   * COLOURS — the emotional tones. Each colour appears three times.
   *  - id:      internal slug; its hex lives in `theme.css` as `--colour-<id>`.
   *  - label:   the player-visible name.
   *  - meaning: design note about the tone (not shown to the player).
   *  - story:   shown on a COLOUR match — the feeling remembered, the place lost.
   */
  colours: [
    {
      id: 'yellow',
      label: 'Yellow',
      meaning: 'warmth / comfort / being held',
      story: 'I feel the warmth of being held.\nFor a moment I can put the rest down.',
    },
    {
      id: 'blue',
      label: 'Blue',
      meaning: 'distance / loneliness / freedom',
      story:
        "Looking back from this distance, I still feel it.\nI can't tell if it was loneliness or freedom.",
    },
    {
      id: 'red',
      label: 'Red',
      meaning: 'anger / frustration',
      story: "I still feel the anger.\nI can't always see what it was for.",
    },
    {
      id: 'grey',
      label: 'Grey',
      meaning: 'numbness / absence / losing half of oneself',
      story: 'Sometimes I feel nothing at all.\nLike half of me is missing.',
    },
  ],

  /**
   * THE DECK — one [memberId, colourId] pair per card. Each theme contributes
   * its two members (so a theme appears twice) and each colour appears three
   * times, so both theme-matches and colour-matches are always possible. The
   * two halves of a theme carry different colours. Keep the count even.
   */
  deck: [
    ['house', 'yellow'],
    ['livingroom', 'blue'],
    ['sun', 'red'],
    ['rain', 'blue'],
    ['books', 'grey'],
    ['pen', 'red'],
    ['arrival', 'blue'],
    ['departure', 'yellow'],
    ['ferriswheel', 'yellow'],
    ['ferry', 'grey'],
    ['fireplace', 'red'],
    ['tree', 'grey'],
  ],

  /** Miscellaneous UI strings. `{remembered}` / `{total}` are filled at runtime. */
  ui: {
    remembered: 'remembered',
    turnSingular: 'turn',
    turnPlural: 'turns',
    storyContinueHint: 'tap, or press space, to continue',
    endTitle: 'I found half of home.',
    endComplete: 'The other half stayed there.',
    endPartial:
      'I brought {remembered} of {total} back. The rest would not come together.',
    playAgain: 'Remember again',
    boardLabel: 'Memory board',
    faceDownLabel: 'Face-down card',
  },

  /** Title screen. The title/tagline above are reused here. */
  intro: {
    beginButton: 'Begin',
    beginHint: 'press space to begin',
  },

  /**
   * World map — a short SMB3-style overworld. The traveller steps between
   * connected places; the named places below label the nodes. Keys must match
   * the node ids in WorldMapScene.
   */
  worldMap: {
    caption: 'You are a long way from home.',
    enterLabel: 'Enter the house',
    walkHint: 'arrow keys — or click a path — to walk',
    enterHint: 'press enter to go inside',
    ariaLabel: 'A map of paths leading to a small house',
    places: {
      road: 'the past',
      woods: 'the gap',
      bridge: 'the key',
      well: 'the other side',
      house: 'the present',
    },
  },

  /**
   * House / NPC conversation. Gentle, a little strange, never over-explaining.
   * Each line is one dialogue beat; the last leads into the card preview.
   */
  house: {
    speaker: '',
    lines: [
      'You came a long way back.',
      'This is not your home.\nBut something of one is still here, under the ash.',
      'What returns will return halved — the place, or the feeling. Never both at once.',
    ],
    continueHint: 'tap, or press space, to continue',
  },
} as const
