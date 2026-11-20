# Unit 4 — Data Visualization

| | |
|---|---|
| **Lecture hours** | 7 |
| **Marks carried in 2026 paper** | **7** — one 1-marker and **two** 3-markers (B4 dashboard design, B6 misleading charts) |
| **Marks in the official model question** | **9 attempted** (A7, B15, C20) — including C20, which asks you to *design* a dashboard rather than list principles |
| **Difficulty** | ★★☆☆☆ to write, ★★★★☆ to score — everyone can name a chart; few can say *why* a chart is wrong |
| **Exam yield** | 🔴 high by mark-per-hour — 7 marks for 7 lecture hours, and the questions are opinion-with-reasons, not recall |
| **Prerequisite** | Unit 1 (visualization is the presentation column of the BI stack); Unit 2 (the data being shown) |
| **Syllabus bullets** | Principles of data visualization · Tools and techniques for data visualization · Dashboard design and best practices |

> **Why this unit is a gift and a trap at once:** it is the only unit where the examiner is asking for *judgement*, so there is no list to memorise and no definition to hide behind. B6 ("how can poor visualization choices mislead?") is the highest-signal question in the paper for separating students who understand BI from students who memorised it. Answer it with mechanisms and numbers, not adjectives.

---

## 4.1 What data visualization is

> **Data visualization is the graphical representation of data using charts, graphs and maps so that patterns, trends and outliers can be perceived quickly and communicated clearly.**

Two clauses carry the marks: **perceive quickly** (the cognitive reason) and **communicate clearly** (the business reason). A definition that says only "presenting data in charts" gets half.

### Why the eye beats the table

A table of 500 daily sales figures forces the reader to compare numbers one pair at a time; a line chart lets the visual system detect slope, seasonality and the outlier in a single glance. That is not a stylistic preference — it is **pre-attentive processing**: position, length and colour are decoded by the eye before conscious reading begins.

So visualization is not decoration applied at the end of analysis. It is the **interface between the analysis and the decision**, and a bad interface silently changes the decision (§4.4).

🇳🇵 **Nepal anchor:** a bank's board pack that prints 14 pages of monthly deposit tables gets skimmed; the same data as one line chart per province with a red threshold line gets discussed. Same numbers, different decision.

---

## 4.2 Principles of data visualization — the syllabus bullet with the most marks behind it

### Principle 1 — Encode with the channels the eye reads accurately

Not all visual channels are equally precise. Ranked, best to worst:

| Channel | Accuracy | Use for |
|---|---|---|
| **Position on a common scale** | highest | bars, dots, scatter, line |
| **Length** | high | bars |
| **Angle / slope** | medium | line charts (slope), pie (angle — weak) |
| **Area** | low | bubbles, treemaps — only for rough magnitude |
| **Volume / 3D** | lowest | **never** — the eye misjudges it badly |
| **Colour hue** | categorical only | grouping, not magnitude |

⚠ **The mark-losing habit:** using area or 3D to show a precise difference. If two values differ by 10%, the reader *cannot* see it in a bubble, and the chart is decorative rather than informative.

### Principle 2 — Match the chart to the question being asked

This is the table to reproduce in the exam, because it converts "principles" into something a marker can tick:

| Question | Chart | Why |
|---|---|---|
| How do categories compare? | **sorted bar** | position/length is the accurate channel; sorting does the ranking for the reader |
| How has it changed over time? | **line** | slope is read pre-attentively; time belongs on the x-axis |
| What is the composition? | **stacked bar** (pie only for 2–3 slices) | angles are hard to compare; a stacked bar is not |
| How is it distributed? | **histogram / box plot** | shows spread, skew and outliers, which an average hides |
| Are two variables related? | **scatter** | shows correlation, clusters and outliers at once |
| Where is it? | **map** | only when geography is genuinely the question |
| How does each unit compare across many periods? | **small multiples** | one panel per unit beats 12 lines on one axis |

### Principle 3 — Maximise the data-ink ratio, and keep the lie factor at 1

Tufte's two tests, both quotable in a 3- or 5-marker:

