# Guardrails — Local Safety & Style Boundaries

Read before every task. Update only with explicit user approval.

## Safety Boundaries
- Never delete files outside the workspace.
- Never delete or overwrite a note file the user has edited by hand without asking.
- Never commit secrets or credentials.
- Never run destructive commands without explicit confirmation.

## Accuracy Boundaries (the ones that matter here)
- **No invented exam questions.** Every question in a `question-bank.md` must be traceable to a real source (2026 TU paper, chapter-wise bank, or explicitly labelled `[practice — generated]`).
- **No invented statistics or citations.** A number without a source gets deleted, not softened.
- **No silent conflict resolution.** When the syllabus PDF and a real paper disagree (e.g. 100/50 vs 60/30 marks), record both and say which one governs.
- **Flag, don't fabricate.** Unverifiable claim → `⚠ unverified` inline. Never fill a gap with confident-sounding filler.

## Style Boundaries
- British/Nepali-academic English, plain sentences, no marketing voice.
- Definitions stated once, crisply, in a form that can be written in an exam.
- Tables for comparisons; bullet lists for enumerations; prose for mechanisms.
- Diagrams as ASCII/indented text (renderable in markdown, copyable into an answer sheet).
- Nepal examples wherever the syllabus allows (eSewa, Khalti, Daraz, NTC, NIC Asia, NRB, DoTM, IRD, NTC, Hamro Patro).
- Answer length must match mark value — a 5-mark answer is not 400 words.

## Agent Boundaries
- `@tutor` owns all subject content and marking.
- Handoffs state: **Done / Files / Verified / Open gaps / Next**.
