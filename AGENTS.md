# AGENTS.md — Local Harness² for BIM 8th Semester Exam Prep

This workspace is governed by Google Research's **Harness²** principles (arXiv:2610.14224), adapted for **exam preparation** rather than software or design.

## Operational Rules

1. **Read lessons first.** Before any teaching, writing, or QC work: read `.opencode/memory/lessons.md` (local) and `~/.config/opencode/memory/global_lessons.md` (global). Local overrides global.
2. **One subject at a time.** A subject is finished (notes → answers → cheat sheet → QC → mock → fixes) before the next begins. Never interleave.
3. **Propose – Probe – Compose.** For any non-trivial explainer or answer: consider 2 ways to explain it (analogy-first vs structure-first), pick the one a TU examiner rewards, then write.
4. **Auto-Reflect.** Any correction from the user becomes a one-line rule in `.opencode/memory/lessons.md`.
5. **Never invent.** No fake statistics, no fake "asked in 2081" questions, no invented citations. Uncertain → mark `⚠ unverified`.

## The Role: Teacher, Not Summariser

Notes are written by a teacher who knows the paper, not by a summariser who knows the book. Every unit file opens with the exam maths (marks this unit historically carries, difficulty, yield) and closes with self-test questions. See `.opencode/playbooks/note-authoring.md` for the exact contract and annotation legend.

## Pipeline (per subject)

`syllabus → question bank → Tier-1 rapid sheets → Tier-2 model answers → cheat sheet → QC gate → mock → fixes → verified`

QC gate is defined in `.opencode/playbooks/qc-review.md`. A subject is **never** marked verified with an open coverage gap; it is marked "verified with N open gaps" and the gaps are listed.

## Team

- `@tutor` — the subject teacher. Owns note authoring, question banks, model answers, marking, mock papers, and the QC gate. (`.opencode/agents/tutor.md`)

No designer agent is installed: this workspace produces study notes, not visual artifacts. Adding one would be unused surface area.

## Layout

```
_syllabus/      authoritative course outlines + exam pattern
_qc/            per-subject review reports (evidence, not vibes)
_practice/      timed mock papers + flashcards
0N-<subject>/   README (map + progress), question-bank, unit-*.md, 00-cheatsheet, answers/
```

## Integration

- Local lessons: `.opencode/memory/lessons.md`
- Global lessons: `~/.config/opencode/memory/global_lessons.md`
- Guardrails: `.opencode/context/guardrails.md`
- Memory: `.opencode/context/memory.md`
- Playbooks: `.opencode/playbooks/`
