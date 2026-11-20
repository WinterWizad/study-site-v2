# IT 249 — Question Bank

**Two official sources for this subject:**

| Source | Status | Where |
|---|---|---|
| **TU 2026 board paper** — the exam actually sat | verbatim below | §"Real paper — TU 2026" |
| **TU/FOM official model question 2026** — the Dean's Office statement of the paper's shape | verbatim in its own file | [`model-question.html`](model-question.html) |

Both are official. They are different documents with different authority: the board paper is what was asked, the model question is what the Dean's Office said would be asked. Neither is a prediction.

> ⚠ Honest limitation: only **one** board paper for this subject exists publicly (the new-syllabus 8th semester was first examined in 2026). The pattern below is an inference from **n=1** — a strong one, because the model question independently confirms the 10/5/3 structure and the unit weighting. It is still not a guarantee.

---

## Real paper — TU 2026

### Group A — Brief answer (10 × 1 = 10)

| # | Question | Unit | Tests |
|---|---|---|---|
| A1 | List any two scope of business intelligence. | 1 | enumeration |
| A2 | Why data in data warehouse must be non volatile? | 2 | 4 characteristics of DW |
| A3 | How does data transformation improve the quality and usability of data in a warehouse? | 2 | ETL, the T |
| A4 | What is data analysis? | 1 | definition, distinguish from mining |
| A5 | Why is data considered as important factor for decision making? | 1 | rationale |
| A6 | What is Data Modelling? | 2 | definition |
| A7 | Define the concept of association rule in datamining. | 3 | definition |
| A8 | What is Data Visualization? | 4 | definition |
| A9 | List any two BI tools. | 5 | recall |
| A10 | What is the limitation of OLAP? | 5 | critique |

### Group B — Short answer (any 5 of 6 × 3 = 15)

| # | Question | Unit |
|---|---|---|
| B1 | Discuss any three importance of business intelligence. | 1 |
| B2 | Explain the ETL process. | 2 |
| B3 | What is the importance of clustering algorithm? Explain with example. | 3 |
| B4 | Discuss any three factor that should be consider to design an effective dashboard for executives. | 4 |
| B5 | How does OLAP differ from traditional database queries in terms of analysis capabilities? | 5 |
| B6 | How poor visualization choices can mislead users? Explain with an example. | 4 |

### Group C — Long answer (any 3 of 4 × 5 = 15)

| # | Question | Unit |
|---|---|---|
| C1 | Explain challenges in BI implementation with example. | 6 |
| C2 | Illustrate and explain data warehouse architecture. | 2 |
| C3 | "A Retail Company wants to analyze customer data to improve sales", explain with example how classification algorithm can be applied to achieve this objective? | 3 |
| C4 | Compare Business Intelligence tools with traditional reporting tools. What makes BI more powerful? Explain. | 5 |

### Group D — Case analysis (20)

> You're on Amazon, and it knows precisely what you want before you do. It's like having a mind reading shopping assistant. Amazon uses data to forecast what products will be super popular. This means they always have the stuff you want ready to ship. Fast delivery, great prices, and a wide selection, that's the Amazon promise.
>
> When Amazon suggests products you might like, it's not a coincidence. They've studied your past purchases and browsing history. Their recommendations make shopping more accessible and more enjoyable. It's as if Amazon is saying, "Hey, we found these cool things that you'll love!"

a. How does Amazon use Business Intelligence to predict product demand?  
b. What types of data are involved, and how do these recommendations influence buying behavior on Amazon?  
c. How do features like personalized suggestions and fast delivery contribute to customer loyalty?  
d. What potential challenges or ethical issues (such as data privacy or over personalization) might arise from collecting and analyzing customer data?

---

## Official model question — coverage of Units 1–5

Full paper: [`model-question.html`](model-question.html). This table is the **checker**: can the unit's notes alone answer the question?

