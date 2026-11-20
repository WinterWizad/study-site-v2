# Unit 2 — Data Warehousing

| | |
|---|---|
| **Lecture hours** | 8 |
| **Marks in 2026 paper** | **11** — three 1-markers, one 3-marker, one 5-marker |
| **Difficulty** | ★★★☆☆ — concepts are easy; diagram and ETL detail separate 3 from 5 |
| **Exam yield** | 🔴 high — most tested unit |
| **Prerequisite** | Unit 1 (BI stack — this is columns 2–3) |
| **Syllabus** | Intro to DW concepts · DW architecture · ETL · Data modelling for BI |

> **Read this first:** This unit is the paper's workhorse. In 2026 it gave a 5-mark architecture question, a 3-mark ETL question, and three 1-markers. If you master one unit, make it this one. Everything here is also the vocabulary for the Group D case.

---

## Coverage Map

```
2.1 DW Concepts
├── Inmon's 4 traits (S-I-T-N)
├── OLTP vs DW contrast
└── Nepal bank example

2.2 DW Architecture
├── 5-layer diagram (Sources→Staging→ETL→EDW→Marts→BI)
├── 6 components + Metadata repo
├── 3 architecture variants
├── EDW vs Dependent Mart vs Independent Mart vs ODS
└── Nepal bank architecture (applied)

2.3 ETL
├── Extract (Full vs Incremental, CDC)
├── Transform (Clean, Standardize, De-dup, Derive, Conform)
├── Load (Bulk, Fact/Dim order, Refresh, ELT)
└── Why order matters (non-volatility)

2.4 Data Modelling
├── Fact vs Dimension tables (Grain)
├── Star vs Snowflake
├── SCD Type 1 vs Type 2 (Type 3 mention)
├── Conformed dimensions
├── Surrogate vs Natural keys
├── Factless fact tables
└── Late-arriving dims / Early-arriving facts

2.5 Metadata & Data Quality
├── Metadata repo (Definitions, Lineage, Load stats)
├── 6 DQ dimensions + controls
└── MDM link

2.6 Modern Patterns
├── ELT vs ETL
├── CDC / Change Data Capture
├── Real-time / Near-real-time DW
└── Cloud DW patterns (Partitioning, Scaling)
```

---

## 2.1 What a Data Warehouse Is

> **A data warehouse is a subject-oriented, integrated, time-variant, non-volatile collection of data built to support management decisions, not daily transactions.**

That is **Inmon's definition**. Every clause earns a mark.

### The Four Traits — learn each as "what it means + why it matters"

| Trait | What it means | Why it matters |
|---|---|---|
| **Subject-oriented** | Organized by subjects (sales, customer, product), not apps or departments | You analyze a subject, not an app's tables |
| **Integrated** | Many sources combined into one consistent form — same codes, units, names | Ends "whose number is right" arguments |
| **Time-variant** | Every record has a time dimension; warehouse keeps years of history | Trends need history, not just today |
| **Non-volatile** | Once loaded, data is not updated or deleted by users; only read | You can reproduce last year's report and get the same answer |

🧠 **Memory hook: S-I-T-N** — Subject, Integrated, Time-variant, Non-volatile.

### The Non-Volatile Answer (A2, 1 mark)

> The warehouse studies the past. If records could be edited, old reports would change and trends would break. ETL loads data once, then it's read-only. To fix errors, add a new timestamped record — don't overwrite.

⚠ **Trap:** "Non-volatile means data is not deleted" is half right. The mark is for **no update** + **why** (historical reproducibility).

### OLTP vs Data Warehouse — the contrast examiners test

| | **OLTP** (core banking, POS) | **Data Warehouse** (analysis store) |
|---|---|---|
| Purpose | Run the business | Understand the business |
| Workload | Many small reads/writes, predefined | Few large reads, ad-hoc queries |
| Data | Current state only | Months–years of history |
| Schema | Fully normalized (3NF) | Denormalized — star/snowflake |
| Typical query | "Get order 88231" | "Total sales by region last quarter" |
| Update | Continuous, row-level | Bulk load by ETL, then read-only |
| Users | Clerks, customers | Analysts, managers |

