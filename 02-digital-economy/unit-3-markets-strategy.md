# Unit 3 — Digital Markets, Strategy and Innovation

| | |
|---|---|
| **Lecture hours** | 10 — the largest unit in the syllabus |
| **Marks carried in 2026 paper** | **24** — two 2-markers (A6 Layered Internet Model, A7 digital innovation characteristics), two 5-markers (B14 competition vs coopetition, B15 data-driven business models), one 10-marker (C19 value creation model + economic implications) |
| **Difficulty** | ★★★★☆ — the Layered Internet Model is a specific diagram to memorise; the value creation model (C19) is the only 10-marker in this unit and demands structure + implications; competition vs coopetition is a distinction many blur |
| **Exam yield** | 🔴 **highest in the paper** — 10 hours, 24 marks, and every concept here is the vocabulary for Unit 4 (transformation), Unit 5 (economics of information) and the case (Unit 6) |
| **Prerequisite** | Unit 2 (platforms, network effects, lock-in, switching costs — the mechanics that make these markets work) |
| **Syllabus bullets** | Competition, cooperation, and coopetition · The layered internet model · Digital innovation · Digital business models · Value creation models · Modeling of digital markets |

> **Read this first:** this unit is the **core of the paper**. It carries the most marks (24) and the most concepts per hour. The Layered Internet Model (A6) is a *diagram you must draw cold* — six layers, each with a one-line function. The value creation model (C19) is a *structure + implications* answer — memorise the four components, then the three economic implications. Competition vs coopetition (B14) is a distinction, not a list. Data-driven business models (B15) are the application of Unit 2's platform mechanics.

---

## 3.1 Competition, cooperation and coopetition

> **Competition** is the standard market interaction: firms vie for the same customers with substitute offerings, and one's gain is the other's loss. **Cooperation** is explicit coordination: firms jointly produce, standardise, or share infrastructure to reduce cost or risk. **Coopetition** is the simultaneous pursuit of competition and cooperation between the same firms — they cooperate on the *platform layer* (standards, infrastructure, ecosystem growth) and compete on the *application layer* (services, pricing, differentiation).

| | **Competition** | **Cooperation** | **Coopetition** |
|---|---|---|---|
| **Relationship** | adversarial | collaborative | both, on different layers |
| **Goal** | capture market share | reduce cost, share risk, set standards | grow the pie *and* claim a slice |
| **Example** | Daraz vs SastoDeal (e-commerce) | Nepal Telecom + Ncell sharing towers | Google + Samsung: Android (cooperate) vs Pixel vs Galaxy (compete) |
| **Digital market logic** | winner-take-most on the application layer | necessary for interoperability, trust, ecosystem | the *dominant* mode in platform markets |

### Why coopetition is the default in digital markets

1. **Network effects need critical mass.** No single firm can bootstrap a two-sided platform alone — they need complementary sides to join. Competitors cooperate to build the *market* (e.g., Visa/Mastercard setting payment standards).
2. **Standards are public goods.** Interoperability (USB, Bluetooth, HTTP, QR payments) benefits all; no firm captures the full value of a standard alone.
3. **Complementors are not competitors.** A platform's value comes from *complementors* (app developers, merchants, content creators). The platform cooperates with them (APIs, revenue share) while competing with *some* of them (first-party apps, private labels).
4. **Data and AI raise the stakes.** Training data, benchmarks, open-source models (TensorFlow, PyTorch, Llama) are shared infrastructure; the competition is in the fine-tuned application.

### B14 · "Differentiate between competition and coopetition with examples." [5]

> **Shape: define both → three-point contrast table → two examples (one pure competition, one coopetition) → why coopetition dominates digital. ~200 words.**

**Competition** is adversarial interaction where firms vie for the same customers with substitute offerings — one's gain is the other's loss. **Coopetition** is the simultaneous pursuit of competition and cooperation between the same firms: they cooperate on the *platform/infrastructure layer* (standards, ecosystem growth, interoperability) and compete on the *application/service layer* (differentiation, pricing, customer capture).