| Q | Model question | Unit | Answerable from that unit's notes alone? |
|---|---|---|---|
| A1 | Define BI | 1 | ✅ |
| A2 | Two benefits in decision-making | 1 | ✅ |
| A3 | What is a data warehouse | 2 | ✅ |
| A4 | What does ETL stand for | 2 | ✅ |
| A5 | Define data mining in one sentence | 3 | ✅ |
| A6 | One classification + one clustering algorithm | 3 | ✅ |
| A7 | One principle of effective data visualization | 4 | ✅ |
| A8 | One popular BI tool | 5 | ✅ §5.2 |
| A9 | What OLAP is used for | 5 | ✅ §5.3 |
| A10 | Metadata in the context of BI | 2 | ✅ |
| B11 | Role of ETL in a BI system | 2 | ✅ |
| B12 | Star schema and its components | 2 | ✅ |
| B13 | Data preprocessing and why it matters | 3 | ✅ |
| B14 | Supervised vs unsupervised learning | 3 | ✅ |
| B15 | Three dashboard best practices | 4 | ✅ |
| B16 | BI implementation challenges | 6 | ✅ §6.3 |
| C17 | Data warehouse architecture, layers and functions | 2 | ✅ |
| C18 | Decision trees **vs** Naive Bayes, strengths and weaknesses | 3 | ✅ **added** — §3.3 now carries the comparison table |
| C19 | Association rule mining + support/confidence + retail example | 3 | ✅ |
| C20 | *Design* a monthly sales dashboard for an online retailer | 4 | ✅ **added** — §4.4 now carries the worked design |
| D21 | End-to-end BI for a mid-size retailer | 2 + 6 | ✅ §6.6 |
| D22 | Healthcare BI platform, phased plan | 6 | ✅ §6.7 |

**Result of the first run of this checker, on 2026-11-18:** two genuine gaps in otherwise QC-passed units — C18 and C20. Both were closed by adding a section, not by patching a sentence. That is the value of the check: Units 1–4 passed a five-check QC and still could not answer two of the official model questions.

## What the model question changed in the notes

| Change | Reason |
|---|---|
| `unit-3` gained §3.4 "Decision tree vs naive Bayes" | C18 asks for a *comparison with strengths and weaknesses*; the unit only named both algorithms in a table |
| `unit-4` gained §4.5 "Design a monthly sales dashboard" | C20 asks you to *design*, not to list principles; the unit taught principles and left the application to the reader |
| Group D rehearsal now covers two shapes | model = 2 × 10 compulsory; 2026 board = 1 × 20. Both are rehearsed |

---

## Heat map — what the paper actually rewards

| Unit | 1-markers | 3-markers | 5-markers | Case | Total marks |
|---|---|---|---|---|---|
| 1 Introduction | 3 | 1 | — | — | 6 |
| 2 Data Warehousing | 3 | 1 | 1 | — | 11 |
| 3 Data Mining | 1 | 1 | 1 | — | 9 |
| 4 Visualisation | 1 | 2 | — | — | 7 |
| 5 BI Tools / OLAP | 2 | 1 | 1 | — | 10 |
| 6 Implementation | — | — | 1 | 20 | 25 |

### Three patterns worth betting on

1. **Every unit produces at least one 1-marker.** There is no "skip a unit" strategy for Group A. Ten marks, six units, no safe omissions — but the 1-markers are always definitions, so the fix is cheap.
2. **Data warehousing is the most examined unit by question count** (5 of 21 questions). Architecture + ETL + the four DW characteristics cover almost all of it.
3. **The case is always implementation + ethics.** The 2026 case asks "how does the company use BI" (units 1–3), "what data" (unit 2), "how does it drive loyalty" (units 4–6), "what are the challenges/ethics" (unit 6). Learn the four-part case skeleton once and it transfers.

---

## Practice set — generated, not real

`[practice — generated]` questions live here once Tier 1 notes are complete. They are written in TU format and marked as such so they are never mistaken for past papers.
