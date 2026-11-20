# `_raw` — scraped source corpus

Everything here is a **raw copy of primary sources**, converted to readable markdown. It exists so that notes are written from evidence, and so a claim in a note can always be traced back.

**209 unique URLs · 4 hosts · last harvested 2026-11-18.** Browse `INDEX.md` for the full list with local paths.

## What each host actually gives you

| Host | Pages | What it holds | Catch |
|---|---|---|---|
| **hamronotes.com** | 164 | The 2026 board papers (all four subjects except Cloud), chapter-wise question lists, chapter pages, viva/practical pages, and 65 individual question pages | **Answers are paywalled** — every question page says *"Please login to view the answer"*. Question **text** is free; solutions are not. Chapter "notes" pages say *"PDF slides coming soon"*. |
| **paperkhoj.com** | 41 | Clean HTML transcription of the official syllabus for every subject, plus past-paper and practice-set indexes | Its `notes` pages are **stubs** — a unit list with nothing behind it. Past-paper count for BI/DE/IT-Entrep: **0**. |
| **tupapers.com** | 21 | One 2020 paper index per subject, syllabus index pages | The paper **questions are injected by JS** — the saved page contains the TU header and an empty question container. Not usable for questions without reverse-engineering their API. |
| **fomecd.edu.np** | 2 | **The official TU/FOM syllabus PDF for BIM 8th semester** (134 KB, 26,770 chars extracted) — covers IT 248, IT 249, IT 250 and IT 277 | None. This is the authoritative document. |

## Consequences for how we build notes

1. **The syllabus is settled.** `_raw/text/pdf/...syllabus...md` is the Dean's Office document. Unit lists, lecture hours, objectives and readings all come from there — not from a blog.
2. **Question text is real, answers are ours.** We know exactly what the 2026 papers asked; nobody publishes the model answers for free. Every model answer in `answers/` is authored here and marked against the syllabus, and is labelled as our answer, not an official one.
3. **Cloud Computing (IT 277) has no published questions at all** — "No question banks available yet". Its practice questions must be generated in TU format and labelled `[practice — generated]`. This is the highest-risk paper of the four.
4. **Nothing is single-sourced.** Every factual claim in a note can be checked against the PDF (syllabus) and, where relevant, the 2026 paper (what is actually tested).

## Folder layout

```
_raw/html/<host>/<slug>.html    original markup, unfiltered
_raw/text/<host>/<slug>.md      converted text, what the notes are written from
_raw/pdf/<slug>.pdf             downloaded PDFs
_raw/manifest.tsv               url · status · bytes · title · local path · timestamp
_raw/INDEX.md                   human-readable index (regenerate with --index)
```

## Regenerating

```powershell
node tools/scrape.mjs --index                                  # rebuild INDEX.md
node tools/scrape.mjs --crawl <url> --match <s> --max 60 --depth 2
node tools/scrape.mjs --pdf <url>
node tools/scrape.mjs <url> --force                             # re-fetch one page
```

See `tools/README.md`. Cached pages are not re-fetched without `--force`, so re-running a crawl is cheap.

## Known noise

- The syllabus PDF's **cover page** extracts with letters spaced apart (`C o u r s e   d e t a i l`) because the original places each glyph individually. Body text is clean. Read from the body.
- Some joined words survive (`TargetMarkets`, `BusinessIdeas`) where the PDF omits the space between text runs. Content is unaffected.
- Mojibake in a few `—` characters is a PowerShell display artefact, not a file corruption.
