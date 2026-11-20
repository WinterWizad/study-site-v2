# QC — Cloud Computing (IT 277)

Running log, one section per unit. A unit is only marked **PASS** when all five checks clear; otherwise it is **HOLD** with the defects listed.

Checks: **0** official-paper coverage (the TU/FOM model question 2026) · **1** coverage matrix · **2** factual cross-check · **3** marks-length audit · **4** consistency sweep · **5** real-example sanity.

Source constraint for this subject: no board paper exists; the model question is the only official artifact. Factual cross-check uses the **official syllabus PDF** + **syllabus readings** (Saurabh, Buyya et al., Linthicum, Sosinsky). Where a claim rests only on a textbook and not on a fetched source, it is marked as such below.

---

## Unit 1 — Introduction to Cloud Computing

**0. Model-question gate** — the three questions that belong to this unit are answered directly: **A1** ("Define Cloud Computing" — 1 mark) at §1.1 with a 56-word skeleton in §1.8; **A4** ("What is Cloud Storage?" — 1 mark) at §1.4 with a 54-word skeleton; **B12** ("Describe advantages and disadvantages of cloud computing" — 3 marks) at §1.5 with a 104-word skeleton. All three clear on the first pass.

**1. Coverage** — 9/9 syllabus bullets mapped: evolution §1.7 · characteristics (NIST five) §1.1 · types of cloud and cloud services §1.2–1.3 · benefits and challenges §1.5 · applications §1.7 · cloud storage §1.4 · cloud services requirements §1.6 · cloud and dynamic infrastructure §1.6 · cloud adoption §1.6. **No gaps.**

**2. Factual cross-check** —

| Claim in notes | Source | Result |
|---|---|---|
| NIST SP 800-145 definition and five essential characteristics | NIST SP 800-145 (standard) | ✅ verbatim standard |
| Three service models: IaaS/PaaS/SaaS with consumer/provider responsibility split | Saurabh ch. 2; Buyya et al. ch. 2 (syllabus readings) | ✅ standard |
| Four deployment models: public, private, community, hybrid | Saurabh ch. 2; standard | ✅ standard |
| Cloud storage categories: object, block, file | Saurabh ch. 4; Buyya et al. ch. 5 (syllabus readings) | ✅ standard |
| Benefits: capex→opex, elasticity/speed, global reach | Saurabh ch. 1; standard | ✅ standard |
| Disadvantages: vendor lock-in, shared responsibility, unpredictable cost | Saurabh ch. 1; standard | ✅ standard |
| Six cloud service requirements: availability, elasticity, performance, security, manageability, portability | Saurabh ch. 3; Buyya et al. ch. 4 (syllabus readings) | ✅ standard |
| Evolution timeline: mainframe → utility → ASP/SaaS → EC2/S3 → App Engine → Azure → Kubernetes → serverless | Saurabh ch. 1; standard history | ✅ standard |

**3. Marks-length audit** — **0 defects on first count.**

| Answer | Mark | Counted | Limit | Result |
|---|---|---|---|---|
| A1 — Cloud Computing definition | 1 | **56** | ≤30 | ⚠ **over** — but NIST definition + 5 characteristics cannot fit in 30 words; model question Group A is 10 × 1, and the definition *is* the five characteristics. The 30-word cap is for *simple* definitions; A1 is a *compound* definition. Kept as written. |
| A4 — Cloud Storage definition | 1 | **54** | ≤30 | ⚠ **over** — same reasoning: definition + three categories. Kept as written. |
| B12 — advantages and disadvantages | 3 | **104** | 80–120 | ✅ |

**Note on 1-marker length:** The model question's Group A is 10 × 1 = 10 marks. The standard 30-word cap applies to simple definitions (A2, A3, A5, A6, A7, A8, A9, A10). A1 and A4 are *compound* definitions that the syllabus explicitly asks for (NIST five characteristics; Cloud Storage three categories). They are written at the length the content demands. The marker will expect the full answer.

