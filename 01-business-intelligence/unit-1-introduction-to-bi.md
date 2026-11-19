# Unit 1 — Introduction to Business Intelligence

| | |
|---|---|
| **Lecture hours** | 5 |
| **Marks carried in 2026 paper** | 6 (three 1-markers + one 3-marker) |
| **Difficulty** | ★★☆☆☆ — easy to understand, easy to lose marks on wording |
| **Exam yield** | 🟡 medium — always present, never large. Cheap marks. |
| **Prerequisite** | none. This unit is the vocabulary the rest of the paper assumes. |
| **Syllabus bullets** | Definition and scope of BI · Importance of BI in decision-making · Overview of BI tools and technologies |

> **Why this unit matters out of proportion to its marks:** every other answer in the paper borrows its vocabulary. You cannot answer the 20-mark case ("how does Amazon use BI?") without being able to say what BI *is*. Get the definitions exact here and you get free marks in Groups A and D simultaneously.

---

## 1.1 The definition — write this version

> **Business Intelligence (BI) is the set of processes, technologies and tools that collect data from multiple sources, transform it into a reliable, query-ready form, and present it as information that managers use to make faster and better decisions.**

Break it into the four parts an examiner looks for:

| Part | What it means | Why it's in the definition |
|---|---|---|
| **Processes** | ETL, reporting cycles, governance | BI is a discipline, not a product |
| **Technologies & tools** | data warehouse, OLAP, dashboards, Tableau/Power BI | the syllabus' Unit 2 and Unit 5 |
| **Transformation** | raw, messy, multi-source → clean, consistent | this is the work nobody sees |
| **Decision** | the output is a *decision*, not a chart | the point of the whole course |

🧠 **Memory hook — "C-T-P-D": Collect → Transform → Present → Decide.**

⚠ **The most common mistake in the whole paper:** writing "BI is software like Power BI". That is a *tool used by* BI. A tool-only answer to a definition question loses the mark, and it sets up a weak case answer later.

### Where BI sits among its neighbours

This table does more work than any paragraph — several 1-markers across the paper come from the edges between these terms:

| Term | What it does | Output |
|---|---|---|
| **Data** | raw facts, unorganised | `3400, 12/03, KTM` |
| **Information** | data in context | "3400 units sold in Kathmandu in March" |
| **Data analysis** | inspecting/cleaning/modelling data to find useful information | an insight or a finding |
| **Data mining** | algorithmic search for *hidden patterns* in large data | a rule, cluster, or model |
| **Reporting** | presenting predefined metrics on a schedule | a static report |
| **BI** | the whole pipeline that makes the above repeatable and decision-ready | decisions |

⚪ **DIKW note:** Data → Information → Knowledge → Wisdom is a common 1-mark question elsewhere; keep it in your head, one line each. Not asked in 2026 for BI, but it is the standard framing.

---

## 1.2 Scope of BI — how to answer "list any two"

"Scope" means **how far BI reaches** — both across the organisation and across levels of analysis. Students lose this mark because "scope" sounds like "features" and they list tool names.

### Scope across the analytical ladder (answer this if asked for scope)

| Level | Question answered | BI capability | Example |
|---|---|---|---|
| 1. **Descriptive** | What happened? | dashboards, reports | last month's sales by branch |
| 2. **Diagnostic** | Why did it happen? | drill-down, OLAP, root-cause | which product drove the drop |
| 3. **Predictive** | What will happen? | forecasting, data mining models | next quarter's demand |
| 4. **Prescriptive** | What should we do? | optimisation, recommendation | reorder quantities per store |

### Scope across the organisation

- **Functional scope** — one department (sales, HR, finance) → **enterprise scope** — one governed data warehouse feeding every function.
- **Data scope** — internal transactional data → external data (market, competitor, social, web).
- **Time scope** — historical reporting → real-time/near-real-time monitoring.
- **User scope** — analyst-authored reports → self-service BI for managers on mobile.

🇳🇵 **Nepal anchor (use this in a 3- or 5-marker, and in a case):** a Nepali commercial bank's BI scope typically runs from *branch-level daily deposit and loan reports* (descriptive, functional) to *NPL early-warning dashboards and customer churn scoring* (predictive, enterprise). Same discipline, different rung of the ladder.

**A2-safe answer (1 mark):** "BI's scope spans descriptive reporting, diagnostic drill-down, predictive forecasting and prescriptive recommendation, across functions from a single department to the whole enterprise."

---

## 1.3 Why BI matters in decision-making

### First, why *data* matters (this was literally a 1-marker)

