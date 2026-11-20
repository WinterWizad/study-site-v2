# Unit 5 — Economics of Information

| | |
|---|---|
| **Lecture hours** | 8 |
| **Marks in 2026 paper** | 12 — one 2-marker (A9 digital challenges to IP frameworks), one 10-marker (C21 effects of digitalization on consumer choice and labour markets) |
| **Difficulty** | ★★★★☆ — thin on marks but **C21 is the only analytical 10-marker in the paper**. Cannot be bluffed from definitions; needs asymmetric-information machinery, digitalisation link, and AI/labour-market mechanism. |
| **Exam yield** | 🟡 thin — 8 hours, 12 marks, but **C21 is high-value** — separates rote learners from those who can apply the economics |
| **Prerequisite** | Unit 2 (platforms, network effects, data as asset) · Unit 3 (digital business models, value creation) |
| **Syllabus** | Asymmetric information: concepts and determinants · Asymmetric information and digitalization · Online search engines · Artificial intelligence · Strategy and the new economics of information · Effects of digitalization on consumer choice and labour markets · Intellectual property and digitalization |

> **Read this first:** This unit is **thin on marks (12) but thick on concepts**. The syllabus packs seven bullets into 8 hours. The paper only asks two questions: A9 (IP challenges — a 2-marker list) and C21 (consumer choice + labour markets — the only analytical 10-marker). **C21 is the gate**: if you cannot explain *how digitalisation changes information asymmetries in markets* and *how AI reshapes labour demand*, you will lose the 10 marks. The other bullets (search engines, AI strategy, IP) are vocabulary for C21 and for the case (Unit 6).

---

## Coverage Map

```
5.1 Asymmetric Information 🎯 3-mark
├── Adverse selection (hidden characteristics, pre-transaction)
├── Moral hazard (hidden actions, post-transaction)
├── Five determinants: observability, verifiability, signalling cost, repeat interaction, intermediaries
└── Platform's economic role: information intermediary reducing both problems

5.2 Digitalisation Reshapes Asymmetry 🎯 5-mark
├── Reduces (buyer-side): reviews, price comparison, verified badges
├── Creates (platform-side): platform knows everything; user knows little about algorithm
├── Creates (worker-side): algorithmic management — platform knows worker data; worker doesn't know dispatch logic
└── Shifts (seller → platform): platform becomes trusted intermediary

5.3 Online Search Engines 🎯 3-mark
├── Two-sided platform: users ↔ advertisers
├── Cross-side network effects
├── Generalised second price auction: rank = bid × quality score
└── Data feedback loop

5.4 AI Economics 🎯 3-mark
├── Prediction machine framework: prediction, judgment, action, data, computing
├── Three shifts: rules→prediction, average→individual, human→machine judgment
└── Judgment becomes more valuable when prediction is cheap

5.5 Strategy & New Economics of Information
├── Six properties of information goods: non-rivalry, high fixed/near-zero marginal cost, experience good, network effects, switching costs, standards
└── These explain why Unit 3's business models look the way they do

5.6 Effects of Digitalisation on Consumer Choice & Labour Markets — C21 🎯 10-mark
├── Consumer choice: three mechanisms (search costs, asymmetry reallocation, behavioural targeting)
├── Labour markets: three mechanisms (task automation, platform-mediated work, global arbitrage)
└── Synthesis: asymmetry concentrates in the platform

5.7 IP & Digitalisation — A9 🎯 2-mark
├── Near-zero marginal cost of copying → enforcement impossible
└── Generative AI and authorship → training data/output ownership/liability gap
```

---

## 5.1 Asymmetric Information — Concepts and Determinants 🎯 3-mark

> **Asymmetric information exists when one party in a transaction has more or better information than the other.** It is the *fundamental market failure* in digital economies — platforms exist largely to reduce it.

### Two Canonical Problems

