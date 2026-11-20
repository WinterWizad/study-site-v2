# Unit 2 — Data Warehousing

| | |
|---|---|
| **Lecture hours** | 8 |
| **Marks carried in 2026 paper** | **11** — three 1-markers, one 3-marker, one 5-marker (5 of the paper's 21 questions) |
| **Difficulty** | ★★★☆☆ — concepts are easy; architecture diagram and ETL detail separate 3 from 5 |
| **Exam yield** | 🔴 high — most-examined unit in the paper |
| **Prerequisite** | Unit 1 (BI stack — this unit is columns 2–3) |
| **Syllabus bullets** | Introduction to data warehousing concepts · Data warehouse architecture · ETL processes · Data modelling for BI |

> **Read this first:** this unit is the paper's workhorse. In 2026 it produced a 5-mark architecture question, a 3-mark ETL question, and *three* separate 1-markers. If you learn only one unit properly, learn this one. Everything here is also the vocabulary for the Group D case.

---

## Coverage Map

```
2.1 Data Warehouse Concepts
├── Inmon's 4 Characteristics (S-I-T-N)
├── OLTP vs DW Contrast
└── Nepal Context (Bank Example)

2.2 Data Warehouse Architecture
├── 5-Layer Diagram (Sources→Staging→ETL→EDW→Marts→BI)
├── 6 Components + Metadata Repository
├── 3 Architecture Variants
├── EDW vs Dependent Mart vs Independent Mart vs ODS
└── Nepal Bank Architecture (Applied)

2.3 ETL Processes
├── Extract (Full vs Incremental, CDC Concept)
├── Transform (Clean, Standardize, De-dup, Derive, Conform)
├── Load (Bulk, Fact/Dim Order, Refresh, ELT)
└── Why Sequence Matters (Non-volatility)

2.4 Data Modelling for BI
├── Fact vs Dimension Tables (Grain Declaration)
├── Star vs Snowflake Schema
├── SCD Type 1 vs Type 2 (Type 3 mention)
├── Conformed Dimensions (Critical for Integration)
├── Surrogate Keys vs Natural Keys
├── Factless Fact Tables
└── Late-Arriving Dimensions / Early-Arriving Facts

2.5 Metadata & Data Quality
├── Metadata Repository (Definitions, Lineage, Load Stats)
├── 6 Data Quality Dimensions + Controls
└── Master Data Management (MDM) Link

2.6 Modern Patterns
├── ELT vs ETL
├── CDC / Change Data Capture
├── Real-time / Near-real-time DW
└── Cloud DW Patterns (Partitioning, Scaling)
```

---

## 2.1 What a Data Warehouse Is

> **A data warehouse is a subject-oriented, integrated, time-variant and non-volatile collection of data, built to support management's decision-making rather than day-to-day transactions.**

That is **Inmon's** definition. Every clause is a mark.

### The Four Characteristics — learn each as "means + why"

| Characteristic | What it means | Why it matters |
|---|---|---|
| **Subject-oriented** | organised around subjects (sales, customer, product), not applications or departments | you analyse a *subject*, not an app's tables |
| **Integrated** | many sources put into one consistent form — same codes, same units, same naming | ends "whose number is right" arguments |
| **Time-variant** | every record carries a time dimension; warehouse holds years of history | trends and comparisons need history, not just today |
| **Non-volatile** | once loaded, data is **not updated or deleted** by users; it is only read | you can reproduce last year's report and get last year's answer |

🧠 **Memory hook: S-I-T-N** — *Subject, Integrated, Time-variant, Non-volatile.*

### The Non-Volatile Answer (A2, 1 mark)

> Because the warehouse analyses the past: editable records would change old reports retroactively and destroy trend comparability. Data is loaded by ETL, then only read. Corrections are handled by loading a *new* record (with its own timestamp), not by overwriting the old one.

⚠ **Trap:** "non-volatile means data is not deleted" is half. The mark is for **no update** + **why** (historical reproducibility).

### OLTP vs Data Warehouse — the contrast examiners keep testing

| | **OLTP** (core banking, POS) | **Data Warehouse** (analysis store) |
|---|---|---|
| Purpose | run the business | understand the business |
| Workload | many small reads/writes, predefined | few large reads, ad-hoc queries |
| Data | current state only | months–years of history |
| Schema | fully normalised (3NF) | denormalised — star/snowflake |
| Typical query | "get order 88231" | "total sales by region last quarter" |
| Update | continuous, row-level | bulk load by ETL, then read-only |
| Users | clerks, customers | analysts, managers |

🇳🇵 **Nepal anchor:** a commercial bank's core banking system (Finacle-style) is the OLTP side — every deposit, withdrawal, loan repayment in real time. The warehouse is a separate store fed nightly, producing "branch-wise deposit growth for the last 12 quarters" without touching the live system. Same organisation, two different machines with two different jobs.

---

## 2.2 Data Warehouse Architecture — draw this diagram

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

### The Six Components You Must Name

| Component | Job | One line for the exam |
|---|---|---|
| **Source systems** | where raw data lives | operational systems + external data |
| **Staging area** | temporary landing zone for extraction and cleansing | keeps dirty work away from warehouse and source systems |
| **ETL / integration** | extract, clean, conform, load | the pipeline that makes data trustworthy (§2.3) |
| **Data warehouse (EDW)** | consolidated, historical, subject-oriented store | "single source of truth" |
| **Data marts** | subject- or department-scoped subsets | fast, focused access for one business area |
| **Metadata repository** | definitions, lineage, load statistics | the warehouse's own documentation — what the numbers *mean* |

### Three Architecture Variants (name them, one line each)

1. **Basic** — sources → warehouse → users. Fine for small org, no staging, dirty data hits warehouse.
2. **With staging area** — sources → staging/ETL → warehouse → users. Cleansing isolated.
3. **With staging area + data marts** — the diagram above. Marts serve departments; EDW keeps governed truth.

### EDW vs Data Mart vs ODS — distinctions worth half a mark each

| Term | Scope | Note |
|---|---|---|
| **Enterprise Data Warehouse (EDW)** | whole org, most detailed grain | single source of truth |
| **Data mart** | one department or subject | faster to build; risks inconsistency if built separately |
| **Dependent data mart** | fed *from* the EDW | consistent — preferred |
| **Independent data mart** | fed *directly from source systems* | fast to build, becomes "island of inconsistency" |
| **ODS (operational data store)** | current-day, cleaned, not historically deep | near-real-time reporting; often feeds the warehouse |

⚠ **Trap:** "data mart = small data warehouse" gets partial credit. The distinguishing point is **scope + source**: a mart is department-scoped, and whether it is dependent or independent decides whether it helps or hurts consistency.

### Nepal Bank Architecture (Applied)

Core banking (OLTP) → nightly ETL → staging → EDW holding 10 years of history in star schema (fact: deposits/withdrawals; dimensions: branch, product, date, customer segment) → dependent marts for branch and product reporting → dashboards.

---

## 2.3 ETL Processes

### 2.3.1 Extract

| Method | Description | When Used |
|---|---|---|
| **Full Extraction** | Pull entire source dataset | initial load, small sources, no change tracking |
| **Incremental Extraction** | Pull only changed records since last run | daily/hourly loads; uses timestamps, triggers, or CDC |
| **Change Data Capture (CDC)** | Captures row-level changes from source transaction logs | near-real-time; low overhead; modern standard |

> **Exam hook**: A3/B2 ask "full vs incremental" — know 2 differences + when each used.

### 2.3.2 Transform

| Operation | Purpose | Exam Phrase |
|---|---|---|
| **Clean** | Fix/remove bad records, handle missing (`-999`), smooth noise | "cleans invalid records" |
| **Standardize** | Formats (dates), codes (M/F→1/2), units (NPR/INR) | "standardises formats and codes" |
| **De-duplicate** | Same customer entered twice with different spellings | "de-duplicates" |
| **Derive** | Calculated fields (age from DOB, margin from revenue/cost) | "derived measures calculated" |
| **Conform Dimensions** | Same customer = same key across CRM + POS + Web | "conforms dimensions" |
| **Aggregate** | Pre-summarize for performance (daily→monthly) | "aggregate where needed" |

> **Late-arriving dimensions**: handled by re-processing affected fact partitions or surrogate key versioning.

### 2.3.3 Load

- **Bulk Load**: COPY/BCP for speed; disable indexes/constraints during load
- **Load Order**: Dimensions first (surrogate keys), then Facts (FK references)
- **Refresh Strategy**: Full reload (small marts) vs Incremental (large facts) vs CDC (real-time)
- **ELT Pattern**: Load raw to staging → transform in-warehouse (SQL/dbt); leverages MPP

> **Why sequence matters**: Loading untransformed data corrupts history — DW is non-volatile.

### 2.3.4 ETL vs ELT

| | ETL | ELT |
|---|---|---|
| Where Transform Runs | Staging server / ETL tool | Inside warehouse (SQL, dbt) |
| Latency | Batch (hours) | Near-real-time (minutes) |
| Scalability | Limited by ETL server | Scales with MPP warehouse |
| When Used | Legacy, complex logic, compliance | Modern cloud DW (Snowflake, BigQuery, Redshift) |

---

## 2.4 Data Modelling for BI

### 2.4.1 Fact vs Dimension Tables

| | **Fact Table** | **Dimension Table** |
|---|---|---|
| Holds | measurements / events | descriptive context |
| Content | numbers (amount, quantity) + foreign keys | names, categories, dates, locations |
| Rows | millions | thousands |
| Example | `sales_fact(store_id, product_id, date_id, qty, amount)` | `product(product_id, name, category, brand)` |
| Answers | "how much" | "by what / when / where / who" |

**Grain** = what one row represents ("one row per product per store per day"). Declare the grain before designing anything; every measure and dimension must be consistent with it.

### 2.4.2 Star vs Snowflake

| | **Star Schema** | **Snowflake Schema** |
|---|---|---|
| Shape | one fact table surrounded by denormalised dimensions | dimensions normalised into sub-dimensions |
| Joins | fewer | more |
| Query speed | faster | slower |
| Redundancy | higher | lower |
| Typical use | BI query performance — default choice | storage-sensitive or highly structured hierarchies |

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

| Type | Behavior | When Used |
|---|---|---|
| **Type 1** | Overwrite old value (lose history) | Corrections, non-critical attributes |
| **Type 2** | New row with validity dates (keep history) | **Default for DW** — customer address, product category |
| **Type 3** | Add "previous value" column | Limited history, specific attributes |

> Since DW is non-volatile, **Type 2 is the normal answer** — and it wins marks in the architecture 5-marker.

### 2.4.4 Advanced Modelling

- **Surrogate Keys vs Natural Keys**: Surrogate (system-generated integer) preferred — stable, small, decoupled from source changes. Natural keys (business codes) change and cause FK breaks.
- **Factless Fact Tables**: Fact table with only FKs, no measures — tracks events (student attendance, promo eligibility). Many-to-many bridge tables are factless.
- **Conformed Dimensions**: Same dimension (e.g., `dim_product`) shared across multiple fact tables (`fact_sales`, `fact_inventory`). Enables "sold 40, have 12" in one query.
- **Late-Arriving Dimensions / Early-Arriving Facts**: Fact arrives before dimension row exists — use inferred member (surrogate key with placeholder attrs) and update later via CDC.

---

## 2.5 Metadata & Data Quality

### 2.5.1 Metadata Repository (A10, 1 mark)

| Category | What It Contains |
|---|---|
| **Business** | Definitions, formulas, ownership, stewardship |
| **Technical** | Table/column names, data types, lineage, load timestamps |
| **Operational** | Load logs, row counts, error records, refresh schedules |

> **A10 answer**: Metadata in BI is the structured documentation that defines what the data means — table and column definitions, data lineage, business rules, transformation logic, load logs and metric definitions — so any user can understand, trust and correctly use the warehouse data.

### 2.5.2 Data Quality — 6 Dimensions + Controls

| Dimension | Definition | Control |
|---|---|---|
| **Completeness** | No missing values where required | Not-null constraints, mandatory field checks |
| **Accuracy** | Values reflect reality | Cross-source reconciliation, reference data lookup |
| **Consistency** | Same meaning across sources | Conformed dimensions, standardized codes |
| **Timeliness** | Data available when needed | SLA monitoring, freshness timestamps |
| **Validity** | Values conform to format/rules | Check constraints, regex, domain lists |
| **Uniqueness** | No duplicate entities | Primary keys, deduplication rules |

> **MDM Link**: Master Data Management ensures "one customer, one product" across sources — feeds conformed dimensions.

---

## 2.6 Modern Patterns

| Pattern | What It Is | When Tested |
|---|---|---|
| **ELT vs ETL** | Transform inside warehouse (SQL/dbt) vs external tool | "When would you use ELT?" |
| **CDC / Change Data Capture** | Capture row-level changes from transaction logs | "How to achieve near-real-time?" |
| **Real-time / Near-real-time DW** | Streaming ingestion (Kafka → DW) | "How to reduce latency?" |
| **Cloud DW Patterns** | Partitioning (range/hash), clustering, auto-scaling, separation of compute/storage | "How to scale DW?" |

---

## 2.7 Answer Skeletons for 2026 Questions

### A2 · "Why data in data warehouse must be non volatile?" [1]
> Because the warehouse analyses the past: editable records would change old reports retroactively and destroy trend comparability. Data is loaded by ETL, then only read.

### A3 · "How does data transformation improve the quality and usability of data in a warehouse?" [1]
> Because it cleans, standardises and reconciles data from different sources into one consistent format and definition, so the warehouse stores accurate, comparable values instead of conflicting raw extracts.

### A6 · "What is Data Modelling?" [1]
> Data modelling defines the structure of data — entities, attributes, relationships and constraints — so it can be stored and queried consistently; in BI it produces the warehouse's fact and dimension tables.

### A10 · "Define metadata in the context of BI." [1]
> Metadata in BI is the structured documentation that defines what the data means — table and column definitions, data lineage, business rules, transformation logic, load logs and metric definitions — so that any user can understand, trust and correctly use the warehouse data.

### B2 · "Explain the ETL process." [3]
> ETL is the pipeline that moves data from source systems into the data warehouse. **Extraction** pulls the required data — full or incremental — from operational systems, files and external sources into a staging area. **Transformation** then cleans and conforms it: invalid records are corrected or rejected, codes and units are standardised, duplicates are removed, and derived measures are calculated, so that data from different systems means the same thing. **Loading** writes the transformed data into the warehouse's fact and dimension tables, usually in bulk and in dependency order. The sequence matters because loading untransformed data would permanently corrupt the historical record, which the warehouse cannot correct later — it is non-volatile.

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

---

## 2.8 Self-Test (Answers Collapsed)

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

## 2.9 Sixty-Second Check

Close the file and, on a blank page:

- [ ] Write the four characteristics from memory, with one line each
- [ ] Draw the five-layer architecture with staging area and marts, and label metadata
- [ ] Explain E, T and L in one sentence each
- [ ] Give the 1-mark answer for "why non-volatile"
- [ ] State one difference between star and snowflake schema
- [ ] Say what a dependent data mart is, and why it is preferred
- [ ] Name the 6 data quality dimensions with one control each
- [ ] Difference between full and incremental extraction
- [ ] Type 1 vs Type 2 SCD
- [ ] What is CDC?

If all ten are there, this unit is marks-safe — and it is the single best unit to have safe.

---

*Sources for this unit: TU FOM syllabus (IT 249, Unit 2, 8 LHs) · TU 2026 paper (A2, A3, A6, B2, C2) · official TU/FOM model question 2026 (A10, B11, B12, C17, D21) · Inmon's characteristics and the OLTP/DW contrast cross-checked against Oracle Database Data Warehousing Guide, ch. 1 · star/snowflake and SCD from Kimball & Ross (syllabus reading) · CDC, ELT, surrogate keys from modern DW literature (Inmon, Kimball, Sherman — syllabus readings).*