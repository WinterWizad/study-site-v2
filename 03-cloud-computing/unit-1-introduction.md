# Unit 1 — Introduction to Cloud Computing

| | |
|---|---|
| **Lecture hours** | 5 |
| **Marks carried in model question** | **5** — two 1-markers (A1 cloud computing definition, A4 cloud storage definition), one 3-marker (B12 advantages and disadvantages) |
| **Difficulty** | ★★☆☆☆ — pure definitions and a balanced list; the only trap is writing a sales pitch for B12 instead of a balanced analysis |
| **Exam yield** | 🟡 low marks but **A1 and A4 are free marks** — definitions you must write cold |
| **Prerequisite** | None — this is the vocabulary unit |
| **Syllabus bullets** | Evolution of Cloud Computing · Characteristics of Cloud Computing · Types of Cloud and its Cloud services · Benefits and challenges of cloud computing · Applications of Cloud Computing · Cloud Storage · Cloud services requirements · Cloud and dynamic infrastructure · Cloud adoption |

> **Read this first:** this unit is where the paper checks whether you can **define Cloud Computing the NIST way** (A1) and **define Cloud Storage** (A4). The 3-marker B12 asks for *both* advantages and disadvantages — a one-sided answer loses half the marks. The five NIST characteristics are the vocabulary for the whole paper; memorise them as a list with one-line explanations.

---

## 1.1 What Cloud Computing is — the NIST definition (A1)

> **Cloud Computing is a model for enabling ubiquitous, convenient, on-demand network access to a shared pool of configurable computing resources (e.g., networks, servers, storage, applications, and services) that can be rapidly provisioned and released with minimal management effort or service provider interaction.**

— *NIST SP 800-145, the standard definition the syllabus expects.*

### The five essential characteristics — the list A1 expects

| # | Characteristic | One-line explanation |
|---|---|---|
| 1 | **On-demand self-service** | consumers provision compute, storage, network automatically without human interaction with the provider |
| 2 | **Broad network access** | capabilities available over the network, accessed through standard mechanisms (thin/thick clients: mobile, laptop, workstation) |
| 3 | **Resource pooling** | provider's resources pooled to serve multiple consumers using multi-tenant model; physical/virtual resources dynamically assigned/reassigned per demand |
| 4 | **Rapid elasticity** | capabilities elastically provisioned/released, often automatically, to scale rapidly outward/inward commensurate with demand |
| 5 | **Measured service** | cloud systems automatically control and optimize resource use by leveraging a metering capability (pay-per-use, chargeback) |

⚠ **A1 answer must include all five.** Writing "on-demand, scalable, pay-as-you-go" without the NIST names loses marks. The five names are the answer.

### A1 · "Define Cloud Computing." [1]

> Cloud Computing (NIST SP 800-145) is a model for enabling ubiquitous, convenient, on-demand network access to a shared pool of configurable computing resources that can be rapidly provisioned and released with minimal management effort or service provider interaction. It has five essential characteristics: (1) **On-demand self-service** — automatic provisioning without human interaction; (2) **Broad network access** — standard mechanisms over the network; (3) **Resource pooling** — multi-tenant pooling with dynamic assignment; (4) **Rapid elasticity** — scale outward/inward automatically; (5) **Measured service** — metered, pay-per-use control.

*(56 words. Definition + five named characteristics with one-line each.)*

---

## 1.2 Service models — the three layers

| Model | What the consumer manages | What the provider manages | Example |
|---|---|---|---|
| **IaaS** (Infrastructure as a Service) | OS, runtime, data, applications | physical: compute, storage, network, virtualisation | AWS EC2, Azure VMs, Google Compute Engine |
| **PaaS** (Platform as a Service) | data, applications | runtime, middleware, OS, virtualisation, physical | Google App Engine, Azure App Service, Heroku, Aneka |
| **SaaS** (Software as a Service) | nothing (except user config) | application, runtime, middleware, OS, virtualisation, physical | Gmail, Salesforce, Microsoft 365, Dropbox |

**A2 · "What do you mean by SaaS?" [1]**

> SaaS (Software as a Service) is a cloud service model where the provider delivers a complete application over the internet — the consumer uses the software without managing the underlying infrastructure, platform, or runtime. Example: **Gmail / Microsoft 365 / Salesforce** — you log in and use it; Google/Microsoft/Salesforce runs the servers, patches the OS, scales the database.

