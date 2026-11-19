# Unit 2 — Cloud Computing Architecture

| | |
|---|---|
| **Lecture hours** | 5 |
| **Marks carried in model question** | **11** — three 1-markers (A2 SaaS, A3 private cloud, A5 SOA), one 3-marker (B11 PaaS vs IaaS + public cloud), one 5-marker (C17 cloud service requirements) |
| **Difficulty** | ★★★☆☆ — service/deployment models are standard; SOA is a specific Linthicum reading; C17 requires the six requirements from Unit 1 §1.6 restated with examples |
| **Exam yield** | 🔴 high — 5 hours, 11 marks, and the service/deployment vocabulary is used in every later unit |
| **Prerequisite** | Unit 1 (NIST five characteristics, service model definitions, deployment model definitions) |
| **Syllabus bullets** | Platform as a Service (PaaS) · Software as a Service (SaaS) · Infrastructure as a Service (IaaS) · Public clouds, Private clouds, Community cloud, Hybrid clouds · Cloud design and implementation using SOA · Security, trust, and privacy |

> **Read this first:** this unit is the **vocabulary layer** for the whole paper. The model question tests SaaS (A2), private cloud (A3), SOA (A5) as 1-markers, then PaaS vs IaaS + public cloud (B11) as a 3-marker, and cloud service requirements (C17) as a 5-marker. **C17 is the only 5-marker in this unit** — it must be structured: six requirements, each with a one-line mechanism and a concrete cloud example.

---

## 2.1 Service models — the three layers (recap + depth)

| Model | Consumer manages | Provider manages | NIST characteristic it relies on |
|---|---|---|---|
| **IaaS** | OS, runtime, middleware, data, applications | physical: compute, storage, network, virtualisation | Resource pooling, Rapid elasticity, Measured service |
| **PaaS** | data, applications | runtime, middleware, OS, virtualisation, physical | Resource pooling, Rapid elasticity, Measured service, Broad network access |
| **SaaS** | user config only | application, runtime, middleware, OS, virtualisation, physical | All five |

### A2 · "What do you mean by SaaS?" [1]

> SaaS (Software as a Service) delivers a complete application over the internet — the consumer uses the software without managing the underlying infrastructure, platform, or runtime. The provider manages everything: application, runtime, middleware, OS, virtualisation, and physical hardware. Example: **Gmail / Microsoft 365 / Salesforce** — you log in and use it; the provider runs the servers, patches the OS, scales the database, and handles availability.