- **Data-ink ratio** — the proportion of ink that actually encodes data. Gridlines, borders, shadows, background fills and 3D effects are **chartjunk**: they consume attention without carrying information.
- **Lie factor** = *size of the effect shown in the graphic* ÷ *size of the effect in the data*. A truthful chart sits at **1.0**. A truncated axis or an over-scaled bubble pushes it far above 1 — which is precisely the mechanism B6 asks about.

### Principle 4 — Use colour with a job, and not as the only channel

| Purpose | Palette | Rule |
|---|---|---|
| magnitude (low → high) | **sequential** (one hue, light → dark) | never rainbow — it invents boundaries that are not in the data |
| deviation from a midpoint | **diverging** (two hues, neutral centre) | centre must be meaningful (zero, target, average) |
| categories | **qualitative** (distinct hues, ≤ 6–8) | more than 8 categories means the chart is the wrong chart |
| emphasis | one accent colour + grey | highlight the point, grey the rest |

Roughly **1 in 12 men** has some colour-vision deficiency, most commonly red–green — so never encode "good vs bad" in red/green alone. Add position, labels or icons. Same principle for accessibility: contrast, readable type size, and never colour-only encoding.

### Principle 5 — Design for cognitive limits, not for the data's convenience

- **One message per chart.** If you cannot write the chart's headline in one sentence, it is two charts.
- **Direct labelling** beats a legend hunt; **sorted categories** beat alphabetical order.
- **Zero baseline on bars** — bar length is a ratio judgement, so cutting the axis lies.
- **Consistent scales and time windows** across panels, so the eye compares like with like.
- **Gestalt grouping** — proximity and enclosure group related items; whitespace separates sections better than boxes.
- **Small multiples** instead of a 12-line spaghetti chart.

---

## 4.3 Tools and techniques

### The tool landscape — name two or three, know the category

| Category | Tools | Note for the exam |
|---|---|---|
| **BI / dashboard platforms** | **Microsoft Power BI**, **Tableau**, Qlik Sense, Google Looker Studio | the syllabus names Power BI and Tableau; use those |
| **Spreadsheet** | Excel (charts, PivotCharts, sparklines) | what most Nepali organisations actually use |
| **Programming libraries** | Python (matplotlib, seaborn, Plotly), R (ggplot2) | reproducible, scriptable, for custom or statistical charts |
| **Web / embedded** | D3.js, ECharts | bespoke interactive visuals inside a product |

### The technique ladder — from static to interactive

| Level | Technique | What it adds |
|---|---|---|
| static | bar, line, pie, scatter | the comparison |
| composite | heatmap, treemap, box plot, bullet chart | many values, or distribution, in one frame |
| small multiples | repeated panels | comparison across units without spaghetti |
| interactive | filter, drill-down, tooltip, cross-highlight | the reader asks their own next question |
| operational | KPI card + sparkline + alert threshold | monitoring, not exploration |

⚠ **Trap:** listing tools when the question asks for *techniques*, or vice versa. "Tableau" is a tool; "drill-down" is a technique; "heatmap" is a chart type. Keep the three words apart.

---

## 4.4 Dashboard design for executives — B4, and the most practical section in the unit

An executive dashboard is not a report. A report is read once, in full; a dashboard is **glanced at repeatedly** and must answer "is anything wrong?" in seconds. Everything below follows from that single constraint.

### The three factors to write (B4)

**1. Decision fit — show the few metrics that map to decisions the executive owns.**
Five to seven KPIs on one screen, exception-driven (green/amber/red against a target), not an exhaustive dump. A dashboard with forty numbers has no hierarchy, so the reader scans nothing and acts on nothing. Ask of every tile: *what decision changes if this goes red?* If the answer is "none", delete it.

**2. Visual hierarchy — arrange it the way the eye scans.**
Most important KPI top-left (reading order), summary before detail, consistent grid, consistent time windows and units across tiles, and drill-down available on demand rather than on screen. Group by question, not by data source. The "five-second rule": the main message must be readable in five seconds without a legend.

**3. Clarity and restraint — remove everything that is not the message.**
Correct chart type per tile, direct labels, a restrained palette with one accent for exceptions, no 3D, no chartjunk, no dual axes. And the two things that make a number *trusted*: a visible **timestamp / last-refresh** and a short **metric definition** ("active customer = purchased in 90 days"). Executives forgive an ugly dashboard; they do not forgive a number whose definition they cannot check.