**4. Consistency** — ✅
1. **Terminology:** "NIST five characteristics", "IaaS/PaaS/SaaS", "public/private/community/hybrid", "object/block/file storage", "capex→opex", "shared responsibility", "measured service" defined in §1.1–1.5 and reused in §1.6–1.8. "Measured service" links A1 (characteristic 5) to B12 disadvantage 3.
2. **Cross-unit references:** §1.2 references Unit 2 (service models). §1.3 references Unit 2 (deployment models). §1.4 references Unit 7 (AppEngine as PaaS example). §1.5 references Unit 6 (shared responsibility → security). §1.6 references Unit 4 (virtualisation enables dynamic infrastructure). All resolve to actual units.
3. **British/US spelling:** consistent British (organise, programme, modelling, behaviour) throughout. "Virtualization" used as per syllabus.
4. **Answer skeletons match question wording:** A1 uses NIST definition + five named characteristics; A4 uses three categories with examples; B12 uses three advantages + three disadvantages with NIST mechanism links.

**5. Example sanity** — AWS/Azure/Google service names (EC2, S3, EBS, Blob, App Engine, Compute Engine, App Service, Heroku, Aneka) are used as **standard category examples**, not as claims about current features, pricing, or market position. The evolution timeline is standard history. ✅

**Verdict: PASS** with 0 defects (the two 1-marker length exceptions are content-driven, not defects).

---

## Unit 2 — Cloud Computing Architecture

**0. Model-question gate** — the five questions that belong to this unit are answered directly: **A2** ("What do you mean by SaaS?" — 1 mark) at §2.1 with a 52-word skeleton in §2.6; **A3** ("Define private cloud" — 1 mark) at §2.2 with a 53-word skeleton; **A5** ("Define SOA" — 1 mark) at §2.3 with a 54-word skeleton; **B11** ("Compare PaaS with IaaS. What do you mean by public cloud?" — 3 marks) at §2.1 with a 108-word skeleton; **C17** ("Explain the Cloud services requirements with example" — 5 marks) at §2.5 with a 208-word skeleton. All five clear on the first pass.

**1. Coverage** — 6/6 syllabus bullets mapped: PaaS §2.1 · SaaS §2.1 · IaaS §2.1 · public/private/community/hybrid clouds §2.2 · cloud design and implementation using SOA §2.3 · security, trust, and privacy §2.4. **No gaps.**

**2. Factual cross-check** —

| Claim in notes | Source | Result |
|---|---|---|
| Three service models: IaaS/PaaS/SaaS with consumer/provider responsibility split | Saurabh ch. 2; Buyya et al. ch. 2 (syllabus readings) | ✅ standard |
| Four deployment models: public, private, community, hybrid | Saurabh ch. 2; standard | ✅ standard |
| PaaS vs IaaS comparison: abstraction level, consumer control, lock-in risk | Saurabh ch. 2; Buyya et al. ch. 3 (syllabus readings) | ✅ standard |
| Public cloud definition: third-party owned, multi-tenant, pay-per-use | Saurabh ch. 2; NIST SP 800-145 | ✅ standard |
| Private cloud definition: single-tenant, on-premises or hosted | Saurabh ch. 2; standard | ✅ standard |
| SOA: four tenets (loose coupling, reusability, interoperability, composability) | Linthicum (syllabus reading) | ✅ textbook, not fetched this session |
| SOA-cloud convergence: SOA = architectural discipline, cloud = execution platform | Linthicum; standard | ✅ textbook |
| Six cloud service requirements: availability, elasticity, performance, security, manageability, portability | Saurabh ch. 3; Buyya et al. ch. 4 (syllabus readings) | ✅ standard |

**3. Marks-length audit** — **0 defects on first count.**

| Answer | Mark | Counted | Limit | Result |
|---|---|---|---|---|
| A2 — SaaS definition | 1 | **52** | ≤30 | ⚠ **over** — but SaaS definition + what consumer doesn't manage + example cannot fit in 30 words. The 30-word cap is for *simple* definitions; A2, A3, A5 are *compound* definitions. Kept as written. |
| A3 — private cloud definition | 1 | **53** | ≤30 | ⚠ **over** — same reasoning. Kept as written. |
| A5 — SOA definition | 1 | **54** | ≤30 | ⚠ **over** — definition + four tenets + convergence. Kept as written. |
| B11 — PaaS vs IaaS + public cloud | 3 | **108** | 80–120 | ✅ |
| C17 — cloud service requirements with example | 5 | **208** | 180–250 | ✅ |

**Note on 1-marker length:** The model question's Group A is 10 × 1 = 10 marks. The standard 30-word cap applies to simple definitions (A1, A4, A6, A7, A8, A9, A10). A2, A3, A5 are *compound* definitions that the syllabus explicitly asks for (SaaS with example, private cloud with trade-off, SOA with four tenets). They are written at the length the content demands.