| Problem | When it arises | Digital example |
|---|---|---|
| **Adverse selection** (hidden *characteristics*) | before the transaction: the informed party knows their *type* (quality, risk, ability); the uninformed party does not | a seller knows their product is defective; a borrower knows they are high-risk; a gig worker knows their skill level — the platform/buyer does not |
| **Moral hazard** (hidden *actions*) | after the transaction: the informed party takes *actions* the uninformed party cannot observe | a driver takes a longer route; a borrower diverts loan funds; a freelancer outsources the work — the platform/client cannot monitor perfectly |

### Determinants — What Makes Asymmetry Better or Worse

| Factor | Increases asymmetry | Decreases asymmetry (platform mechanisms) |
|---|---|---|
| **Observability** | attributes/actions hard to see | ratings, reviews, verified badges, portfolio, work logs |
| **Verifiability** | claims cannot be proven | certifications, third-party audits, blockchain provenance |
| **Cost of signalling** | high cost to prove quality | platform provides cheap signals (completion rate, response time) |
| **Repeat interaction** | one-shot transactions | long-term reputation, recurring revenue, subscription |
| **Information intermediaries** | none | the platform *is* the intermediary — it aggregates, verifies, discloses |

**The platform's economic role:** a multi-sided platform (Unit 2) is an **information intermediary** that reduces adverse selection (via ratings, verification) and moral hazard (via monitoring, escrow, reputation). The *better* it does this, the stronger its network effects.

---

## 5.2 Asymmetric Information and Digitalization 🎯 5-mark

> **Digitalization reshapes information asymmetries in three directions: it reduces some, creates new ones, and shifts where the asymmetry sits.**

| Direction | Mechanism | Example |
|---|---|---|
| **Reduces** (buyer-side) | product reviews, price comparison, specification transparency, verified seller badges | Daraz: buyer sees 4.7★, 2,000 reviews, detailed specs — adverse selection on *product quality* largely solved |
| **Creates** (platform-side) | the platform knows *everything* (behaviour, intent, willingness to pay); the user knows *little* about the algorithm | Google/Facebook: the platform knows your search history, location, purchases; you do not know the ranking algorithm or the auction logic |
| **Creates** (worker-side) | algorithmic management: the platform knows the worker's real-time location, acceptance rate, speed; the worker does not know the dispatch logic | Uber/Pathao: driver sees "surge pricing" but not the algorithm that sets it; acceptance rate affects future dispatch but the formula is opaque |
| **Shifts** (seller → platform) | the platform becomes the *trusted intermediary*; sellers compete on the platform's terms | Amazon/Daraz: buyers trust the platform's fulfilment/return policy more than the individual seller's promise |

**Key insight for C21:** digitalisation does not "solve" asymmetric information — it **reallocates** it. The platform becomes the *new informed party* with massive data advantages over both consumers and producers/workers.

---

## 5.3 Online Search Engines — the Economics of Search 🎯 3-mark

> **A search engine is a two-sided platform (users ↔ advertisers) that solves an information retrieval problem for users and an attention allocation problem for advertisers.** Its economics are a direct application of Unit 2–3 platform mechanics.

| Economic feature | How it works |
|---|---|
| **Two-sided market** | users pay with *attention and data*; advertisers pay *money* (CPC/CPM) |
| **Cross-side network effects** | more users → more advertiser demand → higher bids → better search quality (funded by ads) → more users |
| **Ad auction (generalised second price)** | advertisers bid on keywords; ad rank = bid × quality score; pay the next-highest bidder's rank / your quality score |
| **Quality score** | click-through rate × relevance × landing page experience — aligns advertiser incentive with user experience |
| **Data feedback loop** | every query + click trains the ranking model → better results → more queries → more data |

**For the exam:** you do not need to derive the auction. You need to name it (generalised second price), say what determines rank (bid × quality score), and explain why it is a *two-sided platform with cross-side network effects*.

---