### Two supporting factors (use if you need a fourth point)

- **Performance and delivery** — loads in seconds, works on a tablet, refreshes on schedule; a slow dashboard is abandoned.
- **Interaction discipline** — filters that cannot produce an empty or misleading view; defaults that show the current period, not "all time".

🇳🇵 **Nepal anchor:** a commercial bank's board dashboard typically carries deposits, credit growth, NPL ratio, CASA ratio, cost of funds and profit — six tiles, monthly, each with a target band. That is exactly the "few KPIs + exception thresholds" pattern, and it is what makes it glanceable in a board meeting rather than readable only in a binder.

### The worked design — model question C20: a monthly sales dashboard for an online retailer

B4 asks you to *list* factors. C20 asks you to **design** — which means a layout, a chart per tile, and a stated purpose for each. A principles essay with no layout scores badly; the design is the answer.

**Audience and decision:** the head of sales and the e-commerce operations lead, once a month, deciding where to spend the next month's marketing budget and which categories to promote.

**Layout — five-second summary on top, "where" in the middle, "what exactly" at the bottom:**

```
┌──────────────────────────────────────────────────────────────────────┐
│ REVENUE        ORDERS        AOV          CONVERSION   GROSS MARGIN  │
│ NPR 4.2M ▲     18,940 ▲      NPR 2,215    2.9% ▼       31.4% ▲       │
│ 96% of plan    104% of plan  -3% vs LM    -0.4 pt      +1.1 pt       │
├──────────────────────────────┬───────────────────────────────────────┤
│ Revenue & orders, 12 months  │ Revenue by category                   │
│ (line; current month         │ (horizontal bars, month vs LY)        │
│  projected to month-end)     │                                       │
├──────────────────────────────┼───────────────────────────────────────┤
│ Purchase funnel              │ Return rate by category               │
│ sessions → views → carts     │ (bars + 8% threshold line)            │
│ → paid orders (funnel bars)  │                                       │
├──────────────────────────────┴───────────────────────────────────────┤
│ Top 20 SKUs: units · revenue · return rate · stock cover (table)     │
└──────────────────────────────────────────────────────────────────────┘
```

| Tile | Chart | Metric | Purpose — what decision it changes | Why in this position |
|---|---|---|---|---|
| KPI strip | 5 status tiles, green/amber/red vs target | revenue, orders, AOV, conversion rate, gross margin | "is the month on plan, and which one number is off?" | top-left reading order; the five-week glance |
| 12-month trend | line, revenue and orders on one axis (both are money/volume — no dual axis needed if orders are indexed) | revenue, orders, MoM and YoY | "is this a blip or a slope?" | directly under the KPIs, because every KPI question is a trend question |
| Category mix | sorted horizontal bars | revenue by category vs last year | "which category carries the month, which is decaying?" | top-right, the first "where" question |
| Purchase funnel | funnel or four bars | sessions → product views → add-to-cart → paid orders, with conversion at each step | "is the problem traffic, the product page, the cart or checkout?" | middle-left — the diagnostic layer, read after the trend |
| Return rate | bars against a threshold line | returns / orders by category | "is the revenue real, or is it being returned?" | middle-right; pairs with category mix |
| SKU table | table, sorted by revenue | units, revenue, return rate, stock cover | "what do I restock, discount or delist?" | bottom, because it is drill-down detail, not a glance |

**Three things that make it a *design* rather than a collage:** every tile carries its **definition** ("AOV = revenue ÷ paid orders"), a **last-refresh timestamp**, and an **exception threshold** so the reader's eye goes to the variance rather than to the number. Monthly period with month-to-date projected to month-end, because a raw MTD figure in week two always looks like a collapse.

⚠ The examiner's marks for C20 are in **justification**, not decoration. "Revenue trend as a line because trend is a continuous quantity and lines are read as rate of change" earns; "a nice line chart" does not.

---

## 4.5 How poor visualization misleads — B6

This is the question where you demonstrate that you understand the *mechanism*, not just the moral. Structure the answer as **mechanism → example → consequence**.