🇳🇵 **Nepal anchor:** A commercial bank's core banking (Finacle-style) is OLTP — every deposit, withdrawal, loan payment in real time. The warehouse is a separate store fed nightly, producing "branch-wise deposit growth for 12 quarters" without touching the live system. Same org, two machines, two jobs.

---

## 2.2 Data Warehouse Architecture — Draw This Diagram

The syllabus says "architecture," and in 2026 that was a **5-mark** question: *"Illustrate and explain."* Illustrate means draw. No diagram = max 3 marks.

```
   SOURCE SYSTEMS        STAGING              WAREHOUSE              ACCESS
 ┌──────────────┐     ┌─────────────┐      ┌─────────────────┐    ┌─────────────┐
 │ Core banking │     │  Extract    │      │  ENTERPRISE     │    │  BI tools   │
 │ POS / ERP    │ ──► │  Transform  │ ───► │  DATA WAREHOUSE │ ──► │ (Power BI,  │
 │ CRM          │     │  Load       │      │  (EDW)          │     │  Tableau)   │
 │ Excel / flat │     │ (clean,     │      │ star schemas,   │    ├─────────────┤
 │ Web / API    │     │  conform,   │      │ history kept    │ ──► │ Data marts  │
 │ External data│     │  dedupe)    │      │                 │     │ (sales, HR, │
 └──────────────┘     └─────────────┘      └─────────────────┘     │  finance)   │
                                                      ▲              └─────────────┘
                                                      │
                                            ┌──────────────────┐
                                            │   METADATA       │  (definitions, lineage,
                                            │   REPOSITORY     │   load logs, rules)
                                            └──────────────────┘
```

### Six Components You Must Name

| Component | Job | One-line exam answer |
|---|---|---|
| **Source systems** | Where raw data lives | Operational systems + external data |
| **Staging area** | Temp landing zone for extract & cleanse | Keeps dirty work away from warehouse & sources |
| **ETL / integration** | Extract, clean, conform, load | Pipeline that makes data trustworthy (§2.3) |
| **Data warehouse (EDW)** | Consolidated, historical, subject-oriented store | "Single source of truth" |
| **Data marts** | Dept-scoped subsets | Fast, focused access for one business area |
| **Metadata repository** | Definitions, lineage, load stats | Warehouse's own docs — what numbers mean |

### Three Architecture Variants (name them, one line each)

1. **Basic** — Sources → warehouse → users. Small org, no staging, dirty data hits warehouse.
2. **With staging** — Sources → staging/ETL → warehouse → users. Cleansing isolated.
3. **With staging + marts** — Diagram above. Marts serve departments; EDW keeps governed truth.

### EDW vs Data Mart vs ODS — distinctions worth half a mark each

| Term | Scope | Note |
|---|---|---|
| **EDW** | Whole org, most detailed grain | Single source of truth |
| **Data mart** | One department or subject | Faster to build; risks inconsistency if built separately |
| **Dependent mart** | Fed *from* EDW | Consistent — preferred |
| **Independent mart** | Fed *directly from sources* | Fast to build, becomes "island of inconsistency" |
| **ODS** | Current-day, cleaned, not deep history | Near-real-time reporting; often feeds warehouse |

⚠ **Trap:** "Data mart = small data warehouse" gets partial credit. The difference is **scope + source**: a mart is department-scoped; dependent vs independent decides if it helps or hurts consistency.

### Nepal Bank Architecture (Applied)

Core banking (OLTP) → nightly ETL → staging → EDW with 10 years history in star schema (fact: deposits/withdrawals; dims: branch, product, date, customer segment) → dependent marts for branch & product reporting → dashboards.

---

## 2.3 ETL Processes

### 2.3.1 Extract

