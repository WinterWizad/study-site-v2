# Unit 3 — Data Mining

| | |
|---|---|
| **Lecture hours** | 8 |
| **Marks in 2026 paper** | 9 — one 1-marker, one 3-marker, one 5-marker |
| **Marks in model question** | 18 — A5, A6, B13, B14, C18, C19 (heaviest unit after Unit 6) |
| **Difficulty** | ★★★★☆ — ideas are intuitive, vocabulary is dense, classification/clustering/association blur under pressure |
| **Exam yield** | 🔴 high — every mark band tested, nothing optional |
| **Prerequisite** | Unit 1 (analysis vs mining), Unit 2 (mining uses warehouse data; preprocessing is the bridge) |
| **Syllabus** | Data mining concepts · Preprocessing techniques · Classification and clustering · Association rule mining |

> **Read this first:** This is the only unit where the paper asks you to *apply* an algorithm to a business problem (C3, C18 in model). The Amazon case's recommendation engine is association rules plus classification in a marketing hat. Learn the three techniques as three answers to three different questions, and both C3 and the case part (b) become routine.

---

## Coverage Map

```
3.1 Data Mining Definition
├── 4 keywords: Automated, Previously unknown, Potentially useful, Large datasets
├── Memory hook: Mining finds a question you didn't know to ask
└── Trap: Mining ≠ querying

3.2 Preprocessing (4 families)
├── Cleaning: missing, noise, duplicates, outliers
├── Integration: merge sources, resolve identity
├── Transformation: normalise, discretise, encode, aggregate
└── Reduction: attribute selection, PCA, sampling

3.3 Classification & Clustering 🎯 3-mark / 🎯 5-mark
├── Classification = supervised, predicts known label
├── Clustering = unsupervised, discovers unknown groups
├── Decision tree: readable rules, overfits, needs pruning
├── Naïve Bayes: probabilistic, fast, independence assumption
├── k-means: centroid-based, needs k, numeric only
└── DBSCAN: density-based, finds arbitrary shapes

3.4 Association Rules 🎯 1-mark / 🎯 5-mark
├── Rule: X → Y with support, confidence, lift
├── Worked example: 1000 transactions, bread/butter
├── Apriori: downward closure property
└── Trap: correlation ≠ causation
```

---

## 3.1 What Data Mining Is — And What It Is Not 🎯 1-mark

> **Data mining is the automated discovery of previously unknown, potentially useful patterns in large datasets, using statistical and machine-learning techniques.**

Four words in that definition carry the marks:

| Word | What it excludes |
|---|---|
| **Automated** | not a human eyeballing a pivot table |
| **Previously unknown** | not last month's sales report — that is already known |
| **Potentially useful** | not a coincidence in noise; the pattern must support a decision |
| **Large datasets** | not five rows in Excel — techniques earn their keep at scale |

🧠 **Memory hook:** *Reporting answers a question you had; mining finds a question you didn't know to ask.*

⚠ **Trap:** "Data mining is extracting data from a database." That is **querying**. Mining is **pattern discovery**; nothing is "mined out" in the sense of removal.

🎯 **Exam hook:** A5/A7 ask for the definition in one sentence. Write the four keywords above.

### Mining vs. What Students Confuse It With 🎯 1-mark

This table is the highest-value thing in the unit — 1-markers come from these edges:

| | What it does | Output |
|---|---|---|
| **SQL query / reporting** | retrieves records matching a condition you specified | rows you asked for |
| **OLAP** | aggregates known measures along known dimensions | a cube cell; drill-down |
| **Statistics** | tests a hypothesis you formulated in advance | a p-value, confidence interval |
| **Data mining** | searches for structure you did **not** specify | a model, rule, cluster, segment |

### Where Mining Sits in the Pipeline (KDD)

```
SELECTION → PREPROCESSING → TRANSFORMATION → MINING → EVALUATION
   │              │               │            │          │
pick tables   clean, smooth    normalise,    classify   pattern real?
& records     noise, dedupe    discretise    cluster    or overfit?
                                   encode
```

This whole chain is **KDD — Knowledge Discovery in Databases**. Mining is one step of five. The exam likes the distinction: *KDD is the process; data mining is the algorithm inside it.*

