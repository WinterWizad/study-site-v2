# BIM 8th Semester — Exam Prep Workspace

**Exam:** 15 Bhadra · **Runway:** ~2 weeks · **Budget:** 3–4 hrs/day · **Papers:** 4 (theory only)

## The four papers

**Two different paper sizes** — check the marks column before planning study time.

| # | Subject | Code | Marks | Folder | Notes | Answers | Cheat sheet | QC | Mock |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Business Intelligence | IT 249 | **60** | `01-business-intelligence/` | 🟢 units 1–6 done | ⬜ | ⬜ | ⬜ | ⬜ |
| 2 | Digital Economy | IT 250 | **100** | `02-digital-economy/` | 🟢 units 1–6 done | ⬜ | ⬜ | ⬜ | ⬜ |
| 3 | Cloud Computing | IT 277 | **60** | `03-cloud-computing/` | 🟢 units 1–7 done | ⬜ | ⬜ | ⬜ | ⬜ |
| 4 | IT Entrepreneurship & Management | IT 248 | **100** | `04-it-entrepreneurship-management/` | 🟢 units 1–6 done | ⬜ | ⬜ | ⬜ | ⬜ |

Not in scope by your decision: Internship (IT 350) viva, lab/practical components, .NET / DBA / Big Data electives.

Every subject folder now has a `model-question.md` — the official TU/FOM paper for that subject, and the **acceptance test** each unit is checked against. IT 250's has no model question to carry; it says so and uses the 2026 board paper instead.

## Exam format — two patterns, both verified

| | **60 marks** (IT 249, IT 277) | **100 marks** (IT 248, IT 250) |
|---|---|---|
| Pass | 30 | 50 |
| Group A | 10 × 1 = 10 | 10 × **2** = 20 |
| Group B | any 5 of 6 × 3 = 15 | any 6 of 7 × 5 = 30 |
| Group C | any 3 of 4 × 5 = 15 | any 3 of 4 × **10** = 30 |
| Group D | 1 × 20 (board) or 2 × 10 (model) = 20 | 1 × 20 = 20 |

Group D alone is a third to a fifth of the paper. The 100-mark papers ask for **40 more marks in the same 3 hours** — more writing speed, less margin. Full detail in `_syllabus/exam-pattern.md`.

## How this workspace is organised

```
_syllabus/      exam pattern + unit-by-unit course outlines
_raw/           scraped source corpus (syllabus PDF, 2026 papers, question banks)
tools/          scrape.mjs — the harvester that builds _raw/
_qc/            review reports per subject (what was checked, what was wrong, what got fixed)
_practice/      timed mock papers, flashcards
01-business-intelligence/    README · question-bank.md · unit-*.md · 00-cheatsheet.md · answers/
```

Each subject folder follows the same five-part pipeline: **syllabus → question bank → rapid unit sheets → model answers → cheat sheet**, then a QC pass, then a mock. A subject is only marked done when its QC report exists.

## Where the content comes from

| Source | What it gave us |
|---|---|
| **fomecd.edu.np — official model question set 2026** | the Dean's Office model paper for IT 248, 249, 277 (and 276/278). The acceptance test for each subject |
| fomecd.edu.np (TU FOM syllabus PDF, 2025) | authoritative syllabus, units and lecture hours |
| hamronotes.com/bitm/semester-8 | 2026 board papers, chapter-wise question banks, chapter notes |
| paperkhoj.com/bim/semester-8 | syllabus transcriptions, unit hours |
| tupapers.com | index pages for one older paper per subject — the 2020 pages are client-rendered and carry no question text |

`bimstudynotes.com` — the site you named — is a parked domain now, and its successor `bitmstudynotes.com` lists **all four of these subjects as "Notes Not Available"**. So these notes are built from the primaries, not copied from it.

**On past papers, honestly:** the new-syllabus 8th semester was first examined in **2026**, so exactly one board paper per subject exists — that one. There is no older paper to mine, for any of the four subjects. A second paper would have to come from your college (pre-board or mid-term); if you can photograph one, it goes in `_raw/` and the notes get re-weighted against it.

## How we study

See `.opencode/playbooks/study-loop.md`. Short version: read a unit → blurt it onto a blank page → get quizzed → write one timed answer → get it marked. Reading without writing is the failure mode this workspace exists to prevent.

## Ground rules

- Notes never hide a gap. Anything unverified is tagged `⚠ unverified`; anything conflicting is shown as a conflict.
- Practice questions I write are labelled `[practice — generated]` so you never mistake them for real past questions.
- If something in these notes is wrong, say so — it gets logged in `.opencode/memory/lessons.md` and fixed.
