# Quick Reels

Quick Reels turns the existing Business Intelligence notes into a source-linked, narrated study feed at `/reels/`.

It is a static pilot built on the site's existing Node/Marked pipeline. There is no framework migration, client-side Markdown parser, or second copy of the curriculum.

## What it includes

- All six Business Intelligence units from `01-business-intelligence/`.
- Every mapped coded question from the 2026 board paper and official model paper: **42 distinct paper-and-code identities**.
- Standalone high-value source sections from the same notes.
- Exact source links to the generated heading in the relevant unit page.
- Tables, fenced diagrams, and the Unit 1 motion visual.
- Question cards with the question before the answer.
- Runtime pagination that splits at source-safe boundaries and uses a visible scroll fallback only when one indivisible passage cannot fit.
- Browser text-to-speech with a fixed or random narrator voice.
- Local MP3 music for visual-only cards.
- Seen, Done, Saved, resume position, feed preferences, and audio preferences stored in `localStorage`.
- A light reel-stage layout: one centred portrait study frame, an icon-first Listen/Source/Save/Done edge rail, separate previous/next chevrons, and secondary controls in a modal drawer.

## Run it

```bash
npm run build
npm run serve
```

Open:

```text
http://localhost:8080/reels/
```

The source files live in `reels/`. The build writes the production route to `dist/reels/`.

## Test it

```bash
npm run test:reels:content
npm run test:reels:browser
npm run test:reels
```

The content suite verifies source classification, exact official question wording, exact source-heading occurrences, source order, unique IDs, anchors, exclusions, narration text fidelity, sentence-boundary word preservation, table-row boundaries, diagrams, fail-fast handling for block, inline, nested, and table-cell HTML, and mojibake repair.

The browser suite verifies the built route at `320×568`, `360×640`, `390×844`, `844×390`, `901×500`, `1024×600`, and `1440×900`. It covers the centred portrait stage, four-action edge rail, separate navigation group, action-rail clearance, blank-card audio toggling, internal clipping, the scroll fallback cue, source links, per-feed restoration, resize-safe source atoms, state cleanup, TTS ordering and gap pause/resume, delayed voice enumeration, local music, modifier-safe keyboard controls, focus restoration, the modal drawer at desktop and mobile sizes, live regions, SVG/table/diagram semantics, Saved-only removal, speech fallback, storage failure, and corrupt-state recovery.

## Files

| File | Responsibility |
|---|---|
| `reels/content.mjs` | Build-time Markdown extraction, source heading IDs, question parsing, Unit 1 mojibake repair, exclusions, source links, and audit data. |
| `reels/bi-question-manifest.mjs` | The audited 42-question board/model-paper manifest. |
| `reels/reels.js` | Runtime feed filtering, shuffling, pagination, rendering, TTS, music, persistence, keyboard controls, and drawer accessibility. |
| `reels/reels.html` | The `/reels/` reel-stage shell, edge-rail card template, and modal drawer. |
| `reels/reels.css` | The portrait reel stage, edge-action rail, responsive drawer, card tables, diagrams, and theme values. |
| `reels/assets/music/` | Local MP3 files and their source/licence record. |
| `test-reels-content.mjs` | Source-fidelity and extraction checks. |
| `test-reels.cjs` | Playwright checks against `dist/`. |

## Source-fidelity contract

The Markdown note is authoritative.

1. The extractor does not rewrite teaching prose.
2. A question card displays the question before any answer content.
3. A question's answer content remains in source order.
4. Existing note headings keep their note wording. The original board/model wording is retained separately as `officialQuestion` metadata.
5. A mapped question that does not have a dedicated note heading uses the official question unchanged and links its answer to the mapped note section.
6. Coverage Map, Self-Test, Sixty-Second Check, and answer-skeleton repetitions stay out of the feed. A canonical question that appears first under an Answer Skeletons parent may still be included from its earlier teaching section.
7. Long content continues on another card only at sentence, list-item, code-line, or table-row boundaries. Table cells are never expanded into invented sentence fragments. Splitting retains every source word, including text before inline formatting tokens.
8. Every rendered text part has a matching narration transcript. Code identifiers, comparison operators, and emphasis remain readable in both display and TTS.
9. Unsupported raw HTML fails the build at block, inline, nested-emphasis, table-cell, and reusable-details levels instead of disappearing silently. Reusable `<details>` blocks are extracted explicitly.
10. Source links use the same deduplicated heading-ID assigner as the site build.

### Unit 1 mojibake repair

Unit 1 contains a small number of historical Windows-1252 decoding errors. `repairMojibake()` reverses only suspicious local byte runs. It does not apply a global character conversion, and it never modifies the Markdown source file.

The generated Unit 1 display text and TTS text are repaired. The original note file remains untouched.

## Question manifest

The board paper and model paper reuse codes such as `A1`. A manifest identity is therefore `paper + code`, not code alone.

Each manifest entry records:

- `id`: stable internal identity, such as `board-a1` or `model-b12`.
- `unit`: the unit that owns the displayed answer.
- `paper`: `board` or `model`.
- `code`: the paper's question code.
- `marks`: the paper's mark value.
- `officialQuestion`: exact wording from the official source file.
- `displayQuestion`: exact wording shown in Quick Reels.
- `sourceKind`: `question-heading` or `section`.
- `sourceHeading`: the exact note heading that owns or answers the question.
- `sourceHeadingOccurrence`: optional one-based occurrence for repeated note headings.
- `answerHeadings` and `answerMode`: used only for section-backed questions.

The current manifest contains:

| Unit | Questions |
|---|---:|
| 1 | 6 |
| 2 | 11 |
| 3 | 9 |
| 4 | 6 |
| 5 | 6 |
| 6 | 4 |
| **Total** | **42** |