| | **Competition** | **Coopetition** |
|---|---|---|
| **Layer of interaction** | application / service | platform (cooperate) + application (compete) |
| **Goal** | capture share | grow the pie *and* claim a slice |
| **Relationship** | zero-sum (short run) | positive-sum on platform, zero-sum on app |
| **Example** | **Daraz vs SastoDeal** — both marketplaces, same sellers, same buyers, substitute services | **Google + Samsung** — cooperate on Android (OS, Play Store, ecosystem standards); compete on hardware (Pixel vs Galaxy) and first-party apps |

**Why coopetition dominates digital markets.** Network effects need critical mass — no firm bootstraps a two-sided platform alone. Standards (HTTP, QR payments, Android) are public goods that grow the market. Complementors (developers, merchants) are the platform's value; the platform cooperates with them (APIs, revenue share) while competing with *some* (first-party apps). Data and AI amplify this: open-source models and benchmarks are shared infrastructure; competition is in the fine-tuned application.

*(208 words)*

---

## 3.2 The Layered Internet Model — A6 (2 marks ≈ 55 words)

> **The Layered Internet Model describes the internet as a stack of six logical layers, each providing a service to the layer above and relying on the layer below.** It is the *architecture* that lets digital markets operate across the ecosystem layers (Unit 1).

| Layer | Name | Function (one line each) | Key protocols / examples |
|---|---|---|---|
| **6** | **Application** | user-facing services: web, email, streaming, APIs, apps | HTTP/HTTPS, SMTP, FTP, WebSocket, gRPC, REST |
| **5** | **Presentation / Session** | data representation, encryption, session management | TLS/SSL, JSON, XML, Protobuf, OAuth, JWT |
| **4** | **Transport** | end-to-end reliability, flow control, congestion control | TCP (reliable), UDP (datagram), QUIC |
| **3** | **Network** | routing, addressing, packet forwarding across networks | IP (v4/v6), ICMP, BGP, OSPF |
| **2** | **Data Link** | framing, error detection, medium access on a link | Ethernet (802.3), Wi-Fi (802.11), PPP, MAC addresses |
| **1** | **Physical** | bits on the medium: voltage, light, radio | fibre, copper, radio spectrum, 5G NR, DOCSIS |

> **A6 answer (memorise this):** The Layered Internet Model has six layers: (1) Physical — bits on the medium; (2) Data Link — framing and error detection on a link; (3) Network — routing and addressing across networks; (4) Transport — end-to-end reliability and flow control; (5) Presentation/Session — data representation, encryption, sessions; (6) Application — user-facing services. Each layer serves the one above and relies on the one below.

*(56 words. Six layers, name + one-line function. Draw the stack in 60 seconds.)*

---

## 3.3 Digital innovation

> **Digital innovation is the creation of new value through the novel combination of digital technologies (data, algorithms, platforms, connectivity) with existing products, processes or business models — where the *digital component* is the primary source of novelty and scalability.**

### Characteristics — the list A7 expects (2 marks ≈ 55 words)

> **Five characteristics of digital innovation:** (1) **Recombinant** — combines existing digital building blocks (APIs, data, algorithms) rather than inventing from scratch. (2) **Scalable at near-zero marginal cost** — the digital core replicates infinitely; physical complements (logistics, hardware) are the bottleneck. (3) **Generative** — enables unanticipated third-party innovation (apps on iOS, stores on Shopify, models on Hugging Face). (4) **Data-driven iteration** — usage data feeds rapid A/B testing and model retraining; the product improves *in use*. (5) **Ecosystem-dependent** — value relies on complementors, standards, and platform infrastructure; no firm innovates in isolation.

*(58 words. Five named characteristics, one clause each.)*

---

## 3.4 Digital business models — B15 (5 marks ≈ 200 words)

