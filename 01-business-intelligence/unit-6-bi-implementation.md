# Unit 6 — BI Implementation

| | |
|---|---|
| **Lecture hours** | 8 |
| **Marks in 2026 paper** | 25 — C1 (5 marks, challenges with example) plus entire Group D case (20 marks, challenges-and-ethics sub-question is this unit) |
| **Marks in model question** | 23 — B16 (3, challenges) · D21 (10, retail end-to-end) · D22 (10, healthcare phased plan) |
| **Difficulty** | ★★★★☆ — nothing is hard to understand; the paper asks you to **build a solution on paper**, and most students answer with a list of generic risks |
| **Exam yield** | 🔴 highest in the paper — this unit plus Unit 1 owns Group D |
| **Prerequisite** | Units 1–5. This unit is the assembly manual for everything they taught |
| **Syllabus** | Best practices for implementing BI solutions · Challenges and considerations · Case studies of successful BI implementations |

> **Read this first:** Units 1–5 each answered "what is this thing". This unit answers "how do you make it work in a real organisation, in what order, and what goes wrong". The exam tests that in two shapes — a 3-marker (B16) and a 10- or 20-mark case (D21, D22, and the board paper's Group D). **The case is not a memory test; it is a sequencing test.** The marker checks whether you can put sources → ETL → model → tool → dashboard → governance in a defensible order, name a milestone for each stage, and say *why* each choice was made. That is exactly the shape of D21.

---

## Coverage Map

```
6.1 What BI Implementation Means 🎯 3-mark / 🎯 5-mark
├── Programme vs project (adoption vs delivery)
├── Four layers: People → Process → Data → Technology
└── Memory hook: D-S-P-D-A-C

6.2 Best Practices (8) 🎯 3-mark / 🎯 5-mark
├── Decisions first → prevents data swamp
├── Executive sponsor → prevents stall
├── Phase it: pilot then scale → prevents big bang
├── Define metrics once → prevents two versions of truth
├── Data quality + master data as project → prevents unusable dashboards
├── Architecture for change → prevents rebuilds
├── Build capability → prevents adoption collapse
└── Security/privacy by design → prevents incidents

6.3 Challenges (3 families) 🎯 3-mark / 🎯 5-mark
├── Technical: source sprawl, legacy, performance, hybrid, tool proliferation, security
├── Organisational: no sponsor, unclear ownership, skills gap, resistance, scope creep, IT-business divide
└── Data-related: poor quality, no common ID, conflicting definitions, short history, undocumented metadata, privacy

6.4 Phased Plan (5 phases) 🎯 10-mark
├── Phase 0: Discover & govern (2–4 weeks) → charter signed
├── Phase 1: Foundation (8–12 weeks) → data dictionary approved, warehouse loaded, DQ baseline
├── Phase 2: First dashboards (6–8 weeks) → first dashboard in production use
├── Phase 3: Scale & extend (3–6 months) → second domain live on same template
└── Phase 4: Operate & improve (ongoing) → adoption target met, roadmap refreshed

6.5 Case Patterns 🎯 5-mark
├── Walmart: share data with supplier → inter-organisational BI, row-level security as commercial mechanism
├── Tesco: loyalty card as data asset → Unit 3 at scale, decisions first
├── Harrah's: value the customer, not the visit → executive sponsorship, behaviour change as success
└── Nepali bank pattern: decisions already exist → practice 1 satisfied before project starts

6.6 D21 Retail Case 🎯 10-mark
└── Sources → ETL → Model → Tools → Visualisation → Governance → Integration → Success measure

6.7 D22 Healthcare Case 🎯 10-mark
└── Best practices (sector) → Challenges (3 families) → Phased plan → Gate condition (patient identity)
```

---

## 6.1 What "BI Implementation" Actually Means 🎯 3-mark / 🎯 5-mark

> **BI implementation is the programme of work that turns a BI capability from a purchase into a working decision-support system — the data, the models, the tools, the people, the process and the governance — delivered in stages and then operated.**

Three words in that definition carry the marks.

| Word | What it rules out | Why the examiner cares |
|---|---|---|
| **programme** | "we bought Power BI, so we have BI" | a tool is one deliverable of six; the rest is organisational |
| **stages** | the single big-bang go-live | phasing is what D22 explicitly asks you to plan |
| **operated** | a one-off project that ends at handover | dashboards decay without refresh, ownership and DQ monitoring |

### Project Versus Programme — The Distinction That Earns a Mark

| | **BI project** | **BI programme** |
|---|---|---|
| Deliverable | a dashboard, a report, a warehouse | a change in how decisions are made |
| Success measure | delivered on time and on budget | **adoption** — the dashboard is used, and a decision changed |
| Lifetime | ends at go-live | never ends; it is operated and extended |
| Failure mode | late, over budget | on time, on budget, unused |

The second failure mode is the one that matters, and it is invisible in a project plan. A dashboard nobody opens has delivered nothing, whatever the status report says. When a case question asks you to "propose an approach", say how you will know it worked — *weekly active users, decisions logged, exceptions actioned* — not just what you will build.

### The Four Layers of Implementation Work

```
┌────────────────────────────────────────────────────┐
│  PEOPLE & ORGANISATION   sponsorship, skills,       │  ← where most failures live
│                          ownership, adoption        │
├────────────────────────────────────────────────────┤
│  PROCESS & GOVERNANCE    definitions, DQ rules,     │
│                          security, release cycle    │
├────────────────────────────────────────────────────┤
│  DATA & MODELS           sources, ETL, warehouse,   │
│                          star schemas, semantic layer│
├────────────────────────────────────────────────────┤
│  TECHNOLOGY              BI tool, database, cloud,  │  ← what students write about
│                          scheduling, monitoring     │
└────────────────────────────────────────────────────┘
```

⚠ **The most common 5-mark answer in this unit is a technology-only answer.** It names Power BI, SQL Server and "the cloud" and stops. The bottom layer is 20% of the work and 20% of the marks. C1's word *example*, and D22's words *organizational and data-related*, are the examiner telling you to climb the stack.

🧠 **Memory hook: D-S-P-D-A-C** — *Decisions, Sponsor, Phase, Definitions, Architecture, Capability.* (Add security to taste; six is what fits in an answer.)

🇳🇵 **Nepal anchor:** Practice 8 has a specific local edge. Nepal's **Individual Privacy Act, 2075 (2018)** is the country's first dedicated data-protection law, implementing the constitutional right to privacy; it regulates the collection, storage and processing of personal information, and it applies to corporate entities as well as public bodies. Any BI programme touching customer, patient or employee data — which is most of them — is therefore a privacy programme too. Saying this in a case answer separates it from a generic risk list.

---

## 6.2 Best Practices — Eight, Each With What It Prevents 🎯 3-mark / 🎯 5-mark

A "best practices" question is answered by pairing each practice with the failure it prevents. A list of practices with no failure attached reads as memorised.

| # | Practice | What it means in practice | The failure it prevents |
|---|---|---|---|
| 1 | **Start from decisions, not data** | For each candidate dashboard, write: which decision, by whom, how often, what action follows. Build only what sits behind a decision | the data swamp — years of integration, no decision changed |
| 2 | **Executive sponsorship and business ownership** | A steering group with budget authority; a named business owner per subject area who signs off definitions | a stalled programme when the first sponsor is transferred |
| 3 | **Phase it: pilot, then scale** | One domain, one KPI set, 8–12 weeks, in production; then repeat with the template | the 18-month big bang that is cancelled before its first user |
| 4 | **Define every metric once** | A governed semantic layer and a business glossary; certified datasets; a change process for definitions | "two versions of the truth" — the meeting that argues about whose number is right |
| 5 | **Treat data quality and master data as the project** | Named data owners; DQ rules tested in the pipeline; one customer ID and one product ID across sources | dashboards that are technically correct and commercially unusable |
| 6 | **Design the architecture for change** | Layered warehouse (staging → core → mart), conformed dimensions, ELT so raw history is kept, one semantic layer many outputs | a new source or a new question means rebuilding everything |
| 7 | **Build capability, not just artefacts** | Training, a champion in each department, documentation, a small centre of excellence | adoption collapse at handover — users revert to spreadsheets |
| 8 | **Security, privacy and audit by design** | Role-based access and row-level security, PII classified and minimised, retention rules, access logging | a privacy incident, or a regulator's letter, after go-live |

---

## 6.3 Challenges — The Three Families the Exam Names 🎯 3-mark / 🎯 5-mark

D22 uses the paper's own taxonomy: *technical, organizational, and data-related*. C1 asks for challenges *with example*. Prepare the three families, each with symptom → root cause → mitigation, and one concrete example each.

### Technical Challenges

| Challenge | Symptom | Mitigation |
|---|---|---|
| **Source-system sprawl** | a dozen systems, different keys, no common customer | master data management; conformed dimensions; start with two sources |
| **Legacy and pack-standard systems** | core banking/ERP extracts are batch-only, undocumented, or locked by the vendor | a staging layer that isolates the warehouse from source quirks; vendor extract agreements |
| **Performance and volume** | dashboards time out as history grows | pre-aggregation, incremental load, columnar storage, star schemas rather than wide joins |
| **Hybrid estate** | some data on-premises, some in cloud, some in spreadsheets | one integration layer; never let a spreadsheet become a source of record |
| **Tool proliferation** | four reporting tools, four definitions, four support contracts | standardise; a certification process for what is "official" |
| **Security architecture** | row-level security bolted on late, breaking dashboards | security modelled with the data, not after it |

### Organisational Challenges

| Challenge | Symptom | Mitigation |
|---|---|---|
| **No sponsorship** | the programme reports to a middle manager with no budget | executive steering group with decision rights |
| **Unclear ownership** | everyone wants the dashboard; nobody owns the KPI definition | named business owner per subject area |
| **Skills gap** | one analyst who understands DAX and cannot take leave | train two per domain; document; centre of excellence |
| **Resistance and "we know our business"** | managers keep the old spreadsheet beside the new dashboard | involve users in design; show a decision the dashboard changed |
| **Scope creep** | every meeting adds a report | decision-first backlog with a published release cycle |
| **IT–business divide** | business says IT is slow, IT says business keeps changing its mind | joint delivery team, shared definition of done |

### Data-Related Challenges

| Challenge | Symptom | Mitigation |
|---|---|---|
| **Poor quality** | duplicates, missing fields, impossible dates | DQ profiling before modelling; rules tested in the pipeline; a DQ scorecard |
| **No common identifier** | one customer appears four times | master data management; a survivorship rule |
| **Conflicting definitions** | "active customer" means three things | governed glossary and semantic layer |
| **Short or restated history** | last year's numbers changed after a system migration | retain raw history (ELT); version the marts |
| **Undocumented metadata** | nobody knows what a column means | a data catalogue populated as you build |
| **Privacy and consent** | personal data used beyond its collection purpose | purpose limitation, minimisation, access control, retention |

⚠ **The example rule.** C1 says *with example* and it means one per challenge family, from one consistent organisation. Choose a Nepali commercial bank and keep it: core banking batch extracts (technical), branch managers defending their own spreadsheets (organisational), and three definitions of "active account" (data-related). One organisation, three families — that scores; three unrelated examples read as padding.

### The Challenge That Is Really a Decision — Build Versus Buy

Worth one line in any implementation answer, because it is a real consideration and examiners reward it: **buy** a BI tool and configure it when the need is standard (dashboards, scheduled refresh, row-level security); **build** when the analytical logic is the competitive asset (a demand-forecasting model, a credit-scoring engine). The hybrid — buy the platform, build the model — is the norm.

---

## 6.4 The Phased Plan — The Backbone of Every Case Answer 🎯 10-mark

D22 asks for "a phased implementation plan (high level) with key milestones". That is a structure question, so learn the structure once and reuse it for D21, D22 and the 20-mark board case.

```
PHASE 0        PHASE 1        PHASE 2        PHASE 3        PHASE 4
Discover &     Foundation     First          Scale &        Operate &
govern         (data)         dashboards     extend         improve
2-4 weeks      8-12 weeks     6-8 weeks      3-6 months     ongoing
─────┬──────────────┬──────────────┬──────────────┬──────────────┬────►
     │              │              │              │              │
  M1 charter     M2 data       M3 first       M4 second     M5 adoption
  signed,        dictionary     dashboard      domain live   target met,
  sponsor,       approved,      in use by      with the      DQ scorecard
  scope,         warehouse      a named        same          green, roadmap
  success        loaded, DQ     decision-      template      refreshed
  measures       baseline       maker
```

| Phase | What you do | Milestone (the thing that proves it) | Why this order |
|---|---|---|---|
| **0 Discover & govern** | interviews; decision inventory; success measures; data profiling; privacy/security scope; architecture sketch | **charter signed** — sponsor, scope, budget, success measures | you cannot phase what you have not scoped; the charter also stops scope creep |
| **1 Foundation** | source extracts, staging, core warehouse, conformed dimensions, master data for customer/product, DQ rules, metadata catalogue | **data dictionary approved and warehouse loaded** with a DQ baseline | every later phase is a query against this; skipping it is why pilots fail late |
| **2 First dashboards** | semantic layer; 3–5 KPIs; one dashboard for a named decision-maker; row-level security; refresh schedule | **first dashboard in production use**, with a decision that changed | the pilot proves the template and buys political capital |
| **3 Scale & extend** | second and third subject area on the same template; more sources; training and champions; release cycle | **second domain live** using the same model and definitions | proves it is a platform, not a one-off |
| **4 Operate & improve** | monitoring, DQ scorecard, usage analytics, backlog, roadmap, periodic review | **adoption target met**; roadmap for next year | BI is operated, not delivered |

Three planning points examiners look for:

1. **Milestones are evidence, not activity.** "Requirements gathered" is an activity; "data dictionary approved by the business owner" is a milestone. Write the second kind.
2. **Each phase ends with something usable.** A foundation phase that produces nothing visible for six months is the failure mode of practice 3.
3. **Timeboxes are indicative.** Say "roughly 8–12 weeks" and explain what would compress or extend it — never present a schedule as a promise.

---

## 6.5 Case Studies — What "Successful Implementation" Looks Like 🎯 5-mark

The syllabus asks for case studies. Use three well-documented ones as **patterns**, not as current claims about those companies: each shows one best practice at industrial scale.

### Case 1 — Walmart: Share the Data With the Supplier

**Situation:** a retailer with thousands of stores and thousands of suppliers, each guessing what to ship.
**What was built:** a central retail data warehouse, and a supplier-facing portal that let vendors see store-level sales and stock for their own products.
**Why it worked:** it turned BI into an *inter-organisational* process. The supplier's decision (what to manufacture) was improved with the retailer's data, so both sides gained, and the retailer's data became a condition of doing business.
**Exam use:** the best illustration of "BI changes a decision outside the company", and of governance — vendors see only their own rows, which is row-level security as a commercial mechanism.

### Case 2 — Tesco: The Loyalty Card as a Data Asset

**Situation:** a grocer with a loyalty scheme that most retailers treated as a discount mechanism.
**What was built:** basket-level analysis of card transactions, linking what was bought together, by whom, over time — the association-rule and segmentation machinery of Unit 3, applied at scale.
**Why it worked:** the scheme was designed as a *data collection instrument* first and a discount second, and the analysis was tied to specific decisions — targeting, range, promotions, store clustering.
**Exam use:** ties Unit 3 to Unit 6; the classic answer to "how does a retailer turn transactions into decisions".

### Case 3 — Harrah's (now Caesars): Value the Customer, Not the Visit

**Situation:** a casino operator with a loyalty programme but no view of which customers were worth retaining.
**What was built:** a customer data warehouse with predictive models of customer value and attrition, used to decide who gets an offer, and how much.
**Why it worked:** the analysis was commissioned by the executive who could act on it (practice 2), and success was measured in behaviour change, not in reports shipped.
**Exam use:** the cleanest example that BI's value is in the *decision and the incentive*, not the dashboard.

### Case 4 — the Nepali Pattern (Constructed, Not a Named Company)

**Situation:** a mid-size commercial bank with core banking, a card switch, mobile banking and a spreadsheet-based MIS.
**What would be built:** a warehouse fed nightly from core banking; star schemas for deposits, loans, channels and branches; a board pack and a branch performance dashboard with row-level security; a DQ scorecard for account and customer data.
**Why it works:** the decisions already exist and already have owners — deposit mobilisation, credit growth, NPL, CASA — so practice 1 is satisfied before the project starts.
**Exam use:** the safe, credible local example. Say it is a *pattern*, never that a named bank does exactly this.

⚠ **How to use a case in an answer.** Never tell the story for its own sake. The pattern is: *situation → what was built → which best practice it demonstrates → the transferable lesson*. Four lines. A paragraph of company history earns nothing.

---

## 6.6 Worked Case — D21, the Retailer End-to-End 🎯 10-mark

> *"A mid-size retail company wants to implement a BI solution to improve sales forecasting and inventory planning. Propose an end-to-end BI approach covering data sources, ETL strategy, data modelling, choice of BI tools, visualization/dashboarding, and governance. Explain why each component is chosen and how they integrate to deliver business value."*

The question hands you the structure in its own list. Answer in that order, one short block each, and close with integration.

| Layer | The choice | Why it is chosen |
|---|---|---|
| **Sources** | POS/e-commerce orders, inventory and warehouse system, supplier and purchase orders, product master, store master, CRM/loyalty | forecasting needs demand (POS) *and* supply (stock, lead times); without both you can only report, not plan |
| **ETL** | nightly batch for sales; more frequent (hourly/CDC) for stock levels; staging area; DQ rules for duplicates, missing product codes, negative quantities | daily granularity is enough for planning; stock needs to be near-current or replenishment is wrong by lunchtime |
| **Modelling** | star schema: `fact_sales` (grain: order line per day), `fact_inventory_snapshot` (grain: product × location × day), dimensions `dim_product`, `dim_store`, `dim_date`, `dim_supplier`, `dim_customer` | two facts at different grains answer "what sold" and "what is left"; conformed dimensions let both be cut the same way |
| **Tools** | Power BI (authoring + service) if the estate is Microsoft; Tableau if visual exploration is the priority; the warehouse (SQL Server/Postgres/cloud) underneath | Unit 5's fit argument — cheapest where the platform already exists, and it must connect to the warehouse without a second copy of the data |
| **Visualisation** | demand-and-stock dashboard: sales trend vs forecast, forecast error (MAPE) by category, stock cover in days, stockout and overstock exception lists, supplier lead-time variance | each tile answers a named decision — order more, mark down, expedite, change the reorder point |
| **Governance** | metric definitions (what counts as a sale, a stockout, stock cover), row-level security by region/store, DQ SLAs with named owners, refresh monitoring, a steering group | without it, two branches report two different stock figures and planning stops |

**How it integrates.** The star schema is the hinge: the same product and date dimensions serve both the sales fact and the stock fact, so "sold 40, have 12, lead time 5 days" is one query, not a reconciliation exercise. The dashboard then becomes a decision surface, and the DQ SLA is what keeps it trustworthy. The business value is specific: fewer stockouts on fast movers, less dead stock on slow movers, and a forecast whose error is measured rather than assumed.

**Then say how you would know it worked.** Forecast error falling, stock cover inside target, exception lists cleared within the week, and the planners actually using it. A case answer without a success measure is a build plan, not an implementation.

---

### D21 · Retailer End-to-End [10] 🎯 10-mark

> *Shape: the six components the question lists, one short block each with the reason, then integration, then the success measure. ~380 words.*

> **Sources.** Point-of-sale and e-commerce orders give demand; the inventory and warehouse system gives supply; supplier purchase orders and lead times give replenishment; product, store and customer masters give the dimensions. Both demand and supply are needed — with POS alone you can report sales but not plan stock.
>
> **ETL.** Nightly batch for sales, because planning runs daily; more frequent or change-data-capture loads for stock, because a replenishment decision made on stale stock is wrong. A staging area isolates source quirks, and DQ rules reject duplicates, unknown product codes and negative quantities before they reach the warehouse.
>
> **Data model.** A star schema with two facts at different grains: `fact_sales` at order-line-per-day, and `fact_inventory_snapshot` at product × location × day, sharing `dim_product`, `dim_date`, `dim_store`, `dim_supplier` and `dim_customer`. Conformed dimensions are what allow "sold 40, have 12, lead time 5 days" to be one query rather than a reconciliation.
>
> **Tools.** Power BI where the estate is Microsoft, Tableau where visual exploration is the priority — the choice is fit, not brand. The warehouse remains the single copy of the data; the tool reads it through a governed semantic layer.
>
> **Visualisation.** A planning dashboard: sales against forecast, forecast error by category, stock cover in days, stockout and overstock exception lists, supplier lead-time variance. Each visual is tied to a decision — reorder, mark down, expedite, reset the reorder point.
>
> **Governance.** Definitions signed off once (sale, stockout, stock cover), row-level security by region, DQ thresholds with named owners, refresh monitoring, and a steering group that owns the backlog.
>
> **How it integrates.** The star schema is the hinge: one set of dimensions serves both facts, the semantic layer defines every measure once, and the dashboard turns those measures into exceptions. Value follows directly — fewer stockouts on fast movers, less dead stock on slow movers, and a forecast whose error is measured monthly rather than assumed.
>
> **Sequencing.** Phase 0 agrees the decisions the dashboards must serve; Phase 1 loads the two facts with DQ rules; Phase 2 ships the planning dashboard for one category; Phase 3 extends it to all categories on the same template. Value therefore arrives in Phase 2, not at the end of the programme.

---

## 6.7 Worked Case — D22, the Healthcare Phased Plan 🎯 10-mark

> *"A healthcare provider plans to deploy a BI platform. Discuss major implementation best practices and potential challenges — technical, organizational, and data-related. Provide a phased implementation plan (high level) with key milestones."*

Same skeleton, different content, and the sector adds two constraints: **patient safety** makes wrong numbers a clinical risk, and **consent and privacy** make data use a legal question, not a preference.

### Best Practices, Sector-Specific

Clinician ownership of clinical metrics (practice 2); definitions agreed with the clinical governance committee, not IT (practice 4); a named patient identifier and consistent coding (practice 5); role-based access so a ward nurse and a finance officer see different rows (practice 8); start with operational flows, where the decisions are daily (practice 3).

### Challenges, by Family

| Family | Healthcare-specific examples |
|---|---|
| **Technical** | hospital management systems and laboratory systems that do not interoperate; batch-only extracts; imaging and unstructured notes outside the warehouse; identity matching across registrations |
| **Organisational** | clinicians who distrust numbers they did not produce; competing priorities during a service surge; no analytics staff; governance split between clinical, finance and IT |
| **Data-related** | inconsistent clinical coding; duplicate patient records; missing outcomes; consent and purpose limitation under the privacy law; historical data that predates a system change |

### The Phased Plan

| Phase | Focus | Milestone |
|---|---|---|
| 0 · Discover (3–4 weeks) | clinical and operational decision inventory; privacy and consent scope; data profiling | **charter signed by the medical director and the CFO** |
| 1 · Foundation (8–12 weeks) | master patient index; encounters, admissions, pharmacy and lab data in a warehouse; data dictionary with clinical coding rules | **data dictionary approved by clinical governance; DQ baseline published** |
| 2 · Operational dashboards (6–8 weeks) | bed occupancy, OPD waiting time, theatre utilisation, pharmacy stock and expiry | **first dashboard used in the daily operations huddle** |
| 3 · Clinical quality (8 weeks) | average length of stay, readmissions, infection rate, mortality review, cost per case | **quality indicators agreed and reconciled with the clinical audit** |
| 4 · Predict and extend (ongoing) | demand forecasting, no-show prediction, capacity planning; other departments on the template | **adoption target met; quarterly roadmap in place** |

**The close.** Name the one thing that would make you pause the programme: a patient-identity problem. If the same patient appears twice, every clinical metric downstream is wrong, so fixing the master patient index is a gate before any clinical dashboard, not a later enhancement. A case answer that names its own gate condition reads as professional judgement.

---

### D22 · Healthcare Phased Plan [10] 🎯 10-mark

> *Shape: best practices (sector-specific) → challenges by the paper's own three families → four phases with an evidence milestone each → the gate condition. ~380 words.*

> **Best practices.** Give clinical metrics to clinical owners: definitions agreed with the clinical governance committee, not IT. Establish one patient identifier and consistent coding before any clinical dashboard. Apply role-based and row-level access so wards, finance and executives see different rows. Start with operational flows — occupancy, waiting time, pharmacy stock — where decisions are daily and value is immediate.
>
> **Challenges.** *Technical:* hospital, laboratory and imaging systems that do not interoperate, batch-only extracts, and unstructured notes outside the warehouse. *Organisational:* clinicians who distrust numbers they did not produce, no analytics staff, and governance split across clinical, finance and IT. *Data-related:* inconsistent clinical coding, duplicate patient records, missing outcomes, and consent and purpose limitation under Nepal's Individual Privacy Act, 2075.
>
> **Phased plan.** *Phase 0, discovery (3–4 weeks):* decision inventory, privacy scope, data profiling — milestone: charter signed by the medical director and the CFO. *Phase 1, foundation (8–12 weeks):* master patient index, encounters, admissions, pharmacy and laboratory data in a warehouse, with a clinical data dictionary — milestone: dictionary approved by clinical governance and a DQ baseline published. *Phase 2, operational dashboards (6–8 weeks):* bed occupancy, OPD waiting time, theatre utilisation, pharmacy stock and expiry — milestone: the first dashboard used in the daily operations huddle. *Phase 3, clinical quality (8 weeks):* length of stay, readmissions, infection rate, mortality review, cost per case — milestone: indicators reconciled with clinical audit. *Phase 4, predict and extend:* demand forecasting, no-show prediction, further departments on the same template — milestone: adoption target met and a quarterly roadmap agreed.
>
> **The gate.** Patient identity comes first. If one patient appears twice, every clinical metric downstream is wrong, so the master patient index is a precondition for Phase 3 rather than a later enhancement. Naming that gate is how the plan shows judgement rather than a timeline.
>
> **Sequencing and risk.** Operational dashboards deliberately precede clinical quality: counting beds and waiting times is simpler and builds the clinicians' trust that the quality indicators will later spend. If the DQ baseline is not met at the Phase 1 gate, Phase 3 slips rather than shipping rates the clinical audit will contradict.

---

## 6.8 Answer Skeletons

### B16 · "Outline key challenges organizations face when implementing BI solutions." [3] 🎯 3-mark

> *Shape: name the three families, one instance each, one line of consequence. ~110 words.*

> Organisations meet three families of challenge. **Data:** source systems disagree — duplicate customers, inconsistent product codes and three definitions of "active customer" — so the warehouse is technically correct and commercially untrusted. **Technical:** legacy and pack-standard systems offer only batch, undocumented extracts, and dashboard performance degrades as history grows. **Organisational:** the commonest failure is not technical at all — no executive sponsor, no named owner for each metric, and a skills gap that leaves one analyst holding the programme. The usual result is a dashboard delivered on time and never used.

*(108 words)*

---

### C1 · "Explain challenges in BI implementation with example." [5] 🎯 5-mark

> *Shape: three families × (challenge + example) → the organisational point → what mitigation looks like. ~220 words, one organisation throughout.*

> Take a mid-size commercial bank implementing BI over core banking, cards and mobile channels.
>
> **Technical.** Extracts arrive as overnight batch files with undocumented fields, and the card switch has no shared customer key, so the warehouse cannot join channels without a mapping layer. Mitigation: a staging layer, vendor extract agreements and master data management.
>
> **Data-related.** Three definitions of "active account" exist — by balance, by transaction, by login — and customer records duplicate across branches. A dashboard built on any one of them will be disputed in the first meeting. Mitigation: a governed glossary, one definition signed off by the business owner, and DQ rules tested in the pipeline.
>
> **Organisational.** The programme is sponsored by a middle manager without budget, branch managers keep their own spreadsheets because they trust them, and a single analyst holds all the tool knowledge. This is where most implementations fail, and no technology choice fixes it. Mitigation: an executive steering group, named metric owners, two trained analysts per domain, and a pilot whose result a manager actually used.
>
> The pattern to state: data and technical problems are solvable with time and money; organisational problems need sponsorship and adoption, which is why they decide whether the programme survives.

*(219 words)*

---

## 6.9 Traps

| Trap | Why it costs marks | Fix |
|---|---|---|
| Answering implementation as a tool purchase | the question is about programme, data and people | use the four layers: technology is one of them |
| Listing challenges with no example | C1 prints *with example*; D22 prints *technical, organizational, and data-related* | one organisation, one example per family |
| Writing a timeline with no milestones | D22 prints *with key milestones* | each phase ends in evidence: signed charter, approved dictionary, dashboard in use |
| Milestones that are activities | "requirements gathered" proves nothing | "data dictionary approved by the business owner" |
| Claiming BI projects "usually fail 70% of the time" | cannot be verified, and markers know it is a recycled statistic | say "many fail on adoption, not on delivery" and explain why |
| Ignoring privacy in a data case | a modern paper expects it, and Nepal has a privacy law | one line on purpose limitation, minimisation and access control |
| Recommending a big-bang go-live | contradicts the phasing the question asks for | pilot → template → scale |
| Treating case studies as company history | the marker wants the lesson, not the story | situation → built → practice demonstrated → lesson |
| Naming a real Nepali bank's systems | unverifiable and risks being wrong | describe the pattern; say it is a pattern |
| Forgetting the success measure | a build plan is not an implementation | close with adoption and outcome metrics |

---

## 6.10 Self-Test (Answers Collapsed)

1. Define BI implementation in one sentence, and name the one word that separates it from a BI project. *(1 mark)*
2. Give three challenges of BI implementation, one from each family. *(3 marks — B16)*
3. Name four best practices and, for each, the failure it prevents. *(3–5 marks)*
4. Why is a pilot phase recommended over a single go-live? *(3 marks)*
5. What is a milestone, as opposed to an activity? Give one example from a phased BI plan. *(1–3 marks)*
6. 🇳🇵 A hospital's BI programme is six weeks from its first clinical dashboard when the data team finds 4% duplicate patient records. What do you do, and why? *(5 marks — mini case)*
7. Outline an end-to-end BI approach for a retailer that wants better inventory planning. *(10 marks — D21)*
8. Draft a four-phase plan for a healthcare BI platform with one milestone per phase. *(10 marks — D22)*

<details>
<summary>Answers</summary>

1. "BI implementation is the programme that turns a BI capability into a working decision-support system — data, models, tools, people, process and governance — delivered in stages and then operated." The separating word is **programme** (or **operated**): a project ends at go-live, a programme is measured by adoption.
2. **Technical:** batch-only, undocumented extracts from legacy systems. **Organisational:** no executive sponsor and no named owner of metric definitions. **Data-related:** duplicate customers and three conflicting definitions of "active customer". (Any one from each family.)
3. **Decisions first** → prevents a data swamp with no decision changed. **Phase it** → prevents the cancelled big bang. **Define metrics once** → prevents two versions of the truth. **Security and privacy by design** → prevents a post-launch incident. *(Also: sponsorship, master data, capability building, architecture for change.)*
4. A pilot proves the template on one domain in 8–12 weeks, produces a visible result that buys sponsorship, exposes data-quality problems while they are cheap, and creates a reusable pattern. A single go-live defers all four risks to the moment of maximum exposure.
5. An activity is work done ("requirements gathered", "ETL developed"); a milestone is evidence that a phase is complete ("data dictionary approved by the business owner", "first dashboard used in the daily huddle"). Milestones are what a steering group can verify.
6. Do not publish the clinical dashboard. Report the DQ finding to the steering group, quantify it (4% of records affected, which metrics move), run identity matching and a survivorship rule, and re-baseline. Then release the dashboard with the residual error stated. Rationale: a duplicate patient inflates or deflates every clinical rate, and a number that is wrong once is distrusted permanently — so the identity fix is a gate, not a backlog item.
7. See §6.6 — sources (POS + inventory + suppliers), ETL (nightly sales, near-real-time stock), star schema with `fact_sales` and `fact_inventory_snapshot` on conformed dimensions, a BI tool chosen for fit, a planning dashboard of forecast error, stock cover and exception lists, and governance of definitions, security and DQ.
8. See §6.7 — Phase 0 discovery (charter signed), Phase 1 foundation (data dictionary approved, DQ baseline), Phase 2 operational dashboards (used in the daily huddle), Phase 3 clinical quality (reconciled with clinical audit), Phase 4 predict and extend (adoption target met).

</details>

---

## 6.11 Sixty-Second Check

Close this file and, on a blank page:

- [ ] Define BI implementation, and say why "programme" and "operated" matter
- [ ] Draw the four implementation layers
- [ ] Name four best practices with the failure each prevents
- [ ] Name three challenge families with one example each, from one organisation
- [ ] Draw the five-phase plan with one evidence milestone per phase
- [ ] Give three case patterns and the one practice each illustrates
- [ ] Recall the D21 component order: sources → ETL → model → tools → visualisation → governance
- [ ] Recall the D22 gate: patient identity before clinical metrics
- [ ] Say what a 20-mark case answer looks like: four labelled parts, not one essay

If all nine are there, this unit's **25 board marks and 23 model marks** are covered — C1, B16, D21, D22 and the implementation half of Group D.

---

*Sources: TU FOM syllabus (IT 249, Unit 6, 8 LHs) · TU 2026 paper (C1, Group D) · TU/FOM model question 2026 (B16, D21, D22) · Best-practice structure and the implementation lifecycle from Sherman, Business Intelligence Guidebook (a syllabus reading) and Kimball & Ross, The Data Warehouse Toolkit (also a syllabus reading) — both textbook-level, not fetched this session. The Individual Privacy Act, 2075 (2018) is described at the level of what it regulates (collection, storage, processing of personal information, applicable to corporate entities), confirmed against public legal summaries, not against the statute text. The Walmart, Tesco and Harrah's case boxes describe the commonly published account of what each organisation built and why; no current figures, market positions or unverifiable claims are asserted, and the Nepali bank case is explicitly a constructed pattern, not a claim about a named institution.*