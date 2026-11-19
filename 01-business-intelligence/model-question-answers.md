# BI Model Question 2026 — Complete Written Answers

**Paper:** IT 249 Business Intelligence | **Full Marks:** 60 | **Time:** 3 Hours
**Model Question Source:** TU/FOM 2026 Official Model Question

---

## Group A — Brief Answer Questions [10 × 1 = 10]

### A1. Define Business Intelligence (BI).

Business Intelligence (BI) is the set of processes, technologies and tools that collect data from multiple sources, transform it into a reliable, query-ready form, and present it as information that managers use to make faster and better decisions.

---

### A2. Give two benefits of BI in decision-making.

1. **Faster decisions** — pre-aggregated, query-ready data removes the wait for manual reports, so managers act within the reporting cycle rather than after it.  
2. **Better-quality decisions** — one governed version of the truth removes conflicting spreadsheets, so finance and sales quote the same revenue figure.

---

### A3. What is a data warehouse?

A data warehouse is a subject-oriented, integrated, time-variant and non-volatile collection of data, built to support management's decision-making rather than day-to-day transactions.

---

### A4. What does ETL stand for?

ETL stands for **Extract, Transform, Load** — the three-stage pipeline that moves data from source systems into the data warehouse.

---

### A5. Define data mining in one sentence.

Data mining is the automated discovery of previously unknown, potentially useful patterns and relationships in large datasets, using statistical, mathematical and machine-learning techniques.

---

### A6. Name one classification algorithm and one clustering algorithm.

**Classification:** Decision Tree (C4.5/CART)  
**Clustering:** k-means

---

### A7. State one principle of effective data visualization.

Encode with the channels the eye reads accurately: position and length are highest; angle and area are lower; volume and 3D are never used for precise comparisons.

---

### A8. Give one popular BI tool.

Microsoft Power BI.

---

### A9. What is OLAP used for?

OLAP is used for fast, interactive multidimensional analysis: summarising measures such as sales across dimensions such as time, product and region, and drilling from total to detail.

---

### A10. Define metadata in the context of BI.

Metadata in BI is the structured documentation that defines what the data means — table and column definitions, data lineage, business rules, transformation logic, load logs and metric definitions — so that any user can understand, trust and correctly use the warehouse data.

---

## Group B — Short Answer Questions (attempt any FIVE) [5 × 3 = 15]

### B11. Explain the role of ETL in a BI system.

ETL is the pipeline that moves data from source systems into the data warehouse. **Extraction** pulls required data — full or incremental — from operational systems, files and external sources into a staging area. **Transformation** then cleans and conforms it: invalid records are corrected or rejected, codes and units are standardised, duplicates are removed, and derived measures are calculated, so that data from different systems means the same thing. **Loading** writes the transformed data into the warehouse's fact and dimension tables, usually in bulk and in dependency order. The sequence matters because loading untransformed data would permanently corrupt the historical record, which the warehouse cannot correct later — it is non-volatile.

---

### B12. Describe the star schema and its main components.

A star schema organises data around one **fact table** surrounded by **dimension tables**.

| | **Fact table** | **Dimension table** |
|---|---|---|
| Holds | measurements / events | descriptive context |
| Content | numbers (amount, quantity) + foreign keys | names, categories, dates, locations |
| Rows | millions | thousands |
| Example | `sales_fact(store_id, product_id, date_id, qty, amount)` | `product(product_id, name, category, brand)` |
| Answers | "how much" | "by what / when / where / who" |

The **grain** (what one row represents, e.g., "one row per product per store per day") is declared before design; every measure and dimension must be consistent with it. Star schemas denormalise dimensions for fewer joins and faster queries, which is the default choice for BI performance.

---

### B13. What is data preprocessing and why is it important for data mining?

Data preprocessing is the systematic preparation of raw data before mining algorithms are applied. It has four families:

1. **Data cleaning** — fixes wrong or missing values (imputation, smoothing, deduplication, outlier treatment).
2. **Data integration** — merges the same entity from several systems, resolving identity and naming conflicts.
3. **Data transformation** — normalisation (min–max, z-score), discretisation (continuous → bins), encoding categories, so algorithms receive data on comparable scales.
4. **Data reduction** — attribute selection, dimensionality reduction (PCA), sampling, to make computation feasible.

**Why it matters:** real data is dirty — missing values, inconsistent formats, duplicate records, mixed scales. Mining algorithms assume clean, consistent, numeric input; feed them garbage and they return confident garbage. Industry rule: preprocessing is 60–80% of the actual effort, and it is the bridge between the warehouse and the mining step.

---

### B14. Briefly explain the difference between supervised and unsupervised learning.

