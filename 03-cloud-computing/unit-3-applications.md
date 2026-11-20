# Unit 3 — Cloud Applications

| | |
|---|---|
| **Lecture hours** | 5 |
| **Marks in model question** | 0 — but **insurance for a board paper**. A board setter could easily put a 5-marker on migration, licensing, cost model, SLA, or web application design. |
| **Difficulty** | ★★★☆☆ — practical topics; the concepts are straightforward but need structured answers |
| **Exam yield** | 🟢 low in model question, **high insurance value** — 5 hours, read once, be ready for any 5-marker |
| **Prerequisite** | Units 1–2 (service models, deployment models, cloud service requirements) |
| **Syllabus** | Migrating to the cloud · Software licenses · Cloud cost model · Service levels for cloud applications — security · Web applications design |

> **Read this first:** This unit carries **zero marks in the model question**, but that is *one sample*. A board paper can put a 5-marker on any of these five bullets. Read it once, know the six migration strategies, the three license models, the cost model components, the SLA structure, and the web app design principles. That is your insurance.

---

## Coverage Map

```
3.1 Migrating to the Cloud — Six Strategies
├── Rehost, Replatform, Refactor, Repurchase, Retire, Retain
├── When to use each + trade-off
└── Migration process: assess → pilot → migrate → optimise → govern

3.2 Software Licenses in the Cloud
├── BYOL, License-included, Subscription/SaaS, Open source
└── Key trap: license mobility — not all on-prem licences allow cloud use

3.3 Cloud Cost Model
├── Five components: compute, storage, network, managed services, support
├── Hidden costs: data egress, API calls, idle resources, over-provisioning
└── FinOps discipline: visibility, optimisation, governance, culture

3.4 Service Levels for Cloud Applications — Security
├── SLA vs SLO vs SLI
├── Five SLA elements: availability, performance, durability, support, credits
└── Security SLA: encryption, compliance, incident response, vulnerability mgmt, data sovereignty

3.5 Web Applications Design — Cloud-Native Principles
├── Six principles: statelessness, horizontal scaling, resilience, observability, CI/CD, security by default
└── Twelve-Factor App summary
```

---

## 3.1 Migrating to the Cloud — the Six Strategies

| Strategy | What it means | When to use | Trade-off |
|---|---|---|---|
| **Rehost** ("lift-and-shift") | move VMs as-is to IaaS; no code changes | speed, low risk, legacy apps | no cloud-native benefits; same ops burden |
| **Replatform** ("lift-tinker-shift") | minor optimisations (managed DB, containerise) | moderate effort, some cloud benefits | limited modernisation |
| **Refactor** ("re-architect") | rewrite for cloud-native (microservices, serverless) | long-term agility, scalability | high effort, high risk, high reward |
| **Repurchase** | replace with SaaS (e.g., on-prem CRM → Salesforce) | commoditised function, vendor manages | data migration, process change |
| **Retire** | decommission unused apps | reduce cost, attack surface | must identify dependencies first |
| **Retain** | keep on-premises (latency, compliance, not ready) | valid reasons exist | revisit periodically |

**Migration process:** assess (discovery, TCO, dependency map) → pilot (low-risk wave) → migrate (wave by wave, validate, cutover) → optimise (rightsizing, reserved instances, FinOps) → govern (guardrails, policies, tagging).

---

## 3.2 Software Licenses in the Cloud

| License model | Cloud implication | Example |
|---|---|---|
| **BYOL** (Bring Your Own License) | use existing on-prem licences on cloud (dedicated hosts, license mobility) | Windows Server, SQL Server, Oracle on AWS/Azure dedicated hosts |
| **License-included** (pay-as-you-go) | licence cost baked into instance hourly rate | AWS RDS (SQL Server license included), Azure SQL MI |
| **Subscription / SaaS** | pay per user/month; vendor manages compliance | Microsoft 365, Salesforce, ServiceNow |
| **Open source** | no licence cost; support subscription optional | Linux, PostgreSQL, Kubernetes, Kafka |

