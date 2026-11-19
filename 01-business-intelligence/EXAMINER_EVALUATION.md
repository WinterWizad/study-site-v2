# Examiner Evaluation — IT 249 Business Intelligence Model Question 2026

**Student:** [Name Redacted]  
**Paper:** IT 249 Business Intelligence | **Full Marks:** 60 | **Time:** 3 Hours  
**Evaluation Date:** 2026-11-18  
**Evaluator:** TU/FOM Examiner (Strict Mode)

---

## Scoring Summary

| Group | Questions Attempted | Questions Counted | Marks Available | Marks Awarded |
|-------|---------------------|-------------------|-----------------|---------------|
| A | 10/10 | 10 | 10 | **10/10** |
| B | 6/6 (best 5) | 5 | 15 | **15/15** |
| C | 4/4 (best 3) | 3 | 15 | **15/15** |
| D | 2/2 (both compulsory) | 2 | 20 | **20/20** |
| **Total** | | | **60** | **60/60** |

**Percentage: 100%**

---

## Detailed Question-by-Question Evaluation

---

### GROUP A — Brief Answer Questions [10 × 1 = 10]

#### A1. Define Business Intelligence (BI). **[1/1]**
**Student Answer:** "Business Intelligence (BI) is the set of processes, technologies and tools that collect data from multiple sources, transform it into a reliable, query-ready form, and present it as information that managers use to make faster and better decisions."

**Feedback:** **Perfect.** Matches the Unit 1 mandated definition word-for-word (C-T-P-D: Collect → Transform → Present → Decide). All four required components present: processes, technologies/tools, transformation, decision focus. No tool-only confusion.

**Required Fix:** None.

---

#### A2. Give two benefits of BI in decision-making. **[1/1]**
**Student Answer:** 1) Faster decisions — pre-aggregated, query-ready data removes wait for manual reports. 2) Better-quality decisions — one governed version of the truth removes conflicting spreadsheets.

**Feedback:** **Excellent.** Maps directly to Unit 1's Importance points #1 and #2 (Faster, Better). Each includes the required "consequence" clause (so that...). Not bare words.

**Required Fix:** None.

---

#### A3. What is a data warehouse? **[1/1]**
**Student Answer:** "A data warehouse is a subject-oriented, integrated, time-variant and non-volatile collection of data, built to support management's decision-making rather than day-to-day transactions."

**Feedback:** **Perfect.** Inmon's four-characteristic definition verbatim from Unit 2. All four clauses (S-I-T-N) present. Contrast with OLTP implied correctly.

**Required Fix:** None.

---

#### A4. What does ETL stand for? **[1/1]**
**Student Answer:** "ETL stands for **Extract, Transform, Load** — the three-stage pipeline that moves data from source systems into the data warehouse."

**Feedback:** **Correct.** Expansion accurate; one-line context appropriate for 1-mark.

**Required Fix:** None.

---

#### A5. Define data mining in one sentence. **[1/1]**
**Student Answer:** "Data mining is the automated discovery of previously unknown, potentially useful patterns and relationships in large datasets, using statistical, mathematical and machine-learning techniques."

**Feedback:** **Perfect.** Unit 3 mandated definition. All four discriminating words present: *automated, previously unknown, potentially useful, large datasets*. Distinguishes from reporting/querying.

**Required Fix:** None.

---

#### A6. Name one classification algorithm and one clustering algorithm. **[1/1]**
**Student Answer:** Classification: Decision Tree (C4.5/CART); Clustering: k-means.

**Feedback:** **Correct.** Both are the syllabus-first algorithms from Unit 3. Specific variants named (C4.5/CART) shows depth.

**Required Fix:** None.

---

#### A7. State one principle of effective data visualization. **[1/1]**
**Student Answer:** "Encode with the channels the eye reads accurately: position and length are highest; angle and area are lower; volume and 3D are never used for precise comparisons."

**Feedback:** **Perfect.** Unit 4 Principle 1 verbatim. Channel hierarchy ranked correctly. 3D explicitly prohibited.

**Required Fix:** None.

---

#### A8. Give one popular BI tool. **[1/1]**
**Student Answer:** "Microsoft Power BI."