| | **Supervised learning** (Classification) | **Unsupervised learning** (Clustering) |
|---|---|---|
| **Training data** | carries the answer (label) | no labels at all |
| **Question** | "which known class does this belong to?" | "what natural groups exist?" |
| **Output** | a class label + an inspectable model | a set of clusters + membership |
| **Needs first** | labelled historical examples | only attributes and a similarity measure |
| **Typical use** | churn prediction, fraud, credit scoring | customer segmentation, anomaly detection |
| **Failure mode** | overfitting — 99% on training, useless in production | arbitrary `k`; statistically real but commercially meaningless clusters |

**One line:** *Classification has a teacher; clustering has none.*

---

### B15. List three best practices for dashboard design.

1. **Decision fit — show the few metrics that map to decisions the executive owns.** Five to seven KPIs on one screen, exception-driven (green/amber/red against a target). Ask of every tile: *what decision changes if this goes red?* If "none", delete it.
2. **Visual hierarchy — arrange it the way the eye scans.** Most important KPI top-left (reading order), summary before detail, consistent grid, consistent time windows and units across tiles. The "five-second rule": the main message must be readable in five seconds without a legend.
3. **Clarity and restraint — remove everything that is not the message.** Correct chart type per tile, direct labels, a restrained palette with one accent for exceptions, no 3D, no chartjunk, no dual axes. Every tile carries its **definition** ("active customer = purchased in 90 days"), a **last-refresh timestamp**, and an **exception threshold** so the reader's eye goes to the variance rather than to the number.

---

### B16. Outline key challenges organizations face when implementing BI solutions.

Organisations meet three families of challenge:

**Data:** source systems disagree — duplicate customers, inconsistent product codes and three definitions of "active customer" — so the warehouse is technically correct and commercially untrusted.  
**Technical:** legacy and pack-standard systems offer only batch, undocumented extracts, and dashboard performance degrades as history grows.  
**Organisational:** the commonest failure is not technical at all — no executive sponsor, no named owner for each metric, and a skills gap that leaves one analyst holding the programme. The usual result is a dashboard delivered on time and never used.

---

## Group C — Long Answer Questions (attempt any THREE) [3 × 5 = 15]

### C17. Describe a typical data warehouse architecture, naming its major layers and functions.

**Architecture diagram:**

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

**Five major components and their functions:**

| Component | Job |
|---|---|
| **Source systems** | operational systems (ERP, POS, CRM) + external data — where raw data lives |
| **Staging area** | temporary landing zone for extraction and cleansing — keeps dirty work away from the warehouse and the source systems |
| **ETL / integration** | extract, clean, conform, load — the pipeline that makes data trustworthy |
| **Data warehouse (EDW)** | the consolidated, historical, subject-oriented store — "single source of truth" |
| **Data marts** | subject- or department-scoped subsets — fast, focused access for one business area |
| **Metadata repository** | definitions, lineage, load statistics — the warehouse's own documentation |

**Three architecture variants:** (1) Basic (sources → warehouse → users), (2) With staging area (sources → staging/ETL → warehouse → users), (3) With staging area + data marts (the diagram above — marts serve departments; EDW keeps one governed truth). **Dependent data marts** (fed from EDW) are preferred; **independent marts** (fed directly from sources) become "islands of inconsistency".

---

### C18. Compare and contrast decision trees and Naive Bayes classifiers, mentioning strengths and weaknesses of each.

| Dimension | **Decision tree** (ID3, C4.5, CART) | **Naïve Bayes** |
|---|---|---|
| **What it learns** | a hierarchy of if–then splits chosen to maximise information gain (or reduce Gini impurity) | a probability per class, from the conditional frequency of each attribute value inside that class |
| **Model form** | a tree you can read aloud as rules | a table of probabilities you cannot read as a story |
| **Key assumption** | none about attribute independence; interactions captured automatically by deeper splits | every attribute is **conditionally independent** of the others given the class — usually false, hence *naïve* |
| **Mixed data types** | numerics and categories natively | categories natively; numerics need a Gaussian or discretised variant |
| **Missing values** | needs imputation or surrogate splits | simply omit that attribute for that record |
| **Overfitting risk** | **high** — a deep tree memorises; requires pruning or a depth/size limit | **low** — very few parameters to fit |
| **Speed and data appetite** | slower to train; each split needs enough records on both sides | one pass over the data; works on a few hundred records |
| **Interpretability** | high — that is its selling point | low |
| **Stability** | unstable: a slightly different sample can produce a different tree | stable |

**Strengths and weaknesses:**