## 5.4 Artificial Intelligence — the Economics of AI 🎯 3-mark

> **AI (specifically machine learning) is a prediction technology: it fills in missing information.** In economic terms, **AI lowers the cost of prediction**, which changes decisions, contracts, and labour markets.

### The Prediction Machine Framework (Agrawal, Gans, Goldfarb — standard reference)

| Component | What it is | Economic effect |
|---|---|---|
| **Prediction** | using data you have to generate data you don't have | cheaper → more decisions use prediction instead of rules/heuristics |
| **Judgment** | the value function: what outcome do we want, and what is the cost of errors? | becomes *more valuable* when prediction is cheap (you need to know *what to predict*) |
| **Action** | the decision taken based on prediction + judgment | automated where judgment is codifiable; human-in-the-loop where it is not |
| **Data** | the fuel: training data + input data | becomes a strategic asset; data feedback loops create moats |
| **Computing** | the engine: training + inference | cloud elasticity (Unit 4) makes it opex, not capex |

### AI and the Digital Economy — Three Shifts

1. **From rules to prediction.** Traditional software: `if X then Y`. ML: `predict Y given X`. The latter handles complexity (images, language, fraud patterns) that rules cannot.
2. **From average to individual.** Personalisation at scale: pricing, recommendations, risk scoring, content — each user gets a *different* prediction.
3. **From human to machine judgment (where codifiable).** Routine cognitive tasks (coding boilerplate, translation, summarisation, basic analysis) move to AI; human judgment shifts to *defining the problem, setting the objective, handling exceptions*.

---

## 5.5 Strategy and the New Economics of Information

> **Information goods have distinct economic properties that dictate strategy.** The "new economics of information" (Shapiro & Varian, *Information Rules* — classic, not on syllabus but the ideas are) applies directly to digital business models (Unit 3).