| Method | What it does | When used |
|---|---|---|
| **Full** | Pull entire source dataset | Initial load, small sources, no change tracking |
| **Incremental** | Pull only changed records since last run | Daily/hourly loads; uses timestamps, triggers, or CDC |
| **CDC** | Captures row-level changes from source transaction logs | Near-real-time; low overhead; modern standard |

> **Exam hook:** A3/B2 ask "full vs incremental" — know 2 differences + when each used.

### 2.3.2 Transform

| Operation | Purpose | Exam phrase |
|---|---|---|
| **Clean** | Fix/remove bad records, handle missing (`-999`), smooth noise | "Cleans invalid records" |
| **Standardize** | Formats (dates), codes (M/F→1/2), units (NPR/INR) | "Standardizes formats and codes" |
| **De-duplicate** | Same customer entered twice with different spellings | "De-duplicates" |
| **Derive** | Calculated fields (age from DOB, margin from revenue/cost) | "Derives measures" |
| **Conform dims** | Same customer = same key across CRM + POS + Web | "Conforms dimensions" |
| **Aggregate** | Pre-summarize for speed (daily→monthly) | "Aggregates where needed" |

> **Late-arriving dims:** handled by re-processing affected fact partitions or surrogate key versioning.

### 2.3.3 Load

- **Bulk load:** COPY/BCP for speed; disable indexes/constraints during load
- **Load order:** Dimensions first (surrogate keys), then Facts (FK references)
- **Refresh:** Full reload (small marts) vs Incremental (large facts) vs CDC (real-time)
- **ELT pattern:** Load raw to staging → transform in-warehouse (SQL/dbt); uses MPP

> **Why order matters:** Loading raw data corrupts history — DW is read-only after load.

### 2.3.4 ETL vs ELT

| | ETL | ELT |
|---|---|---|
| Where transform runs | Staging server / ETL tool | Inside warehouse (SQL, dbt) |
| Latency | Batch (hours) | Near-real-time (minutes) |
| Scalability | Limited by ETL server | Scales with MPP warehouse |
| When used | Legacy, complex logic, compliance | Modern cloud DW (Snowflake, BigQuery, Redshift) |

---

## 2.4 Data Modelling

### 2.4.1 Fact vs Dimension Tables

| | **Fact Table** | **Dimension Table** |
|---|---|---|
| Holds | Measurements / events | Descriptive context |
| Content | Numbers (amount, qty) + FKs | Names, categories, dates, locations |
| Rows | Millions | Thousands |
| Example | `sales_fact(store_id, product_id, date_id, qty, amount)` | `product(product_id, name, category, brand)` |
| Answers | "How much" | "By what / when / where / who" |

**Grain** = what one row represents ("one row per product per store per day"). Declare grain first; every measure and dimension must match it.

### 2.4.2 Star vs Snowflake

| | **Star** | **Snowflake** |
|---|---|---|
| Shape | One fact table + denormalized dims | Dims normalized into sub-dims |
| Joins | Fewer | More |
| Speed | Faster | Slower |
| Redundancy | Higher | Lower |
| Use | BI performance — default | Storage-sensitive or complex hierarchies |

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

### 2.4.3 Slowly Changing Dimensions (SCD)

| Type | Behavior | When used |
|---|---|---|
| **Type 1** | Overwrite old value (lose history) | Corrections, non-critical attrs |
| **Type 2** | New row with validity dates (keep history) | **Default for DW** — customer address, product category |
| **Type 3** | Add "previous value" column | Limited history, specific attrs |

> DW is non-volatile, so **Type 2 is the default** — and it scores marks in the architecture 5-marker.

### 2.4.4 Advanced Modelling (Exam Insurance)

- **Surrogate Keys vs Natural Keys:** Surrogate (system-generated integer) wins — stable, small, decoupled from source changes. Natural keys (business codes) change and break FKs.
- **Factless Fact Tables:** Fact table with only FKs, no measures — tracks events (student attendance, promo eligibility). Many-to-many bridge tables are factless.
- **Conformed Dimensions:** Same dim (e.g., `dim_product`) shared across multiple fact tables (`fact_sales`, `fact_inventory`). Enables "sold 40, have 12" in one query.
- **Late-Arriving Dims / Early-Arriving Facts:** Fact arrives before dim row exists — use inferred member (surrogate key with placeholder attrs) and update later via CDC.

