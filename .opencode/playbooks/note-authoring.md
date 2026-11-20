# Note Authoring Contract

Every `unit-*.md` follows this shape. No exceptions - consistency is what makes revision fast later.

## Step 0 - the acceptance test (⭐ most important rule)

Before a unit can be called finished, it must pass this:

> **Every question belonging to this unit in the subject's official model question — or, where no model question exists, in the real 2026 board paper — must be answerable from that unit's notes alone.**

How to run it:

1. Open `<subject>/model-question.md` and read the rows mapped to this unit.
2. **Close the notes.** Answer each question out loud, or write the answer.
3. If any answer needs material from a different unit, the unit is **not done** — either add the missing material here, or accept that the mapping is wrong and fix the map.
4. Group D / case questions span units by design. They are checked at **subject** level, not unit level.

Why it is the strongest check available: it is written by the examiner, not by us. A unit can pass coverage, factual and length checks and still fail this one — that is exactly what happened to BI Unit 3 (no decision-tree/naive-Bayes comparison) and Unit 4 (no worked dashboard design).

Mapping tables live in each `model-question.md`. The rule is logged in `.opencode/memory/lessons.md`.

## Front matter (a table, always)

| Field | Content |
|---|---|
| Unit / lecture hours | from syllabus |
| Historical marks | what this unit actually carried in real papers, summed |
| Difficulty | ★1–5, with *why* |
| Exam yield | 🔴 high / 🟡 medium / ⚪ low |
| Prerequisite | which earlier unit/topic this assumes |

## Body

1. **The one-line answer** — a definition an examiner accepts, at the top, before any explanation.
2. **Plain explanation** — what it actually means, with an analogy if the concept is abstract.
3. **Structure** — tables for comparisons, numbered lists for mechanisms, ASCII for architecture.
4. **Nepal anchor** — a concrete local example where the syllabus permits it.
5. **Answer skeletons** — for the specific mark values in this unit (1, 3, 5, 20).
6. **Traps** — common mistakes, and the confusions that cost marks.
7. **Self-test** — questions with answers withheld or collapsed; a 60-second "can you draw/state X" check.

## Annotation legend (used inline)

| Marker | Meaning |
|---|---|
| 🔴 | High yield — appears repeatedly, learn cold |
| 🟡 | Medium — know the shape, not every word |
| ⚪ | Low — recognise it, don't memorise |
| ★ | Difficulty 1–5 |
| ⚠ | Trap, common mistake, or source conflict |
| 🧠 | Memory hook / mnemonic |
| 🇳🇵 | Nepal example |
| `[practice — generated]` | Question I wrote in TU style; **not** a real past question |

## Mark-length discipline

> **The two paper sizes differ.** IT 249 (BI) and IT 277 (Cloud) are 60 marks with 1/3/5-mark answers. IT 248 (IT Entrepreneurship) and IT 250 (Digital Economy) are 100 marks with 2/5/10-mark answers. Use the column for the subject you are writing.

| Marks | Length | Shape |
|---|---|---|
| 1 | 1-2 sentences, ≤ 30 words | direct definition or one reason. No preamble. |
| 2 | 45-60 words | definition + one sentence of substance, or two named items with a half-line each. Never a single sentence. |
| 3 | 80-120 words | point + 2-3 supporting lines, or 3 named points |
| 5 | 180-250 words | intro line → 4-5 points or a labelled diagram + explanation → closing line |
| 10 | 330-420 words | 4-6 headed points, one worked example, a judgement at the end |
| 20 (Group D) | 600-800 words | case restated in one line → each sub-question as its own headed answer → concepts named explicitly → conclusion |

A 1-mark question answered in a paragraph is a wasted minute you needed for Group D. A 10-mark question answered like a 3-marker is the mirror-image failure: the content is right and the marks are gone.

## Voice

Teacher, not textbook. Say *why* a thing is asked, *what* students get wrong, and *how* to write it so it scores. If a topic is genuinely hard, say so and slow down on it instead of padding.

## Writing Style Rules (2026-11-20)

### Write Like a Peer at 11 PM Before the Exam
- Not a textbook. Not a specification. "Here's what you need to pass."
- Short sentences: 15-20 words max. One idea per sentence. Split if you use "and" or "which" twice.
- Active voice: "The warehouse studies the past" not "The warehouse is analyzed for the past"
- Direct address: "Add a new record" not "A new record should be added"

### Replace Abstract Nouns with Verbs
| Abstract (weak) | Verb (strong) |
|----------------|---------------|
| "consolidation" | "combine" |
| "reconciliation" | "match" |
| "standardization" | "standardize" |
| "derivation" | "calculate" |
| "conformance" | "match" |
| "retroactively" | "after the fact" |
| "reproducibility" | "repeatability" |
| "granularity" | "detail level" |

### Cut Academic Hedges
| Delete | Keep |
|--------|------|
| "is the normal answer" | "is the answer" |
| "is worth remembering" | "remember this" |
| "tends to be" | "is" |
| "it is worth noting that" | (delete) |
| "the normal answer" | "the answer" |

### Tables > Paragraphs for Definitions
- "Subject-oriented: organized by business subject" beats "Subject-oriented means organized around business subjects rather than applications"
- Three columns max: Term | What it means | Exam phrase

### Inline Exam Hooks > Buried at Bottom
- Put "Exam hook: A3 asks X" right next to the concept
- Student sees the connection *while learning*, not after

### Inline Answer Skeletons > Buried at Bottom
- Put A2 answer right after 2.1, B2 after 2.3, etc.
- Student tries → checks → moves on

### Cut "Exam Insurance" Labels
- If it's in the notes, it's exam-relevant
- Labeling it "insurance" signals "optional" — the opposite of what you want

### Visual Hierarchy for Scanning
- Headers = what/why
- Tables = definitions/comparisons
- Bullet lists = steps/lists
- Code blocks = diagrams only
- Bold = scan targets
- Add mark badges to section headers: 🎯 1-mark / 🎯 3-mark / 🎯 5-mark

### Simplify Vocabulary
| Complex | Simple |
|---------|--------|
| "consolidated" | "combined" |
| "reconciles" | "matches" |
| "standardises" | "standardizes" |
| "conforms" | "matches" |
| "derives" | "calculates" |
| "retroactively" | "after the fact" |
| "reproducibility" | "repeatability" |
| "granularity" | "detail level" |
| "conforms" | "matches" |
| "derives" | "calculates" |

### Inline Answer Skeletons > Buried at Bottom
- Put A2 answer right after 2.1, B2 after 2.3, etc.
- Student tries → checks → moves on

### Cut "Exam Insurance" Labels
- If it's in the notes, it's exam-relevant
- Labeling it "insurance" signals "optional" — the opposite of what you want
