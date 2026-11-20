# Project Memory — Active State & Notes

## Workspace Summary
- **Domain:** Academic exam preparation (Bachelor of Information Management, 8th semester, Tribhuvan University, Faculty of Management).
- **Starting state:** Empty directory. No prior notes.
- **Initialized:** 2026-11-18 (study clock: exam on 15 Bhadra, ~2 weeks runway, 3–4 hrs/day).

## Subjects (confirmed with user)
| Study order | Subject | Code | Type | Status |
|---|---|---|---|---|
| 1 | Business Intelligence | IT 249 | core | in progress |
| 2 | Digital Economy | IT 250 | core | queued |
| 3 | Cloud Computing | IT 277 | elective | queued |
| 4 | IT Entrepreneurship and Management | IT 248 | core | queued |

Out of scope by user decision: Internship (IT 350) viva, lab/practical components, theory papers only.

## Exam Pattern — verified, and there are **two sizes**

| | **60 marks** (IT 249, IT 277) | **100 marks** (IT 248, IT 250) |
|---|---|---|
| Pass | 30 | 50 |
| Group A | 10 × 1 | 10 × **2** |
| Group B | any 5 of 6 × 3 | any 6 of 7 × **5** |
| Group C | any 3 of 4 × 5 | any 3 of 4 × **10** |
| Group D | 1 × 20 (board) or 2 × 10 (model) | 1 × 20 |

Confirmed per subject on the official model question and/or the 2026 board paper. The earlier entry here said 60/30 for all four — true of IT 249 only. Corrected in `_syllabus/exam-pattern.md`.

## Source Map — verified by actual harvest (209 pages, see `_raw/INDEX.md`)

| Source | What it actually provides | Trust | Catch |
|---|---|---|---|
| **fomecd.edu.np TV/FOM syllabus PDF (2025)** | the authoritative course outlines for IT 248 / 249 / 250 / 277 | high | none — extracted locally, 26,770 chars |
| **hamronotes.com** (164 pages) | 2026 board papers (BI, DE, IT-Entrep; **not Cloud**), chapter-wise question lists, 65 question pages | medium-high on *questions* | **all answers paywalled**; "notes" pages say "PDF slides coming soon" |
| **paperkhoj.com** (41 pages) | syllabus transcriptions, paper indexes | high on syllabus | notes pages are stubs; 0 past papers for IT 248/249/250 |
| **tupapers.com** (21 pages) | 2020 paper indexes, syllabus indexes | medium | questions injected by JS — not usable without reversing their API |
| **bitmstudynotes.com** (ex-bimstudynotes.com) | nothing | — | all four 8th-sem subjects listed as "Notes Not Available"; `bimstudynotes.com` is a parked domain |
| **studynotesnepal.com** | old-syllabus only (EIC, IT 229 SCM) | low | different course structure |

### Consequence
No free note or answer corpus exists for these four subjects. Notes and model answers are **authored here**, grounded in the official syllabus, the real 2026 board papers and the **official TU/FOM model question set 2026**. Cloud Computing (IT 277) has **no board paper**, but it now has an official model question — practice questions outside it are generated and labelled `[practice — generated]`.

## Official model question (saved 2026-11-18)
One Dean's Office PDF carries model papers for **IT 248, IT 249, IT 276, IT 277, IT 278 — and not IT 250**. Each subject folder now holds `model-question.md`: the paper verbatim, a question→unit mapping table, and the marks-by-unit breakdown. **IT 250's file states plainly that no model question exists and substitutes the 2026 board paper.**

The mapping table is the acceptance test for every unit — see `.opencode/memory/lessons.md` and check 0 in `.opencode/playbooks/qc-review.md`.


## Active Context
- Current phase: Subject 1 (Business Intelligence) — Units 1–4 written and QC **PASS**, including the model-question gate. Unit 5 (BI tools/OLAP) is next.
- Tooling limits discovered: no `python`, no `pdftotext` on this machine. PDFs are extracted with the `.NET DeflateStream` extractor inside `tools/scrape.mjs` (`--pdf`), which works.

## Open Blockers
- Only one board paper per subject exists publicly (2026), because 2026 was the first sitting. Mocks must be generated in TU format and labelled `[practice — generated]`.
- **IT 250 has no model question.** Verified absent from the FOM 2026 set; two searches found nothing. The 2026 board paper stands in as the acceptance test.