🇳🇵 **Nepal anchor:** A Kathmandu e-commerce operation (Daraz-style) has order, clickstream and support-ticket tables. Selecting those three, cleaning duplicates, encoding categories is KDD. Finding "customers who buy a phone case within 14 days of a handset are 3× less likely to return it" is the mining step.

---

### A7 · "Define the concept of association rule in data mining." [1] 🎯 1-mark

> An association rule is an implication X → Y meaning transactions containing itemset X also tend to contain Y, measured by support and confidence.

*(25 words. Support and confidence are named because they make it a rule, not a coincidence. No formulas, no Apriori.)*

---

## 3.2 Data Preprocessing — The Syllabus Bullet Students Skip 🎯 3-mark

Real data is dirty. Missing values, inconsistent dates, same customer twice, two currencies, outliers from a glitch. Mining algorithms assume clean, consistent, numeric input — feed them garbage and they return confident garbage. Industry rule: **preprocessing is 60–80% of the effort.**

### The Four Families — Name Them, Then Say What Each Fixes

| Family | What it fixes | Typical operations |
|---|---|---|
| **Data cleaning** | wrong or missing values | fill missing (mean/mode/predict), smooth noise (binning), remove duplicates, treat outliers |
| **Data integration** | same entity in several systems | merge sources, resolve identity and naming conflicts, remove redundant attributes |
| **Data transformation** | wrong shape or scale for algorithm | normalisation (min–max, z-score), discretisation (continuous → bins), encoding, aggregation, derived attributes |
| **Data reduction** | too much data to compute on | attribute selection, dimensionality reduction (PCA), sampling, numerosity reduction |

⚠ **Trap:** Answering "preprocessing = cleaning." Cleaning is **one of four families**. If the question says *techniques* (plural), naming cleaning alone caps you at ~⅓ marks.

⚠ **Second trap:** Normalisation is **not optional**. If a 5-marker asks why k-means gave nonsense segments, the answer is usually unscaled attributes or an unstandardised `k`.

### The Three Operations Examiners Most Often Ask For

1. **Missing values** — delete record (loses data), impute mean/median/mode (fast, distorts variance), or predict from other attributes (best, most work).
2. **Normalisation** — put attributes on a comparable scale. Without it, rupees (0–500,000) dominates years (0–10) in any distance-based method (k-means, k-NN). Min–max scales to [0,1]; z-score centres on mean 0, std dev 1.
3. **Discretisation** — turn continuous into categories (`age 18–25, 26–35…`), which decision trees and association rules need for human-readable rules.

---

### B13 · "What is data preprocessing and why is it important for data mining?" [3] 🎯 3-mark

> *Shape: name four families → one line why it matters → one concrete example. ~110 words.*

> Data preprocessing prepares raw data for mining through four families: **cleaning** (fix missing values, remove duplicates, smooth noise), **integration** (merge sources, resolve identity conflicts), **transformation** (normalise, discretise, encode categories), and **reduction** (attribute selection, PCA, sampling). It matters because mining algorithms assume clean, numeric, consistent input — feed them dirty data and they return confident garbage. For example, k-means clustering on unscaled attributes lets rupees dominate years, producing meaningless segments. Industry estimates put preprocessing at 60–80% of actual effort.

---

## 3.3 Classification and Clustering — The Distinction The Paper Tests Directly 🎯 3-mark / 🎯 5-mark

One line carries the whole unit:

> **Classification predicts a known label; clustering discovers unknown groups.**

| | **Classification** | **Clustering** |
|---|---|---|
| Learning type | **supervised** — training data carries the answer | **unsupervised** — no labels |
| Question | "which known class?" | "what natural groups exist?" |
| Output | class label + inspectable model | clusters + membership |
| Needs first | labelled historical examples | only attributes + similarity measure |
| Typical use | churn, fraud, credit scoring, campaign response | customer segmentation, anomaly detection, document grouping |
| Evaluation | accuracy, confusion matrix, precision, recall, F1 | cohesion vs separation, silhouette, domain review |
| Failure mode | **overfitting** — 99% on training, useless in production | arbitrary `k`; statistically real but commercially meaningless |

🧠 **Memory hook:** *Classification has a teacher; clustering has none.*

🎯 **Exam hook:** B14 asks for the difference between supervised and unsupervised. This table is the answer.

### Algorithms Worth Naming (Name + One Property Each)