- **Decision tree — strengths:** produces rules a manager can audit and act on ("if recency < 30 days and basket > NPR 2,000, target with the loyalty offer"); needs no scaling or distributional assumption; captures interactions and non-linear boundaries; handles mixed attribute types.
- **Decision tree — weaknesses:** overfits unless pruned; unstable; biased toward attributes with many distinct values; a small change in the data can restructure the whole tree; poor at expressing smooth linear relationships, which it approximates with a staircase of splits.
- **Naïve Bayes — strengths:** extremely fast, trains on tiny datasets, scales to hundreds of attributes, naturally handles text and high-dimensional sparse data (the classic spam filter); robust to irrelevant attributes.
- **Naïve Bayes — weaknesses:** the independence assumption is almost always violated, and correlated attributes get **double-counted**, which makes the probabilities over-confident; it cannot represent an interaction between two attributes unless the combination is encoded as a feature; continuous attributes force a distributional guess.

**Which to choose:** Choose a **decision tree** when the answer has to be explained to a decision-maker, when attributes are mixed, and when there is enough data to prune honestly. Choose **naïve Bayes** when attributes are many, records are few, and speed or text data dominate. In practice you fit both and compare them on a held-out set — because the independence assumption's damage cannot be predicted from the data dictionary.

---

### C19. Explain association rule mining, including definitions of support and confidence, and give a simple example of an association rule from retail transactions.

**Association rule mining** discovers implications of the form **X → Y** meaning transactions containing itemset X also tend to contain Y. It is the algorithmic search for frequent itemsets and the rules they generate, measured by support and confidence.

**Key measures (worked example):**

Setup: **1,000 transactions.** Bread appears in **200**. Butter appears in **400**. Bread *and* butter appear together in **120**.

| Measure | Formula | Here | Reads as |
|---|---|---|---|
| **Support** | `count(X ∪ Y) / N` | 120/1000 = **12%** | how often the combination occurs at all |
| **Confidence** | `support(X ∪ Y) / support(X)` | 120/200 = **60%** | of bread buyers, how many also bought butter |
| **Lift** | `confidence / support(Y)` | 0.60/0.40 = **1.5** | 50% more likely than chance → positive association |
| **Conviction** | `(1 − support(Y)) / (1 − confidence)` | 0.6/0.4 = **1.5** | how much the rule would be wrong without the association |

**Rule interpretation:** `Bread → Butter [support=12%, confidence=60%, lift=1.5]` means of 100 bread buyers, 60 also bought butter; the rule is 1.5× better than chance.

**Apriori algorithm:** uses **downward closure** (if an itemset is infrequent, every superset is also infrequent) to join frequent *k*-itemsets into candidate (*k*+1)-itemsets, then prune those containing infrequent subsets, level by level.

**Retail example:** `Diapers → Beer [support=2%, confidence=65%, lift=1.8]` — weekday evenings, fathers buying diapers also pick up beer; the rule is strong (high confidence), occurs often enough (decent support), and is nearly twice as likely as chance (lift > 1).

---

### C20. Design a dashboard for monthly sales performance for an online retailer: list the key visualizations, metrics (KPIs), and justify their placement and purpose.

**Audience & decision:** head of sales and e-commerce operations lead, once a month, deciding where to spend next month's marketing budget and which categories to promote.

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
| 12-month trend | line, revenue and orders on one axis | revenue, orders, MoM and YoY | "is this a blip or a slope?" | directly under the KPIs, because every KPI question is a trend question |
| Category mix | sorted horizontal bars | revenue by category vs last year | "which category carries the month, which is decaying?" | top-right, the first "where" question |
| Purchase funnel | funnel or four bars | sessions → product views → add-to-cart → paid orders, with conversion at each step | "is the problem traffic, the product page, the cart or checkout?" | middle-left — the diagnostic layer, read after the trend |
| Return rate | bars against a threshold line | returns / orders by category | "is the revenue real, or is it being returned?" | middle-right; pairs with category mix |
| SKU table | table, sorted by revenue | units, revenue, return rate, stock cover | "what do I restock, discount or delist?" | bottom, because it is drill-down detail, not a glance |

**Three things that make it a *design* rather than a collage:** every tile carries its **definition** ("AOV = revenue ÷ paid orders"), a **last-refresh timestamp**, and an **exception threshold** so the reader's eye goes to the variance rather than to the number. Monthly period with month-to-date projected to month-end, because a raw MTD figure in week two always looks like a collapse.

---

## Group D — Comprehensive Answer / Case / Situation Analysis [2 × 10 = 20]

### D21. A mid-size retail company wants to implement a BI solution to improve sales forecasting and inventory planning. Propose an end-to-end BI approach covering data sources, ETL strategy, data modeling, choice of BI tools, visualization/dashboarding, and governance. Explain why each component is chosen and how they integrate to deliver business value.