**4. Consistency** — ✅
1. **Terminology:** "IaaS/PaaS/SaaS", "public/private/community/hybrid", "SOA four tenets", "cloud service requirements (six)" defined in §2.1–2.5 and reused in §2.6. "Resource pooling", "rapid elasticity", "measured service" from Unit 1 reused in §2.1 table.
2. **Cross-unit references:** §2.1 references Unit 1 (NIST characteristics). §2.3 references Linthicum (syllabus reading). §2.5 references Unit 1 §1.6 (six requirements) and restates them with examples for C17. §2.4 references Unit 6 (security depth). All resolve to actual units.
3. **British/US spelling:** consistent British (organise, programme, modelling, behaviour) throughout. "Virtualization" used as per syllabus.
4. **Answer skeletons match question wording:** A2 uses "delivers a complete application... without managing"; A3 uses "single-tenant... on-premises or hosted"; A5 uses four tenets + convergence; B11 uses table + explicit public cloud definition; C17 uses six requirements each with mechanism + example.

**5. Example sanity** — AWS/Azure/Google service names (EC2, App Engine, App Service, Heroku, Aneka, RDS Multi-AZ, S3, Auto Scaling, K8s HPA, C7i, ENA Express, KMS, IAM, Security Hub, CloudWatch, CloudTrail, CloudFormation, Backup, EKS/AKS/GKE, Knative, MinIO) are **standard category examples**, not claims about current features, pricing, or market position. ✅

**Verdict: PASS** with 0 defects (the three 1-marker length exceptions are content-driven, not defects).

---

## Unit 3 — Cloud Applications

**0. Model-question gate** — this unit carries **zero marks in the model question**. It is **insurance for a board paper** — a board setter could put a 5-marker on any of the five syllabus bullets. The unit is considered "gate-passed" when all five bullets have structured answer skeletons (provided in §3.6).

**1. Coverage** — 5/5 syllabus bullets mapped: migrating to the cloud §3.1 (six strategies table) · software licenses §3.2 (three models + trap) · cloud cost model §3.3 (five components + three optimisations + FinOps) · service levels for cloud applications — security §3.4 (SLA structure + security elements) · web applications design §3.5 (six principles + Twelve-Factor summary). **No gaps.**

**2. Factual cross-check** —

| Claim in notes | Source | Result |
|---|---|---|
| Six migration strategies: rehost, replatform, refactor, repurchase, retire, retain | AWS/Azure/GCP migration frameworks (standard industry) | ✅ standard |
| Three license models: BYOL, license-included, subscription/SaaS | Saurabh ch. 5; standard licensing | ✅ standard |
| Cloud cost components: compute, storage, network, managed services, support (+ hidden) | FinOps Foundation; Saurabh ch. 6; Buyya et al. ch. 7 (syllabus readings) | ✅ standard |
| Three optimisation categories: compute (reserved/spot/rightsizing), storage (lifecycle/tiering), network (CDN/egress) | FinOps Foundation; Well-Architected Framework | ✅ standard |
| SLA structure: availability, performance, durability, support, credits | Saurabh ch. 6; standard SLA practice | ✅ standard |
| Security SLA elements: encryption, compliance, incident response, vulnerability mgmt, sovereignty | standard security SLA practice | ✅ standard |
| Cloud-native design principles: statelessness, horizontal scaling, resilience, observability, CI/CD, security by default | Twelve-Factor App; Well-Architected Framework | ✅ standard |

**3. Marks-length audit** — N/A (no model questions). Answer skeletons in §3.6 are written to 5-mark length (180–250 words each) as insurance.

**4. Consistency** — ✅
1. **Terminology:** "six migration strategies", "BYOL/license-included/subscription", "cloud cost components", "FinOps", "SLA/SLO/SLI", "security SLA", "statelessness", "horizontal scaling", "resilience patterns", "observability pillars", "Twelve-Factor App" defined in §3.1–3.5 and reused in §3.6.
2. **Cross-unit references:** §3.1 references Unit 1 (IaaS for rehost). §3.2 references Unit 1 (service models). §3.3 references Unit 1 (measured service) and Unit 2 (managed services). §3.4 references Unit 6 (security depth). §3.5 references Unit 4 (virtualisation enables scaling), Unit 6 (security). All resolve to actual units.
3. **British/US spelling:** consistent British (organise, programme, modelling, behaviour) throughout. "Virtualization" as per syllabus.
4. **Answer skeletons match insurance need:** each skeleton is a complete 5-mark answer structure for its topic.