### The six mechanisms (name three for 3 marks, five for 5)

| Mechanism | How it lies | What it looks like |
|---|---|---|
| **Truncated axis** | bar length is read as a ratio; starting the axis near the maximum multiplies the apparent difference | axis 98–102 makes a 3% rise look like a doubling |
| **Inconsistent / dual axes** | two independently scaled axes manufacture crossings and correlations that are not in the data | "sales up, complaints down" — both axes chosen to cross |
| **Area and volume distortion** | the eye reads area, but the designer scaled the radius or used 3D | a 10% larger bubble looks ~21% larger; 3D pies distort slices |
| **Cherry-picked window** | the start date decides the trend | a 3-month "improvement" inside a flat 3-year series |
| **Wrong denominator / aggregation** | absolute counts favour the biggest unit; averaging averages hides Simpson's paradox | province maps darken with population, not with performance |
| **Decorative encoding** | rainbow palettes, pies with 12 slices, spaghetti lines | the reader sees pattern in noise; boundaries appear where the data is continuous |

**Simpson's paradox** deserves its own line because it is the one that survives even an honest chart: a treatment can beat the control in *every* segment and still lose overall, if the segments are weighted differently. It is a **denominator** problem, and no amount of chart design fixes a wrong aggregation.

### The worked example (use this in the exam — it has numbers)

> A telecom's internal dashboard says "complaints falling for three months". The chart plots total monthly complaints on a y-axis running 380–420; the line falls from 412 to 398 — a **3.4% drop** — but 14 units inside a 40-unit frame occupies about **35% of the chart height**, so the reader sees a collapse. Placed on the full 24-month axis starting at zero, the same series is flat with ordinary seasonal noise: the "fall" is the seasonal low. No individual number is false; the **lie factor** is, because the effect shown is roughly 0.35 ÷ 0.034 ≈ **10×** the effect in the data.

That is the shape to write: what the chart does, the numbers, the honest alternative, and the consequence (a decision made on a phantom improvement).

⚠ **The honest caveat worth one line:** misleading charts are not always dishonest. Truncated axes, rainbow palettes and 3D pies are usually produced by default settings, not malice — which is why the professional duty is to check the default before publishing.

---

## 4.6 Answer skeletons — 2026 paper and official model question

### A8 · "What is Data Visualization?" [1]

> Data visualization is the graphical representation of data using charts, graphs and maps so that patterns, trends and outliers can be perceived quickly and communicated clearly.

*(26 words. Perception + communication — both clauses, one sentence.)*

### B4 · "Discuss any three factor that should be consider to design an effective dashboard for executives." [3]

> *Shape: three named factors, each with a reason and a concrete detail. ~110 words.*
>
> **Decision fit.** An executive reads for seconds, so the dashboard carries five to seven KPIs that map to decisions the executive owns, shown as exception-driven status against target; any tile that would not change a decision is removed. **Visual hierarchy.** The most important KPI sits top-left, summary above detail, with a consistent grid and consistent time windows, so the main message is readable within five seconds. **Clarity and restraint.** Each tile uses the chart type its question needs, with direct labels, one accent colour for exceptions, no 3D or chartjunk — plus a last-refresh timestamp and a one-line definition of each metric, because an executive must trust the number before acting on it.

### B6 · "How poor visualization choices can mislead users? Explain with an example." [3]

> *Shape: mechanism → example with numbers → consequence. ~120 words.*
>
> Poor choices mislead when the encoding exaggerates an effect the data does not contain. **Truncating a bar chart's axis** so it starts near the maximum exploits bar length being read as a ratio: a 3% rise on an axis of 98–102 fills the frame and looks like a doubling. **Scaling bubbles by radius, or using 3D**, exaggerates through area — a 10% larger radius reads as roughly 21% larger. **Dual axes with independent scales** manufacture a correlation, and **cherry-picking the start date** reverses a trend. A telecom charting falling complaints over three months on a 380–420 axis turns a 3.4% seasonal dip in a flat series into an apparent collapse. The consequence: a decision taken on a phantom improvement.