**Key trap:** "license mobility" — not all on-prem licences allow cloud use. Microsoft Software Assurance enables it; Oracle requires specific cloud programmes. Always verify the licence terms before migrating.

---

## 3.3 Cloud Cost Model

> **Cloud cost = compute + storage + network + managed services + support + (hidden: data egress, API calls, idle resources, over-provisioning).**

### Components

| Component | What to watch | Optimisation |
|---|---|---|
| **Compute** | instance type, on-demand vs reserved vs spot, rightsizing | reserved instances (1–3 yr, 30–72% off), spot (90% off, interruptible), autoscaling |
| **Storage** | tier (hot/cool/archive), redundancy (LRS/ZRS/GRS), snapshot lifecycle | lifecycle policies, archive tier, delete orphaned snapshots |
| **Network** | **data egress** (major hidden cost), inter-AZ traffic, VPN/Direct Connect | CloudFront/CDN, VPC endpoints, region selection, compression |
| **Managed services** | RDS, Redis, Kafka, Kubernetes control plane — pay for convenience | evaluate build vs buy; serverless (pay-per-request) for variable load |
| **Support** | Business/Enterprise tiers (AWS Support, Azure Support) | match tier to criticality; developer tier for non-prod |

### FinOps — the Discipline

1. **Visibility** — tagging (owner, env, project), cost allocation, dashboards
2. **Optimisation** — rightsizing, reserved/spot, storage tiering, delete waste
3. **Governance** — budgets, alerts, guardrails (SCPs, quotas), chargeback/showback
4. **Culture** — engineers own cost; finance partners with engineering

---

## 3.4 Service Levels for Cloud Applications — Security

> **SLA (Service Level Agreement)** = provider's commitment on availability, performance, support. **SLO (Service Level Objective)** = internal target. **SLI (Service Level Indicator)** = the metric measured.

### Standard SLA Structure

| Element | What it covers |
|---|---|
| **Availability** | % uptime (99.9% = 8.76h/yr downtime; 99.99% = 52.6min/yr) |
| **Performance** | latency percentiles (p50, p95, p99), throughput guarantees |
| **Durability** | data loss probability (S3: 99.999999999% = 11 nines) |
| **Support** | response time by severity (P1: 15min, P2: 1h, P3: 4h) |
| **Credits** | service credits for SLA breach (typically 10–100% of monthly fee) |

### Security in SLAs

| Security SLA element | What to demand |
|---|---|
| **Encryption** | at rest (AES-256), in transit (TLS 1.2+), key management (BYOK/HYOK) |
| **Compliance** | SOC 2, ISO 27001, PCI DSS, HIPAA, GDPR — provider's certifications |
| **Incident response** | breach notification timeline (GDPR: 72h), forensic support |
| **Vulnerability management** | patching cadence, scanning, pen test reports |
| **Data sovereignty** | region lock, data residency guarantees |

---

## 3.5 Web Applications Design — Cloud-Native Principles

| Principle | What it means | Cloud implementation |
|---|---|---|
| **Statelessness** | no session affinity; store state in external store (Redis, DB, S3) | enables horizontal scaling, zero-downtime deploy |
| **Horizontal scaling** | add instances, not bigger instances | auto-scaling groups, Kubernetes HPA, serverless |
| **Resilience** | design for failure: timeouts, retries, circuit breakers, bulkheads | Polly, Hystrix, Istio, AWS X-Ray |
| **Observability** | logs, metrics, traces — the three pillars | CloudWatch, Prometheus/Grafana, OpenTelemetry, X-Ray |
| **CI/CD** | automated build, test, deploy; infrastructure as code | GitHub Actions, GitLab CI, CodePipeline, ArgoCD, Terraform |
| **Security by default** | least privilege IAM, secrets management, WAF, DDoS protection | AWS Secrets Manager, Vault, AWS WAF, Shield |

### Twelve-Factor App (Summary)