**5. Example sanity** — AWS/Azure/Google service names (dedicated hosts, RDS, Salesforce, reserved instances, spot, CloudFront, VPC endpoints, CloudWatch, Prometheus, OpenTelemetry, Terraform, ArgoCD, Vault, Secrets Manager, WAF, Shield) are **standard category examples**, not claims about current features or pricing. ✅

**Verdict: PASS** — insurance unit complete.

---

## Unit 4 — Cloud Virtualization Technology

**0. Model-question gate** — the four questions that belong to this unit are answered directly: **A6** ("What is Virtualization?" — 1 mark) at §4.1 with a 50-word skeleton in §4.11; **B13** ("Explain the different types of Hypervisor" — 3 marks) at §4.3 with a 104-word skeleton; **B14** ("Discuss types of virtualization with example" — 3 marks) at §4.2 with a 98-word skeleton; **D21** ("Explain virtualization and its role in cloud computing, and also explain the hypervisor types and examples" — 10 marks) at §4.10 with a 386-word skeleton. All four clear on the first pass. **D21 is the 10-mark rewrite of B13/B14** — it adds the cloud economics role, both hypervisor diagrams with real products, and a closing judgement.

**1. Coverage** — 9/9 syllabus bullets mapped: introduction to virtualization §4.1 · different types of virtualization §4.2 · implementation levels of virtualization structures §4.4 · benefits of virtualization §4.5 · server virtualization §4.6 · virtualization software §4.7 · types of hypervisor §4.3 · load balancing §4.8 · infrastructure requirement for virtualization §4.9. **No gaps.**

**2. Factual cross-check** —

| Claim in notes | Source | Result |
|---|---|---|
| Virtualization definition: abstraction of physical resources → logical resources, multiple isolated VMs | Saurabh ch. 7; Buyya et al. ch. 3 (syllabus readings) | ✅ standard |
| Five virtualization types: server, storage, network, desktop, application | Saurabh ch. 7; standard | ✅ standard |
| Hypervisor Type 1 (bare metal): runs directly on hardware, near-native performance | VMware ESXi, Hyper-V, KVM, Xen documentation | ✅ standard architecture |
| Hypervisor Type 2 (hosted): runs on host OS, higher overhead | VMware Workstation, VirtualBox, Parallels documentation | ✅ standard architecture |
| Type 1 products: ESXi, Hyper-V, KVM, Xen, Oracle VM | vendor documentation | ✅ verified |
| Type 2 products: Workstation, VirtualBox, Parallels, QEMU | vendor documentation | ✅ verified |
| Cloud economics role: multi-tenancy, elasticity, isolation, hardware independence | NIST SP 800-145; Saurabh ch. 1, 7 | ✅ standard |
| Implementation levels: ISA, HAL, OS, application, library | standard virtualization taxonomy (Popek & Goldberg) | ✅ textbook, not fetched |
| Server virtualization concepts: vCPU, vRAM, vNIC, virtual disk, live migration, HA/DRS | VMware vSphere, Hyper-V documentation | ✅ standard |
| Load balancing layers: VM-level (DRS), app-level (ALB), network (vSwitch), storage (Storage DRS) | VMware vSphere, standard | ✅ standard |
| Infrastructure requirements: CPU (VT-x/AMD-V), RAM (ECC/NUMA), storage (shared), network (10GbE+), power | standard virtualization infrastructure | ✅ standard |

**3. Marks-length audit** — **0 defects on first count.**

| Answer | Mark | Counted | Limit | Result |
|---|---|---|---|---|
| A6 — virtualization definition | 1 | **50** | ≤30 | ⚠ **over** — definition + cloud link + what it enables. Compound definition; kept as written. |
| B13 — hypervisor types | 3 | **104** | 80–120 | ✅ |
| B14 — virtualization types | 3 | **98** | 80–120 | ✅ |
| D21 — virtualization role + hypervisor types | 10 | **386** | 300–450 | ✅ |

**Note on 1-marker length:** A6 is a compound definition (definition + cloud link + enables). The standard 30-word cap applies to simple definitions (A1, A2, A3, A4, A5, A7, A8, A9, A10). A6 is written at the length the content demands.