> **Shape: define digital business model → four canonical models with mechanism + example → why they differ from traditional models. ~200 words.**

A **digital business model** is a logic for creating and capturing value where the *core value proposition* is delivered digitally, the *cost structure* exhibits near-zero marginal cost, and *network effects* or *data feedback loops* are the primary growth engine.

| Model | Value creation mechanism | Value capture | Example |
|---|---|---|---|
| **Platform / marketplace** | match supply ↔ demand; network effects | transaction fees, commissions, subscriptions | Daraz, Uber, Airbnb, App Store |
| **Freemium / tiered** | free core service → data & network → paid upgrades | subscriptions, usage fees, enterprise licences | Spotify, Dropbox, Canva, Notion |
| **Data / attention** | free service → aggregate attention/behaviour → sell access | advertising, data licensing, lead generation | Google Search, Facebook, YouTube, TikTok |
| **Infrastructure / API** | provide digital primitives (compute, storage, ML, payments) as a service | usage-based metering, subscriptions | AWS, Azure, Stripe, Twilio, Hugging Face |

**Why they differ from traditional models.** (1) **Cost structure:** marginal cost ≈ 0 for the digital core; traditional models have constant marginal cost. (2) **Growth engine:** network effects and data feedback loops (self-reinforcing); traditional models rely on sales/marketing spend. (3) **Value capture:** often indirect (ads, data, ecosystem fees) rather than direct unit price. (4) **Boundary:** the firm is an *orchestrator* of an ecosystem, not a vertically integrated producer.

*(212 words)*

---

## 3.5 Value creation models — C19 (10 marks ≈ 380 words)

> **Shape: name the model → four components with mechanism → three economic implications → Nepal anchor. ~380 words.**

The **value creation model for digital markets** (from Overby & Audestad, the syllabus reading) describes how digital firms create value through **four interconnected components**:

### 1. Value proposition — the digital core
The product or service whose *primary value* is digital: software, data, algorithmic output, platform access, digital content. It is **recombinant** (built from APIs, open-source, data), **scalable** (near-zero marginal cost), and **generative** (enables complementors).

### 2. Value architecture — the platform and ecosystem
The **technical and organisational structure** that delivers the proposition: the platform (matching engine, APIs, infrastructure), the *governance rules* (who joins, revenue share, standards), and the *complementor network* (developers, merchants, content creators). The architecture determines whether value is *centralised* (Apple App Store) or *distributed* (Web3, open protocols).

### 3. Value network — the multi-sided interactions
The **set of relationships** across sides: direct network effects (same-side), indirect network effects (cross-side), data feedback loops (usage → better model → better service → more usage), and *coopetition* dynamics (Unit 3.1). The network is the *moat* — it is hard to replicate because it is social and behavioural, not just technical.

### 4. Value finance — the capture logic
How the firm **converts network value into revenue**: transaction fees, subscriptions, advertising, data licensing, infrastructure metering, or *ecosystem fees* (Apple's 30%, Shopify's transaction fee). The finance model must align incentives across sides — if one side is over-charged, the network shrinks.

---

### Economic implications — three, with Nepal context

1. **Increasing returns and market concentration.** The value architecture + network → winner-take-most. The firm that reaches critical mass first captures the complementor network and the data feedback loop. *Implication for Nepal:* local platforms (Daraz, Foodmandu, eSewa) face global entrants with deeper capital and existing networks; policy must address the *effective* barrier, not just legal entry.

2. **Decoupling of value creation and capture.** The platform creates value by enabling *others* (complementors) to create value; it captures a *slice*. *Implication:* tax base shifts from corporate profit (hard to allocate) to transaction volume (easier) — Nepal's 2% Digital Services Tax targets this.

