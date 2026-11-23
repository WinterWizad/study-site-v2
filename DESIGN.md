---
name: Worst Generation
description: A calm, source-faithful BIM revision system built around focused study reels and exam-paper typography.
colors:
  site-ground: "#fafafa"
  site-panel: "#ffffff"
  site-ink: "#1a1a2e"
  site-muted: "#6b6b7a"
  site-rule: "#e5e5eb"
  bi-blue: "#2563eb"
  bi-blue-hover: "#1d4ed8"
  night-ground: "#0f0f1a"
  night-panel: "#1a1a2a"
  night-ink: "#e8e8f0"
  night-muted: "#8b8ba8"
  night-blue: "#60a5fa"
  reels-frame: "#eceff2"
  reels-chrome: "#f6f7f8"
  reels-ink: "#111827"
  reels-muted: "#56616d"
  reels-rule: "#d4d9de"
typography:
  display:
    fontFamily: "Newsreader, Georgia, serif"
    fontWeight: 600
    lineHeight: 1.0
    letterSpacing: "-0.025em"
  reading:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.38
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "13px"
    fontWeight: 650
    lineHeight: 1.3
  code:
    fontFamily: "SFMono-Regular, Consolas, Liberation Mono, monospace"
    fontSize: "0.86em"
    fontWeight: 400
    lineHeight: 1.35
rounded:
  control: "8px"
  panel: "12px"
  sheet: "18px"
  pill: "999px"
spacing:
  hair: "4px"
  tight: "8px"
  control: "12px"
  section: "24px"
  stage: "28px"
components:
  button-primary:
    backgroundColor: "{colors.bi-blue}"
    textColor: "{colors.site-panel}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "6px 8px"
    height: "40px"
    mobileHeight: "44px"
  button-secondary:
    backgroundColor: "{colors.site-panel}"
    textColor: "{colors.site-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "6px 8px"
    height: "40px"
    mobileHeight: "44px"
  segmented-control:
    backgroundColor: "{colors.reels-chrome}"
    textColor: "{colors.reels-muted}"
    rounded: "{rounded.control}"
    padding: "3px"
    height: "34px"
    mobileHeight: "44px"
  unit-filter-button:
    backgroundColor: "{colors.reels-chrome}"
    textColor: "{colors.reels-muted}"
    rounded: "{rounded.control}"
    padding: "6px 8px"
    height: "36px"
    mobileHeight: "44px"
  source-link:
    textColor: "{colors.reels-muted}"
    activeTextColor: "{colors.bi-blue}"
    fontSize: "12px"
  range-control:
    trackColor: "{colors.reels-rule}"
    fillColor: "{colors.bi-blue}"
    desktopHeight: "24px"
    mobileHeight: "44px"
  modal-drawer:
    backgroundColor: "{colors.reels-chrome}"
    textColor: "{colors.reels-ink}"
    width: "min(88vw, 360px)"
    shadow: "18px 0 48px rgba(15,23,42,0.14)"
  reel-action:
    backgroundColor: "{colors.reels-ink}"
    textColor: "{colors.site-panel}"
    shape: "circle"
    size: "42px"
    activeBackgroundColor: "{colors.bi-blue}"
  scroll-cue:
    textColor: "{colors.bi-blue}"
    fontSize: "11px"
    fontWeight: "650"
  reading-card:
    backgroundColor: "{colors.site-panel}"
    textColor: "{colors.reels-ink}"
    typography: "{typography.reading}"
    rounded: "{rounded.sheet}"
    padding: "9px 96px 16px 24px"
  progress-track:
    backgroundColor: "{colors.reels-rule}"
    textColor: "{colors.bi-blue}"
    rounded: "{rounded.pill}"
    height: "4px"
---

# Design System: Worst Generation

## Overview

**Creative North Star: "The Focused Study Reel"**

Worst Generation is a study system, not a content feed. Its visual identity comes from the exam paper: exact source prose, a quiet reading surface, and the learner's own progress always within reach. The interface stays quiet enough that the note text remains the loudest thing in the room.

The system combines two related voices. The main site uses Newsreader for editorial headings, system sans for controls, restrained subject colour, and familiar study-document structure. Quick Reels borrows the spatial grammar of a vertical reel—one centred portrait frame, a calm surround, a restrained edge action rail—without borrowing social metrics, autoplay, or decorative video overlays. It remains an exam reading tool.