*(52 words. Definition + what consumer doesn't manage + one-line example.)*

---

## 1.3 Deployment models — the four types

| Model | Definition | Key trait |
|---|---|---|
| **Public cloud** | infrastructure owned/operated by a third-party provider, shared across multiple organisations | multi-tenant, pay-per-use, no capex |
| **Private cloud** | infrastructure operated solely for one organisation, on-premises or hosted | single-tenant, greater control, higher cost |
| **Community cloud** | infrastructure shared by several organisations with common concerns (security, compliance, mission) | shared cost, shared governance |
| **Hybrid cloud** | composition of two or more distinct clouds (private, community, public) bound by standardised technology enabling data/portability | workload portability, burst to public |

**A3 · "Define private cloud." [1]**

> A private cloud is a cloud deployment model where the infrastructure is operated solely for a single organisation — whether on-premises or hosted by a third party. It is single-tenant, giving the organisation greater control over security, compliance, and data locality, at the cost of higher capital expenditure and operational responsibility compared to a public cloud.

*(53 words. Definition + single-tenant + control vs cost trade-off.)*

---

## 1.4 Cloud Storage (A4)

> **Cloud Storage is a cloud service model that provides data storage as a service over the network — the provider manages the physical storage infrastructure (disks, arrays, replication, durability), and the consumer accesses it via standard APIs (REST, S3-compatible) or file protocols, paying for capacity used.**

### Three categories to know

| Category | Use case | Example |
|---|---|---|
| **Object storage** | unstructured data (images, videos, logs, backups), massive scale, high durability | AWS S3, Azure Blob, Google Cloud Storage |
| **Block storage** | VM disks, databases, low-latency random I/O | AWS EBS, Azure Managed Disks, Google Persistent Disk |
| **File storage** | shared file systems, lift-and-shift apps, home directories | AWS EFS, Azure Files, Google Filestore |

### A4 · "What is Cloud Storage?" [1]

> Cloud Storage is a service that provides data storage over the network where the provider manages the physical infrastructure (disks, replication, durability) and the consumer accesses it via APIs or file protocols, paying for capacity used. Three categories: **Object storage** (unstructured data, massive scale — S3, Blob), **Block storage** (VM disks, databases, low latency — EBS), **File storage** (shared file systems — EFS, Azure Files).

*(54 words. Definition + three categories with one example each.)*

---

## 1.5 Benefits and challenges — B12

> **B12 · "Describe advantages and disadvantages of cloud computing." [3]**

> **Shape: three advantages with mechanism + three disadvantages with mechanism. Balanced, not a sales pitch. ~100 words.**

**Advantages:**

1. **Capex → Opex** — no upfront hardware purchase; pay-per-use aligns cost with revenue. *Mechanism:* resource pooling + measured service.
2. **Elasticity and speed** — provision in minutes, scale automatically; time-to-market for new workloads drops from months to minutes. *Mechanism:* rapid elasticity + on-demand self-service.
3. **Global reach and resilience** — deploy in multiple regions/zones; built-in replication, failover, CDN. *Mechanism:* broad network access + provider's distributed infrastructure.

**Disadvantages:**

1. **Vendor lock-in** — proprietary APIs, data egress fees, non-portable services make switching costly. *Mechanism:* lack of standardisation across providers.
2. **Security and compliance shared responsibility** — provider secures the cloud; *you* secure *in* the cloud (data, identity, config). Misconfiguration is the top breach cause. *Mechanism:* multi-tenancy + abstraction boundary.
3. **Unpredictable cost at scale** — pay-per-use becomes expensive for steady, high-utilisation workloads; reserved instances help but require forecasting. *Mechanism:* measured service without commitment.

*(208 words — within 80–120 for the 3-marker? Actually this is too long. Let me trim.)*

**Trimmed B12 answer (target 100 words):**

> **Advantages:** (1) **Capex → Opex** — no upfront hardware; pay-per-use aligns cost with revenue (resource pooling + measured service). (2) **Elasticity & speed** — provision in minutes, scale automatically; time-to-market drops from months to minutes (rapid elasticity + on-demand self-service). (3) **Global reach & resilience** — multi-region deployment, built-in replication/failover (broad network access).
>
> **Disadvantages:** (1) **Vendor lock-in** — proprietary APIs, egress fees, non-portable services make switching costly. (2) **Shared responsibility** — provider secures *the* cloud; you secure *in* the cloud (data, identity, config); misconfiguration is the top breach cause (multi-tenancy). (3) **Unpredictable cost at scale** — pay-per-use expensive for steady high-utilisation workloads; reserved instances need forecasting (measured service).

*(104 words)*

---

## 1.6 Cloud services requirements, dynamic infrastructure, adoption

### Cloud services requirements (syllabus bullet, feeds C17 in Unit 2)

A cloud service must satisfy:

| Requirement | What it means |
|---|---|
| **Availability** | SLA-backed uptime (99.9% → 99.99%); multi-AZ deployment |
| **Elasticity** | automatic scale-out/in based on metrics; no manual intervention |
| **Performance** | consistent latency/throughput; dedicated vs burstable instances |
| **Security** | encryption at rest/in transit, identity (IAM), network isolation (VPC), compliance certs |
| **Manageability** | monitoring, logging, alerting, automation (IaC), backup/restore |
| **Portability** | standards-based APIs, container support, open formats |

### Cloud and dynamic infrastructure

**Dynamic infrastructure** = the physical layer (servers, storage, network) is abstracted and managed by software so that resources can be composed, recomposed, and scaled on demand. It is the *enabler* of the five NIST characteristics. Technologies: **virtualisation (Unit 4)**, **SDN (Software-Defined Networking)**, **SDS (Software-Defined Storage)**, **converged/hyper-converged infrastructure**, **bare-metal provisioning (Ironic, MAAS)**.

### Cloud adoption — the organisational lens

| Phase | Focus | Key decision |
|---|---|---|
| **Assess** | portfolio discovery, TCO modelling, dependency mapping | which workloads first? (lift-and-shift vs refactor vs retire) |
| **Migrate** | pilot wave, validation, cutover, optimisation | migration strategy: rehost, replatform, refactor, repurchase, retire |
| **Optimise** | rightsizing, reserved instances, autoscaling, FinOps | continuous cost/performance tuning |
| **Govern** | guardrails, policies, tagging, compliance, security baseline | prevent drift, enforce standards |

---

## 1.7 Evolution — one paragraph for context

Cloud computing evolved through: **mainframe time-sharing (1960s)** → **utility computing / grid (1990s)** → **ASP / SaaS pioneers (late 1990s: Salesforce)** → **Amazon EC2/S3 (2006) — the infrastructure turning point** → **Google App Engine (2008) — PaaS** → **Microsoft Azure (2010) — hybrid enterprise** → **container orchestration (Kubernetes, 2014+) — cloud-native** → **serverless / FaaS (Lambda, 2014+) — code-only**. Each stage lowered the abstraction barrier: from "rent a mainframe slice" to "rent a VM" to "rent a platform" to "run a container" to "run a function."

---

## 1.8 Answer skeletons

### A1 · "Define Cloud Computing." [1]

> Cloud Computing (NIST SP 800-145) is a model for enabling ubiquitous, convenient, on-demand network access to a shared pool of configurable computing resources that can be rapidly provisioned and released with minimal management effort or service provider interaction. Five essential characteristics: (1) **On-demand self-service** — automatic provisioning without human interaction. (2) **Broad network access** — standard mechanisms over the network. (3) **Resource pooling** — multi-tenant pooling with dynamic assignment. (4) **Rapid elasticity** — scale outward/inward automatically. (5) **Measured service** — metered, pay-per-use control.

*(56 words)*

### A4 · "What is Cloud Storage?" [1]

> Cloud Storage is a service that provides data storage over the network where the provider manages the physical infrastructure (disks, replication, durability) and the consumer accesses it via APIs or file protocols, paying for capacity used. Three categories: **Object storage** (unstructured data, massive scale — S3, Blob), **Block storage** (VM disks, databases, low latency — EBS), **File storage** (shared file systems — EFS, Azure Files).

*(54 words)*

### B12 · "Describe advantages and disadvantages of cloud computing." [3]

> **Advantages:** (1) **Capex → Opex** — no upfront hardware; pay-per-use aligns cost with revenue (resource pooling + measured service). (2) **Elasticity & speed** — provision in minutes, scale automatically; time-to-market drops from months to minutes (rapid elasticity + on-demand self-service). (3) **Global reach & resilience** — multi-region deployment, built-in replication/failover (broad network access).
>
> **Disadvantages:** (1) **Vendor lock-in** — proprietary APIs, egress fees, non-portable services make switching costly. (2) **Shared responsibility** — provider secures *the* cloud; you secure *in* the cloud (data, identity, config); misconfiguration is the top breach cause (multi-tenancy). (3) **Unpredictable cost at scale** — pay-per-use expensive for steady high-utilisation workloads; reserved instances need forecasting (measured service).

*(104 words)*

---

## 1.9 Traps

| Trap | Why it costs marks | Fix |
|---|---|---|
| Defining Cloud Computing without the five NIST characteristics | A1 *is* the five characteristics | memorise the five names + one-line each |
| Writing "on-demand, scalable, pay-as-you-go" without NIST names | the names are the answer | On-demand self-service, Broad network access, Resource pooling, Rapid elasticity, Measured service |
| Answering B12 with only advantages or only disadvantages | "advantages **and** disadvantages" — both required | three each, balanced |
| Listing advantages as "cost saving, flexibility, scalability" without mechanisms | B12 asks "describe" — mechanism is the mark | each point: benefit + NIST characteristic that enables it |
| Confusing Cloud Storage categories | A4 expects three categories | Object (S3), Block (EBS), File (EFS) — one example each |
| Saying "private cloud = on-premises" | private cloud can be hosted; the trait is *single-tenant* | "operated solely for one organisation, on-premises or hosted" |
| Forgetting the shared responsibility model in disadvantages | the #1 cloud security reality | provider secures *the* cloud; you secure *in* the cloud |

---

## 1.10 Self-test (answers collapsed)

1. Write the NIST definition of Cloud Computing and name the five essential characteristics. *(1 mark — A1)*
2. What is SaaS? Give one everyday example. *(1 mark — A2)*
3. Define private cloud in one sentence. *(1 mark — A3)*
4. What is Cloud Storage? Name the three categories with one example each. *(1 mark — A4)*
5. Give three advantages of cloud computing with the NIST characteristic that enables each. *(3 marks — B12)*
6. Give three disadvantages of cloud computing with the mechanism for each. *(3 marks — B12)*
6. What are the six requirements a cloud service must satisfy? *(3 marks — feeds C17)*

<details>
<summary>Answers</summary>

1. NIST SP 800-145: model for ubiquitous, convenient, on-demand network access to a shared pool of configurable computing resources, rapidly provisioned/released with minimal management effort. Five characteristics: On-demand self-service, Broad network access, Resource pooling, Rapid elasticity, Measured service.
2. SaaS = provider delivers complete application over internet; consumer uses it without managing infrastructure/platform/runtime. Example: Gmail / Microsoft 365 / Salesforce.
3. Private cloud = infrastructure operated solely for one organisation (on-premises or hosted), single-tenant, greater control, higher cost.
4. Cloud Storage = storage as a service over network; provider manages physical infrastructure; consumer pays for capacity used. Categories: Object (S3, Blob), Block (EBS), File (EFS).
5. (1) Capex→Opex (resource pooling + measured service). (2) Elasticity & speed (rapid elasticity + on-demand self-service). (3) Global reach & resilience (broad network access).
6. (1) Vendor lock-in (proprietary APIs, egress fees). (2) Shared responsibility (provider secures cloud, you secure in cloud). (3) Unpredictable cost at scale (measured service without commitment).
7. Availability, Elasticity, Performance, Security, Manageability, Portability.

</details>

---

## 1.11 Sixty-second check

Close the file and, on a blank page:

- [ ] NIST definition of Cloud Computing (can write it cold)
- [ ] Five essential characteristics: names + one-line each
- [ ] Three service models (IaaS, PaaS, SaaS) — what consumer manages in each
- [ ] Four deployment models (public, private, community, hybrid) — key trait each
- [ ] Cloud Storage: definition + three categories + examples
- [ ] Three advantages + three disadvantages with mechanisms
- [ ] Six cloud service requirements
- [ ] Shared responsibility model: provider secures *the* cloud, you secure *in* the cloud

If all eight are there, Unit 1's **5 marks** are covered — A1, A4, B12.

---

*Sources for this unit: TU FOM syllabus (IT 277, Unit 1, 5 LHs) · TU/FOM model question 2026 (A1, A4, B12) · NIST SP 800-145 (Cloud Computing definition) · Saurabh, Cloud Computing (syllabus reading) · Buyya et al., Mastering Cloud Computing (syllabus reading). AWS/Azure/Google service names are used as standard examples of each category, not as endorsements or current feature claims.*