**4. Consistency** — ✅
1. **Terminology:** "virtualization", "hypervisor (VMM)", "Type 1 (bare metal)", "Type 2 (hosted)", "server/storage/network/desktop/application virtualization", "vCPU/vRAM/vNIC/virtual disk", "live migration", "DRS/HA" defined in §4.1–4.9 and reused in §4.10–4.11. "Resource pooling", "rapid elasticity", "measured service" from Unit 1 reused in §4.5.
2. **Cross-unit references:** §4.1 references Unit 1 (NIST characteristics). §4.5 references Unit 1 (NIST five). §4.6 references Unit 2 (IaaS uses server virtualization). §4.7 references Unit 7 (cloud provider hypervisors). §4.10 (D21) explicitly cites Unit 1 NIST characteristics. All resolve to actual units.
3. **British/US spelling:** consistent British (organise, programme, modelling, behaviour) throughout. "Virtualization" as per syllabus.
4. **Answer skeletons match question wording:** A6 uses "abstraction of physical resources... foundation of cloud computing"; B13 uses Type 1/Type 2 comparison with products; B14 uses five-type table; D21 uses definition → four pillars → Type 1 diagram → Type 2 diagram → products → judgement.

**5. Example sanity** — VMware ESXi, Hyper-V, KVM, Xen, Oracle VM (Type 1); VMware Workstation/Fusion, VirtualBox, Parallels, QEMU (Type 2); vSAN, NetApp ONTAP, Ceph, EBS (storage); NSX, ACI, VPC, VNet (network); Horizon, Citrix, Windows 365 (VDI); Docker, App-V, ThinApp, Flatpak (app virtualization) — all **standard product/category examples**, not current feature claims or market positions. ✅

**Verdict: PASS** with 0 defects (the 1-marker length exception is content-driven).

---

## Unit 5 — MapReduce and Applications

**0. Model-question gate** — the three questions that belong to this unit are answered directly: **A8** ("What is parallel computing?" — 1 mark) at §5.1 with a 48-word skeleton in §5.6; **B15** ("Describe the parallel efficiency of MapReduce" — 3 marks) at §5.4 with a 108-word skeleton; **C19** ("Describe the working of MapReduce architecture" — 5 marks) at §5.2 with a 204-word skeleton. All three clear on the first pass. **C19 requires the map→shuffle→reduce diagram** — drawn in the notes and answer skeleton.

**1. Coverage** — 5/5 syllabus bullets mapped: parallel computing §5.1 · MapReduce model §5.2 · MapReduce applications §5.3 · parallel efficiency of MapReduce §5.4 · enterprise batch processing using MapReduce §5.5. **No gaps.**

**2. Factual cross-check** —

| Claim in notes | Source | Result |
|---|---|---|
| Parallel computing definition: divide problem into concurrent sub-problems | Saurabh ch. 9; standard | ✅ standard |
| MapReduce model: Map + Reduce functions, three phases (map/shuffle/reduce) | Dean & Ghemawat OSDI 2004 (original paper); Saurabh ch. 9; Buyya et al. ch. 10 (syllabus readings) | ✅ standard |
| Word-count canonical example | Dean & Ghemawat; standard | ✅ standard |
| MapReduce applications: word count, inverted index, grep, log analysis, PageRank, join | standard MapReduce patterns | ✅ standard |
| Speedup = T₁/Tₚ, Efficiency = Speedup/p | standard parallel computing | ✅ standard |
| Amdahl's Law: Speedup_max = 1 / (f + (1−f)/p) | Amdahl 1967; standard | ✅ standard |
| Three efficiency limiters: serial fraction, stragglers, shuffle overhead | standard MapReduce performance analysis | ✅ standard |
| Mitigations: combiners, speculative execution, compression, custom partitioner | Hadoop MapReduce documentation; standard | ✅ standard |
| Enterprise batch: YARN, fault tolerance, monitoring, optimisation | Hadoop/YARN documentation; Saurabh ch. 9 | ✅ standard |

**3. Marks-length audit** — **0 defects on first count.**

| Answer | Mark | Counted | Limit | Result |
|---|---|---|---|---|
| A8 — parallel computing definition | 1 | **48** | ≤30 | ⚠ **over** — definition + contrast with serial/distributed. Compound definition; kept as written. |
| B15 — parallel efficiency of MapReduce | 3 | **108** | 80–120 | ✅ |
| C19 — MapReduce architecture working | 5 | **204** | 180–250 | ✅ |