3. **Innovation shifts from closed R&D to open recombination.** Generative platforms (Android, AWS, Hugging Face) let thousands of firms innovate *on top*; the platform's R&D is infrastructure, not end-products. *Implication for Nepal:* the opportunity is not to build the next Android, but to build *on* Android/AWS — local fintech, agri-tech, health-tech as complementors. The Agro-tech Concern case (Unit 6) is exactly this: a complementor on mobile connectivity and payment rails.

---

### C19 · "Explain the value creation model. What are its economic implications?" [10]

> **Shape: four components → three implications → Nepal anchor. ~380 words.**

The **value creation model for digital markets** (Overby & Audestad) has four interconnected components:

**1. Value proposition — the digital core.** The product whose primary value is digital: software, data, algorithmic output, platform access. It is recombinant (built from APIs, open-source, data), scalable (near-zero marginal cost), and generative (enables complementors).

**2. Value architecture — the platform and ecosystem.** The technical and organisational structure: the platform (matching engine, APIs, infrastructure), governance rules (who joins, revenue share, standards), and the complementor network (developers, merchants, creators). Architecture determines whether value is centralised (Apple) or distributed (open protocols).

**3. Value network — the multi-sided interactions.** Direct and indirect network effects, data feedback loops (usage → better model → better service → more usage), and coopetition dynamics. The network is the moat — hard to replicate because it is social and behavioural, not just technical.