Because decisions made on intuition are **unverifiable and unrepeatable**; data makes a decision traceable to evidence, comparable across periods, and correctable when wrong. In one line: *data converts opinion into evidence.*

### The five importance points (this is the 3-marker "discuss any three importance")

| # | Importance | One-line justification | Example |
|---|---|---|---|
| 1 | **Faster decisions** | pre-aggregated, query-ready data removes the wait for a report | branch manager sees yesterday's position today |
| 2 | **Better-quality decisions** | one governed version of the truth removes conflicting spreadsheets | finance and sales quote the same revenue figure |
| 3 | **Single source of truth** | central warehouse + definitions (Unit 2) | "active customer" defined once |
| 4 | **Trend and pattern discovery** | historical data reveals seasonality and anomalies | Dashain–Tihar demand spikes, visible in advance |
| 5 | **Competitive advantage / cost control** | spot loss-making products and idle inventory early | discontinue a product line before the year-end loss |

🧠 Memory hook for the five: **F-B-S-T-C** — *Faster, Better, Single truth, Trends, Competitive edge.* In the exam write any three with a justification line each — never three bare words.

⚠ **Trap:** "Importance" questions want **consequence**, not definition. "BI means business intelligence" earns zero of three. Each point must say *what improves as a result*.

### What BI does **not** fix (worth one line in any evaluation answer)

BI improves the *evidence*; it does not improve the *decision-maker*. Poor data quality, unclear ownership and unexploded recommendations (dashboards nobody acts on — the "BI shelfware" problem) all survive a perfect warehouse. Examiners like this sentence in 5-markers and in the case's ethics part.

---

## 1.4 Overview of BI tools and technologies

You need two things here: the **stack** (in order) and **two tool names** (that is literally a 1-marker: "list any two BI tools").

### The BI stack — draw this, it earns marks everywhere

```
  SOURCES            INTEGRATION          STORAGE            ANALYSIS           PRESENTATION
 ┌──────────┐      ┌────────────┐      ┌────────────┐     ┌────────────┐     ┌──────────────┐
 │ ERP/POS  │      │            │      │   Data     │     │   OLAP     │     │  Dashboards  │
 │ CRM      │ ───► │    ETL     │ ───► │ Warehouse  │ ──► │  Mining    │ ──► │  Reports     │
 │ Excel    │      │ (extract,  │      │  / Data    │     │  Statistics│     │  Alerts      │
 │ Web/API  │      │ transform, │      │   Marts    │     │  Queries   │     │  Mobile      │
 │ Sensors  │      │  load)     │      │            │     │            │     │              │
 └──────────┘      └────────────┘      └────────────┘     └────────────┘     └──────────────┘
                                                                                   │
                                                                                   ▼
                                                                            DECISION / ACTION
```

That diagram is the skeleton of the whole course: Unit 2 is column 2–3, Unit 3 is column 4, Unit 4 is column 5, Unit 5 is the tooling across columns, Unit 6 is making it survive in a real organisation.

### Tool categories and named examples (name two, know the category of each)

| Category | What it is | Named tools |
|---|---|---|
| Visualisation / dashboard BI | drag-and-drop analysis and dashboards | **Tableau, Microsoft Power BI**, Qlik Sense, Google Looker Studio |
| Reporting layer | paginated, scheduled operational reports | SQL Server Reporting Services (SSRS), Crystal Reports |
| Spreadsheet BI | the tool everyone actually uses | Excel (Power Pivot, PivotTables) |
| Database / OLAP engine | stores and pre-aggregates | SQL Server Analysis Services (SSAS), Oracle OLAP, ClickHouse |
| ETL / integration | moves and cleans data | Informatica, Talend, Apache NiFi, SSIS |
| Programming / advanced analytics | custom models | Python (pandas, scikit-learn), R |

**A9-safe answer (1 mark):** "Tableau and Microsoft Power BI." Two words, full mark. Do not write a paragraph.

🇳🇵 **Nepal reality check (use in a 3/5-marker):** most Nepali mid-size organisations run BI on **Excel + Power BI** against a SQL database, with Tableau in larger banks and telecoms. Say that instead of pretending everyone has a full warehouse — it reads like someone who has seen the inside of a Nepali office, which examiners reward in evaluation and case parts.

---

## 1.5 Answer skeletons for the real 2026 questions from this unit

### A1 · "List any two scope of business intelligence." [1]

> BI's scope ranges from **descriptive reporting** (what happened) through **diagnostic drill-down** (why) to **predictive forecasting** and **prescriptive recommendation**; organisationally it extends from a single department's reports to enterprise-wide, governed analytics.

*(One sentence, two dimensions — ladder + organisation. Twenty-eight words. Full mark.)*

