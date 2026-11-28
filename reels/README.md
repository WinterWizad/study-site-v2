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
- Narration read from the build-time Groq reel transcript, using a browser voice. No cloud account, key, or per-play network call is involved.
- **Reel transcripts** — one AI-generated reel transcript per entry, generated at build time via Groq (qwen primary, gpt-oss fallback). The transcript is the only narration script: if a card has no transcript it plays nothing. The caption dock shows the same script while leaving the original note visible.
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

### Narration configuration

Quick Reels needs no narration credentials at runtime. The build generates one Groq reel transcript per entry; the browser reads that transcript with a local voice. `GROQ_API_KEY` is the only required variable, and only for the build.

The Google Cloud variables below are legacy: they belong to the dormant `/api/narration` endpoint and the deployment-time MP3 priming script. The current narrator menu never offers a Google voice, and the client only uses rendered audio when the build actually shipped static assets. Leave them unset.

| Variable | Required | Purpose |
|---|---|---|
| `GROQ_API_KEY` | Build | Authenticates AI reel-transcript generation via Groq at build time. |
| `GROQ_TTS_PRIME_ENTRIES` | No | Number of initial AI transcript entries queued for deployment-time MP3 generation; default `0`. |
| `GOOGLE_CLOUD_TTS_API_KEY` | Legacy | Authenticates Chirp 3 HD synthesis in the build and the dormant `/api/narration`. Unused by the current UI. |
| `UPSTASH_REDIS_REST_URL` | Legacy | Shared, durable narration quota store for the dormant endpoint. |
| `UPSTASH_REDIS_REST_TOKEN` | Legacy | Authenticates the Upstash quota store. |
| `GOOGLE_TTS_VOICE` | Legacy | Overrides `en-US-Chirp3-HD-Achernar`. |
| `GOOGLE_TTS_LANGUAGE_CODE` | Legacy | Overrides `en-US`. |
| `GOOGLE_TTS_PACE` | Legacy | Sets synthesis pace from `0.25` to `2`; the runtime also supports a `0.75×`–`1.25×` playback rate. |
| `GOOGLE_TTS_MODEL_VERSION` | Legacy | Changes the cache identity when the voice model changes. |
| `GOOGLE_TTS_PRIME_ENTRIES` | Legacy | Number of initial playable entries queued for deployment-time MP3 generation; default `12`. |
| `GOOGLE_TTS_DAILY_CHAR_BUDGET` | Legacy | Daily app-level character cap; default `100000`. |
| `GOOGLE_TTS_MONTHLY_CHAR_BUDGET` | Legacy | Monthly app-level character cap; default `900000`, below Google's 1M-character free monthly tier. |
| `GOOGLE_TTS_REQUESTS_PER_FIVE_MINUTES` | Legacy | Shared request cap; default `300`. |
| `GOOGLE_TTS_MAX_PRIME_CHARS` | Legacy | Safety cap for one priming run; default `900000`. |
| `GOOGLE_TTS_PRIME_CONCURRENCY` | Legacy | Parallel synthesis jobs during priming; default `4`, maximum `8`. |

`GOOGLE_TTS_ALLOW_LOCAL_QUOTA=true` is a diagnostic escape hatch. Do not enable it on Vercel: serverless instances need the durable Upstash counters to enforce one shared quota.

Build and prime the initial narration with:

```bash
npm run build:narrated
```

`build:narrated` fails when the Google credential is missing. It primes the first playable entries, writes versioned MP3s to `dist/reels/audio/`, and marks those segments as static in `content.json`. Later segments remain available through the protected `/api/narration` endpoint.

## Test it

```bash
npm run test:reels:content
npm run test:narration
npm run test:reels:browser
npm run test:reels
```

The content suite verifies source classification, exact official question wording, exact source-heading occurrences, source order, unique IDs, anchors, exclusions, narration text fidelity, sentence-boundary word preservation, table-row boundaries, diagrams, fail-fast handling for block, inline, nested, and table-cell HTML, and mojibake repair.