| Technique | Algorithms | Property to quote |
|---|---|---|
| Classification | **decision tree** (ID3, C4.5, CART) | produces readable if–then rules; default exam answer |
| | **naïve Bayes** | probabilistic, very fast, assumes attributes independent |
| | **k-NN** | classifies by majority label of k nearest records; no model built |
| | **logistic regression / SVM** | strong on clean numeric data; less interpretable |
| Clustering | **k-means** | centroid-based, fast, needs `k` in advance, numeric only |
| | **hierarchical** | builds dendrogram; no `k` needed; slower on large data |
| | **DBSCAN** | density-based; finds arbitrary shapes, labels noise as outliers |

---

### Decision Tree vs Naïve Bayes — The Comparison C18 Asks For 🎯 5-mark

These are the two algorithms the syllabus names first. The model question asks you to **compare and contrast**, not define them. Two definitions side by side score ~2/5; marks are in the **dimensions**.

| Dimension | **Decision tree** (ID3, C4.5, CART) | **Naïve Bayes** |
|---|---|---|
| **What it learns** | hierarchy of if–then splits maximising information gain (or reducing Gini) | probability per class from conditional frequency of each attribute value |
| **Model form** | a tree you can read as rules | a table of probabilities you cannot read as a story |
| **Key assumption** | none about independence; interactions captured by deeper splits | every attribute **conditionally independent** given the class — usually false, hence *naïve* |
| **Mixed data types** | numerics and categories natively | categories natively; numerics need Gaussian or discretised variant |
| **Missing values** | needs imputation or surrogate splits | simply omit that attribute for that record |
| **Overfitting risk** | **high** — deep tree memorises; needs pruning or depth limit | **low** — very few parameters |
| **Speed, data appetite** | slower to train; needs enough records per split | one pass; works on a few hundred records |
| **Interpretability** | high — that is its selling point | low |
| **Stability** | unstable: slightly different sample → different tree | stable |

**Strengths and weaknesses, in the form the question wants:**

- **Decision tree — strengths:** produces rules a manager can audit and act on ("if recency < 30 days and basket > NPR 2,000, target with loyalty offer"); needs no scaling; captures interactions and non-linear boundaries; handles mixed types.
- **Decision tree — weaknesses:** overfits unless pruned; unstable; biased toward attributes with many distinct values; small data change restructures whole tree; poor at smooth linear relationships (approximates with staircase).
- **Naïve Bayes — strengths:** extremely fast, trains on tiny data, scales to hundreds of attributes, naturally handles text and high-dimensional sparse data (spam filter); robust to irrelevant attributes.
- **Naïve Bayes — weaknesses:** independence assumption almost always violated; correlated attributes get **double-counted**, making probabilities over-confident; cannot represent an interaction unless engineered as a feature; continuous attributes force a distributional guess.

**Which to choose — the line that earns the last mark:**

> Choose a **decision tree** when the answer must be explained to a decision-maker, attributes are mixed, and there is enough data to prune honestly. Choose **naïve Bayes** when attributes are many, records are few, and speed or text data dominate. In practice you fit both and compare on a held-out set — because the independence assumption's damage cannot be predicted from the data dictionary.

🇳🇵 **Nepal anchor:** A bank scoring loan applications for a cooperative will usually prefer the tree, because the loan officer must justify a rejection to the borrower and regulator — "income below X and existing EMIs above Y" is defensible; a posterior probability is not. A telecom filtering Nepali-language SMS spam will prefer naïve Bayes — tens of thousands of token attributes, must run in milliseconds.

---

### The Example That Makes Clustering Click (and Answers B3) 🎯 3-mark

Take a grocery chain's customers and cluster on **recency, frequency, monetary value (RFM)**. Nobody tells the algorithm how many customer types exist. Three groups fall out:

- Weekly high-spend families → loyalty top-up, fresh-produce offers
- Weekend bulk buyers → volume discounts, larger pack sizes
- Dormant one-time shoppers → win-back voucher, reactivation email

The segments came **from the data**, not from a manager's guess. That sentence is the "importance" the 3-marker asks for.

🇳🇵 **Nepal anchor:** A Kathmandu retail chain or digital wallet can cluster users on transaction frequency, average ticket, merchant category. The output that matters is not the cluster number — it is that "dormant but previously high-value" becomes a group you can *name*, *count* and *target*.