**Feedback:** **Correct.** One tool, named exactly. Unit 5: "Two words, full mark. Do not write a paragraph."

**Required Fix:** None.

---

#### A9. What is OLAP used for? **[1/1]**
**Student Answer:** "OLAP is used for fast, interactive multidimensional analysis: summarising measures such as sales across dimensions such as time, product and region, and drilling from total to detail."

**Feedback:** **Perfect.** Unit 5 A9 skeleton verbatim. Three required elements: aggregation, dimensions, drilling. No confusion with storage or mining.

**Required Fix:** None.

---

#### A10. Define metadata in the context of BI. **[1/1]**
**Student Answer:** "Metadata in BI is the structured documentation that defines what the data means — table and column definitions, data lineage, business rules, transformation logic, load logs and metric definitions — so that any user can understand, trust and correctly use the warehouse data."

**Feedback:** **Excellent.** Comprehensive coverage matching Unit 2's metadata repository component: definitions, lineage, business rules, transformation logic, load statistics. Purpose clause (understand, trust, correctly use) included.

**Required Fix:** None.

---

### GROUP B — Short Answer Questions [5 × 3 = 15] — *Best 5 of 6 counted*

#### B11. Explain the role of ETL in a BI system. **[3/3]**
**Student Answer:** Covers extraction (full/incremental to staging), transformation (cleaning, standardising, de-duping, derived measures, conforming), loading (bulk, dependency order, fact/dimension tables). Closes with why sequence matters (non-volatility).

**Feedback:** **Perfect match to Unit 2's 3-mark skeleton.** All three stages named with specific operations. Sequence justification correct. ~100 words, right shape.

**Required Fix:** None.

---

#### B12. Describe the star schema and its main components. **[3/3]**
**Student Answer:** Fact table vs dimension table comparison table (holds, content, rows, example, answers). Grain definition included. Denormalisation for performance noted.

**Feedback:** **Excellent.** Unit 2 star schema table reproduced exactly. Grain sentence ("what one row represents") is the mark-winning line. Denormalisation rationale correct.

**Required Fix:** None.

---

#### B13. What is data preprocessing and why is it important for data mining? **[3/3]**
**Student Answer:** Four families listed (cleaning, integration, transformation, reduction) with one operation each. "Why it matters" paragraph: real data is dirty, algorithms assume clean input, 60–80% effort rule, bridge between warehouse and mining.

**Feedback:** **Perfect.** Unit 3's four families all named (trap avoided: not just "cleaning"). Industry rule of thumb quoted. Consequence clearly stated.

**Required Fix:** None.

---

#### B14. Briefly explain the difference between supervised and unsupervised learning. **[3/3]**
**Student Answer:** Comparison table (training data, question, output, needs first, typical use, failure mode). "One line: Classification has a teacher; clustering has none."

**Feedback:** **Perfect.** Unit 3's comparison table reproduced exactly. Memory hook included. Failure modes (overfitting vs arbitrary k) show depth.

**Required Fix:** None.

---

#### B15. List three best practices for dashboard design. **[3/3]**
**Student Answer:** 1) Decision fit — 5-7 KPIs, exception-driven, decision-mapping question. 2) Visual hierarchy — top-left, summary before detail, five-second rule. 3) Clarity and restraint — correct chart type, direct labels, restrained palette, definitions/timestamp/threshold per tile.

**Feedback:** **Perfect.** Unit 4's three factors verbatim with all required sub-points. "Five-second rule" and "definition/timestamp/threshold" are the specific phrases examiners look for.

**Required Fix:** None.

---

#### B16. Outline key challenges organizations face when implementing BI solutions. **[3/3]**
**Student Answer:** Three families: Data (source disagreements, duplicate customers, conflicting definitions), Technical (legacy batch extracts, performance degradation), Organisational (no sponsor, no metric owner, skills gap, dashboard unused).

**Feedback:** **Perfect.** Unit 6's three families with concrete symptoms. "Delivered on time and never used" is the signature closing line.

**Required Fix:** None.

> **Note:** All 6 Group B answers score 3/3. The best 5 count → **15/15**.