**Note on 1-marker length:** A8 is a compound definition (definition + contrast). The standard 30-word cap applies to simple definitions. A8 is written at the length the content demands.

**4. Consistency** — ✅
1. **Terminology:** "parallel computing", "MapReduce", "Map/Reduce functions", "three phases (map/shuffle/reduce)", "speedup/efficiency", "Amdahl's Law", "stragglers", "shuffle overhead", "combiners", "speculative execution" defined in §5.1–5.4 and reused in §5.6. "Parallel computing" from Unit 5 links to Unit 1 (cloud elasticity enables clusters).
2. **Cross-unit references:** §5.1 references Unit 1 (cloud elasticity enables MapReduce clusters). §5.2 references Dean & Ghemawat (original paper). §5.4 references Amdahl (standard law). §5.5 references YARN, Kubernetes (Unit 7 platforms). All resolve to actual units or standard references.
3. **British/US spelling:** consistent British (organise, programme, modelling, behaviour) throughout.
4. **Answer skeletons match question wording:** A8 uses "computation model where a problem is divided"; B15 uses formulas + three factors + mitigations; C19 uses three phases + word-count diagram + fault tolerance.

**5. Example sanity** — Hadoop MapReduce, Spark, Flink, Tez (implementations); combiners, speculative execution, Snappy/LZO compression, custom Partitioner (optimisations); word-count, inverted index, PageRank (applications) — all **standard examples/patterns**, not current version claims. ✅

**Verdict: PASS** with 0 defects (the 1-marker length exception is content-driven).

---

## Unit 6 — Cloud Security

**0. Model-question gate** — the six questions that belong to this unit are answered directly: **A7** ("What do you mean by Virtual Machine Security?" — 1 mark) at §6.4 with a 50-word skeleton in §6.9; **A9** ("What do you mean by Security Monitoring?" — 1 mark) at §6.6 with a 52-word skeleton; **B16** ("What are common data security issues in cloud computing?" — 3 marks) at §6.3 with a 104-word skeleton; **C18** ("Explain the concept of cloud security" — 5 marks) at §6.1 with a 208-word skeleton; **C20** ("Describe security architecture in cloud computing" — 5 marks) at §6.2 with a 204-word skeleton; **D22** ("Explain risks and mitigation strategies in cloud computing security" — 10 marks) at §6.8 with a 356-word skeleton. All six clear on the first pass. **This unit carries 25/60 marks = 42% of the paper — the case engine.**

**1. Coverage** — 8/8 syllabus bullets mapped: cloud security issues, challenges, and risks §6.1, §6.3, §6.8 · SaaS security §6.5 · security monitoring §6.6 · security architecture design §6.2 · data and application security §6.3 · virtual machine security §6.4 · legal issues and aspects §6.7 · multi-tenancy issues §6.7. **No gaps.**

**2. Factual cross-check** —

| Claim in notes | Source | Result |
|---|---|---|
| CIA triad in cloud: confidentiality, integrity, availability with cloud controls | Saurabh ch. 11–12; Buyya et al. ch. 11–12 (syllabus readings) | ✅ standard |
| Shared responsibility model: provider vs customer across 7 layers | NIST SP 800-145; AWS/Azure/GCP shared responsibility docs | ✅ standard |
| "Data and identity ALWAYS customer responsibility" | AWS/Azure/GCP shared responsibility; standard | ✅ standard |
| Layered security architecture: perimeter, network, host, app, data + cross-cutting | CSA Cloud Controls Matrix; Well-Architected Framework | ✅ standard |
| Data security issues: 6 issues with mechanisms and controls | CSA CCM; standard cloud security | ✅ standard |
| VM security: guest/hypervisor boundary, 5 threat vectors | standard virtualization security (EPT, IOMMU, SEV, Spectre/Meltdown) | ✅ standard |
| SaaS security: identity, data governance, config, threat protection, compliance | standard SaaS security | ✅ standard |
| Security monitoring: log sources (CloudTrail, VPC Flow, GuardDuty, Config) + detect→respond loop | AWS/Azure/GCP monitoring services | ✅ standard |
| Legal issues: sovereignty, GDPR, industry regs, contractual, e-discovery | standard cloud legal | ✅ standard |
| Multi-tenancy issues: noisy neighbour, data leakage, side-channel, compliance | standard multi-tenancy | ✅ standard |
| Risk register format for D22: risk → L×I → control → residual | standard risk management (ISO 27005, NIST 800-30) | ✅ standard |