Depth is functional. Most surfaces sit flat and separate through tone and a hairline edge. The Quick Reels frame and controls drawer receive directional shadow because they physically float above the stage. The only saturated colour is the subject blue, and its rarity keeps progress, active controls, and source context findable.

**Key Characteristics:**
- Source text is the dominant visual element.
- One blue accent marks action, position, and active state.
- One centred reel frame replaces a permanent dashboard shell.
- Edge actions stay icon-first, labelled, and keyboard-operable.
- Light and dark themes change values, never hierarchy.

## Colors

The palette is one cool ground, one ink family, and a single study-blue accent.

### Primary

- **Exam Blue** (`#2563eb`): Business Intelligence accent, primary actions, active controls, progress, and source context. It stays below the visual weight of the note body.
- **Exam Blue Hover** (`#1d4ed8`): interaction feedback for the light-theme primary action.

### Secondary

- **Night Blue** (`#60a5fa`): the dark-theme action and progress accent. It restores the same emphasis without the light-theme blue losing contrast.

### Neutral

- **Site Ground** (`#fafafa`): the standard page background outside framed tools.
- **Site Panel** (`#ffffff`): note surfaces, cards, inputs, and reading sheets.
- **Site Ink** (`#1a1a2e`): primary text on light surfaces.
- **Site Muted** (`#6b6b7a`): secondary text and quiet controls.
- **Site Rule** (`#e5e5eb`): page hairlines and low-emphasis borders.
- **Reels Frame** (`#eceff2`): the pale-grey stage surround.
- **Reels Chrome** (`#f6f7f8`): drawer and secondary control surfaces.
- **Reels Ink** (`#111827`): primary reading-stage text and edge-action fill.
- **Reels Muted** (`#56616d`): source labels, progress text, and secondary instructions.
- **Reels Rule** (`#d4d9de`): sheet edges, controls, and table boundaries.
- **Night Ground** (`#0f0f1a`): the standard dark-theme page ground.
- **Night Panel** (`#1a1a2a`): the standard dark-theme panel.
- **Night Ink** (`#e8e8f0`): primary dark-theme text.
- **Night Muted** (`#8b8ba8`): secondary dark-theme text.

### Named Rules

**The One Chroma Rule.** A subject colour marks action, selection, and progress. It does not tint every surface, decorate the sheet, or compete with source content.

**The Reel Stage Rule.** Quick Reels keeps one portrait study frame centred in a quiet surround. It borrows the composition of a vertical reel, not its social furniture: no fake metrics, comments, follower counts, autoplay, or decorative overlays.

## Typography

- **Display Font:** Newsreader (with Georgia as fallback)
- **Body Font:** System sans (with platform sans fallbacks)
- **Label/Mono Font:** System monospace for code, diagram text, seeds, and measurements only

**Character:** Newsreader gives headings and source passages the cadence of an exam answer. The system sans keeps controls compact and operational. Monospace is reserved for information that behaves like code or data.

### Hierarchy

- **Display** (600, 28–30px on Quick Reels, 1.0–1.06 line height): route title and the current source heading. The global site may scale this role larger for editorial pages.
- **Headline** (600, 20–24px, tight leading): subject and unit headings that organize content without competing with it.
- **Title** (550–650, 13px, 1.3 line height): control groups, progress labels, and compact utility headings.
- **Body** (400, 14px, 1.7 line height): operational copy and controls.
- **Reading** (400, 16px, 1.38 line height): note prose inside Quick Reels. It stays readable as study material rather than dashboard copy.
- **Label** (550–650, 11–13px): source metadata, answer labels, table headers, and status text.
- **Code** (400, 0.86em, 1.35 line height): fenced code and text diagrams only.

### Named Rules

**The Source Voice Rule.** Source headings and educational passages use Newsreader. Interface labels use the sans. Never use monospace to make ordinary labels feel technical.

**The Source Boundary Rule.** Split a card only at a sentence, list-item, code-line, or table-row boundary. Retain every source word. If one indivisible atom cannot fit, keep it intact inside a scrollable body and show a visible scroll cue.

**The Measured Scale Rule.** A reading stage exposes a clear jump from source heading to body. Do not fill the gap with intermediate decorative sizes.

