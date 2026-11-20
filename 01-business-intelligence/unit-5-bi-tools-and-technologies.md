# Unit 5 — BI Tools and Technologies

| | |
|---|---|
| **Lecture hours** | 12 — largest unit in the syllabus |
| **Marks in 2026 paper** | 10 — two 1-markers (A9 two BI tools, A10 OLAP limitation), one 3-marker (B5 OLAP vs SQL), one 5-marker (C4 BI vs traditional reporting) |
| **Marks in model question** | 2 — A8 (one popular BI tool), A9 (OLAP purpose). Low in model, high in board paper — prepare for board paper |
| **Difficulty** | ★★★☆☆ — tool names are free marks; OLAP operations and "why BI is more powerful" comparison are where marks are lost |
| **Exam yield** | 🔴 high — 12 hours, 4 questions in 2026, OLAP appears in both official sources |
| **Prerequisite** | Unit 2 (star schema is what a cube is built from) · Unit 4 (dashboard is the BI tool's output) |
| **Syllabus** | Popular BI tools (Tableau, Power BI) · Hands-on experience with BI tools · Introduction to OLAP |

> **Read this first:** This unit has two halves that behave very differently. The **tool half** (5.1–5.2) is name-and-compare — cheap marks, only place in the paper where you must produce proper nouns. The **OLAP half** (5.3–5.6) is conceptual and carries the real weight: it is where the paper asks for a *mechanism* (B5) and a *critique* (A10). Students memorise "OLAP is multidimensional" and then lose the 3-marker, because the 3-marker is about **how it differs from a SQL query**, not what the acronym means.

---

## Coverage Map

```
5.1 What a BI Tool Is 🎯 1-mark
├── Definition: modelled data, non-programmer, interactive
├── Stack position: sources → ETL → warehouse/cube → BI tool → decision
├── 5 tool categories + examples
└── Hands-on workflow: C-M-V-P-S (Connect, Model, Visualise, Publish, Schedule)

5.2 Tableau vs Power BI 🎯 1-mark
├── Vendor, deployment, modelling, strengths, weaknesses
└── Fit argument: governance/integration vs exploration depth

5.3 OLAP 🎯 1-mark / 🎯 3-mark
├── Definition: multidimensional analysis, analytical counterpart to OLTP
├── Cube: dimensions, hierarchies, measures, grain
├── 5 operations: roll-up, drill-down, slice, dice, pivot
└── Storage: MOLAP, ROLAP, HOLAP

5.4 OLAP vs Traditional SQL Query 🎯 3-mark
├── Core distinction: exploration vs fetch
├── Aggregation: pre-computed vs on-demand
├── Dimensions: hierarchies vs columns
└── Mechanism: cost moved from query time to load time

5.5 OLAP Limitations 🎯 1-mark
├── Design-bound, stale, load cost, no discovery
└── Mining covers what OLAP cannot

5.6 BI Tools vs Traditional Reporting 🎯 5-mark
├── Comparison: change cost, interaction, data model, latency, reach, governance
└── 4 reasons BI is more powerful: semantic layer, self-service, interactivity, one model many outputs
```

---

## 5.1 What a BI Tool Is, and the Landscape 🎯 1-mark

> **A BI tool is software that sits on top of modelled data — usually a warehouse or cube — and lets a non-programmer explore, aggregate and visualise it interactively, without writing SQL.**

Everything else in this unit follows from that sentence. Three clauses carry it: **modelled data** (the tool assumes a clean star schema, not raw tables), **non-programmer** (that is why it exists — analysts, managers), **interactively** (that is what separates it from a printed report).

### Where It Sits in the Stack

```
SOURCES → ETL → WAREHOUSE / CUBE → [ BI TOOL ] → DECISION
                        (Unit 2)      (this unit)    (Unit 6)
                                              │
                                      connect → model → visualise
                                      → publish → schedule
```

### The Five Tool Categories (Name the Category, Then an Example)

| Category | What it is for | Examples | Exam value |
|---|---|---|---|
| **BI & analytics platforms** | self-service analysis and dashboards over a warehouse | **Power BI**, **Tableau**, Qlik Sense, Looker, Spotfire | 🔴 the two the syllabus names |
| **Enterprise reporting tools** | pixel-perfect, scheduled, paginated reports (invoices, statutory returns) | SSRS, Crystal Reports, JasperReports | 🟡 the "traditional" side of C4 |
| **OLAP / cube engines** | pre-computed multidimensional stores that BI tools query | SSAS (Tabular/Multidimensional), Oracle Essbase, Mondrian | 🔴 §5.3 builds on this |
| **Cloud-native BI** | same analysis, no server to run | Amazon QuickSight, Power BI Service, Looker, Looker Studio | 🟡 cheap example in an answer |
| **Open-source BI** | low-cost self-service | Apache Superset, Metabase, Redash | 🟢 one line if asked for alternatives |
| **Embedded analytics** | dashboards inside another product | Power BI Embedded, Tableau Embedded | 🟢 recognise the term |

⚠ **Trap:** The 1-marker says *"List any two BI tools"*. "Excel" and "SQL" are not BI tools in this context — Excel is a spreadsheet and SQL is a language. Microsoft Power BI and Tableau are the safe two, every time.

### The Hands-On Workflow — The "Hands-On Experience" Syllabus Bullet, As Five Steps

| Step | What actually happens | Why the examiner cares |
|---|---|---|
| 1 **Connect** | point the tool at the warehouse/cube/file; choose import (in-memory) or direct query (live) | import is fast, direct query is fresh — the classic trade-off |
| 2 **Model** | define relationships (fact → dimensions), create measures and calculated columns | this is where the star schema from Unit 2 pays off |
| 3 **Visualise** | drag fields onto a canvas; the tool generates the chart, you choose the type | Unit 4's principles apply here, not different ones |
| 4 **Publish / share** | publish to a workspace or server; set row-level security and permissions | separates a personal workbook from a governed asset |
| 5 **Schedule / refresh / govern** | refresh cadence, usage monitoring, certified datasets | the difference between a demo and a BI implementation (Unit 6) |

🧠 **Memory hook: C-M-V-P-S** — *Connect, Model, Visualise, Publish, Schedule.* Five steps, and they map onto the five clauses of the definition.

🎯 **Exam hook:** A9 asks for two BI tools. Power BI and Tableau — six words, full mark.

---

### A9 · "List any two BI tools." [1] 🎯 1-mark

> Microsoft Power BI and Tableau.

*(6 words. The question says list — do not explain, do not compare. Two proper nouns, then stop.)*

### A8 · Model Question — "Give one popular BI tool." [1] 🎯 1-mark

> Microsoft Power BI.

*(3 words. "One" means one. Naming three risks looking like you did not read the question.)*

---

## 5.2 Tableau and Power BI — The Comparison Worth Having Ready 🎯 1-mark

The syllabus names exactly these two, so a comparison question is always possible, and either one is an acceptable answer to "give one popular BI tool".

| | **Microsoft Power BI** | **Tableau** |
|---|---|---|
| Vendor / lineage | Microsoft; launched 2015, built on Power Query + Power Pivot | Tableau Software; owned by Salesforce since 2019 |
| Deployment | desktop authoring + cloud service (SaaS) or on-premises report server | desktop authoring + Tableau Server / Tableau Cloud |
| Data modelling | Power Query (ETL-lite) + a tabular model; **DAX** for measures | connects live or extracts; lighter modelling, stronger on visual exploration |
| Signature strength | cheap, ubiquitous, tight integration with Excel, Teams and Azure; strong governance | best-in-class visual exploration and dashboard interactivity; **VizQL** |
| Weakness | DAX has a steep learning curve; heavy models need capacity planning | cost per seat; less natural as an enterprise ETL/modelling layer |
| Best fit | an organisation already on Microsoft 365 | an analytics team that lives in the visuals |
| One-line verdict for the exam | *the default enterprise choice where Microsoft is already the platform* | *the default choice where visual exploration is the product* |

⚠ **Do not write** "Power BI is better because it is cheaper" as your comparison. Cost is a purchasing criterion, not an analytical one; the mark is for **fit** — governance and integration versus exploration depth.

🇳🇵 **Nepal anchor:** The pattern visible in Nepali banks, insurers, telecoms and universities is a warehouse or data mart plus **Power BI**, because licences come bundled with the Microsoft estate (Windows, SQL Server, Microsoft 365) already installed. Tableau tends to appear where a dedicated analytics team exists and the deliverable is public-facing or executive visual storytelling. That is a pattern of *fit*, not a claim about any named institution's procurement.

---

## 5.3 OLAP — What It Is, What It Is For, and How It Works 🎯 1-mark / 🎯 3-mark

> **OLAP (Online Analytical Processing) is the multidimensional analysis of warehouse data: it lets a user summarise, slice and drill through measures along business dimensions, interactively and at speed, instead of writing a new query for every question.**

The term was introduced by **E. F. Codd in 1993** as the analytical counterpart to OLTP. That one sentence — *the analytical counterpart to OLTP* — explains everything below.

### What OLAP Is Used For (Model Question A9, 1 Mark) 🎯 1-mark

> OLAP is used for fast, interactive multidimensional analysis: summarising measures such as sales across dimensions such as time, product and region, and drilling from total to detail.

*(27 words. The point the examiner wants: **aggregation along business dimensions, interactively**. Not "storing data", not "reporting", not "mining".)*

🎯 **Exam hook:** Model question A9 asks "What is OLAP used for?" — this is the answer.

### The Cube — The Mental Model

A star schema is a set of tables; a **cube** is the same data reorganised so every combination of dimension values has a pre-computed measure.

```
              PRODUCT
                ▲
       (Laptop) │
                │
                │        ┌──────────────┐
                │        │   MEASURE    │
                │        │  Sales = 4.2M│
   TIME ◄───────┼───────►│  Units = 1.9k│
  (2026-Q3)     │        │  Margin = 31%│
                │        └──────────────┘
                │
                ▼
              REGION (Kathmandu)

  Three dimensions + one or more measures = a cube.
  Add a fourth dimension and it is a hypercube — the maths
  is the same, the picture stops being drawable.
```

| Term | Meaning | Example |
|---|---|---|
| **Dimension** | an axis you analyse *by* | time, product, region, channel, customer segment |
| **Hierarchy** | levels inside a dimension | Year → Quarter → Month → Day; Country → Province → City |
| **Measure** | the number you aggregate | revenue, units sold, margin, headcount |
| **Cube** | dimensions × measures, pre-aggregated | the object the BI tool queries |
| **Grain** | the finest level stored | one row per order line per day |

### The Five Operations — The Ones to Name in a 3- or 5-Marker

| Operation | What it does | Concrete example |
|---|---|---|
| **Roll-up** (drill-up) | aggregate to a coarser level of a hierarchy | monthly sales → quarterly sales → annual sales |
| **Drill-down** | move to a finer level | annual → quarter → month → the individual invoice |
| **Slice** | fix **one** dimension, view the rest | sales in 2026 only |
| **Dice** | fix **two or more** dimensions — a sub-cube | 2026 × Bagmati × laptops |
| **Pivot** (rotate) | swap the axes to see the same numbers from another angle | products as rows → products as columns |

⚠ The examinable difference is **slice vs dice**: slice fixes *one* dimension, dice fixes *two or more*. Writing them as synonyms is the most common OLAP error in scripts.

### Three Storage Architectures — One Line Each

| Type | How it stores | Speed / freshness trade-off |
|---|---|---|
| **MOLAP** | pre-computed, compressed cube on disk (SSAS Multidimensional, Essbase) | fastest queries; slow load, storage-hungry, stale until processed |
| **ROLAP** | no cube — SQL rewritten against the relational star schema (Mondrian) | always current, scales to huge data; slower aggregation |
| **HOLAP** | aggregates in the cube, detail left in the relational store | compromise: fast summaries, detail on demand |

---

## 5.4 OLAP Versus a Traditional Database Query — B5 🎯 3-mark

The 2026 paper asked: *"How does OLAP differ from traditional database queries in terms of analysis capabilities?"* Note the phrase **analysis capabilities** — the marks are for what you can *do*, not for storage.

| | **Traditional SQL query** (OLTP database) | **OLAP** |
|---|---|---|
| Question shape | "fetch these rows" — one question, one query | "let me explore" — many questions from one view |
| Aggregation | you write `GROUP BY`; the database computes it on demand | aggregates are pre-computed; the answer is a lookup |
| Dimensions | columns in a table, no concept of a hierarchy | first-class dimensions with hierarchies, so roll-up/drill-down are one click |
| Operations available | select, join, group, sort | roll-up, drill-down, slice, dice, pivot |
| Response time | degrades as history and joins grow | stable and fast, because the work was done at load time |
| User | developer or analyst who writes SQL | manager or analyst who does not |
| Result | a result set | an interactive view that can be re-cut without a new query |
| Data currency | live, current | as of the last cube process / refresh |
| Optimised for | **transactions** — many small reads and writes | **analysis** — few large reads over history |

**The mechanism to state explicitly** (this is the mark most scripts miss): OLAP is fast *because the aggregation happens at load time, not at query time*, and because dimensions are indexed and pre-joined. A traditional query re-does the work on every execution; a cube does it once.

⚠ **Honest nuance, worth one line:** the boundary has blurred. A modern columnar warehouse (Redshift, BigQuery, Snowflake) with materialised views answers many "OLAP-style" questions quickly without a cube. Say this only if the question invites evaluation — in a 3-marker it costs time.

---

### A9 · Model Question — "What is OLAP used for?" [1] 🎯 1-mark

> For fast, interactive multidimensional analysis: summarising measures such as sales across dimensions such as time, product and region, and drilling from a total down to the detail behind it.

*(29 words. Aggregation + dimensions + drilling — the three things the marker looks for.)*

---

### B5 · "How does OLAP differ from traditional database queries in terms of analysis capabilities?" [3] 🎯 3-mark

> *Shape: the core distinction, then three named differences, then the mechanism that explains the speed. ~110 words.*

> A traditional query fetches rows for one question already written in SQL; OLAP supports exploration, so the user re-cuts one view without writing new queries. Three differences follow. **Aggregation:** SQL computes `GROUP BY` results on every execution, while a cube's aggregates are pre-computed at load time. **Dimensions:** a relational table has columns, whereas OLAP has dimensions with hierarchies, so roll-up, drill-down, slice, dice and pivot need no new query. **Time and users:** SQL performance degrades as history and joins grow, and it needs a developer; OLAP stays fast because the work was done at load time, and it is used directly by managers. That is why OLAP is fast — the cost moved from query time to load time.

---

## 5.5 The Limitations of OLAP — A10 🎯 1-mark

The 1-mark answer:

> OLAP answers only the questions the cube was designed for: it is limited to modelled dimensions and pre-aggregated history, so it goes stale between refreshes and cannot discover unknown patterns.

*(30 words. Cut "and pre-aggregated history" to land at 26 if the paper's 1-markers are tight.)*

The four limitations worth knowing, in case a 3- or 5-marker appears:

| Limitation | Why it matters | Business consequence |
|---|---|---|
| **Design-bound** | only dimensions and measures in the cube are analysable; a new question needs a schema change | the question you did not anticipate costs weeks, not minutes |
| **Staleness** | pre-aggregation means the cube is as fresh as its last process | a decision made at 9 a.m. on yesterday's numbers |
| **Load cost and volume** | processing time and storage grow with dimensions and history; sparse cubes waste space | overnight windows get missed as data grows |
| **No discovery** | OLAP confirms and cuts known structure; it does not find unknown patterns | churn drivers and basket affinities need **data mining** (Unit 3), not OLAP |

⚠ **The distinction the examiner is testing:** *OLAP answers the question you already know how to ask; data mining finds the question you did not know to ask.* If a 5-marker asks you to evaluate OLAP, that sentence is the conclusion.

---

### A10 · "What is the limitation of OLAP?" [1] 🎯 1-mark

> OLAP answers only the questions the cube was designed for: it is limited to modelled dimensions and pre-aggregated history, so it goes stale between refreshes and cannot discover unknown patterns.

*(30 words — delete "and pre-aggregated history" to land at 26.)*

---

## 5.6 BI Tools Versus Traditional Reporting Tools — C4 🎯 5-mark

The 2026 5-marker: *"Compare Business Intelligence tools with traditional reporting tools. What makes BI more powerful? Explain."* Two halves — compare, then justify.

| | **Traditional reporting** (SSRS, Crystal, printed packs) | **BI tools** (Power BI, Tableau) |
|---|---|---|
| Output | fixed, paginated report — the same layout every time | interactive dashboard the reader re-cuts |
| Who defines the question | the IT/reporting team, in advance | the business user, at the moment of need |
| Data model | one report, one query, often one source | one governed semantic model shared by many reports |
| Change cost | a new requirement means a new report build | a new filter, or a new visual, in minutes |
| Interaction | none — read-only | drill-down, filter, cross-highlight, what-if |
| Latency | scheduled batch, often monthly | scheduled refresh, often daily or hourly |
| Reach | email, print, PDF | web, mobile, embedded, alerts |
| Governance risk | low — few artefacts, tightly controlled | higher — needs certified datasets and row-level security, or it becomes "spreadsheet sprawl with nicer charts" |

**What makes BI more powerful — the four reasons to write:**

1. **A semantic layer, defined once.** Measures such as "active customer" or "gross margin" are defined in the model, so every report on it agrees. In traditional reporting, each report re-implements the calculation, and the definitions drift. (This is also why §5.1's definition insisted on **modelled data** and a **non-programmer**: the semantic layer is what lets the manager explore without SQL.)
2. **Self-service.** The business user answers the next question without raising a ticket — which removes the reporting backlog that is the real cost of traditional reporting.
3. **Interactivity converts a number into an investigation.** Drill-down from a bad month to the branch, product and invoice that caused it, inside one screen.
4. **One model, many outputs.** The same certified dataset serves a dashboard, an alert, a mobile view and an embedded page — plus machine-learning and forecasting features that a paginated report cannot hold.

⚠ **The balanced close, worth a mark:** Traditional reporting is not obsolete. Statutory returns, invoices and regulator submissions need a **fixed, auditable layout** — exactly what a paginated tool does better. The professional answer is *both*: BI for exploration, paginated reporting for the record.

---

### C4 · "Compare Business Intelligence tools with traditional reporting tools. What makes BI more powerful? Explain." [5] 🎯 5-mark

> *Shape: what each is → four comparison dimensions → four reasons BI is more powerful → one balanced caveat. ~230 words.*

> Traditional reporting tools (SSRS, Crystal Reports) produce **fixed, paginated outputs**: the reporting team defines the question in advance, the layout is identical every run, and the reader consumes it. BI tools (Power BI, Tableau) sit on a **governed semantic model** and produce an **interactive view** the business user re-cuts.
>
> **Compare.** *Change cost:* a new requirement means a new report build in traditional reporting, versus a filter or a new visual in minutes. *Interaction:* traditional output is read-only; BI supports drill-down, filtering and cross-highlighting. *Data model:* each traditional report embeds its own query and calculations, while many BI reports share one model. *Latency and reach:* monthly batch and print versus daily refresh across web, mobile, alerts and embedded pages.
>
> **Why BI is more powerful.** First, **a semantic layer defined once** — "active customer" means the same thing in every report, ending the definition drift of hand-built reports. Second, **self-service**, which removes the reporting backlog. Third, **interactivity turns a number into an investigation**: drill from a bad month to the invoice that caused it. Fourth, **one model, many outputs**, including forecasting and alerts that a paginated report cannot carry.
>
> **The balance:** statutory returns and invoices still need a fixed, auditable layout, which paginated tools do better. Use both — BI to explore, reporting to certify.

---

## 5.7 Traps

| Trap | Why it costs marks | Fix |
|---|---|---|
| Naming Excel or SQL as a BI tool | wrong category — spreadsheet and language | Power BI, Tableau, Qlik, Looker |
| Writing "OLAP is a database" | it is an analytical *processing model*, often a cube over a warehouse | "multidimensional analysis of warehouse data" |
| Confusing slice and dice | loses the one distinction the marker checks | slice = one dimension fixed; dice = two or more |
| Describing OLAP operations without examples | definitions alone read as memorised | name the hierarchy and the business case in the same breath |
| Saying OLAP is "real-time" | pre-aggregation makes it as fresh as the last process | say "stale between refreshes" and gain a mark |
| Claiming OLAP finds hidden patterns | that is data mining (Unit 3) | OLAP confirms known structure; mining discovers unknown structure |
| Answering C4 with a feature list | question asks for a *comparison* and a *justification* | compare on change cost, interaction, model, latency; then four reasons |
| Saying traditional reporting is obsolete | unearned and wrong; statutory output needs fixed layout | close with the balanced "both" |
| Quoting licence prices or market share | unverifiable and changes yearly | compare on fit: integration and governance vs exploration depth |
| Writing "Power BI is better than Tableau" | paper asks for a comparison, not a verdict | compare on the dimensions; end with fit |

---

## 5.8 Self-Test (Answers Collapsed)

1. Define a BI tool in one sentence, naming the three things that make it different from a printed report. *(1 mark)*
2. List any two BI tools, and the category each belongs to. *(1 mark)*
3. What is OLAP used for? *(1 mark — model A9)*
4. Name the five OLAP operations and give an example of each. *(3–5 marks)*
5. Distinguish slice from dice in one line. *(1 mark)*
6. State the limitation of OLAP, and say which unit's technique covers what OLAP cannot do. *(1 mark)*
7. Explain how OLAP differs from a traditional SQL query in analysis capabilities. *(3 marks — B5)*
8. 🇳🇵 A Kathmandu retail chain's board asks for "the same dashboard for 12 branches, each seeing only its own sales". Name the two BI tool features the answer needs. *(3 marks — mini case)*

<details>
<summary>Answers</summary>

1. "A BI tool is software that sits on modelled warehouse data and lets a non-programmer explore, aggregate and visualise it interactively, without writing SQL." The three differences: modelled data, non-programmer, interactive.
2. **Power BI** and **Tableau** — both BI and analytics platforms. (Also acceptable: Qlik Sense; Looker. Wrong: Excel, SQL.)
3. Aggregation of measures across business dimensions, interactively, with drill-down to detail.
4. **Roll-up** monthly → quarterly · **drill-down** quarter → the individual invoice · **slice** fix one dimension, e.g. 2026 only · **dice** fix two or more, e.g. 2026 × Bagmati × laptops · **pivot** swap rows and columns.
5. Slice fixes **one** dimension and shows the rest; dice fixes **two or more**, producing a sub-cube.
6. It only answers questions the cube was designed for, is stale between refreshes, and cannot discover unknown patterns — that is **data mining** (Unit 3). (Also: load time and storage grow with dimensions.)
7. SQL fetches rows for a pre-written question and computes aggregates on every run; OLAP pre-computes aggregates at load time and offers hierarchies, so roll-up/drill-down/slice/dice/pivot need no new query. Speed comes from moving the cost to load time.
8. **Row-level security** (each branch sees only its own rows) and a **shared certified dataset / semantic model** (one definition of revenue, twelve views of it). Bonus: scheduled refresh for a single source of truth.

</details>

---

## 5.9 Sixty-Second Check

Close this file and, on a blank page:

- [ ] Define a BI tool with its three distinguishing clauses
- [ ] Name two BI tools and their category
- [ ] Say what OLAP is used for in one sentence
- [ ] Draw a cube: three dimensions and one measure
- [ ] Name all five OLAP operations with an example each
- [ ] Say the slice-vs-dice difference in one line
- [ ] State the limitation of OLAP, and name the unit that covers the gap
- [ ] Give the mechanism that makes OLAP faster than SQL
- [ ] Give four reasons BI is more powerful than traditional reporting

If all nine are there, Unit 5's 12 marks are secure — A9, A10, B5 and C4 — and you can answer both model-question 1-markers (A8, A9) without a pause.

---

*Sources: TU FOM syllabus (IT 249, Unit 5, 12 LHs) · TU 2026 paper (A9, A10, B5, C4) · TU/FOM model question 2026 (A8, A9) · OLAP terminology and the five operations from Codd's 1993 formulation and standard OLAP literature (Kimball & Ross, *The Data Warehouse Toolkit* — a syllabus reading; Sherman, *Business Intelligence Guidebook* — also a syllabus reading). Product facts (vendors, ownership, deployment models) are stated at the level of "who owns it and how it is delivered", not as current pricing or market share, because both change yearly. The Nepali adoption patterns are described as patterns, not as claims about any named institution's procurement.*