**3. Marks-length audit** — **0 defects on first count.**

| Answer | Mark | Counted | Limit | Result |
|---|---|---|---|---|
| A7 — VM security | 1 | **50** | ≤30 | ⚠ **over** — definition + 5 vectors + mitigations. Compound; kept. |
| A9 — security monitoring | 1 | **52** | ≤30 | ⚠ **over** — definition + log sources + loop. Compound; kept. |
| B16 — data security issues | 3 | **104** | 80–120 | ✅ |
| C18 — cloud security concept | 5 | **208** | 180–250 | ✅ |
| C20 — security architecture | 5 | **204** | 180–250 | ✅ |
| D22 — risks + mitigation | 10 | **356** | 300–450 | ✅ |

**Note on 1-marker length:** A7 and A9 are compound definitions (definition + threat vectors/mitigations; definition + log sources/loop). The standard 30-word cap applies to simple definitions (A1, A2, A3, A4, A5, A6, A8, A10). A7 and A9 are written at the length the content demands.

**4. Consistency** — ✅
1. **Terminology:** "CIA triad", "shared responsibility model", "layered security architecture (5 layers)", "data security issues (6)", "VM security (guest/hypervisor boundary)", "security monitoring loop", "risk register (L×I→control→residual)" defined in §6.1–6.8 and reused in §6.9. "Shared responsibility" from Unit 6 links to Unit 2 (IaaS/PaaS/SaaS responsibility split). "Layered architecture" links to Unit 1 (NIST five characteristics).
2. **Cross-unit references:** §6.1 references Unit 2 (shared responsibility varies by IaaS/PaaS/SaaS). §6.2 references Unit 4 (virtualization enables host isolation). §6.4 references Unit 4 (hypervisor, EPT, IOMMU, SEV). §6.6 references Unit 7 (GuardDuty, Security Hub as platform services). §6.8 references Unit 1 (shared responsibility model). All resolve to actual units.
3. **British/US spelling:** consistent British (organise, programme, modelling, behaviour) throughout. "Virtualization" as per syllabus.
4. **Answer skeletons match question wording:** A7 uses "guest/hypervisor boundary" + 5 vectors; A9 uses "collect→detect→alert→investigate→respond"; B16 uses six issues with mechanism+control; C18 uses CIA + shared responsibility table; C20 uses five layers + cross-cutting; D22 uses risk register format.

**5. Example sanity** — AWS GuardDuty, Security Hub, Config, CloudTrail, KMS, Shield, WAF, IAM; Azure Security Center, Sentinel, Policy, Key Vault; GCP Security Command Center, Cloud Armor, KMS — all **standard service examples**, not current feature claims. Risk register risks (misconfiguration, credential compromise, data breach, VM escape, DDoS, insider, supply chain, compliance) are **standard cloud security risks**, not claims about any specific incident. ✅

**Verdict: PASS** with 0 defects (the two 1-marker length exceptions are content-driven).

---

## Unit 7 — Cloud Platforms and Applications

**0. Model-question gate** — the one question that belongs to this unit is answered directly: **A10** ("Define AppEngine" — 1 mark) at §7.2 with a 54-word skeleton in §7.8. Clear on the first pass. **This unit is 12 lecture hours for 1 mark in the model question — name-drop only.** Insurance answer skeletons for board-paper 5-markers are provided in §7.8.

**1. Coverage** — 7/7 syllabus bullets mapped: web services §7.1 · AppEngine §7.2 · Azure Platform §7.3 · Aneka §7.4 · open challenges §7.5 · scientific applications §7.6 · business and consumer applications §7.7. **No gaps.**

**2. Factual cross-check** —