### C20 · model question — "Design a dashboard for monthly sales performance for an online retailer: list the key visualizations, metrics (KPIs), and justify their placement and purpose." [5]

> *Shape: state the audience and the decision in one line → top KPI strip → trend → breakdowns → detail table → one line on delivery. ~230 words. This is the applied version of B4: B4 asks what makes a dashboard good, C20 asks you to build one, and the layout is the answer.*

> Designed for the head of sales reviewing the month in one glance and deciding where next month's budget goes. **Top strip:** five KPI tiles — revenue, orders, average order value, conversion rate and gross margin — each shown against plan and against last month, amber or red on variance, because that is the five-second answer to "are we on plan?". **Directly beneath, a 12-month line** of revenue and orders, projected to month-end, because one month cannot separate a blip from a trend. **Right column:** revenue by category as sorted horizontal bars, and return rate by category against an 8% threshold line, because revenue that comes back is not revenue. **Middle-left:** a purchase funnel from sessions to product views to paid orders, because when conversion falls the funnel says whether the cause is traffic, the product page, the cart or checkout. **Bottom:** a table of the top 20 SKUs with units, revenue, return rate and stock cover — detail to drill into, not a glance. Placement follows the eye: the answer top-left, the diagnosis next, the detail last. Every tile carries its metric definition, a last-refresh timestamp and an exception threshold, so the reader finds the variance before reading a single number.


### 5-marker · "Explain the principles of data visualization with suitable examples." [practice — generated]

> *No printed question asked this in this exact form, but the syllabus bullet is the unit's largest and a 5-mark version is the obvious risk. ~210 words.*
>
> Visualization principles exist to make the comparison the viewer needs as easy as possible, so they are rules about perception rather than about taste.
>
> **Encode with accurate channels.** Position and length are read precisely; area, angle and volume are not. Two bars show a 3% difference honestly; two bubbles do not.
>
> **Match the chart to the question.** Sorted bars for comparison, lines for trend over time, stacked bars for composition, histograms for distribution, scatter for relationship, small multiples for many units over many periods.
>
> **Maximise the data-ink ratio.** Gridlines, borders, shadows and 3D effects are chartjunk: they consume attention without carrying data, and they push Tufte's *lie factor* away from 1.0.
>
> **Use colour with a purpose.** Sequential shades for magnitude, diverging for deviation around a meaningful centre, qualitative hues for categories, one accent for emphasis — and never red/green as the only signal, since roughly one man in twelve cannot separate them.
>
> **Respect cognitive limits.** One message per chart, direct labels over legends, sorted categories, a zero baseline on bars, and consistent scales across panels.
>
> The test of a visualization is not whether it looks impressive but whether the intended comparison is the easiest thing to do on the page.

---

## 4.7 Traps

| Trap | Why it costs marks | Fix |
|---|---|---|
| Answering B6 with adjectives ("charts can be confusing") | the marks are for *mechanisms* | name the mechanism, give numbers, state the consequence |
| Saying "pie charts are bad" | unarguable and unearned | pie is acceptable for 2–3 slices; it fails for many slices because angle is a weak channel |
| Truncated axis called "wrong" without the reason | misses the perceptual point | bar length is read as a ratio, so a non-zero baseline inflates the visual effect |
| 3D charts dismissed as "ugly" | misses that they distort *area* | volume encoding is misjudged; the lie factor rises |
| Dashboard answer listing tiles instead of factors | answers a different question | factors = decision fit · hierarchy · clarity (then data trust, performance) |
| "More charts = better dashboard" | inverts the design logic | fewer, exception-driven, one screen |
| Listing tools when asked for techniques | wrong category | tools = Power BI/Tableau; techniques = drill-down, small multiples, heatmap |
| Forgetting the data-quality line | loses the evaluation mark in a 5-marker | timestamp + metric definition = trust |
| Blaming the chart for a wrong aggregation | confuses design with statistics | Simpson's paradox is a denominator problem, not a chart problem |
| Using red/green as the only good/bad signal | accessibility failure, and examiners notice | add labels or symbols; colour-blind safe palettes |
| Answering C20 with five principles and no layout | the verb is **design** — principles are the B4 answer | give the wireframe, one chart per tile, and a stated purpose for each |