| Property | Strategic implication |
|---|---|
| **Non-rivalry** | my use does not diminish yours → marginal cost ≈ 0 → versioning, bundling, freemium |
| **High fixed cost, near-zero marginal cost** | recover fixed cost via price discrimination (tiers, subscriptions, ads) |
| **Experience good** | you must consume to value it → free trials, freemium, demos, reviews |
| **Network effects** | value grows with users → penetrate pricing, open APIs, ecosystem building |
| **Switching costs** | lock-in → invest in compatibility, data portability (or don't, to retain) |
| **Standards and compatibility** | winners set standards → participate in SSOs, build installed base first |

**For the exam:** these properties explain *why* the digital business models in Unit 3 (platform, freemium, data/attention, infrastructure) look the way they do. C21's "strategy" half is: firms design products and contracts *around* these properties.

---

## 5.6 Effects of Digitalization on Consumer Choice and Labour Markets — C21 🎯 10-mark

> **Shape: consumer choice (three mechanisms) → labour markets (three mechanisms) → synthesis: the platform as the new information intermediary. ~380 words.**

This is the **only analytical 10-marker in the paper**. It cannot be answered from definitions alone. You must apply the asymmetric-information machinery (adverse selection, moral hazard) and the AI/prediction framework to *how digitalisation changes the information structure* for consumers and workers.

### Consumer Choice — Three Mechanisms

1. **Reduced search costs and expanded consideration sets.** Price comparison, reviews, recommendations, and search engines lower the cost of finding alternatives. *Result:* consumers switch more, are less loyal, and demand better value. *But:* algorithmic curation (filter bubbles, personalised ranking) can *narrow* the effective choice set — the platform decides what you see.
2. **Information asymmetry reallocation.** Traditional adverse selection (buyer doesn't know seller quality) is reduced by ratings/reviews/verification. *But* a *new* asymmetry emerges: the platform knows the consumer's willingness to pay, search intent, and behavioural profile; the consumer does not know the ranking algorithm or the personalised price. **Personalised pricing and dark patterns** are the moral hazard of the platform side.
3. **Behavioural targeting and manipulation.** AI-driven recommendations optimise for *engagement* or *conversion*, not necessarily consumer welfare. The consumer's choice architecture is designed by the platform's objective function. *Regulatory implication:* the Individual Privacy Act, 2075 (consent, purpose limitation) and future digital consumer protection laws address this.

### Labour Markets — Three Mechanisms

1. **Task-level automation and the "prediction" substitution.** AI lowers the cost of prediction (Agrawal et al.). Routine cognitive tasks (coding boilerplate, translation, summarisation, data entry, basic analysis, customer support tier-1) are automated. *Result:* demand shifts from *routine cognitive* to *non-routine cognitive* (problem definition, judgment, creativity, human interaction) and *non-routine manual* (care, trades, logistics last-mile).
2. **Platform-mediated work and algorithmic management.** Gig platforms (Pathao, Tootle, Upwork, Fiverr) replace the firm with an algorithm: dispatch, pricing, rating, termination are automated. *Information asymmetry:* the platform knows the worker's real-time location, acceptance rate, speed; the worker does not know the dispatch/pricing logic. *Result:* flexibility without security; income volatility; no collective bargaining; the "partner" fiction.
3. **Global labour arbitrage for digital tasks.** Digital delivery (Unit 4's Channel 1) lets a Kathmandu developer compete for London jobs. *Wage convergence* for digital skills: Nepali developers earn a fraction of Silicon Valley rates but a multiple of local averages. *Brain drain without migration:* the best talent works remotely for foreign firms, hollowing out the local innovation ecosystem.

### Synthesis — the Platform as the New Information Intermediary

Digitalisation does not eliminate asymmetric information. It **concentrates it in the platform**. The platform knows both sides better than they know each other, and better than they know the platform. Consumer choice is shaped by algorithmic curation; labour outcomes are shaped by algorithmic management. The policy response (Unit 1, Unit 6) must address: **data rights (Privacy Act, 2075), algorithmic transparency, gig-worker protections, and competition policy for platform dominance.**

---

### C21 · "Analyze the effects of digitalization on consumer choice and labour markets." [10] 🎯 10-mark

> **Shape: consumer choice (3 mechanisms) → labour markets (3 mechanisms) → synthesis. ~380 words.**

**Consumer choice.** Digitalisation reshapes choice through three mechanisms. (1) **Reduced search costs and expanded consideration sets:** price comparison, reviews, recommendations, and search engines lower the cost of finding alternatives; consumers switch more and demand better value. But algorithmic curation (filter bubbles, personalised ranking) can *narrow* the effective choice set — the platform decides what you see. (2) **Information asymmetry reallocation:** traditional adverse selection (buyer vs seller quality) is reduced by ratings/reviews. But a *new* asymmetry emerges: the platform knows the consumer's willingness to pay, intent, and behaviour; the consumer does not know the ranking algorithm or personalised price. Personalised pricing and dark patterns are the platform's moral hazard. (3) **Behavioural targeting:** AI recommendations optimise for engagement/conversion, not consumer welfare. The choice architecture is designed by the platform's objective function. The Individual Privacy Act, 2075 (consent, purpose limitation) addresses this.

**Labour markets.** Three mechanisms. (1) **Task-level automation:** AI lowers prediction cost (Agrawal et al.). Routine cognitive tasks (coding boilerplate, translation, summarisation, data entry, tier-1 support) are automated. Demand shifts to non-routine cognitive (judgment, creativity, human interaction) and non-routine manual (care, trades, logistics). (2) **Platform-mediated work and algorithmic management:** gig platforms (Pathao, Upwork) replace the firm with an algorithm — dispatch, pricing, rating, termination automated. Asymmetry: platform knows worker's real-time data; worker does not know dispatch logic. Result: flexibility without security, income volatility, no collective bargaining. (3) **Global labour arbitrage:** digital delivery (Unit 4) lets a Kathmandu developer compete for London jobs. Wage convergence for digital skills; brain drain without migration — talent works remotely for foreign firms, hollowing out local innovation.

**Synthesis.** Digitalisation does not eliminate asymmetric information; it **concentrates it in the platform**. The platform knows both sides better than they know each other, and better than they know the platform. Consumer choice is shaped by algorithmic curation; labour outcomes by algorithmic management. Policy must address: data rights (Privacy Act, 2075), algorithmic transparency, gig-worker protections, and competition policy for platform dominance.

*(386 words)*

---

## 5.7 Intellectual Property and Digitalization — A9 🎯 2-mark

> **A9 answer (memorise this):** Two digital challenges to traditional IP frameworks: (1) **Near-zero marginal cost of copying** — digital goods replicate perfectly at near-zero cost, making enforcement of copyright/patent across borders practically impossible; traditional IP assumes physical scarcity. (2) **Generative AI and authorship** — AI models trained on copyrighted works produce outputs that blur the line between derivative work and original creation; current IP law has no clear framework for model training data, output ownership, or liability for infringement. (Other acceptable: open-source licensing conflicts, patent thickets in software, jurisdictional enforcement gaps, DRM vs fair use.)

*(58 words. Two named challenges, mechanism for each.)*

---

### A9 · "Write any two digital challenges to traditional IP frameworks." [2] 🎯 2-mark

> (1) **Near-zero marginal cost of copying** — digital goods replicate perfectly at near-zero cost, making enforcement of copyright/patent across borders practically impossible; traditional IP assumes physical scarcity. (2) **Generative AI and authorship** — AI models trained on copyrighted works produce outputs that blur derivative work and original creation; current IP law has no clear framework for training data, output ownership, or infringement liability.

*(58 words)*

---

## 5.8 Traps

| Trap | Why it costs marks | Fix |
|---|---|---|
| Answering C21 with only "consumers have more choice" | misses the asymmetry reallocation, algorithmic curation, behavioural targeting | three mechanisms for consumer choice, each with the *but* |
| Ignoring the labour market half of C21 | the question explicitly says "consumer choice **and** labour markets" | three mechanisms for labour markets: automation, platform work, global arbitrage |
| Saying "AI replaces jobs" without the task-level distinction | C21 needs the prediction-cost framework | routine cognitive automated; non-routine cognitive/manual grow |
| Treating gig work as "just flexibility" | misses the algorithmic management asymmetry | platform knows worker data; worker doesn't know dispatch logic |
| Listing IP challenges without mechanisms | A9 says "challenges" — a list without *why* is not an answer | near-zero marginal cost → enforcement impossible; generative AI → authorship gap |
| Forgetting the Privacy Act, 2075 in C21 | the only named Nepali law in the syllabus | one line: consent, purpose limitation, data minimisation |
| Writing "digitalisation reduces information asymmetry" | it reallocates it — the platform becomes the new informed party | synthesis: concentration in the platform |

---

## 5.9 Self-Test (Answers Collapsed)

1. Define adverse selection and moral hazard with one digital example each. *(3 marks)*
2. How does digitalisation reduce, create, and shift information asymmetries? Give one example each. *(5 marks)*
3. What is the economic role of a search engine? Name the auction mechanism and what determines rank. *(3 marks)*
4. In the prediction machine framework, what happens to the value of judgment when prediction becomes cheap? *(2 marks)*
5. Name the three shifts AI brings to the digital economy. *(3 marks)*
6. How does digitalisation affect consumer choice? Give three mechanisms with the "but" for each. *(5–10 marks)*
7. How does digitalisation affect labour markets? Give three mechanisms. *(5–10 marks)*
8. What is the synthesis: where does asymmetric information concentrate after digitalisation? *(2 marks)*
9. Write two digital challenges to traditional IP frameworks with mechanisms. *(2 marks — A9)*

<details>
<summary>Answers</summary>

1. **Adverse selection** (hidden characteristics, pre-transaction): seller knows product is defective; platform/buyer does not. **Moral hazard** (hidden actions, post-transaction): driver takes longer route; platform/client cannot monitor perfectly.
2. **Reduces:** Daraz ratings/reviews reduce buyer-side adverse selection on product quality. **Creates (platform-side):** Google knows your search history/location/purchases; you don't know the ranking algorithm. **Creates (worker-side):** Uber/Pathao knows driver's real-time location/acceptance rate; driver doesn't know dispatch logic. **Shifts:** platform becomes trusted intermediary; sellers compete on platform's terms.
3. Two-sided platform (users ↔ advertisers). Auction: generalised second price. Rank = bid × quality score (CTR × relevance × landing page experience).
4. Judgment becomes *more valuable* — when prediction is cheap, you need to know *what to predict* and *what the cost of errors is*.
5. (1) From rules to prediction. (2) From average to individual (personalisation at scale). (3) From human to machine judgment (where codifiable).
6. (1) Reduced search costs/expanded sets — *but* algorithmic curation narrows effective choice. (2) Asymmetry reallocation — traditional adverse selection reduced; *but* platform knows willingness to pay/intent; consumer doesn't know algorithm/personalised price. (3) Behavioural targeting — AI optimises for engagement/conversion, not welfare; *but* choice architecture designed by platform's objective.
7. (1) Task-level automation — prediction cost falls; routine cognitive automated; demand shifts to non-routine cognitive/manual. (2) Platform-mediated work/algorithmic management — dispatch/pricing/rating automated; platform knows worker data; worker doesn't know logic; flexibility without security. (3) Global labour arbitrage — digital delivery enables remote competition; wage convergence; brain drain without migration.
8. Asymmetric information concentrates in the **platform** — it knows both sides better than they know each other, and better than they know the platform.
9. (1) Near-zero marginal cost of copying → enforcement impossible across borders; traditional IP assumes physical scarcity. (2) Generative AI and authorship → training data/output ownership/liability gap; current IP law has no clear framework.

</details>

---

## 5.10 Sixty-Second Check

Close this file and, on a blank page:

- [ ] Adverse selection vs moral hazard + digital examples
- [ ] Digitalisation: reduces / creates / shifts asymmetry + examples
- [ ] Search engine: two-sided platform, GSP auction, rank = bid × quality score
- [ ] Prediction machine: prediction cheap → judgment more valuable
- [ ] Three AI shifts: rules→prediction, average→individual, human→machine judgment
- [ ] Consumer choice: three mechanisms + the "but" for each
- [ ] Labour markets: automation (task-level), platform work (algorithmic management), global arbitrage
- [ ] Synthesis: asymmetry concentrates in the platform
- [ ] Two IP challenges: near-zero copying cost + generative AI authorship

If all nine are there, Unit 5's **12 marks** are covered — A9, C21.

---

*Sources: TU FOM syllabus (IT 250, Unit 5, 8 LHs) · TU 2026 board paper (A9, C21) · Overby & Audestad, Introduction to Digital Economics, ch. 10–11 (syllabus reading) · Maheshwari, Digital Transformation, ch. 8–9 (syllabus reading) · Agrawal, Gans & Goldfarb, *Prediction Machines* (standard AI economics reference, not fetched) · Shapiro & Varian, *Information Rules* (classic information economics, not fetched) · Individual Privacy Act, 2075 provisions from public legal summaries (pioneerlaw.com, pacmap.dev). Nepal gig platforms (Pathao, Tootle), freelance platforms (Upwork, Fiverr), and IT export figure (~USD 500m) are widely reported, stated as patterns. Agro-tech Concern case facts (85,555 farmers, NPR 489m transactions, 16% price gain, remote reach gap, manual price errors, NPR 16m fee revenue) are verbatim from the 2026 board paper.*