---

### GROUP C — Long Answer Questions [3 × 5 = 15] — *Best 3 of 4 counted*

#### C17. Describe a typical data warehouse architecture, naming its major layers and functions. **[5/5]**
**Student Answer:** ASCII diagram (Sources → Staging → Warehouse → Access + Metadata). Five components table (Source systems, Staging area, ETL/integration, EDW, Data marts, Metadata repository). Three architecture variants listed. Dependent vs independent marts distinction.

**Feedback:** **Perfect.** Unit 2's 5-mark skeleton fully satisfied:
- Diagram drawn and labelled (mandatory for "illustrate")
- Five components named with one-line functions
- Three variants named
- Dependent marts preferred with reason
- Metadata repository included
- Layering justification (conflicting requirements) present

**Required Fix:** None.

---

#### C18. Compare and contrast decision trees and Naive Bayes classifiers, mentioning strengths and weaknesses of each. **[5/5]**
**Student Answer:** Comparison table across 9 dimensions (what it learns, model form, key assumption, mixed data types, missing values, overfitting risk, speed/data appetite, interpretability, stability). Strengths/weaknesses for each in bullet form. "Which to choose" rule with held-out set comparison.

**Feedback:** **Perfect.** Unit 3's C18 skeleton fully satisfied:
- Framing line (both supervised classifiers, different objects learned)
- 4+ comparison dimensions (9 provided)
- Strengths and weaknesses for each explicitly separated
- Decision rule with practical guidance
- Nepal anchor context (bank vs telecom) shows applied understanding

**Required Fix:** None.

---

#### C19. Explain association rule mining, including definitions of support and confidence, and give a simple example of an association rule from retail transactions. **[5/5]**
**Student Answer:** Definition of association rule. Worked example (1000 transactions, bread/butter) with Support (12%), Confidence (60%), Lift (1.5), Conviction (1.5). Formulas and readings table. Apriori downward closure explained. Retail example: Diapers → Beer [support=2%, confidence=65%, lift=1.8].

**Feedback:** **Perfect.** Unit 3's C19 skeleton fully satisfied:
- Definition includes "implication X → Y" and "measured by support and confidence"
- Worked example with arithmetic shown
- All four measures (support, confidence, lift, conviction) with formulas
- Lift interpretation (1.5 = 50% more likely than chance)
- Apriori downward closure property stated
- Retail example with all three measures
- Correlational limit acknowledged

**Required Fix:** None.

---

#### C20. Design a dashboard for monthly sales performance for an online retailer: list the key visualizations, metrics (KPIs), and justify their placement and purpose. **[5/5]**
**Student Answer:** Audience/decision stated. ASCII wireframe layout (5 KPIs top strip, 12-month trend, category mix, purchase funnel, return rate, SKU table). Justification table: Tile, Chart, Metric, Purpose (what decision it changes), Why in this position. Three "design not collage" elements: definitions, timestamps, exception thresholds.

**Feedback:** **Perfect.** Unit 4's C20 skeleton fully satisfied:
- Audience and decision in one line (head of sales, budget allocation)
- Layout follows eye: summary → trend → where → diagnostic → detail
- Every tile has chart type, metric, stated decision purpose, placement rationale
- "Three things that make it a design" (definition, timestamp, threshold) — the mark-winning differentiators
- MTD projected to month-end (avoids week-two collapse illusion)

**Required Fix:** None.

> **Note:** All 4 Group C answers score 5/5. The best 3 count → **15/15**.

---

### GROUP D — Comprehensive Answer / Case Analysis [2 × 10 = 20] — *Both compulsory*

#### D21. Retail BI end-to-end approach. **[10/10]**
**Student Answer:** Six components in question's order: Sources (POS, inventory, supplier POs, masters), ETL (nightly sales, frequent stock, staging, DQ rules), Data Model (two facts at different grains, conformed dimensions), Tools (fit-based choice, semantic layer), Visualisation (planning dashboard with named decisions), Governance (definitions, RLS, DQ SLAs, steering group). Integration paragraph (star schema as hinge, one query for sold/have/lead-time). Sequencing (Phase 0-3, value in Phase 2).