## Layout

The main site uses a fluid reading column capped near 900px, with an optional 240–300px subject rail. Unit pages, subject indexes, and resource pages share the same broad content measure so moving between subjects does not feel like entering a different product.

Quick Reels uses a dedicated app layout:

- A 52px masthead spans the viewport with only the site wordmark, route context, controls trigger, and theme toggle.
- The main canvas has no permanent sidebar or KPI row. One centred portrait frame, held near 9:16 and capped at 448px wide, carries the current source passage.
- The card is a three-row grid: source context, a scroll-safe content body, then a minimal source/progress footer.
- Four study actions—Listen, Source, Save, and Done—form an icon-first rail at the lower-right edge. Previous and next use a separate two-chevron group beneath it.
- The content body reserves a readable strip beside the edge rail so controls never cover prose, tables, or diagrams.
- Feed order, unit filters, Saved-only mode, progress, voice, rate, volume, music credits, and site links live inside a true modal drawer at every viewport size.
- Content is split at source-safe boundaries first. If one indivisible row, line, or passage is taller than the available body, the body scrolls vertically and a visible “Scroll inside this card for more” cue appears.
- At 900px and below, the frame fills the portrait viewport. Landscape phones retain a narrow centred reel frame instead of stretching study content across the screen.
- Blank card space toggles the active narration or music. Text, links, diagrams, tables, and scrolling remain independent.

The frame edge, source text, and edge actions use one spacing rhythm. Controls sit close to the action they govern; the reading surface remains the dominant mass.

## Elevation & Depth

The system is mostly flat. Standard pages use a low ambient shadow (`0 1px 3px rgba(0,0,0,0.08)`) only when a conventional panel must lift from the page. The Quick Reels portrait frame may cast a low directional shadow (`0 20px 52px rgba(15,23,42,0.12)`) because it is the single floating study surface.

The controls drawer casts a stronger directional shadow (`18px 0 48px rgba(15,23,42,0.14)`) because it physically floats above the stage at every viewport size. Modal dialogs may use the site's stronger shadow. Decorative glows, coloured halos, and shadow stacks are not part of the system.

### Shadow Vocabulary

- **Ambient Card** (`0 1px 3px rgba(0,0,0,0.08)`): conventional content cards on the main site.
- **Raised Panel** (`0 4px 12px rgba(0,0,0,0.1)`): menus and panels that need stronger separation.
- **Reel Frame** (`0 20px 52px rgba(15,23,42,0.12)`): the single Quick Reels portrait reading surface.
- **Floating Drawer** (`18px 0 48px rgba(15,23,42,0.14)`): the Quick Reels controls drawer above the reading stage.

### Named Rules

**The Flat-By-Default Rule.** If a surface can be separated with tone, it is flat. Shadow is a response to physical layering, not a default finish.

## Shapes

Controls use an 8px radius. Conventional site panels use 12px. The Quick Reels portrait frame uses 18px on desktop and becomes edge-to-edge on portrait phones. Study actions use compact circles, while progress tracks use a fully rounded profile. Tables and code blocks retain their own functional geometry rather than being forced into card shapes.

The system avoids decorative blobs, floating icon tiles, and ornamental silhouettes. The one recurring shape is the sheet itself: a calm, bounded place for study content.

## Components

### Buttons

- **Shape:** gently rounded at 8px.
- **Primary:** study-blue fill with white text, 40px minimum height on desktop, 44px on touch layouts, and 6–8px horizontal padding.
- **Hover / Focus:** the fill darkens in light mode; a 3px blue focus ring with 2px offset remains visible in both themes.
- **Secondary:** panel fill, ink text, and a one-pixel rule. It gains a quiet raised tint on hover.
- **Disabled:** reduced opacity, no pointer cursor, and no action.

### Segmented Control

- **Style:** a raised track with two equal options.
- **State:** the selected option uses the panel or active tone with full-ink text; unselected options remain muted. It is a control group, not a set of decorative tabs.

### Unit Filters

- **Style:** a compact three-column row: unit marker, unit title, and source count.
- **State:** the active filter uses the active blue-grey tone. Long unit titles truncate rather than distort the count.

### Reading Cards