---

## 2.5 Metadata & Data Quality

### 2.5.1 Metadata Repository (A10, 1 mark)

| Category | What it contains |
|---|---|
| **Business** | Definitions, formulas, ownership, stewardship |
| **Technical** | Table/column names, data types, lineage, load timestamps |
| **Operational** | Load logs, row counts, error records, refresh schedules |

> **A10 answer:** Metadata in BI is the structured docs that define what data means — table/column definitions, data lineage, business rules, transformation logic, load logs, metric definitions — so any user can understand, trust, and correctly use the warehouse.

### 2.5.2 Data Quality — 6 Dimensions + Controls

| Dimension | What it means | Control |
|---|---|---|
| **Completeness** | No missing values where required | Not-null constraints, mandatory field checks |
| **Accuracy** | Values reflect reality | Cross-source reconciliation, reference lookup |
| **Consistency** | Same meaning across sources | Conformed dims, standardized codes |
| **Timeliness** | Data available when needed | SLA monitoring, freshness timestamps |
| **Validity** | Values follow format/rules | Check constraints, regex, domain lists |
| **Uniqueness** | No duplicate entities | Primary keys, deduplication rules |

> **MDM Link:** Master Data Management ensures "one customer, one product" across sources — feeds conformed dimensions.

---

## 2.6 Modern Patterns

| Pattern | What it is | When tested |
|---|---|---|
| **ELT vs ETL** | Transform inside warehouse (SQL/dbt) vs external tool | "When would you use ELT?" |
| **CDC** | Capture row-level changes from transaction logs | "How to get near-real-time?" |
| **Real-time DW** | Streaming ingestion (Kafka → DW) | "How to reduce latency?" |
| **Cloud DW** | Partitioning (range/hash), clustering, auto-scaling, compute/storage separation | "How to scale DW?" |

---

## 2.7 Answer Skeletons for 2026 Questions

### A2 · "Why must warehouse data be non-volatile?" [1]
> The warehouse studies the past. Editable records would change old reports and break trends. ETL loads once, then read-only.

### A3 · "How does transformation improve data quality?" [1]
> It cleans, standardizes, and reconciles data from different sources into one consistent format, so the warehouse stores accurate, comparable values instead of conflicting raw extracts.

### A6 · "What is Data Modelling?" [1]
> Data modelling defines data structure — entities, attributes, relationships, constraints — so it can be stored and queried consistently; in BI it produces fact and dimension tables.

### A10 · "Define metadata in BI context." [1]
> Metadata in BI is the structured docs defining what data means — table/column definitions, lineage, business rules, transformation logic, load logs, metric definitions — so any user can understand, trust, and correctly use the warehouse.

### B2 · "Explain the ETL process." [3]
> ETL moves data from sources into the warehouse. **Extract** pulls required data — full or incremental — from operational systems, files, external sources into staging. **Transform** cleans and conforms: invalid records corrected or rejected, codes/units standardized, duplicates removed, derived measures calculated, so data from different systems means the same thing. **Load** writes transformed data into fact/dimension tables in bulk, dependency order. Sequence matters because loading raw data would permanently corrupt history — the warehouse is non-volatile.

### C2 · "Illustrate and explain DW architecture." [5]
> *Shape: diagram first (half page), then 5 labelled components, then why layers exist. ~220 words + diagram.*
>
> DW architecture organizes data flow from operational systems to decision-makers in layers, so cleansing and history-keeping happen without disturbing live systems.
>
> **[Draw diagram from §2.2 — sources → staging/ETL → EDW → marts/tools, metadata alongside]**
>
> **Source systems** are operational DBs, POS, CRM, external feeds. The **staging area** receives extracted data and cleans, conforms, de-duplicates it, keeping heavy transform away from sources and warehouse. **ETL** moves data across layers on schedule or near-real-time. The **EDW** stores integrated, subject-oriented, time-variant history in star schemas — the org's single source of truth. **Data marts** are dept-scoped subsets fed from the warehouse — dependent marts — so sales, finance, HR each get fast, focused access without duplicating definitions. A **metadata repository** records definitions, lineage, load stats, which lets two reports agree on what "revenue" means.
>
> Layering exists because requirements conflict: source systems must stay fast and current; analysis needs history and consistency. Separating them makes both possible.

