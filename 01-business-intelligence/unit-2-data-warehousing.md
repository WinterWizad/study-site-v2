# Unit 2 — Data Warehousing

| | |
|---|---|
| **Lecture hours** | 8 |
| **Marks carried in 2026 paper** | **11** — three 1-markers, one 3-marker, one 5-marker (5 of the paper's 21 questions) |
| **Difficulty** | ★★★☆☆ — the concepts are easy; the architecture diagram and ETL detail are what separate a 3 from a 5 |
| **Exam yield** | 🔴 high — the most-examined unit in the paper |
| **Prerequisite** | Unit 1 (the BI stack — this unit is columns 2 and 3 of it) |
| **Syllabus bullets** | Introduction to data warehousing concepts · Data warehouse architecture · ETL processes · Data modelling for BI |

> **Read this first:** this unit is the paper's workhorse. In 2026 it produced a 5-mark architecture question, a 3-mark ETL question, and *three* separate 1-markers. If you learn only one unit properly, learn this one. Everything here is also the vocabulary for the Group D case.

---

## 2.1 What a data warehouse is

> **A data warehouse is a subject-oriented, integrated, time-variant and non-volatile collection of data, built to support management's decision-making rather than day-to-day transactions.**

That is **Inmon's** definition, and it is the one to write. Every clause is a mark.

### The four characteristics — learn each as "means + why"

| Characteristic | What it means | Why it matters |
|---|---|---|
| **Subject-oriented** | organised around subjects (sales, customer, product), not around applications or departments | you analyse a *subject*, not an app's tables |
| **Integrated** | many sources put into one consistent form — same codes, same units, same naming | ends "whose number is right" arguments |
| **Time-variant** | every record carries a time dimension; warehouse holds years of history | trends and comparisons need history, not just today |
| **Non-volatile** | once loaded, data is **not updated or deleted** by users; it is only read | you can reproduce last year's report and get last year's answer |

### The non-volatile answer (this was A2, 1 mark)

> Because the warehouse analyses the past: editable records would change old reports retroactively and destroy trend comparability. Data is loaded by ETL, then only read.

⚠ **Trap:** students write "non-volatile means data is not deleted". That's half. The mark is for **no update** + **why** (historical reproducibility). Corrections are handled by loading a *new* record (with its own timestamp), not by overwriting the old one.

🧠 **Memory hook for the four: S-I-T-N** — *Subject, Integrated, Time-variant, Non-volatile.*

### OLTP vs data warehouse — the contrast examiners keep testing

| | **OLTP** (the till, the core banking system) | **Data warehouse** (the analysis store) |
|---|---|---|
| Purpose | run the business | understand the business |
| Workload | many small reads/writes, predefined | few large reads, ad-hoc queries |
| Data | current state only | months–years of history |
| Schema | fully normalised (3NF) | denormalised — star/snowflake |
| Typical query | "get order 88231" | "total sales by region last quarter" |
| Update | continuous, row-level | bulk load by ETL, then read-only |
| Users | clerks, customers | analysts, managers |

🇳🇵 **Nepal anchor:** a commercial bank's core banking system (Finacle-style) is the OLTP side — every deposit, withdrawal, loan repayment, in real time. The warehouse is a separate store fed nightly, and it is what produces "branch-wise deposit growth for the last 12 quarters" without touching the live system. Same organisation, two different machines with two different jobs.

---

## 2.2 Data warehouse architecture — draw this diagram

The syllabus says "architecture", and in 2026 that was a **5-mark** question phrased as *"Illustrate and explain"*. Illustrate means draw. A 5-mark answer with no diagram caps at about 3.

```
   SOURCE SYSTEMS              STAGING                   WAREHOUSE                ACCESS
 ┌────────────────┐        ┌──────────────┐        ┌──────────────────┐     ┌──────────────┐
 │ Core banking   │        │  Extract     │        │   ENTERPRISE     │     │  BI tools    │
 │ POS / ERP      │ ─────► │  Transform   │ ─────► │   DATA WAREHOUSE │ ──► │  (Power BI,  │
 │ CRM            │        │  Load        │        │   (EDW)          │     │   Tableau)   │
 │ Excel / flat   │        │  (clean,     │        │  star schemas,   │     ├──────────────┤
 │ Web / API      │        │   conform,   │        │  history kept    │ ──► │  Data marts  │
 │ External data  │        │   dedupe)    │        │                  │     │  (sales, HR, │
 └────────────────┘        └──────────────┘        └──────────────────┘     │   finance)   │
                                                        ▲                   └──────────────┘
                                                        │
                                              ┌──────────────────┐
                                              │     METADATA     │  (definitions, lineage,
                                              │     REPOSITORY   │   load logs, business rules)
                                              └──────────────────┘
```

### The five components you must name

| Component | Job | One line for the exam |
|---|---|---|
| **Source systems** | where raw data lives | operational systems + external data |
| **Staging area** | temporary landing zone for extraction and cleansing | keeps dirty work away from the warehouse and the source systems |
| **ETL / integration** | extract, clean, conform, load | the pipeline that makes data trustworthy (§2.3) |
| **Data warehouse (EDW)** | the consolidated, historical, subject-oriented store | "single source of truth" |
| **Data marts** | subject- or department-scoped subsets | fast, focused access for one business area |
| **Metadata repository** | definitions, lineage, load statistics | the warehouse's own documentation — what the numbers *mean* |

### Three architecture variants (name them, one line each)

1. **Basic** — sources → warehouse → users. Fine for a small organisation, no staging area, dirty data hits the warehouse.
2. **With staging area** — the common enterprise shape: sources → staging/ETL → warehouse → users. Cleansing is isolated.
3. **With staging area + data marts** — the diagram above. Marts serve departments; the EDW keeps one governed truth.

### Data mart, EDW, ODS — the distinctions that earn half a mark each

| Term | Scope | Note |
|---|---|---|
| **Enterprise data warehouse (EDW)** | whole organisation, most detailed grain | the single source of truth |
| **Data mart** | one department or subject | faster to build; risks inconsistency if built separately |
| **Dependent data mart** | fed *from* the EDW | consistent — preferred |
| **Independent data mart** | fed *directly from source systems* | fast to build, becomes an "island of inconsistency" |
| **ODS (operational data store)** | current-day, cleaned, not historically deep | near-real-time reporting; often feeds the warehouse |

⚠ **Trap:** "data mart = small data warehouse" gets partial credit. The distinguishing point is **scope + source**: a mart is department-scoped, and whether it is dependent or independent decides whether it helps or hurts consistency.

---

## 2.3 ETL — the process question (3 marks) and the transformation question (1 mark)

### The three stages

| Stage | What happens | Typical work |
|---|---|---|
| **Extract** | pull data out of source systems | full vs incremental extraction; handle flat files, APIs, DB connections; log what was pulled |
| **Transform** | make it consistent and usable | clean (fix/remove bad records), standardise formats and codes, de-duplicate, derive calculated fields, conform dimensions, aggregate where needed |
| **Load** | write into the warehouse | bulk load, dimension/fact load order, refresh strategy, index rebuild, error handling and restart |

### Why "transform" is the hardest and most asked-about stage

Raw data from different systems disagrees with itself: dates as `12/03/2024` and `2024-03-12`, gender as `M/F` and `1/2`, amounts in NPR and INR, the same customer entered twice with different spellings, missing values encoded as `-999`. Transformation is where those are resolved into **one agreed definition**. That is precisely why transformation is what makes warehouse data trustworthy — and it is the answer to A3.

### The 1-mark answer (A3, asked in 2026)

> Because it cleans, standardises and reconciles data from different sources into one consistent format and definition, so the warehouse stores accurate, comparable values instead of conflicting raw extracts.

⚠ **Trap:** don't answer A3 by describing what ETL stands for. The question asks *how transformation improves quality* — so name the operations (cleaning, standardising, de-duplicating, deriving, conforming) and the outcome (consistent, comparable, trustworthy).

### The 3-mark answer (B2, asked in 2026)

> *Shape: name the three stages, one sentence each, plus one line on why the sequence matters. ~100 words.*
>
> ETL is the pipeline that moves data from source systems into the data warehouse. **Extraction** pulls the required data — full or incremental — from operational systems, files and external sources into a staging area. **Transformation** then cleans and conforms it: invalid records are corrected or rejected, codes and units are standardised, duplicates are removed, and derived measures are calculated, so that data from different systems means the same thing. **Loading** writes the transformed data into the warehouse's fact and dimension tables, usually in bulk and in dependency order. The sequence matters because loading untransformed data would permanently corrupt the historical record, which the warehouse cannot correct later — it is non-volatile.

🧠 **Memory hook:** *E = get it, T = fix it, L = store it.*

---

## 2.4 Data modelling for BI

### First, the 1-mark definition (A6, asked in 2026)

> Data modelling defines the structure of data — entities, attributes, relationships and constraints — so it can be stored and queried consistently; in BI it produces the warehouse's fact and dimension tables.

### The two tables everything is built from

| | **Fact table** | **Dimension table** |
|---|---|---|
| Holds | measurements / events | descriptive context |
| Content | numbers (amount, quantity) + foreign keys | names, categories, dates, locations |
| Rows | millions | thousands |
| Example | `sales_fact(store_id, product_id, date_id, qty, amount)` | `product(product_id, name, category, brand)` |
| Answers | "how much" | "by what / when / where / who" |

### Star vs snowflake — the standard comparison

| | **Star schema** | **Snowflake schema** |
|---|---|---|
| Shape | one fact table surrounded by denormalised dimensions | dimensions normalised into sub-dimensions |
| Joins | fewer | more |
| Query speed | faster | slower |
| Redundancy | higher | lower |
| Typical use | BI query performance — the default choice | storage-sensitive or highly structured dimension hierarchies |

```
        STAR                                  SNOWFLAKE
   dim_date   dim_product                dim_date    dim_product
        \        /                             \          /     \
         \      /                               \        /    dim_category
        fact_sales                              fact_sales
         /      \                               /        \
   dim_store  dim_customer              dim_store    dim_customer
                                                          \
                                                       dim_city
```

### Grain — the one sentence that makes you sound like you know this

**Grain** is what one row of the fact table represents ("one row per product per store per day"). Declare the grain before designing anything; every measure and dimension must be consistent with it. Examiners rarely ask directly, but it is the correct thing to say when asked to "explain data modelling for BI".

### Slowly changing dimensions (SCD) — worth one line

When a customer moves city, does the warehouse overwrite the old city (losing history) or add a new versioned row (keeping it)? Type 1 = overwrite, Type 2 = new row with validity dates. Since the warehouse is non-volatile, **Type 2 is the normal answer** — and it is a good mark-winning sentence in the architecture 5-marker.

---

## 2.5 Answer skeletons for the real 2026 questions from this unit

### A2 · "Why data in data warehouse must be non volatile?" [1]
See §2.1 — one sentence: historical reproducibility.

### A3 · "How does data transformation improve the quality and usability of data in a warehouse?" [1]
See §2.3 — operations + outcome, one sentence.

### A6 · "What is Data Modelling?" [1]
See §2.4 — structure of entities/attributes/relationships; in BI, fact and dimension tables.

### B2 · "Explain the ETL process." [3]
See §2.3 — 100-word skeleton.

### C2 · "Illustrate and explain data warehouse architecture." [5]

> *Shape: diagram first (half a page), then five labelled components, then one line on why the layers exist. ~220 words + diagram.*
>
> A data warehouse architecture organises the flow of data from operational systems to decision-makers in layers, so that cleansing and history-keeping happen without disturbing live systems.
>
> **[draw the diagram from §2.2 — sources → staging/ETL → EDW → marts/tools, metadata alongside]**
>
> **Source systems** are the operational databases, POS, CRM and external feeds that generate raw data. The **staging area** receives extracted data and is where it is cleaned, conformed and de-duplicated, keeping heavy transformation away from both the source systems and the warehouse. The **ETL process** moves data across these layers on a scheduled or near-real-time basis. The **enterprise data warehouse** stores the integrated, subject-oriented, time-variant history in dimensional (star) schemas and acts as the organisation's single source of truth. **Data marts** are department-scoped subsets fed from the warehouse — dependent marts — so that sales, finance and HR each get fast, focused access without duplicating definitions. A **metadata repository** records definitions, lineage and load statistics, which is what allows two reports to agree on what "revenue" means.
>
> The layering exists because the requirements conflict: source systems must stay fast and current, while analysis needs history and consistency. Separating them is what makes both possible.

⚠ In the exam, draw first, label everything, then write. A perfect essay with no diagram will not reach 5 on a question that says *illustrate*.

---

## 2.6 Traps

| Trap | Why it costs marks | Fix |
|---|---|---|
| Answering the architecture question with prose only | "illustrate" is a command word; no diagram = lost marks | draw the 5-layer diagram, then explain |
| "Non-volatile = never deleted" | misses the update ban and the reason | no update/delete + historical reproducibility |
| Confusing data mart with data warehouse | scope and governance are the point | mart = one department; EDW = whole organisation |
| Describing ETL as "extract, transform, load" and stopping | that's the expansion, not the explanation | say what happens in each stage |
| Star vs snowflake answered as "one is bigger" | wrong axis | normalisation vs denormalisation → joins vs speed |
| Forgetting metadata | half a mark in architecture answers | metadata = definitions + lineage |
| Saying the warehouse is updated in place by users | breaks non-volatility | only ETL loads; users read |

---

## 2.7 Self-test (answers collapsed)

1. State Inmon's four characteristics of a data warehouse and one line on each. *(3–5 marks)*
2. Draw the data warehouse architecture with staging area and data marts; label six components. *(5 marks)*
3. Explain ETL, naming what happens in each stage. *(3 marks)*
4. Why must warehouse data be non-volatile, and how is a correction handled if data cannot be updated? *(1–3 marks)*
5. Distinguish dependent and independent data marts; which is preferred and why? *(3 marks)*
6. What is the grain of a fact table, and why declare it first? *(1–3 marks)*
7. 🇳🇵 A Nepali bank wants monthly branch-wise deposit reports without slowing its core banking system, and wants to keep 10 years of history. Draw the architecture you would propose and justify each layer. *(5 marks)*

<details>
<summary>Answers</summary>

1. **Subject-oriented** (organised by business subject, not by application), **integrated** (consistent codes, units and naming across sources), **time-variant** (every record is tied to time; years of history), **non-volatile** (loaded in bulk, then read-only so history cannot change).
2. Diagram: source systems → staging area (extract/transform) → ETL → enterprise data warehouse → data marts / BI tools; metadata repository alongside. Labels: sources, staging, ETL, EDW, marts, metadata (users/access as the seventh).
3. **Extract**: pull full or incremental data from operational systems into staging. **Transform**: clean invalid records, standardise codes and units, de-duplicate, derive measures, conform dimensions. **Load**: bulk-insert into fact and dimension tables in dependency order, with logging and restart handling.
4. Because analysis depends on history being reproducible; if records could be edited, past reports would silently change and trend comparisons would be meaningless. A correction is made by loading a **new, timestamped record** (or a new SCD Type 2 version), not by overwriting the old one.
5. **Dependent** marts are fed from the EDW; **independent** marts are fed directly from source systems. Dependent is preferred: it inherits the warehouse's single definitions, whereas independent marts grow into islands of inconsistency with their own versions of "revenue".
6. Grain = what one row represents (e.g. one product per store per day). Declaring it first fixes the level of detail, so every measure and dimension is consistent and no double-counting occurs.
7. Core banking (OLTP) → nightly ETL → staging → EDW holding 10 years of history in a star schema (fact: deposits/withdrawals; dimensions: branch, product, date, customer segment) → dependent marts for branch and product reporting → dashboards. Justification: separates analytical load from the live system (no slowdown), preserves history (time-variant), gives one definition of "deposit" across branches (integrated), and lets corrections be added rather than overwritten (non-volatile).

</details>

---

## 2.8 Sixty-second check

Close the file and, on a blank page:

- [ ] Write the four characteristics from memory, with one line each
- [ ] Draw the five-layer architecture with staging area and marts, and label metadata
- [ ] Explain E, T and L in one sentence each
- [ ] Give the 1-mark answer for "why non-volatile"
- [ ] State one difference between star and snowflake schema
- [ ] Say what a dependent data mart is, and why it is preferred

If all six are there, this unit is marks-safe — and it is the single best unit to have safe.

---

*Sources for this unit: TU FOM syllabus (IT 249, Unit 2, 8 LHs) · TU 2026 paper (A2, A3, A6, B2, C2) · Inmon's characteristics and the OLTP/DW contrast cross-checked against Oracle Database Data Warehousing Guide, ch. 1 · star/snowflake and SCD from Kimball & Ross (syllabus reading).*
