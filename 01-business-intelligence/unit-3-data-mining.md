# Unit 3 — Data Mining

| | |
|---|---|
| **Lecture hours** | 8 |
| **Marks carried in 2026 paper** | **9** — one 1-marker, one 3-marker, one 5-marker (all three answer lengths) |
| **Marks in the official model question** | **18 attempted** (A5, A6, B13, B14, C18, C19) — the heaviest unit in the model paper after Unit 6 |
| **Difficulty** | ★★★★☆ — the ideas are intuitive, the vocabulary is dense, and classification/clustering/association rules blur together under exam pressure |
| **Exam yield** | 🔴 high — every mark band is tested, so nothing here is optional |
| **Prerequisite** | Unit 1 (analysis vs mining) and Unit 2 (this unit mines the warehouse's data; preprocessing is the bridge) |
| **Syllabus bullets** | Introduction to data mining concepts · Data preprocessing techniques · Classification and clustering algorithms · Association rule mining |

> **Why this unit is worth more than 9 marks:** it is the only unit where the paper asks *you* to apply an algorithm to a business problem (C3, and C18 in the model question). That is also the skill Group D rewards — the Amazon case's recommendation engine is association rules plus classification, wearing a marketing hat. Learn the three techniques as three answers to three different questions, and both C3 and part (b) of the case become routine.

---

## 3.1 What data mining is — and what it is not

> **Data mining is the automated discovery of previously unknown, potentially useful patterns and relationships in large datasets, using statistical, mathematical and machine-learning techniques.**

Four words in that definition are doing the work, and each is worth a mark in a 3-marker:

| Word | What it excludes |
|---|---|
| **Automated** | not a human eyeballing a pivot table |
| **Previously unknown** | not a report of last month's sales — that is already known |
| **Potentially useful** | not a coincidence in noise; the pattern must support a decision |
| **Large datasets** | not five rows in Excel — the techniques earn their keep at scale |

### Data mining vs the three things students confuse it with

This table is the single highest-value thing in the unit, because 1-markers are built from exactly these edges:

| | What it does | Output |
|---|---|---|
| **SQL query / reporting** | retrieves records that match a condition you already specified | rows you asked for |
| **OLAP** | aggregates and slices known measures along known dimensions | a cube cell; drill-down |
| **Statistics** | tests a hypothesis you formulated in advance | a p-value, a confidence interval |
| **Data mining** | searches for structure you did *not* specify in advance | a model, rule, cluster or segment |

🧠 **Memory hook:** *reporting answers a question you had; mining finds a question you did not know to ask.*

⚠ **The trap that costs the 1-mark:** "data mining is extracting data from a database." That is *querying*. Mining is the **pattern discovery** step; nothing is "mined out" of the data in the sense of removal.

### Where mining sits in the pipeline (KDD)

```text
 SELECTION        PREPROCESSING       TRANSFORMATION        MINING          EVALUATION
┌──────────┐     ┌──────────────┐    ┌───────────────┐   ┌───────────┐   ┌────────────┐
│ pick the │ ──► │ clean: fix   │ ──►│ normalise,    │──►│ classify  │──►│ is the     │
│ relevant │     │ missing,     │    │ discretise,   │   │ cluster   │   │ pattern    │
│ tables & │     │ smooth noise,│    │ encode, reduce│   │ associate │   │ real, or   │
│ records  │     │ de-duplicate │    │ attributes    │   │           │   │ overfit?   │
└──────────┘     └──────────────┘    └───────────────┘   └───────────┘   └────────────┘
                                                                              │
                                                     knowledge / action ◄──────┘
```

This whole chain is **KDD — Knowledge Discovery in Databases**. Mining is one step of five. The exam likes the distinction: *KDD is the process; data mining is the algorithm inside it.*

🇳🇵 **Nepal anchor:** a Kathmandu e-commerce operation (Daraz-style) has order, clickstream and support-ticket tables. Selecting those three, cleaning the duplicates and test orders, and encoding the categories is KDD; finding "customers who buy a phone case within 14 days of a handset are 3× less likely to return it" is the mining step.

---

## 3.2 Data preprocessing — the syllabus bullet students skip, and the cheapest place to lose 3 marks

Reality check first: real data is dirty. Missing values, inconsistent dates, the same customer entered twice, amounts in two currencies, outliers from a system glitch. Mining algorithms assume clean, consistent, numeric input — feed them garbage and they return confident garbage. Industry rule of thumb: **preprocessing is 60–80% of the actual effort.**

### The four families — name them, then say what each fixes

| Family | What it fixes | Typical operations |
|---|---|---|
| **Data cleaning** | wrong or missing values | fill missing (mean/mode/prediction), smooth noise (binning, regression), remove duplicates, treat outliers |
| **Data integration** | the same entity in several systems | merge sources, resolve identity and naming conflicts, remove redundant attributes |
| **Data transformation** | wrong shape or scale for the algorithm | normalisation (min–max, z-score), discretisation (continuous → bins), encoding categories, aggregation, derived attributes |
| **Data reduction** | too much data to compute on | attribute selection, dimensionality reduction (PCA), sampling, numerosity reduction |

### The three operations examiners most often ask you to name

1. **Missing values** — delete the record (loses data), impute the mean/median/mode (fast, distorts variance), or predict it from other attributes (best, most work).
2. **Normalisation** — put attributes on a comparable scale. Without it, an attribute measured in rupees (range 0–500,000) dominates one measured in years (0–10) in any distance-based method such as k-means or k-NN. Min–max scales to [0,1]; z-score centres on mean 0, standard deviation 1.
3. **Discretisation** — turn a continuous value into categories (`age 18–25, 26–35, …`), which is what a decision tree or association rule needs in order to produce human-readable rules.

⚠ **Trap:** answering "preprocessing = cleaning". Cleaning is one of four families. If the question says *techniques* (plural), naming cleaning alone caps you at about a third of the marks.

⚠ **Second trap, and it is a real one:** normalisation is **not** optional decoration. If a 5-marker asks why k-means gave nonsense segments, the answer is usually unscaled attributes or an unstandardised `k`.

---

## 3.3 Classification and clustering — the distinction the paper tests directly

One line, and it carries the whole unit:

> **Classification predicts a known label; clustering discovers unknown groups.**

| | **Classification** | **Clustering** |
|---|---|---|
| Learning type | **supervised** — training data carries the answer | **unsupervised** — no labels at all |
| Question | "which known class does this belong to?" | "what natural groups exist?" |
| Output | a class label + a model you can inspect | a set of clusters + membership |
| Needs first | labelled historical examples | only the attributes and a similarity measure |
| Typical use | churn prediction, fraud, credit scoring, "will respond to campaign" | customer segmentation, anomaly detection, document grouping |
| Evaluation | accuracy, confusion matrix, precision, recall, F1 | cohesion vs separation, silhouette, domain review |
| Failure mode | **overfitting** — 99% on training data, useless in production | a `k` that is arbitrary; clusters that are statistically real but commercially meaningless |

🧠 **Memory hook:** *classification has a teacher; clustering has none.*

### The algorithms worth naming (name + one property each)

| Technique | Algorithms | Property to quote |
|---|---|---|
| Classification | **decision tree** (ID3, C4.5, CART) | produces readable if–then rules; the default answer in an exam |
| | **naïve Bayes** | probabilistic, very fast, assumes attributes independent |
| | **k-NN** | classifies by the majority label of the k nearest records; no model built |
| | **logistic regression / SVM** | strong on clean numeric data; less interpretable |
| Clustering | **k-means** | centroid-based, fast, needs `k` chosen in advance, numeric attributes |
| | **hierarchical** | builds a dendrogram; no `k` needed; slower on large data |
| | **DBSCAN** | density-based; finds arbitrary shapes and labels noise as outliers |

### Decision tree vs naïve Bayes — the comparison C18 asks for

These are the two algorithms the syllabus names first, and the model question asks you to hold them against each other rather than define them. A comparison answered as two definitions scores about 2/5; the marks are in the **dimensions**.

| Dimension | **Decision tree** (ID3, C4.5, CART) | **Naïve Bayes** |
|---|---|---|
| **What it learns** | a hierarchy of if–then splits chosen to maximise information gain (or reduce Gini impurity) | a probability per class, from the conditional frequency of each attribute value inside that class |
| **Model form** | a tree you can read aloud as rules | a table of probabilities you cannot read as a story |
| **Key assumption** | none about attribute independence; interactions are captured automatically by deeper splits | every attribute is **conditionally independent** of the others given the class — usually false, hence *naïve* |
| **Mixed data types** | numerics and categories natively | categories natively; numerics need a Gaussian or discretised variant |
| **Missing values** | needs imputation or surrogate splits | simply omit that attribute for that record |
| **Overfitting risk** | **high** — a deep tree memorises; requires pruning or a depth/size limit | **low** — very few parameters to fit |
| **Speed and data appetite** | slower to train; each split needs enough records on both sides | one pass over the data; works on a few hundred records |
| **Interpretability** | high — that is its selling point | low |
| **Stability** | unstable: a slightly different sample can produce a different tree | stable |

**Strengths and weaknesses, in the form the question wants:**

- **Decision tree — strengths:** produces rules a manager can audit and act on ("if recency < 30 days and basket > NPR 2,000, target with the loyalty offer"); needs no scaling or distributional assumption; captures interactions and non-linear boundaries; handles mixed attribute types.
- **Decision tree — weaknesses:** overfits unless pruned; unstable; biased toward attributes with many distinct values; a small change in the data can restructure the whole tree; poor at expressing smooth linear relationships, which it approximates with a staircase of splits.
- **Naïve Bayes — strengths:** extremely fast, trains on tiny datasets, scales to hundreds of attributes, naturally handles text and high-dimensional sparse data (the classic spam filter); robust to irrelevant attributes.
- **Naïve Bayes — weaknesses:** the independence assumption is almost always violated, and correlated attributes get **double-counted**, which makes the probabilities over-confident; it cannot represent an interaction between two attributes unless the combination is encoded as a feature; continuous attributes force a distributional guess.

**Which to choose — the line that earns the last mark:**

> Choose a **decision tree** when the answer has to be explained to a decision-maker, when attributes are mixed, and when there is enough data to prune honestly. Choose **naïve Bayes** when attributes are many, records are few, and speed or text data dominate. In practice you fit both and compare them on a held-out set — because the independence assumption's damage cannot be predicted from the data dictionary.

🇳🇵 **Nepal anchor:** a bank scoring loan applications for a cooperative will usually prefer the tree, because the loan officer must justify a rejection to the borrower and to the regulator — "income below X and existing EMIs above Y" is defensible, a posterior probability is not. A telecom filtering Nepali-language SMS spam will prefer naïve Bayes, because there are tens of thousands of token attributes and it must run in milliseconds on every message.

### The example that makes clustering click (and answers B3)

Take a grocery chain's customers and cluster on **recency, frequency and monetary value** (RFM). Nobody tells the algorithm how many types of customer exist. Three groups fall out:

- weekly high-spend families → loyalty top-up, fresh-produce offers
- weekend bulk buyers → volume discounts, larger pack sizes
- dormant one-time shoppers → win-back voucher, reactivation email

The segments came **from the data**, not from a manager's guess. That single sentence is the "importance" the 3-marker is asking for.

🇳🇵 **Nepal anchor:** a Kathmandu retail chain or a digital wallet can cluster users on transaction frequency, average ticket and merchant category. The output that matters is not the cluster number — it is that "dormant but previously high-value" becomes a group you can *name*, *count* and *target*, which is why clustering is a business tool and not just a statistics exercise.

---

## 3.4 Association rule mining — A7 lives here

> **An association rule is an implication X → Y meaning transactions that contain itemset X also tend to contain Y, measured by support and confidence.**

That is the 1-mark answer (25 words). Do not add the Apriori explanation to a 1-mark question.

### The four measures — with a worked example you can reproduce in the hall

Setup: **1,000 transactions.** Bread appears in **200**. Butter appears in **400**. Bread *and* butter appear together in **120**.

| Measure | Formula | Here | Reads as |
|---|---|---|---|
| **Support** | `count(X ∪ Y) / N` | 120/1000 = **12%** | how often the combination occurs at all |
| **Confidence** | `support(X ∪ Y) / support(X)` | 120/200 = **60%** | of bread buyers, how many also bought butter |
| **Lift** | `confidence / support(Y)` | 0.60/0.40 = **1.5** | 50% more likely than chance → positive association |
| **Conviction** | `(1 − support(Y)) / (1 − confidence)` | 0.6/0.4 = **1.5** | how much the rule would be wrong without the association |

Reading the numbers correctly is where marks are won:

- **lift = 1** → X and Y are independent; the rule is useless.
- **lift > 1** → positive association (the useful case).
- **lift < 1** → they *substitute* for each other; a promotion on one cannibalises the other. This is a genuinely useful finding, not a failed rule.
- **High confidence with low support** → a rule that is right almost every time it fires, but fires on almost nobody. Commercially worthless. Always quote support *and* confidence together; one alone is half an answer.

### Apriori — how the frequent itemsets are actually found

Brute force is impossible: with *n* items there are 2ⁿ candidate itemsets. Apriori uses one property:

> **Downward closure (anti-monotonicity): if an itemset is infrequent, every superset of it is also infrequent.**

So the algorithm alternates two steps, level by level:

1. **Join** — combine frequent *k*-itemsets into candidate (*k*+1)-itemsets.
2. **Prune** — discard any candidate containing an infrequent subset, then count support on the database and keep those above minimum support.

Frequent itemsets → generate rules → keep only rules above **minimum confidence**. Both thresholds are business decisions, not statistics: lower support = more rules = more noise.

⚠ **Trap:** saying "Apriori finds rules with high accuracy". There is no accuracy here. It finds rules above a **support** and **confidence** threshold; **lift** is what tells you whether the rule beats chance.

### Market basket analysis, and the honest limit

The retail application is **market basket analysis**: what is bought together, used for shelf layout, bundles, cross-sell recommendations and promotion design. The 2026 case's Amazon recommendations are exactly this idea, industrialised.

The limit worth one line: association rules are **aggregate and correlational**. "Customers who buy nappies buy beer" says nothing about *why*, and nothing about any individual customer. Claiming causation from a rule is the fastest way to lose the evaluation mark.

---

## 3.5 Answer skeletons — 2026 paper and official model question

### A7 · "Define the concept of association rule in datamining." [1]

> An association rule is an implication X → Y meaning transactions that contain itemset X also tend to contain Y, measured by support and confidence.

*(25 words. Support and confidence are named because they are what make it a rule rather than a coincidence — but no formulas, no Apriori.)*

### B3 · "What is the importance of clustering algorithm? Explain with example." [3]

> *Shape: one line on what clustering does, two or three importance points, then one concrete example. ~115 words.*
>
> Clustering groups records so that members of a group are similar to each other and different from other groups, **without any pre-existing labels**. Its importance follows from that: it discovers segments nobody defined in advance, it reduces a heterogeneous customer base into a few homogeneous groups that can be targeted differently, and it scales to millions of records while surfacing anomalies as small distant clusters. For example, a Kathmandu grocery chain clustering customers on recency, frequency and spend obtains three groups — weekly high-spend families, weekend bulk buyers and dormant one-time shoppers — and runs a loyalty offer, a volume discount and a win-back voucher respectively. The segments came from the data, not from a manager's guess.

### C3 · "A Retail Company wants to analyze customer data to improve sales — explain with example how classification algorithm can be applied to achieve this objective." [5]

> *Shape: restate the objective as a prediction problem → define the label → list features → name the algorithm and how it is trained/evaluated → state the business action → one caution. ~230 words.*
>
> The retailer's real question is *which customers will buy*, so the task is **classification**: the outcome is a known category, not a free-form pattern.
>
> **Define the label.** Using two years of history, label each customer "responded to a promotion" or "did not". That label is what makes the problem supervised.
>
> **Build the features.** Recency of last purchase, purchase frequency, monetary value, average basket, category affinity, channel preference and discount sensitivity — all derived from the customer's own transaction record.
>
> **Train and evaluate.** Fit a decision tree, which is the practical choice here because it yields readable rules such as *"if recency < 30 days AND average basket > NPR 2,000 then likely responder"*. Hold back a test set, and judge the model with a confusion matrix, precision and recall rather than raw accuracy, since responders are typically a minority class.
>
> **Act on the scores.** Score the entire base and spend only on high-probability responders, while routing high-value customers who score as likely to lapse into a retention programme.
>
> **The gain** is measurable: the same campaign budget reaches more likely buyers, and unprofitable discounts stop going to customers who would have bought anyway.
>
> **The caution:** the model learns past behaviour, so it must be retrained as demand shifts, and it must not be used to justify discrimination on protected attributes.

⚠ C3 says *"explain with example"*. A generic description of decision trees with no retailer, no label and no campaign scores about 2/5. The marks are in the label → features → evaluation → action chain.

### C18 · model question — "Compare and contrast decision trees and Naive Bayes classifiers, mentioning strengths and weaknesses of each." [5]

> *Shape: one framing line → four or five comparison dimensions → strengths and weaknesses of each → a rule for choosing. ~230 words. This is the answer to write if the paper asks for a comparison; do not spend it on C3, which wants an application.*

> Both are **supervised classifiers** that learn from labelled history to assign a known class, but they learn different objects. A decision tree learns a hierarchy of if–then splits chosen to maximise information gain, so it can represent interactions between attributes; naïve Bayes learns a probability per class from the conditional frequency of each attribute value, on the assumption that attributes are independent given the class.
>
> **Compare:** a tree is readable as rules and handles mixed numeric and categorical data natively, where naïve Bayes is opaque and needs a distributional assumption for continuous attributes. A tree overfits easily and is unstable; naïve Bayes has few parameters and overfits rarely. Naïve Bayes trains in a single pass and copes with hundreds of attributes and small datasets; a tree is slower and needs enough records on both sides of every split.
>
> **Strengths — tree:** interpretable, no scaling needed, captures non-linearity and interactions. **Weaknesses — tree:** overfits without pruning, unstable, biased toward attributes with many distinct values.
>
> **Strengths — naïve Bayes:** very fast, works on tiny data, strong on text and high-dimensional sparse data. **Weaknesses — naïve Bayes:** the independence assumption is usually false, so correlated attributes are double-counted and the probabilities become over-confident; it cannot express an interaction unless that interaction is engineered as a feature.
>
> **Choose** a tree when the result must be explained and data is plentiful; naïve Bayes when attributes are many, records are few and speed matters. In practice, fit both and compare them on a held-out set.

---

## 3.6 Traps

| Trap | Why it costs marks | Fix |
|---|---|---|
| Calling clustering "supervised" | inverts the only distinction the paper tests directly | classification has labels, clustering does not |
| "Data mining = extracting data" | that is querying; the definition mark is for *pattern discovery* | automated discovery of previously unknown, useful patterns in large data |
| Preprocessing answered as "cleaning" only | there are four families | cleaning · integration · transformation · reduction |
| Quoting confidence without support | a rule that fires on 3 customers | always report support *and* confidence, then lift |
| "Lift < 1 means the rule failed" | it means substitution — a real finding | lift < 1 = negative association, useful for cannibalisation |
| Confusing support of the rule with support of X | arithmetic then goes wrong | support(X→Y) = count(X∪Y)/N; support(X) = count(X)/N |
| Describing Apriori as measuring "accuracy" | wrong vocabulary | support and confidence thresholds; lift for chance |
| Claiming a rule explains *why* | correlation is not causation | rules are aggregate and correlational — say so explicitly |
| Reporting 99% training accuracy as success | that is overfitting, not performance | quote test-set precision/recall |
| Answering C3 with theory only | the question says "with example" | label → features → train → evaluate → act |
| Forgetting normalisation when asked why k-means misbehaves | it is the standard cause | unscaled attributes distort distance, so big-unit attributes dominate |
| Answering C18 with two definitions side by side | the verb is **compare and contrast** | compare on dimensions: what is learned, assumption, overfitting, interpretability, speed, data appetite |
| Calling naïve Bayes "better because it uses probability" | its probabilities are over-confident when attributes correlate — that is its main weakness | name the independence assumption and its cost, then say when it still wins |

---

## 3.7 Self-test (answers collapsed)

1. Define data mining in one sentence and name the one word that distinguishes it from reporting. *(1 mark)*
2. Name the four families of data preprocessing and one operation from each. *(3 marks)*
3. Distinguish classification from clustering in two lines. *(1–3 marks depending on paper mood)*
4. In 1,000 transactions, 300 contain tea, 150 contain tea and sugar, and 500 contain sugar. Compute support, confidence and lift for tea → sugar, and say what the lift means. *(3 marks)*
5. State the downward-closure property Apriori relies on, and why it matters computationally. *(3 marks)*
6. Name one classification algorithm and one clustering algorithm, each with one distinguishing property. *(1–3 marks)*
7. 🇳🇵 A Kathmandu grocery chain has 200,000 loyalty transactions and wants to know which products to place together, which customers to target, and which customers are about to leave. Name the mining technique for each of the three questions. *(5 marks — mini case)*
8. Compare decision trees and naïve Bayes on four dimensions, and say which you would use to explain a loan rejection to a borrower. *(5 marks)*

<details>
<summary>Answers</summary>

1. "Data mining is the automated discovery of previously unknown, potentially useful patterns in large datasets." The distinguishing word is **unknown** — reporting answers questions you already had; mining finds structure you did not specify.
2. **Cleaning** (impute missing values, remove duplicates) · **integration** (merge sources, resolve identity conflicts) · **transformation** (normalisation, discretisation, encoding) · **reduction** (attribute selection, sampling, PCA).
3. Classification is supervised: a labelled training set teaches a model to assign a known class to new records. Clustering is unsupervised: no labels exist, and the algorithm discovers groups of similar records itself.
4. support(tea ∪ sugar) = 150/1000 = **15%**; support(tea) = 300/1000 = 30%, so confidence = 150/300 = **50%**; support(sugar) = 500/1000 = 50%, so lift = 0.50/0.50 = **1.0**. Lift of exactly 1 means tea and sugar are independent — buying one tells you nothing about the other. (Note how a 50% confidence rule looks impressive and is worthless.)
5. If an itemset is infrequent, all its supersets are also infrequent. So the algorithm prunes entire branches of the search space and never counts them, turning an exponential 2ⁿ search into something tractable.
6. Classification: **decision tree** — produces interpretable if–then rules. Clustering: **k-means** — centroid-based and fast, but requires `k` in advance and numeric, normalised attributes.
7. Products placed together → **association rule mining** (market basket, Apriori). Customers to target → **clustering** (RFM segmentation) or **classification** if a specific outcome such as "will respond" is already known. Customers about to leave → **classification** (churn prediction with a labelled "churned" history), which is the only one of the three that needs a label.
8. **What is learned:** a tree of if–then splits vs a class-conditional probability table. **Assumption:** none vs conditional independence of attributes. **Overfitting:** high, needs pruning vs low, few parameters. **Interpretability:** high vs low. Use the **decision tree** for a loan rejection: "income below NPR 25,000 and existing EMIs above 40% of income" is a reason a borrower and a regulator can both inspect; a posterior probability is not a reason, it is a verdict with no evidence attached.

</details>

---

## 3.8 Sixty-second check

Close the file and, on a blank page:

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

*Sources for this unit: TU FOM syllabus (IT 249, Unit 3, 8 LHs) · TU 2026 paper (A7, B3, C3) · official TU/FOM model question 2026 (A5, A6, B13, B14, C18, C19) · support/confidence/lift/conviction definitions, the Apriori downward-closure property and the decision-tree/naïve-Bayes comparison cross-checked against the standard literature (Agrawal & Srikant; Han, Kamber & Pei, *Data Mining: Concepts and Techniques*; Witten, Frank & Hall, *Data Mining: Practical Machine Learning Tools and Techniques* — both syllabus-level readings). Worked example and its arithmetic are computed in this file, so you can verify each figure by hand.*