**Sources.** Point-of-sale and e-commerce orders give demand; the inventory and warehouse system gives supply; supplier purchase orders and lead times give replenishment; product, store and customer masters give the dimensions. Both demand and supply are needed — with POS alone you can report sales but not plan stock.

**ETL.** Nightly batch for sales, because planning runs daily; more frequent or change-data-capture loads for stock, because a replenishment decision made on stale stock is wrong by lunchtime. A staging area isolates source quirks, and DQ rules reject duplicates, unknown product codes and negative quantities before they reach the warehouse.

**Data model.** A star schema with two facts at different grains: `fact_sales` at order-line-per-day, and `fact_inventory_snapshot` at product × location × day, sharing `dim_product`, `dim_date`, `dim_store`, `dim_supplier` and `dim_customer`. Conformed dimensions are what allow "sold 40, have 12, lead time 5 days" to be one query rather than a reconciliation exercise.

**Tools.** Power BI where the estate is Microsoft, Tableau where visual exploration is the priority — the choice is fit, not brand. The warehouse remains the single copy of the data; the tool reads it through a governed semantic layer.

**Visualisation.** A planning dashboard: sales against forecast, forecast error by category, stock cover in days, stockout and overstock exception lists, supplier lead-time variance. Each visual is tied to a named decision — reorder, mark down, expedite, reset the reorder point.

**Governance.** Definitions signed off once (sale, stockout, stock cover), row-level security by region, DQ thresholds with named owners, refresh monitoring, and a steering group that owns the backlog.

**How it integrates.** The star schema is the hinge: one set of dimensions serves both facts, the semantic layer defines every measure once, and the dashboard turns those measures into exceptions. Value follows directly — fewer stockouts on fast movers, less dead stock on slow movers, and a forecast whose error is measured monthly rather than assumed.

**Sequencing.** Phase 0 agrees the decisions the dashboards must serve; Phase 1 loads the two facts with DQ rules; Phase 2 ships the planning dashboard for one category; Phase 3 extends it to all categories on the same template. Value therefore arrives in Phase 2, not at the end of the programme.

---

### D22. A healthcare provider plans to deploy a BI platform. Discuss major implementation best practices and potential challenges — technical, organizational, and data-related. Provide a phased implementation plan (high level) with key milestones.

**Best practices.** Give clinical metrics to clinical owners: definitions agreed with the clinical governance committee, not IT. Establish one patient identifier and consistent coding before any clinical dashboard. Apply role-based and row-level access so wards, finance and executives see different rows. Start with operational flows, where the decisions are daily and value is immediate.

**Challenges.**  
*Technical:* hospital, laboratory and imaging systems that do not interoperate, batch-only extracts, and unstructured notes outside the warehouse.  
*Organisational:* clinicians who distrust numbers they did not produce, no analytics staff, and governance split across clinical, finance and IT.  
*Data-related:* inconsistent clinical coding, duplicate patient records, missing outcomes, and consent and purpose limitation under Nepal's Individual Privacy Act, 2075.

**Phased plan.**

| Phase | Focus | Milestone |
|---|---|---|
| 0 · Discover (3–4 weeks) | clinical and operational decision inventory; privacy scope; data profiling | **charter signed by the medical director and the CFO** |
| 1 · Foundation (8–12 weeks) | master patient index; encounters, admissions, pharmacy and lab data in a warehouse; data dictionary with clinical coding rules | **data dictionary approved by clinical governance; DQ baseline published** |
| 2 · Operational dashboards (6–8 weeks) | bed occupancy, OPD waiting time, theatre utilisation, pharmacy stock and expiry | **first dashboard used in the daily operations huddle** |
| 3 · Clinical quality (8 weeks) | average length of stay, readmissions, infection rate, mortality review, cost per case | **quality indicators agreed and reconciled with the clinical audit** |
| 4 · Predict and extend (ongoing) | demand forecasting, no-show prediction, capacity planning; other departments on the template | **adoption target met; quarterly roadmap in place** |

**The gate.** Patient identity comes first. If one patient appears twice, every clinical metric downstream is wrong, so the master patient index is a precondition for Phase 3 rather than a later enhancement. Naming that gate is how the plan shows judgement rather than a timeline.

**Sequencing and risk.** Operational dashboards deliberately precede clinical quality: counting beds and waiting times is simpler and builds the clinicians' trust that the quality indicators will later spend. If the DQ baseline is not met at the Phase 1 gate, Phase 3 slips rather than shipping rates the clinical audit will contradict.

---

**End of Answers** — Total 60 marks attempted