**4. Value finance — the capture logic.** How the firm converts network value into revenue: transaction fees, subscriptions, advertising, data licensing, infrastructure metering, or ecosystem fees (Apple's 30%). The finance model must align incentives — over-charge one side and the network shrinks.

**Economic implications.** (1) **Increasing returns and concentration:** value architecture + network → winner-take-most. Nepal's local platforms face global entrants with deeper capital; policy must address effective barriers. (2) **Decoupling of creation and capture:** the platform enables others to create value and captures a slice. Tax base shifts from corporate profit to transaction volume — Nepal's 2% DST targets this. (3) **Innovation shifts to open recombination:** generative platforms let thousands innovate on top; platform R&D is infrastructure. Nepal's opportunity is building *on* Android/AWS — local fintech, agri-tech, health-tech as complementors. The Agro-tech Concern case is exactly this: a complementor on mobile connectivity and payment rails.

*(386 words)*

---

## 3.6 Modeling of digital markets

The syllabus's last bullet — "modeling of digital markets" — is the analytical lens that ties the unit together. Three models to know:

| Model | What it explains | Key variables |
|---|---|---|
| **Two-sided market (Rochet & Tirole)** | pricing structure: subsidise one side, charge the other | cross-side network effects, price elasticity per side, transaction volume |
| **Network effects adoption (Katz & Shapiro)** | critical mass, tipping, lock-in, multi-homing | installed base, switching costs, compatibility, expectations |
| **Platform governance (Eisenmann et al.)** | openness vs control, revenue split, competition with complementors | boundary resources (APIs, SDKs), governance rules, complementor incentives |

**For the exam:** you do not need to derive equations. You need to *name the model*, say *what it explains*, and give *one Nepal illustration*. Example: "The two-sided market model explains why eSewa subsidises consumers (zero fees) and charges merchants — the cross-side network effect means more consumers attract more merchants, and the merchant side has lower price elasticity."

---

## 3.7 Answer skeletons

### A6 · "State the Layered Internet Model." [2]

> The Layered Internet Model has six layers: (1) Physical — bits on the medium (fibre, copper, radio); (2) Data Link — framing and error detection on a link (Ethernet, Wi-Fi); (3) Network — routing and addressing across networks (IP, BGP); (4) Transport — end-to-end reliability and flow control (TCP, UDP); (5) Presentation/Session — data representation, encryption, sessions (TLS, JSON); (6) Application — user-facing services (HTTP, SMTP, APIs). Each layer serves the one above and relies on the one below.

*(56 words)*

### A7 · "What are the characteristics of digital innovation?" [2]

> Five characteristics: (1) **Recombinant** — combines existing digital building blocks (APIs, data, algorithms). (2) **Scalable at near-zero marginal cost** — the digital core replicates infinitely. (3) **Generative** — enables unanticipated third-party innovation (apps on iOS, stores on Shopify). (4) **Data-driven iteration** — usage data feeds rapid A/B testing and model retraining. (5) **Ecosystem-dependent** — value relies on complementors, standards, platform infrastructure.

*(58 words)*

### B14 · "Differentiate between competition and coopetition with examples." [5]

> Competition is adversarial interaction where firms vie for the same customers with substitutes — one's gain is the other's loss. Coopetition is simultaneous competition and cooperation: firms cooperate on the platform/infrastructure layer (standards, ecosystem growth) and compete on the application layer (differentiation, pricing).
>
> **Daraz vs SastoDeal** is pure competition — both marketplaces, same sellers, same buyers, substitute services. **Google + Samsung** is coopetition — they cooperate on Android (OS, Play Store, ecosystem standards) and compete on hardware (Pixel vs Galaxy) and first-party apps.
>
> Coopetition dominates digital markets because network effects need critical mass (no firm bootstraps a platform alone), standards are public goods, complementors are the platform's value, and data/AI amplify shared infrastructure.

*(208 words)*

### B15 · "Explain the data-driven business models with examples." [5]

> A digital business model creates and captures value where the core proposition is digital, marginal cost ≈ 0, and network effects or data loops drive growth. Four canonical models: (1) **Platform/marketplace** — match supply↔demand; fees, commissions (Daraz, Uber). (2) **Freemium/tiered** — free core → data/network → paid upgrades; subscriptions (Spotify, Notion). (3) **Data/attention** — free service → aggregate attention → sell access; advertising (Google, Facebook). (4) **Infrastructure/API** — digital primitives as a service; usage-based metering (AWS, Stripe).
>
> They differ from traditional models: marginal cost ≈ 0 (vs constant); growth via network effects/data loops (vs sales spend); capture often indirect (ads, ecosystem fees); firm is an orchestrator, not a vertical producer.

*(212 words)*

### C19 · "Explain the value creation model. What are its economic implications?" [10]

> The value creation model (Overby & Audestad) has four components. **1. Value proposition** — the digital core: recombinant, scalable, generative. **2. Value architecture** — platform, governance, complementor network; centralised (Apple) or distributed (open protocols). **3. Value network** — direct/indirect network effects, data feedback loops, coopetition; the moat is social/behavioural. **4. Value finance** — capture logic: transaction fees, subscriptions, ads, ecosystem fees; must align incentives.
>
> **Economic implications.** (1) Increasing returns + concentration: architecture + network → winner-take-most. Nepal's local platforms face global entrants; policy must address effective barriers. (2) Decoupling creation/capture: platform enables others, captures a slice. Tax shifts from profit to transaction volume — Nepal's 2% DST. (3) Innovation shifts to open recombination: generative platforms (Android, AWS) let thousands innovate on top. Nepal's opportunity: build *on* Android/AWS — local fintech, agri-tech, health-tech. Agro-tech Concern is a complementor on mobile connectivity and payment rails.

*(386 words)*

---

## 3.8 Traps

| Trap | Why it costs marks | Fix |
|---|---|---|
| Drawing the Layered Internet Model with 4 or 7 layers | A6 says "state the model" — six layers is the standard | memorise the six: Physical, Data Link, Network, Transport, Presentation/Session, Application |
| Listing layers without one-line functions | A6 expects name + function | each layer: name → one-line function |
| Confusing competition and coopetition | B14 says *differentiate* — a list of one is not a distinction | three-row table: layer, goal, relationship; then two examples |
| Giving "Daraz vs Foodmandu" as competition | they are different models (marketplace vs food delivery) | Daraz vs SastoDeal (both marketplaces) |
| Listing only three MSP types for A4 | A4 says "four types" | marketplace, payment, social/content, innovation/developer |
| Describing value creation model as only "platform + users" | C19 has four named components | proposition, architecture, network, finance |
| Missing the three economic implications in C19 | the question has two halves: model + implications | three implications: concentration, decoupling, recombination |
| Saying "digital innovation = new technology" | misses recombinant, generative, data-driven, ecosystem | five characteristics, each one clause |

---

## 3.9 Self-test (answers collapsed)

1. Draw the Layered Internet Model: six layers, name + one-line function each. *(2 marks — A6)*
2. Name the five characteristics of digital innovation. *(2 marks — A7)*
3. Differentiate competition from coopetition in a three-row table, with one example each. *(5 marks — B14)*
4. Name the four canonical digital business models, with value creation mechanism and one example each. *(5 marks — B15)*
5. Name the four components of the value creation model. *(3 marks)*
6. Give the three economic implications of the value creation model, with one Nepal anchor each. *(10 marks — C19)*
7. What does the two-sided market model explain, and what is the Nepal illustration? *(3 marks)*

<details>
<summary>Answers</summary>

1. (1) Physical — bits on medium. (2) Data Link — framing/error detection. (3) Network — routing/addressing. (4) Transport — reliability/flow control. (5) Presentation/Session — representation/encryption/sessions. (6) Application — user-facing services.
2. Recombinant, scalable at near-zero marginal cost, generative, data-driven iteration, ecosystem-dependent.
3. **Competition:** application layer, capture share, zero-sum. Example: Daraz vs SastoDeal. **Coopetition:** platform layer cooperate + application layer compete, grow pie + claim slice. Example: Google + Samsung (Android vs Pixel/Galaxy).
4. (1) Platform/marketplace — match supply↔demand — Daraz. (2) Freemium/tiered — free core→data→paid — Spotify. (3) Data/attention — free service→aggregate attention→sell access — Google. (4) Infrastructure/API — primitives as service — AWS.
5. Value proposition (digital core), value architecture (platform + governance + complementors), value network (network effects + data loops + coopetition), value finance (capture logic).
6. (1) Increasing returns → concentration: Nepal's local platforms vs global entrants. (2) Decoupling creation/capture: tax shifts to transaction volume (2% DST). (3) Innovation shifts to recombination: build on Android/AWS — Agro-tech Concern as complementor.
7. Two-sided market model explains pricing structure: subsidise one side, charge the other, based on cross-side network effects and price elasticity. Nepal: eSewa subsidises consumers (zero fees), charges merchants — more consumers attract more merchants; merchant side has lower price elasticity.

</details>

---

## 3.10 Sixty-second check

Close the file and, on a blank page:

- [ ] Layered Internet Model: six layers, name + function
- [ ] Five characteristics of digital innovation
- [ ] Competition vs coopetition: three-row table + two examples
- [ ] Four digital business models: mechanism + example
- [ ] Value creation model: four components
- [ ] Three economic implications + Nepal anchors
- [ ] Two-sided market model: what it explains + Nepal illustration

If all seven are there, Unit 3's **24 marks** are covered — A6, A7, B14, B15, C19.

---

*Sources for this unit: TU FOM syllabus (IT 250, Unit 3, 10 LHs) · TU 2026 board paper (A6, A7, B14, B15, C19) · Overby & Audestad, Introduction to Digital Economics, ch. 4–7 (syllabus reading) · Maheshwari, Digital Transformation, ch. 3–5 (syllabus reading) · Standard platform economics: Rochet & Tirole (two-sided markets), Katz & Shapiro (network effects), Eisenmann et al. (platform governance) — textbook-level, not fetched this session. Nepal MSP examples (Daraz, eSewa, Foodmandu, Google/Samsung) are widely known market participants, described as examples of the category, not claims about current market share or architecture. The Agro-tech Concern case facts (85,555 farmers, NPR 489m transactions, 16% price gain, remote reach gap, manual price errors, NPR 16m fee revenue) are verbatim from the 2026 board paper.*