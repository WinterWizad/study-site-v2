# Local Lessons — Project Living Diary

> **Purpose:** project-specific preferences, style rules, and corrections.
> Universal preferences live in `~/.config/opencode/memory/global_lessons.md`. This file records only what applies to this workspace.

## Lessons

- [Scope] 2026-11-18: User sits **Cloud Computing (IT 277)** as the only elective. Do not build .NET / DBA / Big Data.
- [Scope] 2026-11-18: Theory papers only. Skip internship viva and lab/practical files unless asked.
- [Method] 2026-11-18: **One subject at a time.** Finish → self-review → revise → only then next subject. Do not interleave subjects.
- [Method] 2026-11-18: After drafting a subject, run an explicit **recheck pass for mistakes** (coverage matrix, factual cross-check, marks-length, terminology, real examples) before declaring it done.
- [Format] 2026-11-18: One folder per subject; notes as **markdown**, one file per unit. Markdown is the user's preferred surface.
- [Format] 2026-11-18: Write as a **teacher**, not a summariser — call out what is hard to understand, what is important for the exam, common mistakes, and how each topic is actually asked.
- [Format] 2026-11-20: **Write like a peer at 11 PM before the exam.** Not a textbook. Short sentences (15-20 words max). Active voice. No academic hedging ("normal answer," "worth remembering," "tends to"). Replace abstract nouns with verbs: "reconciliation"→"match," "standardization"→"standardize," "derivation"→"calculate," "conformance"→"match." Tables > paragraphs for definitions. Inline exam hooks next to concepts. Inline answer skeletons after each section. No "Exam Insurance" labels — if it's in notes, it's exam-relevant.
- [Budget] 2026-11-18: ~2 weeks, 3–4 hrs/day. Cut order when behind: subject mocks → low-probability model answers. Never cut notes or cheat sheets.
- [Sources] 2026-11-18: Scrape the sources, don't trust chat-tool fetches — tables and PDFs get mangled. Corpus lives in `_raw/`, rebuildable via `tools/scrape.mjs`.
- [Sources] 2026-11-18: hamronotes **answers are paywalled**; question text is free. Never claim an answer is "official" — model answers are ours.
- [Sources] 2026-11-18: **Cloud Computing (IT 277) has zero published past papers** — but it *does* now have an official TU/FOM model question (2026). Practice questions it does not cover must be generated in TU format and labelled `[practice - generated]`.
- [Sources] 2026-11-18: The official TU/FOM **model question set 2026** is one PDF at `fomecd.edu.np/noticeattachments/Model Question for BITM 1st and BBA BIM and BBM 8th Semester Final.pdf`. It contains IT 248, IT 249, IT 276, IT 277, IT 278 — **not IT 250**. Saved in `_raw/pdf/`, text in `_raw/text/pdf/`. It is the authoritative statement of paper shape, and it is the acceptance test for each subject.
- [Sources] 2026-11-18: Only **one real board paper per subject** exists (2026) — no new-syllabus 8th-sem papers predate it, because 2026 was the first sitting. bitmstudynotes hosts 8th-sem papers only for the **old** syllabus. Do not spend more time hunting for a second paper; ask the user for a photo of a college pre-board instead.
- [Sources] 2026-11-18: The authoritative syllabus is the FOM PDF (`_raw/text/pdf/...`). Where a blog disagrees with it, the PDF wins.
- [Tooling] 2026-11-18: **Never edit these UTF-8 markdown files with `Get-Content -Raw | Set-Content`.** PowerShell 5.1 decodes them as ANSI, adding a BOM and 57 mojibake sequences in one go. Use `[IO.File]::ReadAllText($p,[Text.Encoding]::UTF8)` + `[IO.File]::WriteAllText($p,$s,(New-Object Text.UTF8Encoding($false)))`, or the `edit`/`write` tools.
- [Method] 2026-11-18: Unit loop is **write → recheck → PASS → next**. Word counts for 1- and 3-mark answers are measured from the saved file with a script, never estimated.
- [Method] 2026-11-18: **⭐ IMPORTANT — the official question paper is the checker.** A unit is not finished until every question belonging to that unit in the subject's **official model question (or, where none exists, the real board paper)** can be answered **from that unit's notes alone**. Test it by closing the notes and answering out loud. If a mapped question needs material from another unit, the unit is not done — the syllabus bullet, not the writer's filing system, defines the unit boundary. Group D questions span units by design and are checked at subject level. Mapped tables live in `<subject>/model-question.md`; the check is step 0 of `_qc` review.
- [Format] 2026-11-18: **The four papers are not the same size.** IT 249 (BI) and IT 277 (Cloud) are **60/30**: 10×1 / any5×3 / any3×5 / 1–2×20. IT 248 (IT Entrepreneurship) and IT 250 (Digital Economy) are **100/50**: 10×**2** / any6×**5** / any3×**10** / 1×20. Confirmed on three sources each (model question + 2026 board paper + syllabus). Answer lengths differ accordingly: 2-mark ≈ 50-60 words, 5-mark ≈ 180-220, 10-mark ≈ 350-400.