*(52 words. Definition + what consumer doesn't manage + one-line example.)*

### PaaS vs IaaS — the comparison B11 demands

| Dimension | **IaaS** | **PaaS** |
|---|---|---|
| **Abstraction level** | virtual machines, storage, networks | application platform: runtime, frameworks, databases, CI/CD |
| **Consumer control** | OS, patches, scaling logic, middleware | code and data only; platform handles scaling, patching, runtime |
| **Typical use** | lift-and-shift, custom stacks, legacy apps | cloud-native development, microservices, rapid deployment |
| **Example products** | AWS EC2, Azure VMs, Google Compute Engine | Google App Engine, Azure App Service, Heroku, Aneka |
| **Lock-in risk** | lower (standard VM images, portable) | higher (proprietary APIs, platform-specific services) |

### Public cloud — the definition B11 also asks for

> A **public cloud** is a cloud deployment model where the infrastructure is owned and operated by a third-party provider and shared across multiple organisations (multi-tenant). Consumers access resources over the internet, pay per use, and have no capital expenditure. Examples: **AWS, Microsoft Azure, Google Cloud Platform**.

---

### B11 · "Compare PaaS with IaaS. What do you mean by public cloud?" [3]

> **Shape: PaaS vs IaaS table (3 rows) + public cloud definition. ~100 words.**

**PaaS vs IaaS:**

| | **IaaS** | **PaaS** |
|---|---|---|
| **Abstraction** | VMs, storage, network — you manage OS, runtime, middleware | Platform — runtime, frameworks, DB, CI/CD managed; you provide code + data |
| **Control** | full OS/middleware control; you handle scaling, patching | platform handles scaling, patching, runtime; you control app logic |
| **Lock-in** | lower — standard VM images portable | higher — proprietary APIs, platform services |

**Public cloud:** infrastructure owned/operated by a third-party provider, shared across multiple organisations (multi-tenant), accessed over the internet, pay-per-use, no capex. Examples: AWS, Azure, GCP.

*(108 words)*

---

## 2.2 Deployment models — the four types (recap + depth)

| Model | Definition | Key trait | Example |
|---|---|---|---|
| **Public cloud** | third-party owned, multi-tenant, pay-per-use | no capex, infinite scale | AWS, Azure, GCP |
| **Private cloud** | single-organisation, on-premises or hosted | control, compliance, data locality | VMware vSphere, OpenStack, Azure Stack |
| **Community cloud** | shared by organisations with common concerns | shared cost, shared governance | GovCloud, bank community cloud |
| **Hybrid cloud** | composition of two+ distinct clouds bound by standardised tech | workload portability, burst to public | Azure Arc, Google Anthos, AWS Outposts |

### A3 · "Define private cloud." [1]

> A private cloud is a cloud deployment model where the infrastructure is operated solely for a single organisation — whether on-premises or hosted by a third party. It is single-tenant, giving the organisation greater control over security, compliance, and data locality, at the cost of higher capital expenditure and operational responsibility compared to a public cloud.

*(53 words. Definition + single-tenant + control vs cost trade-off.)*

---

## 2.3 SOA — Service-Oriented Architecture (A5)

> **SOA (Service-Oriented Architecture) is an architectural style where business functionality is exposed as a set of loosely coupled, reusable, interoperable services — each with a well-defined interface (contract), communicating via standard protocols, and orchestrated to compose applications.**

— *Linthicum, "Cloud Computing and SOA Convergence" (syllabus reading)*

### The four tenets of SOA (Linthicum)

| Tenet | What it means |
|---|---|
| **Loose coupling** | services interact through contracts, not implementation dependencies; change one without breaking others |
| **Reusability** | services are designed for multiple consumers; granularity is business-capability, not technical function |
| **Interoperability** | standard protocols (HTTP/REST, SOAP, gRPC, message queues) and data formats (JSON, XML, Protobuf) |
| **Composability** | services are orchestrated (centralised) or choreographed (decentralised) to build composite applications |

### SOA and Cloud — the convergence

| SOA provides | Cloud provides |
|---|---|
| service contract, governance, reuse | elasticity, on-demand provisioning, measured service |
| enterprise service bus (ESB), registry | API gateway, service mesh, service discovery |
| business-process orchestration (BPEL) | serverless workflows (Step Functions, Logic Apps) |

**The convergence:** SOA is the *architectural discipline*; cloud is the *execution platform*. A cloud-native application *is* an SOA application deployed on cloud infrastructure — microservices are the modern realisation of SOA services.

### A5 · "Define SOA." [1]

> SOA (Service-Oriented Architecture) is an architectural style where business functionality is exposed as loosely coupled, reusable, interoperable services with well-defined contracts, communicating via standard protocols (HTTP/REST, SOAP, gRPC). Four tenets: loose coupling, reusability, interoperability, composability. In cloud, SOA is the architectural discipline; cloud provides the elastic execution platform — microservices are the modern realisation.

*(54 words. Definition + four tenets + cloud convergence one-liner.)*

---

## 2.4 Security, trust, and privacy in architecture

The syllabus lists this as a Unit 2 bullet, but the model question puts security in Unit 6. Here, cover the **architectural** aspects only:

| Architectural concern | Mechanism |
|---|---|
| **Multi-tenancy isolation** | hypervisor/VMM separation, VPC/VNET, security groups, IAM policies |
| **Data residency / sovereignty** | region selection, dedicated hosts, encryption key management (BYOK/HYOK) |
| **Trust boundaries** | zero-trust network (no implicit trust), micro-segmentation, service mesh mTLS |
| **Compliance by design** | guardrails (SCPs, Azure Policy), audit logging (CloudTrail, Audit Logs), config rules |

---

## 2.5 Cloud services requirements — C17 (5 marks ≈ 200 words)

> **Shape: six requirements, each with mechanism + cloud example. ~200 words.**

From Unit 1 §1.6, a cloud service must satisfy six requirements. C17 asks you to **explain with example** — so each requirement gets a one-line mechanism and a concrete product feature.

| Requirement | Mechanism | Cloud example |
|---|---|---|
| **1. Availability** | SLA-backed uptime; multi-AZ/region deployment; automatic failover | AWS S3 99.99% (standard), 99.999999999% durability; RDS Multi-AZ |
| **2. Elasticity** | auto-scaling groups, target tracking, scheduled scaling; no manual intervention | EC2 Auto Scaling, Kubernetes HPA, Azure Scale Sets |
| **3. Performance** | instance types (compute/memory/storage optimised), placement groups, enhanced networking | AWS C7i (compute), R7iz (memory), ENA Express; Azure HBv3 (HPC) |
| **4. Security** | encryption at rest (KMS), in transit (TLS 1.3), IAM least-privilege, VPC isolation, compliance certs | AWS KMS, IAM conditions, Security Hub; Azure Key Vault, Policy |
| **5. Manageability** | monitoring (CloudWatch, Prometheus), logging (CloudTrail, Cloud Logging), IaC (CloudFormation, Terraform), backup/restore | AWS Config, Backup; Azure Monitor, Resource Graph |
| **6. Portability** | standards-based APIs, container support (OCI, CRI), open formats (Parquet, ORC), no vendor lock-in | Kubernetes (EKS, AKS, GKE), Knative, CloudEvents, S3-compatible APIs |

### C17 · "Explain the Cloud services requirements with example." [5]

> A cloud service must satisfy six requirements. (1) **Availability** — SLA-backed uptime with multi-AZ failover (e.g., AWS RDS Multi-AZ, S3 99.99% SLA). (2) **Elasticity** — automatic scale-out/in via metrics, no manual intervention (e.g., EC2 Auto Scaling, Kubernetes HPA). (3) **Performance** — matched instance types, placement groups, enhanced networking (e.g., AWS C7i compute-optimised, ENA Express). (4) **Security** — encryption at rest/in transit, IAM least-privilege, VPC isolation, compliance certs (e.g., AWS KMS, IAM conditions, Security Hub). (5) **Manageability** — monitoring, logging, IaC, backup/restore (e.g., CloudWatch, CloudTrail, CloudFormation, AWS Backup). (6) **Portability** — standards-based APIs, container support, open formats, S3-compatible APIs (e.g., Kubernetes on EKS/AKS/GKE, Knative, MinIO).

*(208 words)*

---

## 2.6 Answer skeletons

### A2 · "What do you mean by SaaS?" [1]

> SaaS delivers a complete application over the internet — the consumer uses it without managing infrastructure, platform, or runtime. Provider manages everything: application, runtime, middleware, OS, virtualisation, physical hardware. Example: Gmail / Microsoft 365 / Salesforce.

*(52 words)*

### A3 · "Define private cloud." [1]

> A private cloud is a deployment model where infrastructure is operated solely for one organisation — on-premises or hosted. Single-tenant, greater control over security/compliance/data locality, at the cost of higher capex and operational responsibility vs public cloud.

*(53 words)*

### A5 · "Define SOA." [1]

> SOA is an architectural style where business functionality is exposed as loosely coupled, reusable, interoperable services with well-defined contracts, communicating via standard protocols (HTTP/REST, SOAP, gRPC). Four tenets: loose coupling, reusability, interoperability, composability. In cloud, SOA is the architectural discipline; cloud provides the elastic execution platform — microservices are the modern realisation.

*(54 words)*

### B11 · "Compare PaaS with IaaS. What do you mean by public cloud?" [3]

> **PaaS vs IaaS:**
> | | IaaS | PaaS |
> |---|---|---|
> | **Abstraction** | VMs, storage, network — you manage OS, runtime, middleware | Platform — runtime, frameworks, DB, CI/CD managed; you provide code + data |
> | **Control** | full OS/middleware control; you handle scaling, patching | platform handles scaling, patching, runtime; you control app logic |
> | **Lock-in** | lower — standard VM images portable | higher — proprietary APIs, platform services |
>
> **Public cloud:** infrastructure owned/operated by third-party, shared multi-tenant, pay-per-use, no capex. Examples: AWS, Azure, GCP.

*(108 words)*

### C17 · "Explain the Cloud services requirements with example." [5]

> Six requirements: (1) **Availability** — SLA-backed uptime, multi-AZ failover (RDS Multi-AZ, S3 99.99%). (2) **Elasticity** — auto-scale via metrics, no manual intervention (EC2 Auto Scaling, K8s HPA). (3) **Performance** — matched instance types, placement groups, enhanced networking (C7i, ENA Express). (4) **Security** — encryption at rest/in transit, IAM least-privilege, VPC isolation, certs (KMS, IAM conditions, Security Hub). (5) **Manageability** — monitoring, logging, IaC, backup/restore (CloudWatch, CloudTrail, CloudFormation, Backup). (6) **Portability** — standards APIs, containers, open formats, S3-compatible (K8s on EKS/AKS/GKE, Knative, MinIO).

*(208 words)*

---

## 2.7 Traps

| Trap | Why it costs marks | Fix |
|---|---|---|
| Answering B11 with only PaaS vs IaaS, forgetting public cloud | the question has **two parts** — "Compare PaaS with IaaS. **What do you mean by public cloud?**" | always answer both parts explicitly |
| Listing PaaS vs IaaS differences without a table/structure | B11 is a 3-marker; structure carries marks | three-row table: abstraction, control, lock-in |
| Defining SOA without the four tenets | A5 is 1 mark but Linthicum is the syllabus reading | name the four tenets: loose coupling, reusability, interoperability, composability |
| Writing C17 as a list without examples | "with example" is in the question | each of the six: requirement → mechanism → concrete product feature |
| Confusing "private cloud = on-premises" | private cloud can be hosted; the trait is single-tenant | "operated solely for one organisation, on-premises or hosted" |
| Saying SOA = microservices | SOA is the architectural discipline; microservices are one realisation | "SOA is the discipline; microservices are the modern realisation" |
| Forgetting portability in C17 | it's the sixth requirement; often omitted | standards APIs, containers, open formats, S3-compatible |

---

## 2.8 Self-test (answers collapsed)

1. What does the consumer manage in IaaS vs PaaS vs SaaS? *(1 mark)*
2. Compare PaaS and IaaS in a three-row table. *(3 marks — part of B11)*
3. Define public cloud in one sentence. *(1 mark — part of B11)*
4. Define private cloud. *(1 mark — A3)*
5. What are the four tenets of SOA (Linthicum)? *(2 marks)*
6. Define SOA and its convergence with cloud. *(1 mark — A5)*
7. Name the six cloud service requirements, and give one cloud example for each. *(5 marks — C17)*

<details>
<summary>Answers</summary>

1. **IaaS:** OS, runtime, middleware, data, applications. **PaaS:** data, applications. **SaaS:** user config only.
2. **Abstraction:** IaaS = VMs/storage/network; PaaS = platform (runtime, frameworks, DB). **Control:** IaaS = full OS control; PaaS = platform handles scaling/patching. **Lock-in:** IaaS = lower (portable VMs); PaaS = higher (proprietary APIs).
3. Public cloud = third-party owned, multi-tenant, pay-per-use, no capex. Examples: AWS, Azure, GCP.
4. Private cloud = infrastructure operated solely for one organisation (on-premises or hosted), single-tenant, greater control, higher cost.
5. Loose coupling, reusability, interoperability, composability.
6. SOA = loosely coupled, reusable, interoperable services with contracts, standard protocols. Four tenets above. Convergence: SOA is architectural discipline; cloud is elastic execution platform; microservices are modern realisation.
7. (1) Availability — RDS Multi-AZ. (2) Elasticity — EC2 Auto Scaling. (3) Performance — C7i instances. (4) Security — KMS + IAM. (5) Manageability — CloudWatch + CloudFormation. (6) Portability — K8s on EKS/AKS/GKE.

</details>

---

## 2.9 Sixty-second check

Close the file and, on a blank page:

- [ ] IaaS/PaaS/SaaS: what consumer manages in each
- [ ] PaaS vs IaaS: three-row table (abstraction, control, lock-in)
- [ ] Public cloud definition + examples
- [ ] Private cloud definition (single-tenant, on-prem or hosted)
- [ ] SOA: four tenets + cloud convergence one-liner
- [ ] Six cloud service requirements + one product example each

If all six are there, Unit 2's **11 marks** are covered — A2, A3, A5, B11, C17.

---

*Sources for this unit: TU FOM syllabus (IT 277, Unit 2, 5 LHs) · TU/FOM model question 2026 (A2, A3, A5, B11, C17) · Saurabh, Cloud Computing, ch. 2–3 (syllabus reading) · Buyya et al., Mastering Cloud Computing, ch. 2–4 (syllabus reading) · Linthicum, Cloud Computing and SOA Convergence (syllabus reading). AWS/Azure/Google service names are standard category examples, not current feature claims.*