1. **Codebase** — one repo, many deploys
2. **Dependencies** — explicit, isolated
3. **Config** — env vars, not files
4. **Backing services** — attached resources (DB, queue, cache)
5. **Build, release, run** — strict separation
6. **Processes** — stateless, share-nothing
7. **Port binding** — export services via port
8. **Concurrency** — scale out via process model
9. **Disposability** — fast startup, graceful shutdown
10. **Dev/prod parity** — keep environments similar
11. **Logs** — event streams, not files
12. **Admin processes** — run as one-off processes

---

## 3.6 Traps

| Trap | Why it costs marks | Fix |
|---|---|---|
| Writing "lift-and-shift" as the only migration strategy | six strategies exist; the question asks for "strategies" (plural) | know all six: rehost, replatform, refactor, repurchase, retire, retain |
| Confusing BYOL with license-included | different cost models, different compliance | BYOL = your licence on dedicated hosts; license-included = pay-per-hour |
| Forgetting data egress in cost model | it's the #1 hidden cost | always list egress as a network cost component |
| Writing SLA as only "99.9% uptime" | SLA has multiple elements | availability, performance, durability, support, credits |
| Missing security in SLA answer | "service levels for cloud applications — security" is the syllabus bullet | encryption, compliance, incident response, vulnerability mgmt, sovereignty |
| Listing Twelve-Factor App without cloud implementation | the question is about *cloud-native* design | map each factor to cloud implementation (e.g., config → env vars + Secrets Manager) |

---

## 3.7 Self-Test (Answers Collapsed)

1. Name the six cloud migration strategies. *(2 marks)*
2. When would you choose refactor over replatform? *(2 marks)*
3. What is BYOL, and when does it apply? *(2 marks)*
4. Name the five components of cloud cost. *(2 marks)*
5. Give three cloud cost optimisation techniques. *(3 marks)*
6. What are the five elements of an SLA? *(3 marks)*
7. Name three security SLA elements. *(2 marks)*
8. What does "statelessness" mean in cloud-native design, and why does it matter? *(2 marks)*

<details>
<summary>Answers</summary>

1. Rehost, replatform, refactor, repurchase, retire, retain.
2. Refactor when you need long-term agility, scalability, cloud-native benefits; replatform when you need moderate effort for some benefits. Refactor = rewrite; replatform = minor optimisations.
3. BYOL = Bring Your Own License; use existing on-prem licences on cloud (dedicated hosts, license mobility). Applies to Windows Server, SQL Server, Oracle with Software Assurance / specific cloud programmes.
4. Compute, storage, network, managed services, support. (Hidden: data egress, API calls, idle resources, over-provisioning.)
5. (1) Compute: reserved instances, spot, rightsizing, autoscaling. (2) Storage: lifecycle policies, delete orphans, tiered redundancy. (3) Network: CDN for egress, VPC endpoints, region selection.
6. Availability, performance, durability, support, credits.
7. Encryption (at rest/in transit + key mgmt), compliance certifications (SOC 2, ISO 27001), incident response (breach notification timeline), vulnerability management, data sovereignty.
8. Statelessness = no session affinity; state stored externally (Redis, DB, S3). Matters because it enables horizontal scaling (add instances) and zero-downtime deployments.

</details>

---

## 3.8 Sixty-Second Check

Close this file and, on a blank page:

- [ ] Six migration strategies: name + when to use + trade-off
- [ ] Three license models: BYOL, license-included, subscription/SaaS
- [ ] Cloud cost: five components + three optimisations
- [ ] SLA: five elements + three security elements
- [ ] Cloud-native design: six principles + Twelve-Factor summary

If all five are there, Unit 3's **insurance** is covered — ready for any board-paper 5-marker.

---

*Sources: TU FOM syllabus (IT 277, Unit 3, 5 LHs) · Saurabh, Cloud Computing, ch. 5–6 (syllabus reading) · Buyya et al., Mastering Cloud Computing, ch. 6–7 (syllabus reading) · AWS/Azure/GCP migration frameworks, Well-Architected Framework, FinOps Foundation — standard industry practices. AWS/Azure/Google service names are standard examples, not current feature claims.*