---

## 4.8 Self-test (answers collapsed)

1. Define data visualization in one sentence containing both perception and communication. *(1 mark)*
2. Name the three most accurate visual channels and the least accurate. *(1–3 marks)*
3. Which chart for: comparison, trend, composition, distribution, relationship? *(3 marks)*
4. Name three factors in designing an executive dashboard, with a reason for each. *(3 marks)*
5. Explain two mechanisms by which a chart can mislead, with numbers. *(3 marks)*
6. What is Tufte's lie factor, and what value is truthful? *(1–3 marks)*
7. 🇳🇵 A provincial health ministry maps "number of hospital beds" by district and concludes the hill districts are well served. Name the error and the fix. *(3–5 marks — mini case)*
8. Sketch a monthly sales dashboard for an online retailer: five KPIs, four supporting charts, and one sentence on why each sits where it sits. *(5 marks — model question C20)*

<details>
<summary>Answers</summary>

1. "Data visualization is the graphical representation of data so that patterns, trends and outliers can be perceived quickly and communicated clearly."
2. Most accurate: **position on a common scale**, **length**, and (weaker) **angle/slope**. Least accurate: **volume / 3D** — area is already poor, and volume is worse.
3. Comparison → sorted bar · trend → line · composition → stacked bar (pie only for 2–3 slices) · distribution → histogram or box plot · relationship → scatter.
4. Any three of: **decision fit** (few KPIs tied to decisions, exception-driven) · **visual hierarchy** (most important top-left, summary before detail, consistent grid) · **clarity and restraint** (right chart type, direct labels, no chartjunk) · **data trust** (timestamp, metric definition) · **performance** (fast, mobile, scheduled refresh).
5. **Truncated axis**: a 3% rise plotted on 98–102 looks like a doubling, because bar length is read as a ratio. **Area distortion**: scaling a bubble by radius makes a 10% larger radius read as ~21% more area. (Also acceptable: dual axes manufacturing correlation; cherry-picked window.)
6. Lie factor = size of the effect shown in the graphic ÷ size of the effect in the data. Truthful ≈ **1.0**; anything far from 1 exaggerates or understates.
7. The error is a **wrong denominator**: absolute bed counts simply follow population, so the most populous districts look darkest regardless of access. Fix: map **beds per 1,000 people** (a rate, with a sequential palette and a legend), and if the question is access rather than capacity, map travel time to the nearest facility. The visual was accurate; the measure was not.
8. Five KPIs across the top (revenue, orders, AOV, conversion, gross margin) against plan; beneath them a 12-month revenue/orders line; right column revenue by category and return rate by category; middle-left a sessions → views → carts → orders funnel; bottom a top-20 SKU table. The strip is top-left because it answers "are we on plan?" in five seconds; the trend sits under it because one month cannot distinguish a blip from a trend; the funnel sits in the diagnostic layer because it localises a conversion drop; the table is last because it is drill-down, not a glance.

</details>

---

## 4.9 Sixty-second check

Close the file and, on a blank page:

- [ ] Define visualization with both clauses
- [ ] Rank position, length, area, volume by accuracy
- [ ] Give the chart for comparison / trend / composition / distribution / relationship
- [ ] Name the three executive-dashboard factors
- [ ] Explain one misleading mechanism with numbers
- [ ] State the lie factor and its truthful value
- [ ] Lay out a monthly sales dashboard: 5 KPIs, 4 charts, and the reason for each position

If all seven are there, Unit 4's 9 marks are secure — 7 from the 2026 paper plus C20 from the model question — and you have just gained the vocabulary for the case's "how do dashboards drive loyalty" part.

---

*Sources for this unit: TU FOM syllabus (IT 249, Unit 4, 7 LHs) · TU 2026 paper (A8, B4, B6) · official TU/FOM model question 2026 (A7, B15, C20) · principles (data-ink ratio, chartjunk, lie factor) from Tufte, "The Visual Display of Quantitative Information", and dashboard practice from Few, "Information Dashboard Design" — both standard references for this syllabus bullet. The telecom, ministry and online-retailer examples are constructed illustrations, not claims about any named organisation's published figures.*