The narration suite verifies narration-only normalisation, protected known-segment requests, immutable cache headers, quota and rate-limit responses, concurrent-request deduplication, ETag reuse, Google request shape, pace retry, and deployment-prime selection.

The browser suite verifies the built route at `320×568`, `360×640`, `390×844`, `844×390`, `901×500`, `1024×600`, and `1440×900`. It covers the centred portrait stage, four-action edge rail, separate navigation group, action-rail clearance, blank-card audio toggling, internal clipping, the scroll fallback cue, source links, per-feed restoration, resize-safe source atoms, state cleanup, TTS ordering and gap pause/resume, delayed voice enumeration, local music, modifier-safe keyboard controls, focus restoration, the modal drawer at desktop and mobile sizes, live regions, SVG/table/diagram semantics, Saved-only removal, Google playback and fallback, prefetch deduplication and limits, speech fallback, storage failure, and corrupt-state recovery.

## Files

| File | Responsibility |
|---|---|
| `reels/content.mjs` | Build-time Markdown extraction, source heading IDs, question parsing, Unit 1 mojibake repair, exclusions, source links, and audit data. |
| `reels/bi-question-manifest.mjs` | The audited 42-question board/model-paper manifest. |
| `reels/reels.js` | Runtime feed filtering, shuffling, pagination, rendering, Google/AI/browser narration, prefetch, music, persistence, keyboard controls, and drawer accessibility. |
| `reels/reels.html` | The `/reels/` reel-stage shell, edge-rail card template, narrator controls, and modal drawer. |
| `reels/reels.css` | The portrait reel stage, edge-action rail, responsive drawer, card tables, diagrams, and theme values. |
| `reels/speech.mjs` | Narration-only normalisation, contextual arrow wording, profile hashing, segment IDs, deterministic manifest generation, **and AI transcript manifest generation**. |
| `reels/google-tts.mjs` | Google Chirp synthesis request and pace-rejection fallback. |
| `api/narration.mjs` | Protected known-segment narration endpoint with durable quota controls and immutable caching; serves both deterministic and AI segment IDs. |
| `scripts/prime-narration.mjs` | Deployment-time MP3 generation for deterministic and AI segments, static-asset marking. |
| `scripts/reel-adapter.mjs` | Production-safe Groq client: qwen primary (`reasoning_effort: "none"`), gpt-oss fallback, per-entry cache by source/prompt/model hash, `cleanForTTS()`, protected-token validation, graceful no-key behavior. |
| `scripts/reel-prompts/` | Copied canonical production prompts (`reel-writer.system.v3.txt`, `reel-writer.user.txt`) from `tools/reel/`. |
| `reels/assets/music/` | Local MP3 files and their source/licence record. |
| `test-reels-content.mjs` | Source-fidelity and extraction checks. |
| `test-narration.mjs` | Normalisation, manifest, API, quota, cache, and priming checks. |
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
8. Every rendered text part has a matching narration segment. The visible text stays unchanged; only the spoken copy removes structural labels, arrows, flags, and instructional annotations. Code identifiers, comparison operators, dates, money, percentages, and meaningful parentheses remain readable.
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
5. Builds the versioned narration manifest and entry-to-segment references.
6. Builds a parallel AI transcript manifest: one reel transcript per entry, generated via Groq (qwen primary, gpt-oss fallback), with deterministic fallback and per-entry validation.
7. Writes `dist/reels/content.json` with both `narration` and `aiTranscript` manifests.
8. Copies the Quick Reels route, CSS, JavaScript, and local MP3 assets.

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

### Reel transcripts (the only narration source)