---

### B3 · "What is the importance of clustering algorithm? Explain with example." [3] 🎯 3-mark

> *Shape: one line what clustering does → 2–3 importance points → one concrete example. ~115 words.*

> Clustering groups records so members of a group are similar to each other and different from other groups, **without any pre-existing labels**. Its importance follows from that: it discovers segments nobody defined in advance, it reduces a heterogeneous customer base into a few homogeneous groups that can be targeted differently, and it scales to millions of records while surfacing anomalies as small distant clusters. For example, a Kathmandu grocery chain clustering customers on recency, frequency and spend obtains three groups — weekly high-spend families, weekend bulk buyers, and dormant one-time shoppers — and runs a loyalty offer, a volume discount and a win-back voucher respectively. The segments came from the data, not from a manager's guess.

---

### C3 · "A Retail Company wants to analyze customer data to improve sales — explain with example how classification algorithm can be applied." [5] 🎯 5-mark

> *Shape: restate objective as prediction → define label → list features → name algorithm + train/eval → state business action → one caution. ~230 words.*

> The retailer's real question is *which customers will buy*, so the task is **classification** — the outcome is a known category, not a free-form pattern.
>
> **Define the label.** Using two years of history, label each customer "responded to a promotion" or "did not". That label makes the problem supervised.
>
> **Build the features.** Recency of last purchase, purchase frequency, monetary value, average basket, category affinity, channel preference, discount sensitivity — all from the customer's own transaction record.
>
> **Train and evaluate.** Fit a decision tree, the practical choice here because it yields readable rules such as *"if recency < 30 days AND average basket > NPR 2,000 then likely responder"*. Hold back a test set, judge with confusion matrix, precision and recall rather than raw accuracy, since responders are typically a minority class.
>
> **Act on the scores.** Score the entire base and spend only on high-probability responders, while routing high-value customers who score as likely to lapse into a retention programme.
>
> **The gain** is measurable: the same campaign budget reaches more likely buyers, and unprofitable discounts stop going to customers who would have bought anyway.
>
> **The caution:** the model learns past behaviour, so it must be retrained as demand shifts, and it must not be used to justify discrimination on protected attributes.

⚠ C3 says *"explain with example"*. A generic description of decision trees with no retailer, no label, no campaign scores ~2/5. Marks are in the label → features → evaluation → action chain.

---

### C18 · Model Question — "Compare and contrast decision trees and Naive Bayes classifiers, mentioning strengths and weaknesses of each." [5] 🎯 5-mark

> *Shape: one framing line → 4–5 comparison dimensions → strengths/weaknesses each → rule for choosing. ~230 words. This is the answer to write if the paper asks for a comparison; do not spend it on C3, which wants an application.*

> Both are **supervised classifiers** that learn from labelled history to assign a known class, but they learn different objects. A decision tree learns a hierarchy of if–then splits chosen to maximise information gain, so it can represent interactions between attributes; naïve Bayes learns a probability per class from the conditional frequency of each attribute value, on the assumption that attributes are independent given the class.
>
> **Compare:** a tree is readable as rules and handles mixed numeric and categorical data natively, where naïve Bayes is opaque and needs a distributional assumption for continuous attributes. A tree overfits easily and is unstable; naïve Bayes has few parameters and overfits rarely. Naïve Bayes trains in a single pass and copes with hundreds of attributes and small datasets; a tree is slower and needs enough records on both sides of every split.
>
> **Strengths — tree:** interpretable, no scaling needed, captures non-linearity and interactions. **Weaknesses — tree:** overfits without pruning, unstable, biased toward attributes with many distinct values.
>
> **Strengths — naïve Bayes:** very fast, works on tiny data, strong on text and high-dimensional sparse data. **Weaknesses — naïve Bayes:** the independence assumption is usually false, so correlated attributes are double-counted and probabilities become over-confident; it cannot express an interaction unless engineered as a feature.
>
> **Choose** a tree when the result must be explained and data is plentiful; naïve Bayes when attributes are many, records are few and speed matters. In practice, fit both and compare on a held-out set.

---

## 3.4 Association Rule Mining — A7 Lives Here 🎯 1-mark / 🎯 5-mark