---

## 2.8 Self-Test (Answers Collapsed)

1. State Inmon's four traits of a DW and one line each. *(3–5 marks)*
2. Draw DW architecture with staging and marts; label six components. *(5 marks)*
3. Explain ETL, naming what happens in each stage. *(3 marks)*
4. Why must DW data be non-volatile, and how is a correction handled if data can't be updated? *(1–3 marks)*
5. Distinguish dependent and independent marts; which is preferred and why? *(3 marks)*
6. What is grain of a fact table, and why declare it first? *(1–3 marks)*
7. 🇳🇵 A Nepali bank wants monthly branch-wise deposit reports without slowing core banking, keeping 10 years history. Draw the architecture and justify each layer. *(5 marks)*

<details>
<summary>Answers</summary>

1. **Subject-oriented** (by business subject, not app), **integrated** (consistent codes, units, names across sources), **time-variant** (every record tied to time; years of history), **non-volatile** (bulk loaded, then read-only so history can't change).

2. Diagram: sources → staging (extract/transform) → ETL → EDW → marts/BI tools; metadata repo alongside. Labels: sources, staging, ETL, EDW, marts, metadata (users/access as seventh).

3. **Extract:** pull full/incremental data from ops systems into staging. **Transform:** clean invalid records, standardize codes/units, de-duplicate, derive measures, conform dimensions. **Load:** bulk-insert into fact/dim tables in dependency order, with logging/restart handling.

4. Because analysis needs reproducible history; if records could be edited, past reports would silently change and trends would be meaningless. A correction = load a **new timestamped record** (or SCD Type 2 version), not overwrite.

5. **Dependent** marts fed from EDW; **independent** marts fed directly from sources. Dependent preferred: inherits warehouse's single definitions; independent marts become islands of inconsistency with their own "revenue."

6. Grain = what one row represents (e.g., one product per store per day). Declaring it first fixes detail level, so every measure/dimension stays consistent and no double-counting.

7. Core banking (OLTP) → nightly ETL → staging → EDW with 10 years history in star schema (fact: deposits/withdrawals; dims: branch, product, date, customer segment) → dependent marts for branch/product reporting → dashboards. Justification: separates analytical load from live system (no slowdown), preserves history (time-variant), one "deposit" definition across branches (integrated), corrections added not overwritten (non-volatile).

</details>

---

## 2.9 Sixty-Second Check

Close the file. On a blank page:

- [ ] Write the four traits from memory, one line each
- [ ] Draw the five-layer architecture with staging and marts, label metadata
- [ ] Explain E, T, L in one sentence each
- [ ] Give the 1-mark answer for "why non-volatile"
- [ ] State one difference between star and snowflake
- [ ] Say what a dependent mart is, and why it's preferred
- [ ] Name the 6 data quality dimensions with one control each
- [ ] Difference between full and incremental extraction
- [ ] Type 1 vs Type 2 SCD
- [ ] What is CDC?

If all ten are there, this unit is marks-safe — and it's the single best unit to have safe.

---

*Sources: TU FOM syllabus (IT 249, Unit 2, 8 LHs) · TU 2026 paper (A2, A3, A6, B2, C2) · TU/FOM model Q 2026 (A10, B11, B12, C17, D21) · Inmon's traits & OLTP/DW contrast (Oracle DW Guide Ch.1) · Star/snowflake & SCD from Kimball & Ross (syllabus) · CDC, ELT, surrogate keys from modern DW lit (Inmon, Kimball, Sherman — syllabus readings).*