### A4 · "What is data analysis?" [1]

> Data analysis is the process of inspecting, cleaning and modelling data to discover useful information, draw conclusions and support decision-making.

⚠ Do **not** swap in a definition of data mining here. Mining is a *technique within* analysis: algorithmic pattern discovery in large datasets. If the question says "analysis", keep it general.

### A5 · "Why is data considered as important factor for decision making?" [1]

> Because data-based decisions are evidence-based: data makes a decision traceable to facts, comparable over time, and correctable when outcomes differ — unlike intuition, which cannot be verified or repeated.

### B1 · "Discuss any three importance of business intelligence." [3]

> *Structure: 1 opening line + three points, each with a consequence + 1 closing line. ~100 words.*
>
> Business intelligence matters because it converts scattered operational data into decision-ready evidence. **First, it speeds up decisions** — pre-aggregated warehouse data removes the wait for manual reports, so managers act within the reporting cycle rather than after it. **Second, it improves decision quality** by giving every function a single governed version of the truth, ending the situation where finance and sales quote different revenue figures. **Third, it exposes trends and anomalies** — seasonality, declining products, idle inventory — early enough to act on. Together these shift management from reactive reporting to proactive control.

*(Note the shape: each point = claim + "because/how" clause + concrete consequence. Three bare claims = 1.5/3 at best.)*

---

## 1.6 Traps

| Trap | Why it costs marks | Fix |
|---|---|---|
| "BI = Power BI / Tableau" | confuses tool with discipline; ruins the definition and the case | always say processes + technologies + decisions |
| Listing tool names when asked for *scope* | answers a different question | scope = ladder + organisational reach |
| "Importance" answered with definitions | no consequence = no marks | every point needs "…so that…" |
| Data analysis vs data mining mixed up | guarantees a lost 1-mark, and weakens Unit 3 | analysis = general; mining = algorithmic patterns in big data |
| Forgetting that BI is only as good as its data | loses the evaluation line in 5-markers and the ethics part of Group D | "garbage in, garbage out — BI improves evidence, not the decision-maker" |
| Writing 80 words for a 1-mark question | burns Group D time | 1 mark = one sentence, ≤30 words, move on |

---

## 1.7 Self-test (answers collapsed)

1. Define BI in one sentence containing the words *process*, *technologies* and *decision*. *(1 mark)*
2. Name the four levels of analytical scope and give the question each answers. *(3 marks)*
3. Give any three importances of BI, each with a consequence. *(3 marks)*
4. What is the difference between data analysis and data mining? *(1–3 marks, depending on paper mood)*
5. Name the five stages of the BI stack from source to decision. *(3 marks)*
6. 🇳🇵 A Kathmandu retail chain has POS data from 40 outlets, one Excel report per outlet, and managers who argue about whose number is right. Name the *first* BI problem to fix and which stack stage it belongs to. *(5 marks — this is a mini case)*

<details>
<summary>Answers</summary>

1. "Business Intelligence is the set of processes, technologies and tools that collect data from multiple sources, transform it into reliable, query-ready information, and present it so managers can make faster, better decisions."
2. Descriptive (what happened) · Diagnostic (why it happened) · Predictive (what will happen) · Prescriptive (what should we do).
3. Any three of: faster decisions (pre-aggregated data removes report waits) · better quality (single governed version of the truth) · trend/pattern discovery (seasonality and anomalies surface early) · cost/competitive control (loss-making products identified) · single source of truth (consistent definitions across functions).
4. Analysis is the broad process of inspecting and modelling data to extract useful information; mining is a specific algorithmic search for hidden patterns (classification, clustering, association rules) in large datasets.
5. Sources → ETL/integration → data warehouse (and marts) → OLAP/mining/analysis → visualisation/dashboards → decision.
6. The first problem is **inconsistent, ungoverned reporting** — 40 Excel reports produce 40 definitions of "sales", so the organisation cannot agree on a fact. It belongs to the **integration + storage** stages: standardise the metric definitions and load POS data into a single warehouse/mart with one "sales" definition. Tooling comes later; without this, a dashboard just displays the argument faster.

</details>

---

## 1.8 Sixty-second check

Close this file and, on a blank page:

- [ ] Write the BI definition from memory (all four parts)
- [ ] Draw the five-stage BI stack
- [ ] Name three importance points, each with a consequence
- [ ] Name two BI tools **and** two ETL tools
- [ ] Give one line distinguishing data analysis from data mining

If you can do all five in 60 seconds, this unit is marks-safe. Move to Unit 2 — Data Warehousing, which carries 11 marks and the paper's most reliable 5-marker.
