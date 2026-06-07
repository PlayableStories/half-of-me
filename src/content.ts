/**
 * ============================================================================
 *  Half of Me — CONTENT
 * ============================================================================
 *
 *  Single source of truth for ALL player-facing TEXT and the DECK. Re-skinning
 *  is mostly editing values here, plus the colours/fonts in `src/theme.css` and
 *  the icons in `src/icons/index.tsx`. You do not need to touch the engine.
 *
 *  The mechanic to preserve: two cards match if they share the same OBJECT or
 *  the same COLOUR. Each match reveals half a memory — the thing without the
 *  feeling (object match), or the feeling without the thing (colour match).
 *
 *  NOTE: fragment wording here is the GDD's working text; Phase 3 refines it.
 * ============================================================================
 */

export const content = {
  /** Shown as the game title (and the browser tab). */
  title: 'Half of Me',
  /** Small subtitle under the title. */
  tagline: 'a home that only returns in fragments',
  /** Line shown beneath the deck during the face-up preview phase. */
  previewCaption: 'Look as long as you like. Once you begin, only half returns.',
  /** Label on the button that starts the game. */
  startButton: 'Start remembering',

  /**
   * OBJECTS — the "things" on the cards. Each object appears twice in the deck.
   *  - id:    internal slug, referenced by `deck` and the icon map.
   *  - label: the player-visible name.
   *  - story: shown on an OBJECT match — the thing remembered, the feeling lost.
   *           ("\n" is a line break.)
   */
  objects: [
    {
      id: 'house',
      label: 'House',
      story: "I remember the house.\nI don't remember whether it was warm.",
    },
    {
      id: 'trees',
      label: 'Trees',
      story: "I remember the trees outside.\nI don't remember the season.",
    },
    {
      id: 'dog',
      label: 'Pet dog',
      story: "I remember the dog waiting.\nI don't remember who came home first.",
    },
    {
      id: 'table',
      label: 'Dining table',
      story: 'I remember the table.\nThe voices around it are missing.',
    },
    {
      id: 'suitcase',
      label: 'Suitcase',
      story: "I remember the suitcase.\nI don't remember deciding to leave.",
    },
    {
      id: 'photobook',
      label: 'Photobook',
      story: "I remember the photobook.\nI don't remember which picture was true.",
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
      meaning: 'warmth / family / comfort',
      story: "I remember warmth.\nI don't remember which room held it.",
    },
    {
      id: 'blue',
      label: 'Blue',
      meaning: 'distance / sadness / separation',
      story: "I remember distance.\nI don't remember when it began.",
    },
    {
      id: 'red',
      label: 'Red',
      meaning: 'love / conflict / urgency',
      story: "I remember the urgency.\nI don't remember what we said.",
    },
    {
      id: 'grey',
      label: 'Grey',
      meaning: 'forgetting / dust / absence',
      story: 'I remember absence.\nIt had no clear shape.',
    },
  ],

  /**
   * THE DECK — one [objectId, colourId] pair per card (GDD §12). Each object
   * appears twice and each colour three times, so both object-matches and
   * colour-matches are always possible. Keep the count even.
   */
  deck: [
    ['house', 'yellow'],
    ['house', 'blue'],
    ['trees', 'blue'],
    ['trees', 'red'],
    ['dog', 'yellow'],
    ['dog', 'grey'],
    ['table', 'red'],
    ['table', 'grey'],
    ['suitcase', 'blue'],
    ['suitcase', 'yellow'],
    ['photobook', 'grey'],
    ['photobook', 'red'],
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
      "{remembered} of {total} fragments returned. The rest wouldn't connect.",
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
      road: 'the road',
      woods: 'the woods',
      bridge: 'the bridge',
      well: 'the well',
      house: 'the house',
    },
  },

  /**
   * House / NPC conversation. Gentle, a little strange, never over-explaining.
   * Each line is one dialogue beat; the last leads into the card preview.
   */
  house: {
    speaker: '',
    lines: [
      'You have come a long way.',
      'This is not your home.\nBut something of it may still be here.',
      'You may look for as long as you want.\nOnce you begin, only half will return.',
    ],
    continueHint: 'tap, or press space, to continue',
  },
} as const