- One AI-generated reel transcript is built per entry at build time using Groq. Primary model: `qwen/qwen3.8-27b` (temperature `0.7`, max tokens `900`, reasoning effort `none`). Fallback for RPD/TPM failures: `openai/gpt-oss-20b` (temperature `0.7`, max tokens `1400`, reasoning effort `low`).
- The AI only transforms source notes into reel-style spoken transcripts. It never rewrites the authoritative Markdown, original cards, tables, or diagrams.
- Each transcript preserves protected tokens (dates, money, percentages, formulas, identifiers) and exact blockquote wording when present. It runs through `cleanForTTS()` (cue removal, markdown stripping, emoji removal, whitespace collapse) before segmentation.
- Transcript segment IDs use the `aiseg-` prefix and are versioned independently.
- The build strips `narration` from the browser payload (≈30% smaller per subject) and writes the full copy to `dist/reels/narration-manifest.json`, which only the dormant `/api/narration` reads.
- Playback reads the transcript with a browser voice. There is no second source: no card text, no atom narration, no cloud provider. A card with no transcript plays nothing and says `No narration for this card.`
- The hub-menu `Subtitles` switch controls the caption dock only. Captions are on by default and always show the same script the voice is reading.
- `GROQ_API_KEY` must be set for transcript generation. Without it, entries have no transcript and the reel says so instead of inventing narration.

### Captions

- One spoken utterance is one caption. The caption advances when the utterance starts, so it cannot drift from the voice.
- Scaffolding (`TITLE:`/`TABLE:`/`DIAGRAM:` markers, pipe table rows, box-drawing frames) is dropped from both audio and captions.
- Long lines are hard-wrapped at word boundaries, never mid-word. Captions stay at or below 180 characters.
- The caption dock is a polite `status` region, sits above the footer, and lets pointer events through to the card.

### Text cards

- One browser voice reads every utterance of a card. `Random browser voice per card` is the default; a fixed browser voice or the system voice can be chosen.
- Fixed browser voices support both the modern `voiceschanged` event and legacy `onvoiceschanged` browsers. A saved voice that never appears shows an explicit unavailable/system-fallback label.
- Speech rate is persisted from 0.75× to 1.25× and stays consistent across all utterances of one card.
- The full visible transcript remains unchanged when narration or speech is unavailable or fails.

### Visual cards

- Dedicated visual cards use a local MP3 from `reels/assets/music/`. Table and diagram cards keep their source layout and are narrated.
- Navigation after a user gesture may start the visual track.
- Play/Pause controls the track explicitly.
- Visual cards play music only: no narration and no captions.
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
  "narratorVersion": 3,
  "subtitlesEnabled": true,
  "speechRate": 1,
  "shuffleSeed": 541385059,
  "order": "ordered",
  "unit": "all",
  "savedOnly": false,
  "musicVolume": 0.28,
  "muted": false
}
```

Retired narrator values (`google`, `ai`, `kokoro`, `piper-*`) migrate to `random` on load, and the old `aiNarrationEnabled` key migrates to `subtitlesEnabled`.

Malformed storage and unsupported state versions fall back to safe defaults. Removed entry IDs, removed units, and stale Saved-only references are cleaned on load. Storage failure does not stop the feed; the progress note then says that progress cannot be saved instead of falsely claiming it was saved. Narrator version `2` migrates the old random-browser default to Google while keeping explicitly selected browser voices.

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

Long prose wraps instead of clipping, including long question titles at narrow landscape sizes. A card that still contains an indivisible over-height passage uses a named scrollable body with a visible scroll cue. The body reserves a clear strip beside the icon rail so actions never cover source text, tables, or diagrams. Card changes, audio state, Saved/Done state, load errors, empty-feed recovery, and provider loading or failure messages use separate live regions. The motion SVG is associated with its caption list; tables and diagrams have contextual accessible names and remain keyboard focusable.

## Add another subject

Reuse the same engine rather than cloning the interface:

1. Add the subject's unit files and build metadata in `build.js`.
2. Create a subject-specific question manifest with stable paper-and-code identities.
3. Pass that manifest to `extractReelContent()`.
4. Generate a subject payload and copy the same route assets.
5. Add subject-specific filters and the subject's existing accent token.
6. Run the content and browser suites with the new subject's expected counts.

Do not rewrite the notes to fit the feed. If a mapped answer is missing from a note, fix the note first or explicitly mark the coverage gap; do not invent an answer in the extractor.