- **Corner Style:** the viewport owns an 18px desktop frame radius; individual cards remain square within it.
- **Background:** site panel or dark-theme panel.
- **Shadow Strategy:** one directional frame shadow surrounds the active study surface.
- **Border:** one-pixel sheet edge on desktop; portrait phones use the full viewport edge to edge.
- **Internal Padding:** 18–22px in the header, source-safe reading space in the body, and a narrow metadata footer.

### Reel Action Rail

- **Form:** four 42px circular actions—Listen, Source, Save, and Done—stacked at the lower-right edge of the current card.
- **Labels:** icon-first by default. Every action has an accessible name, keyboard focus state, and a short pointer tooltip.
- **Active state:** Saved and Done fill with the subject blue; the unfilled state uses primary ink.
- **Separation:** Previous and Next use their own two-chevron group beneath the study actions.
- **Clearance:** the body reserves at least 68px beside the rail so prose and tables never sit under an icon.
- **Rule:** action icons represent real study operations. Never add decorative likes, comments, follower counts, or share actions without a real destination.

### Source Link

- **Style:** compact muted text with a clear action label.
- **State:** the link changes to the accent and underlines on hover/focus. Its destination must always identify the exact generated source heading.

### Inputs and Ranges

- **Style:** white or panel-filled fields with a 8px radius and a visible control border.
- **Focus:** the shared 3px accent ring.
- **Disabled:** reduced opacity and a non-interactive cursor.

### Navigation and Drawer

- **All viewports:** secondary feed controls live behind one focus-trapped modal drawer with `role="dialog"`, `aria-modal="true"`, and an accessible name.
- **Closed state:** the drawer starts closed, inert, fixed off-canvas, and hidden from assistive technology. The reading stage remains the only persistent work surface.
- **Modal isolation:** while open, the reading stage is inert and hidden from assistive technology. The scrim is exposed only while the drawer is open.
- **Focus return:** Escape, the scrim, the internal close button, and programmatic close all return focus to the menu trigger.

### Progress

- **Style:** the current card shows a thin position line. Detailed Seen, Done, and Saved totals live in the drawer.
- **Rule:** progress always names its denominator and never implies completion for merely seen cards.

### Tables and Diagrams

- **Style:** compact tables use aligned headers, one-pixel row rules, and no zebra fill. Diagrams use a raised neutral ground and preserve their source order.
- **Continuation:** long tables split strictly by source row and diagrams split by source line. No rows, lines, or table-cell sentence fragments are dropped or invented.
- **Accessible names:** every table region is named from its source entry, every text diagram is a named focusable region, and the motion SVG is associated with its visible caption list.
- **Scroll fallback:** an indivisible source row, line, or passage remains intact inside a scrollable card body and receives a visible scroll cue.

### Status and Announcements

- **Card changes:** the current card title, index, and total use one polite atomic live region.
- **Audio state:** narration, mute, pause, resume, and fallback messages use a polite status region.
- **Study state:** Saved and Done confirmations use a separate polite region so they do not interrupt the card announcement.
- **Load failure:** a failed feed request uses an assertive alert. A recoverable empty feed remains a polite status.

## Do's and Don'ts

### Do:

- **Do** keep the current source heading, answer label, exact-source access, and position visible while reading.
- **Do** use Newsreader for source prose and the sans for controls.
- **Do** separate surfaces with tone and a hairline before reaching for shadow.
- **Do** keep every control keyboard-operable with a visible focus state and accessible name.
- **Do** use one subject accent to mark action, selection, and progress.
- **Do** preserve the exact source text and split overflow only at semantic boundaries.
- **Do** keep secondary controls in the modal drawer rather than rebuilding a permanent dashboard shell.

### Don't:

- **Don't** copy Instagram literally. Use the reel composition, not fake likes, comments, follower counts, messaging bubbles, autoplay, or decorative social chrome.
- **Don't** rewrite, summarise, reorder, or silently omit source teaching content.
- **Don't** use decorative gradients, glows, glass, icon tiles, or a second accent palette.
- **Don't** let edge actions cover prose, tables, or diagrams.
- **Don't** use monospace for ordinary labels; reserve it for code, diagrams, seeds, and measurements.
- **Don't** hide the transcript or make audio the only way to access a card.
- **Don't** add persistent motion, moving content, or autoplay without an explicit user action.
