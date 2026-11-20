# tools — the scraper

`scrape.mjs` is a dependency-free Node 24 script (no `npm install`, no Puppeteer, no Python). It fetches, caches, converts HTML to markdown, extracts PDF text, and indexes what it saved.

## Why not just use the web tools in chat

They are lossy in three specific ways that matter for exams:

1. **Tables collapse.** Syllabus unit/hour tables are the single most important thing to get right, and markdown conversion through a chat tool drops cells.
2. **PDFs are refused.** The authoritative TU syllabus is a PDF; the chat fetcher returns "unsupported content type".
3. **No cache, no corpus.** Every re-read costs a fetch, and nothing is retained on disk to check a note against later.

## Usage

```powershell
# one page
node tools/scrape.mjs https://hamronotes.com/bitm/semester-8/business-intelligence

# discover links on a page (same host only)
node tools/scrape.mjs --links https://paperkhoj.com/bim/semester-8

# crawl a section: same host, URL must contain --match, max N pages, N levels deep
node tools/scrape.mjs --crawl "https://hamronotes.com/bitm/semester-8" `
                      --match "/bitm/semester-8/" --max 80 --depth 2

# a PDF: download + extract text
node tools/scrape.mjs --pdf "https://www.fomecd.edu.np/syllabuses/BIM%208th%20Semester%20Syllabus%202025.pdf"

# rebuild the index of everything downloaded
node tools/scrape.mjs --index
```

| Flag | Effect |
|---|---|
| `--crawl` | breadth-first crawl from the URL |
| `--links` | print same-host links only, change nothing |
| `--pdf` | download and extract text |
| `--index` | regenerate `_raw/INDEX.md` from the manifest |
| `--match <s>` | only follow links containing `<s>` |
| `--max <n>` | stop after n pages (default 60) |
| `--depth <n>` | follow links this many levels (default 2) |
| `--force` | re-fetch even if a cached text file exists |

Output goes to `_raw/` — see `_raw/README.md`.

## How the PDF text extraction works

No libraries, so it does it by hand:

1. Find each `stream … endstream` block (with `(?<!end)stream` — matching the `stream` inside `endstream` misaligns every capture and silently produces zero output).
2. Inflate it with `zlib` (`FlateDecode`).
3. Walk the content stream for `Tj` / `TJ` text operators, including hex strings.
4. Rebuild line breaks from the `Tm` text-matrix Y coordinate, because Word→PDF exports put one word per text block — joining blocks blindly would reflow the whole page into a single line.
5. Refuse to pretend: if the text comes back with almost no real words (a CID-encoded font with no recoverable mapping), it writes an explicit failure message instead of garbage.

Verified against the TU BIM 8th-semester syllabus: 26,770 characters, all four subjects readable.

## Diagnostics

`pdf-probe.mjs <file.pdf>` reports stream count, compression, font subtypes, ToUnicode presence, and dumps the first two text-bearing streams. Run it when a new PDF extracts badly.

```powershell
node tools/pdf-probe.mjs "_raw\pdf\<file>.pdf"
```

## Etiquette

Sequential requests, 400 ms apart, honest user agent, retries with backoff, cache-first. It is a personal study archive, not a crawler — do not raise `--max` to scrape whole sites.
