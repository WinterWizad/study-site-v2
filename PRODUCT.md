# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

BIM 8th-semester students revising TU/FOM exam papers, especially Business Intelligence (IT 249) for the 2026 paper. They use the site on phones during short revision sessions and on desktops for longer study sessions.

## Product Purpose

Provide fast, source-faithful revision from the existing study notes. Success means a learner can move through a focused feed, hear the original note wording, keep track of what they have seen or completed, and return to the exact source section when they need the full page.

## Positioning

The product turns the current website notes into a narrated carousel without creating a second, rewritten curriculum. The exact note wording remains the source of truth.

## Operating Context

- The site is a static Node/Marked build deployed through Vercel.
- The Quick Reels pilot lives at `/reels/` and covers all six Business Intelligence units.
- Learners navigate manually; there is no autoplay feed.
- Browser speech synthesis provides narration after a user gesture.
- Local MP3 music is used only for cards whose main content is a table, diagram, or other visual.
- Progress, preferences, and the last position are stored locally in the browser.
- The interface must work as a full-screen reading stage on portrait mobile and a centred portrait stage with a restrained edge-action rail on desktop; secondary controls belong in a modal drawer.

## Capabilities and Constraints

- Read the current working-tree notes in `01-business-intelligence/` without rewriting, summarising, or reordering their educational wording.
- Include mapped exam questions and standalone high-value concepts from all six BI units.
- Place the question before its answer on question cards.
- Split overflowing content into continuation cards without losing text.
- Preserve source tables and diagrams, scaling or continuing them to fit.
- Offer a selected browser voice or a random narrator voice per card, with speed, pause/replay, and mute controls.
- Support ordered and shuffled feeds, unit filters, Seen, Done, Saved, and resume-from-last-position states.
- Keep the visible transcript available when speech is unavailable.
- Expand the same engine to Digital Economy, Cloud Computing, and IT Entrepreneurship later.
- MP3 files must be local, reusable, and accompanied by source and licence credits.

## Brand Commitments

- Keep the `Worst Generation` name and the site's established typography, theme system, and subject colours.
- The Quick Reels surface should feel integrated with the existing site while remaining focused on reading.
- Do not add fabricated study claims, statistics, citations, or question history.

## Evidence on Hand

- Active Business Intelligence notes: `01-business-intelligence/unit-1-introduction-to-bi.md` through `unit-6-bi-implementation.md`.
- Mapped-question context: `01-business-intelligence/model-question.md` and `question-bank.md`.
- Existing static-site generator and visual system: `build.js` and `styles.css`.
- Local royalty-free MP3 candidates are sourced from Incompetech with Creative Commons attribution records.

## Product Principles

1. The source note is authoritative; the interface may reorganise for reading but must not rewrite it.
2. Keep every card useful on its own: question first, answer second, source link always available.
3. Progress belongs to the learner and must survive refreshes without requiring an account.
4. Audio supports the text; it never replaces the visible transcript.
5. Build one reusable mechanism that can serve every subject without duplicating the interface.

## Accessibility & Inclusion

The feed must support keyboard navigation, visible focus states, reduced-motion preferences, readable contrast in light and dark themes, and a text fallback when speech synthesis is unavailable. Tables and diagrams need an accessible textual representation wherever the source provides one.