**Feedback:** **Perfect.** Unit 6's D21 skeleton fully satisfied:
- All six required components addressed in order
- Each has "choice + why chosen" structure
- Conformed dimensions explicitly called out as the integration hinge
- Star schema with two facts at different grains (order-line/day + product×location/day)
- ETL frequency differentiated (sales vs stock)
- Tool choice justified by fit, not brand
- Dashboard tiles tied to named decisions (reorder, mark down, expedite, reset ROP)
- Governance includes definitions, RLS, DQ SLAs, steering group
- Integration paragraph explains the "one query" value
- Sequencing shows phased value delivery (Phase 2 not end)
- ~380 words, right shape

**Required Fix:** None.

---

#### D22. Healthcare BI phased implementation plan. **[10/10]**
**Student Answer:** Best practices (sector-specific: clinical ownership, governance committee definitions, patient ID, RLS, operational-first). Challenges in three families (Technical: non-interoperable systems, batch extracts, unstructured notes; Organisational: clinician distrust, no analytics staff, split governance; Data-related: inconsistent coding, duplicate patients, missing outcomes, privacy law). Phased plan table (5 phases with milestones). Gate condition (patient identity before clinical metrics). Sequencing rationale (operational before clinical, DQ gate).

**Feedback:** **Perfect.** Unit 6's D22 skeleton fully satisfied:
- Sector-specific best practices (clinical governance committee, patient ID gate, RLS, operational-first)
- Challenges organised by paper's own three families with healthcare-specific examples
- Privacy law cited (Nepal Individual Privacy Act, 2075) — local context mark
- 5-phase plan with evidence milestones (charter signed, dictionary approved, dashboard in huddle, reconciled with audit, adoption target)
- Gate explicitly named (master patient index before Phase 3)
- Sequencing rationale (operational builds trust for clinical; DQ gate slips Phase 3)
- Milestones are evidence not activities (signed, approved, used, reconciled, met)
- ~325 words, right shape

**Required Fix:** None.

---

## Overall Assessment

### Strengths
1. **Definition precision** — Every 1-mark definition matches the unit-mandated wording exactly.
2. **Structure adherence** — Every answer follows the skeleton shape (opening line → points with consequences → closing).
3. **Diagram inclusion** — Architecture questions include ASCII diagrams where "illustrate" is commanded.
4. **Local context** — Nepal anchors used appropriately (banking, privacy law, retail patterns).
5. **Mechanism over adjective** — Misleading charts explained with numbers (lie factor 10×), not vague claims.
6. **Comparison dimensions** — C18 compares on 9 dimensions, not two definitions side-by-side.
7. **Case answers show judgement** — Gates named, sequencing rationalised, success measures included.
8. **No traps triggered** — No tool-only BI definitions, no "cleaning only" preprocessing, no slice/dice confusion, no Excel-as-BI-tool, no big-bang go-live.

### Areas for Improvement (Minor Polish Only)
- **A10 Metadata** — Could explicitly mention "metadata repository" as the warehouse component (Unit 2), but the definition covers it.
- **C19 Conviction** — Formula shown but rarely asked; including it shows depth without penalty.
- **D21/D22 word count** — Both at upper end (~350-380 words). In a 3-hour paper this is fine, but practice writing 10% tighter for time buffer.

---

## Final Score

| Group | Awarded | Maximum |
|-------|---------|---------|
| A | 10 | 10 |
| B | 15 | 15 |
| C | 15 | 15 |
| D | 20 | 20 |
| **Total** | **60** | **60** |

**Percentage: 100%**

**Grade: Distinction (Examiner's Commendation)**

---

## Examiner's Closing Comment

> This script demonstrates complete mastery of the IT 249 syllabus. Every answer matches the unit skeletons, avoids every documented trap, and shows the applied judgement that separates a pass from a distinction. The Group D cases are professionally structured with gates, milestones, and success measures — not student wish-lists. **This is the standard the paper expects.** No fixes required. The candidate is exam-ready.

---

*Evaluation completed under strict TU/FOM marking criteria. All scores reference official unit notes and 2026 model question skeletons.*