`D21` is officially mapped to Units 2 and 6. Quick Reels files it under Unit 6 because the complete worked answer lives in `unit-6-bi-implementation.md`. The official cross-unit mapping remains recorded in `model-question.md` and is checked by the content suite.

## Build pipeline

`build.js` performs the following work:

1. Renders the normal subject pages.
2. Calls `extractReelContent()` with the BI unit list and question manifest.
3. Reconciles the heading audit.
4. Rejects missing answers, unresolved mojibake, changed mapped-question counts, and missing source anchors.
5. Writes `dist/reels/content.json`.
6. Copies the Quick Reels route, CSS, JavaScript, and local MP3 assets.

The build exits non-zero if any gate fails.

## Runtime feed model

The runtime does not paginate the source Markdown directly. It receives semantic entries from `content.json`:

```json
{
  "id": "bi-q-model-b12",
  "unit": 2,
  "kind": "question",
  "code": "B12",
  "paper": "model",
  "manifestId": "model-b12",
  "questionText": "Describe the star schema and its main components.",
  "officialQuestion": "Describe the star schema and its main components.",
  "sourceAnchor": "2-4-data-modelling",
  "sourceUrl": "../bi/unit-2.html#2-4-data-modelling",
  "parts": []
}
```

Runtime steps:

1. Filter by unit and Saved-only state.
2. Sort by the ordered or seeded shuffle feed.
3. Measure and split each entry into cards at semantic boundaries.
4. Restore the same source entry and atom boundary when possible.
5. Render one active card and keep inactive cards inert.

A card key combines the stable entry ID and continuation index. The persisted position also stores the active atom boundary: a table row range, diagram line range, or text-part hash. Resizing repaginates the feed and restores that source boundary even when the runtime chunk width changes.

Ordered and shuffled feeds use separate positions. Ordered positions do not depend on the shuffle seed. Feed keys are `order|unit|saved-or-all` for ordered feeds and `order|unit|saved-or-all|seed` for shuffled feeds.

## Audio model

### Text cards

- Browser speech synthesis starts only after a user gesture.
- The selected voice is reused for the question and answer of one card.
- Random mode chooses one English voice per card, then keeps it for that card.
- Fixed voices support both the modern `voiceschanged` event and legacy `onvoiceschanged` browsers. A saved voice that never appears shows an explicit unavailable/system-fallback label.
- Question narration is one segment. Answer narration is the second segment.
- A deliberate 450ms pause separates the two. Pause/resume during that gap keeps the answer pending and never restarts the question.
- Speech rate is persisted from 0.75× to 1.25× and stays consistent across all segments of one card.
- The full transcript remains visible when speech is unavailable or fails.

### Visual cards

- Visual cards use a local MP3 from `reels/assets/music/`.
- Navigation after a user gesture may start the visual track.
- Play/Pause controls the track explicitly.
- Visual cards do not start text narration.
- Music volume is persisted independently from the speech rate.

Music source and licence details are in `reels/assets/music/CREDITS.md` and are also available in the controls drawer.

## Persisted state

State is stored under `quickReels.state.v1`:

```json
{
  "version": 1,
  "seen": [],
  "done": [],
  "saved": [],
  "lastPosition": null,
  "positions": {},
  "voice": "random",
  "speechRate": 1,
  "shuffleSeed": 541385059,
  "order": "ordered",
  "unit": "all",
  "savedOnly": false,
  "musicVolume": 0.28,
  "muted": false
}
```

Malformed storage and unsupported state versions fall back to safe defaults. Removed entry IDs, removed units, and stale Saved-only references are cleaned on load. Storage failure does not stop the feed; the progress note then says that progress cannot be saved instead of falsely claiming it was saved.

## Keyboard and accessibility

| Key | Action |
|---|---|
| `ArrowUp` | Previous card |
| `ArrowDown` | Next card |
| `Space` | Play or pause narration |
| `M` | Mute or unmute audio |
| `S` | Toggle Saved |
| `D` | Toggle Done |
| `Escape` | Close the controls drawer |

The `M`, `S`, and `D` shortcuts run only without Ctrl, Meta, or Alt and only when focus is not on a link, button, form control, or editable element. Modified browser shortcuts keep their native behaviour.

The controls drawer starts closed and inert at every viewport size. While open, it exposes `role="dialog"`, `aria-modal="true"`, traps focus in both directions, and makes the reading stage inert. Escape, scrim, the internal close button, and programmatic close paths restore focus to the menu trigger. The current card alone is exposed to assistive technology; inactive cards are inert.

Long prose wraps instead of clipping, including long question titles at narrow landscape sizes. A card that still contains an indivisible over-height passage uses a named scrollable body with a visible scroll cue. The body reserves a clear strip beside the icon rail so actions never cover source text, tables, or diagrams. Card changes, audio state, Saved/Done state, load errors, and empty-feed recovery use separate live regions. The motion SVG is associated with its caption list; tables and diagrams have contextual accessible names and remain keyboard focusable.

## Add another subject

Reuse the same engine rather than cloning the interface:

1. Add the subject's unit files and build metadata in `build.js`.
2. Create a subject-specific question manifest with stable paper-and-code identities.
3. Pass that manifest to `extractReelContent()`.
4. Generate a subject payload and copy the same route assets.
5. Add subject-specific filters and the subject's existing accent token.
6. Run the content and browser suites with the new subject's expected counts.

Do not rewrite the notes to fit the feed. If a mapped answer is missing from a note, fix the note first or explicitly mark the coverage gap; do not invent an answer in the extractor.