> **An association rule is an implication X → Y meaning transactions containing itemset X also tend to contain Y, measured by support and confidence.**

That is the 1-mark answer (25 words). Do not add the Apriori explanation to a 1-mark question.

### The Four Measures — With a Worked Example You Can Reproduce

Setup: **1,000 transactions.** Bread in **200**. Butter in **400**. Bread **and** butter in **120**.

| Measure | Formula | Here | Reads as |
|---|---|---|---|
| **Support** | `count(X ∪ Y) / N` | 120/1000 = **12%** | how often the combination occurs at all |
| **Confidence** | `support(X ∪ Y) / support(X)` | 120/200 = **60%** | of bread buyers, how many also bought butter |
| **Lift** | `confidence / support(Y)` | 0.60/0.40 = **1.5** | 50% more likely than chance → positive association |
| **Conviction** | `(1 − support(Y)) / (1 − confidence)` | 0.6/0.4 = **1.5** | how much the rule would be wrong without the association |

Reading the numbers correctly wins marks:

- **lift = 1** → X and Y independent; rule useless.
- **lift > 1** → positive association (useful case).
- **lift < 1** → they *substitute* for each other; promotion on one cannibalises the other. This is a real finding, not a failed rule.
- **High confidence with low support** → rule fires almost every time but on almost nobody. Commercially worthless. Always quote support **and** confidence together.

### Apriori — How Frequent Itemsets Are Found

Brute force is impossible: with *n* items there are 2ⁿ candidates. Apriori uses one property:

> **Downward closure (anti-monotonicity): if an itemset is infrequent, every superset of it is also infrequent.**

Algorithm alternates two steps, level by level:

1. **Join** — combine frequent *k*-itemsets into candidate (*k*+1)-itemsets.
2. **Prune** — discard any candidate containing an infrequent subset, then count support on the database and keep those above minimum support.

Frequent itemsets → generate rules → keep only rules above **minimum confidence**. Both thresholds are business decisions, not statistics: lower support = more rules = more noise.

⚠ **Trap:** Saying "Apriori finds rules with high accuracy." There is no accuracy. It finds rules above **support** and **confidence** thresholds; **lift** tells you whether the rule beats chance.

### Market Basket Analysis, and the Honest Limit

The retail application is **market basket analysis**: what is bought together, used for shelf layout, bundles, cross-sell recommendations, promotion design. The 2026 case's Amazon recommendations are exactly this idea, industrialised.

The limit worth one line: association rules are **aggregate and correlational**. "Customers who buy nappies buy beer" says nothing about *why*, and nothing about any individual customer. Claiming causation from a rule is the fastest way to lose the evaluation mark.

---

## 3.5 Traps

| Trap | Why it costs marks | Fix |
|---|---|---|
| Calling clustering "supervised" | inverts the only distinction the paper tests | classification has labels, clustering does not |
| "Data mining = extracting data" | that is querying; definition mark is for *pattern discovery* | automated discovery of previously unknown, useful patterns in large data |
| Preprocessing answered as "cleaning" only | there are four families | cleaning · integration · transformation · reduction |
| Quoting confidence without support | a rule that fires on 3 customers | always report support *and* confidence, then lift |
| "Lift < 1 means the rule failed" | it means substitution — a real finding | lift < 1 = negative association, useful for cannibalisation |
| Confusing support of rule with support of X | arithmetic goes wrong | support(X→Y) = count(X∪Y)/N; support(X) = count(X)/N |
| Describing Apriori as measuring "accuracy" | wrong vocabulary | support and confidence thresholds; lift for chance |
| Claiming a rule explains *why* | correlation is not causation | rules are aggregate and correlational — say so explicitly |
| Reporting 99% training accuracy as success | that is overfitting, not performance | quote test-set precision/recall |
| Answering C3 with theory only | question says "with example" | label → features → train → evaluate → act |
| Forgetting normalisation when asked why k-means misbehaves | standard cause | unscaled attributes distort distance, big-unit attributes dominate |
| Answering C18 with two definitions side by side | verb is **compare and contrast** | compare on dimensions: what is learned, assumption, overfitting, interpretability, speed, data appetite |
| Calling naïve Bayes "better because it uses probability" | its probabilities are over-confident when attributes correlate | name the independence assumption and its cost, then say when it still wins |

---