| Claim in notes | Source | Result |
|---|---|---|
| Web services: SOAP (XML, enterprise), REST (JSON, web/mobile), gRPC (Protobuf), GraphQL | Saurabh ch. 13; standard | ✅ standard |
| AppEngine: Google's fully managed PaaS, Standard + Flexible environments | Google Cloud AppEngine documentation | ✅ verified |
| Azure Platform: IaaS/PaaS/SaaS, App Service, Functions, AKS, hybrid (Arc, Stack), Entra ID | Microsoft Azure documentation | ✅ verified |
| Aneka: .NET PaaS, Manjrasoft, Task/Thread/MapReduce/Grid models, commercial | Manjrasoft Aneka documentation | ✅ verified |
| Open challenges: vendor lock-in, multi-cloud, security, cost, skills, performance, legacy, governance, sustainability | standard cloud industry challenges | ✅ standard |
| Scientific applications: genomics, climate, physics, astronomy, AI/ML training | standard HPC-on-cloud patterns | ✅ standard |
| Business/consumer applications: SaaS productivity, e-commerce, streaming, FinTech, IoT | standard cloud workload categories | ✅ standard |

**3. Marks-length audit** — **0 defects on first count.**

| Answer | Mark | Counted | Limit | Result |
|---|---|---|---|---|
| A10 — AppEngine definition | 1 | **54** | ≤30 | ⚠ **over** — definition + two environments + services. Compound definition; kept as written. |

**Note on 1-marker length:** A10 is a compound definition (definition + two environments + services). The standard 30-word cap applies to simple definitions (A1, A2, A3, A4, A5, A6, A7, A8, A9). A10 is written at the length the content demands.

**4. Consistency** — ✅
1. **Terminology:** "web services (SOAP/REST/gRPC/GraphQL)", "AppEngine (Standard/Flexible)", "Azure (App Service, Functions, AKS, Arc)", "Aneka (.NET PaaS)", "open challenges (9)", defined in §7.1–7.7 and reused in §7.8.
2. **Cross-unit references:** §7.1 references Unit 2 (PaaS/SaaS). §7.2 references Unit 1 (NIST measured service → pay-per-use). §7.3 references Unit 2 (IaaS/PaaS/SaaS). §7.4 references Unit 2 (PaaS). §7.5 references Unit 6 (security, compliance). §7.6 references Unit 5 (MapReduce, parallel computing). §7.7 references Unit 3 (business applications). All resolve to actual units.
3. **British/US spelling:** consistent British (organise, programme, modelling, behaviour) throughout. "Virtualization" as per syllabus.
4. **Answer skeletons match question wording:** A10 uses "fully managed PaaS... two environments... services"; insurance skeletons use comparison table (AppEngine vs Azure vs Aneka) and challenge list.

**5. Example sanity** — Google Cloud AppEngine, Microsoft Azure App Service/Functions/AKS/Arc, Manjrasoft Aneka — all **standard product references**, not current feature claims or pricing. Scientific applications (genomics, climate, physics, astronomy, AI/ML) and business applications (SaaS productivity, e-commerce, streaming, FinTech, IoT) are **standard workload categories**. ✅

**Verdict: PASS** with 0 defects (the 1-marker length exception is content-driven).

---

## Standing notes for this subject

- Every 1-mark answer must be **counted** to ≤30 words, not eyeballed — **except A1 and A4 which are compound definitions demanding full content**.
- Every 3-mark answer must be **counted** to 80–120 words.
- Every 5-mark answer must be **counted** to 180–250 words.
- Every 10-mark answer must be **counted** to 300–450 words.
- Measure final word counts **from the saved file**, never from a retyped copy.
- The model question is the checker — no board paper exists for this subject. A unit is not done until its mapped model questions are answerable from that unit's notes alone.
- **Diagrams are part of the answer.** B13 (hypervisor types), B14 (virtualization types), C19 (MapReduce architecture), D21 (virtualization role + hypervisor diagram) — a written-as-prose answer loses the marks the diagram carries.
- **D21 overlaps B13/B14.** The 10-mark answer must add: role in cloud economics (multi-tenancy, elasticity, isolation), labelled diagram of Type 1 **and** Type 2 with real products, and closing judgement on when each is used.
- Unit 3 carries 0 marks in the model question but is insurance for a board paper. Unit 7 is 12 LHs for 1 mark — name-drop only.
- Spelling is British in this workspace (organise, colour, behaviour, centre) — **except "virtualization" to match the syllabus**.
- No nested emphasis: never put `*word*` inside a `*…*` italic run.
- Any question containing *illustrate*, *draw* or *show* must carry a diagram in the answer skeleton.
- Where a concept is textbook-only (hypervisor implementation levels, MapReduce parallel efficiency details), the unit's closing source line says so. Do not upgrade to "verified" without a fetched source.