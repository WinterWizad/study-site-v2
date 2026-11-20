# IT 277 — Cloud Computing

**Paper:** 60 marks / 30 pass · **Time:** 3 hours · **Lecture hours:** 48 · **Units:** 7

## Exam structure (verified from model question)

| Group | Format | Marks | Word budget |
|---|---|---|---|
| A | 10 × 1 (attempt all) | 10 | 25–30 words each |
| B | any 5 of 6 × 3 | 15 | 80–120 words each |
| C | any 3 of 4 × 5 | 15 | 180–250 words each |
| D | 2 × 10 (compulsory) | 20 | 300–400 words each |

**Total attempted:** 10 + 18 + 20 + 20 = 68 → 60 counted.

## Unit progress

| Unit | File | Read | Blurted | Quizzed | Timed answer | Model-question test |
|---|---|---|---|---|---|---|
| 1 | `unit-1-introduction.md` | ✅ | ⬜ | ⬜ | ⬜ | ✅ A1, A4, B12 |
| 2 | `unit-2-architecture.md` | ✅ | ⬜ | ⬜ | ⬜ | ✅ A2, A3, A5, B11, C17 |
| 3 | `unit-3-applications.md` | ✅ | ⬜ | ⬜ | ⬜ | ✅ (insurance — no model questions) |
| 4 | `unit-4-virtualization.md` | ✅ | ⬜ | ⬜ | ⬜ | ✅ A6, B13, B14, D21 |
| 5 | `unit-5-mapreduce.md` | ✅ | ⬜ | ⬜ | ⬜ | ✅ A8, B15, C19 |
| 6 | `unit-6-security.md` | ✅ | ⬜ | ⬜ | ⬜ | ✅ A7, A9, B16, C18, C20, D22 |
| 7 | `unit-7-platforms.md` | ✅ | ⬜ | ⬜ | ⬜ | ✅ A10 |

**Rule:** write one unit at a time → QC → if PASS, move to next. The model-question questions mapped to the unit are the acceptance test.

## Folder contents

```
03-cloud-computing/
  README.md                 ← this file
  question-bank.md          ← model question verbatim + coverage map
  model-question.md         ← the official TU/FOM model question
  _syllabus/IT277-cloud-computing.md  (in _syllabus/)
  unit-1-introduction.md
  unit-2-architecture.md
  unit-3-applications.md
  unit-4-virtualization.md
  unit-5-mapreduce.md
  unit-6-security.md
  unit-7-platforms.md
  00-cheatsheet.md          ← after all units
  answers/                  ← Tier-2 model answers
  _qc/cloud-computing-review.md  ← QC log
```

## The three things that decide this paper

1. **Security is the case engine.** Unit 6 carries 25/60 marks (A7, A9, B16, C18, C20, D22). The model question's Group D case D22 is entirely security. A board paper will likely keep this weight.
2. **Virtualization is the diagram engine.** Unit 4 carries 17/60 marks (A6, B13, B14, D21). B13 and B14 are 3-markers that expect a labelled diagram of Type 1 and Type 2 hypervisors. D21 is the 10-mark rewrite — same content, triple depth: role in cloud economics + diagram + judgement.
3. **Unit 3 is the insurance unit.** Zero marks in the model question, but 5 LHs and a perfect place for a board setter to put a 5-marker on migration, licensing, cost model, SLA, or web application design. Read it, don't deep-dive.
4. **Unit 7 is the name-drop unit.** 12 LHs, 1 mark (AppEngine). Know: AppEngine (Google PaaS), Azure (Microsoft IaaS/PaaS), Aneka (managed PaaS for .NET), Web services (SOAP/REST, WSDL/JSON). One line each.

## Length discipline (60-mark paper)

| Mark | Target words | Hard cap | Notes |
|---|---|---|---|
| 1 | 25–30 | 30 | Group A — definitions with one illustrative detail |
| 3 | 80–120 | 120 | Group B — mechanism + example + why it matters |
| 5 | 180–250 | 250 | Group C — structure, evaluation, implications |
| 10 | 300–400 | 450 | Group D — structured, with diagram where applicable |

**Count from the saved file, never estimate.** The word-count script works here too.

## Study order for this subject

The model question's mark distribution dictates the study order:

1. **Unit 6 (Security)** — 25 marks, 6 hours → highest yield
2. **Unit 4 (Virtualization)** — 17 marks, 8 hours → second engine
3. **Unit 2 (Architecture)** — 11 marks, 5 hours → service/deployment models, SOA
4. **Unit 5 (MapReduce)** — 9 marks, 7 hours → architecture, parallel efficiency
5. **Unit 1 (Introduction)** — 5 marks, 5 hours → definitions, easy marks
6. **Unit 3 (Applications)** — 0 marks in model, 5 hours → insurance
7. **Unit 7 (Platforms)** — 1 mark in model, 12 hours → name-drop only

**Do not study in syllabus order.** Study in marks-per-hour order.