## 3.6 Self-Test (Answers Collapsed)

1. Define data mining in one sentence and name the one word that distinguishes it from reporting. *(1 mark)*
2. Name the four families of data preprocessing and one operation from each. *(3 marks)*
3. Distinguish classification from clustering in two lines. *(1–3 marks)*
4. In 1,000 transactions, 300 contain tea, 150 contain tea and sugar, 500 contain sugar. Compute support, confidence, lift for tea → sugar, and say what the lift means. *(3 marks)*
5. State the downward-closure property Apriori relies on, and why it matters computationally. *(3 marks)*
6. Name one classification algorithm and one clustering algorithm, each with one distinguishing property. *(1–3 marks)*
7. 🇳🇵 A Kathmandu grocery chain has 200,000 loyalty transactions and wants to know: which products to place together, which customers to target, which customers are about to leave. Name the mining technique for each. *(5 marks — mini case)*
8. Compare decision trees and naïve Bayes on four dimensions, and say which you would use to explain a loan rejection to a borrower. *(5 marks)*

<details>
<summary>Answers</summary>

1. "Data mining is the automated discovery of previously unknown, potentially useful patterns in large datasets." The distinguishing word is **unknown** — reporting answers questions you already had; mining finds structure you did not specify.
2. **Cleaning** (impute missing, remove duplicates) · **integration** (merge sources, resolve identity) · **transformation** (normalise, discretise, encode) · **reduction** (attribute selection, sampling, PCA).
3. Classification is supervised: a labelled training set teaches a model to assign a known class. Clustering is unsupervised: no labels exist, the algorithm discovers groups of similar records itself.
4. support(tea ∪ sugar) = 150/1000 = **15%**; support(tea) = 300/1000 = 30%, so confidence = 150/300 = **50%**; support(sugar) = 500/1000 = 50%, so lift = 0.50/0.50 = **1.0**. Lift of exactly 1 means tea and sugar are independent — buying one tells you nothing about the other. (Note how a 50% confidence rule looks impressive and is worthless.)
5. If an itemset is infrequent, all its supersets are also infrequent. The algorithm prunes entire branches of the search space and never counts them, turning an exponential 2ⁿ search into something tractable.
6. Classification: **decision tree** — produces interpretable if–then rules. Clustering: **k-means** — centroid-based and fast, but requires `k` in advance and numeric, normalised attributes.
7. Products placed together → **association rule mining** (market basket, Apriori). Customers to target → **clustering** (RFM segmentation) or **classification** if a specific outcome like "will respond" is already known. Customers about to leave → **classification** (churn prediction with labelled "churned" history) — the only one needing a label.
8. **What is learned:** a tree of if–then splits vs a class-conditional probability table. **Assumption:** none vs conditional independence of attributes. **Overfitting:** high, needs pruning vs low, few parameters. **Interpretability:** high vs low. Use the **decision tree** for a loan rejection: "income below NPR 25,000 and existing EMIs above 40% of income" is a reason a borrower and regulator can both inspect; a posterior probability is not a reason, it is a verdict with no evidence attached.

</details>

---

## 3.7 Sixty-Second Check

Close this file and, on a blank page:

- [ ] Define data mining, including the word *unknown*
- [ ] Name the four preprocessing families
- [ ] Say classification vs clustering in one sentence each
- [ ] Write support, confidence and lift formulas from memory
- [ ] Say what lift = 1 and lift < 1 mean
- [ ] Name one classification and one clustering algorithm with a property
- [ ] State the downward-closure property in one line
- [ ] Compare decision tree and naïve Bayes on four dimensions, with one weakness each

If all eight are there, you can answer A5, A6, A7, B3, B13, B14, C3 and C18 — 18 marks across the 2026 paper and the model question, and the only unit where the paper asks you to *apply* something.

---

*Sources: TU FOM syllabus (IT 249, Unit 3, 8 LHs) · TU 2026 paper (A7, B3, C3) · TU/FOM model question 2026 (A5, A6, B13, B14, C18, C19) · Support/confidence/lift/conviction definitions, Apriori downward-closure, decision-tree/naïve-Bayes comparison cross-checked against standard literature (Agrawal & Srikant; Han, Kamber & Pei; Witten, Frank & Hall — all syllabus-level readings). Worked example arithmetic computed in this file.*