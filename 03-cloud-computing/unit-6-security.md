# Unit 6 — Cloud Security

| | |
|---|---|
| **Lecture hours** | 6 |
| **Marks in model question** | 25 — two 1-markers (A7 VM security, A9 security monitoring), one 3-marker (B16 data security issues), two 5-markers (C18 cloud security concept, C20 security architecture), one 10-marker (D22 risks + mitigation) |
| **Difficulty** | ★★★★☆ — **the case engine**. 25/60 marks = 42% of the paper from 6/48 hours = 12.5% of syllabus. CIA triad, shared responsibility, layered architecture, and risk register are the vocabulary. |
| **Exam yield** | 🔴 **owns the case** — highest marks-per-hour in the paper. |
| **Prerequisite** | Units 1–4 (virtualization enables isolation; IaaS/PaaS/SaaS define shared responsibility boundaries) |
| **Syllabus** | Cloud Security issues, challenges, and Risks · Software-as-a-Service Security · Security Monitoring · Security Architecture Design · Data and application Security · Virtual Machine Security · Legal issues and Aspects · Multi-tenancy issues |

> **Read this first:** This unit is **the case engine**. The model question puts 25 marks here including one Group D case (D22). The vocabulary is **CIA triad**, **shared responsibility model**, **layered security architecture**, and **risk register**. D22 asks for "risks and mitigation strategies" — you must produce a **risk register** (risk → likelihood × impact → control → residual risk) for cloud security. C18 and C20 are 5-markers on concept and architecture. A7 and A9 are 1-markers on VM security and security monitoring. B16 is a 3-marker on data security issues.

---

## Coverage Map

```
6.1 Cloud Security Concept — CIA + Shared Responsibility (C18) 🎯 5-mark
├── CIA triad in cloud: confidentiality, integrity, availability with controls
├── Shared responsibility model: provider vs customer for 7 layers
└── Data and identity ALWAYS customer's responsibility

6.2 Security Architecture Design — Layered (C20) 🎯 5-mark
├── Five layers: Perimeter/Identity → Network → Host/Compute → Application/Runtime → Data
├── Cross-cutting: logging, monitoring, alerting, IR playbooks
└── Governance: policies, compliance, audit, tagging

6.3 Data and Application Security (B16) 🎯 3-mark
├── Six data security issues with mechanism + control
└── Confidentiality breach, integrity violation, availability loss, data leakage, multi-tenancy residue, compliance failure

6.4 Virtual Machine Security (A7) 🎯 1-mark
├── Definition: guest/hypervisor boundary protection
└── Five threat vectors: VM escape, side-channel, image compromise, snapshot theft, resource exhaustion

6.5 SaaS Security
├── Identity & access, data governance, configuration, threat protection, compliance
└── CASB, anomaly detection, session risk

6.6 Security Monitoring (A9) 🎯 1-mark
├── Definition: continuous collection, analysis, alerting on security events
├── Log sources: CloudTrail, VPC Flow Logs, GuardDuty, Config/Security Hub, app logs
└── Detection → Response loop: collect → detect → alert → investigate → respond

6.7 Legal Issues and Multi-Tenancy
├── Data sovereignty, GDPR/privacy, industry regulations, contractual, e-discovery
└── Multi-tenancy issues: noisy neighbour, data leakage, side-channel, compliance isolation

6.8 D22 — Risks and Mitigation Strategies [10] 🎯 10-mark
├── Risk register format: risk → L×I → control → residual risk
├── 8 risks: misconfiguration, credential compromise, data breach, VM escape, DDoS, insider threat, supply chain, compliance
└── Cross-cutting mitigations: SIEM, monitoring, IR playbooks, chaos engineering, red teaming
```

---

## 6.1 Cloud Security Concept — CIA + Shared Responsibility (C18) 🎯 5-mark

> **Cloud security is the set of policies, technologies, and controls deployed to protect data, applications, and infrastructure in cloud environments — addressing confidentiality, integrity, and availability (CIA) across the shared responsibility boundary.**

### CIA Triad in Cloud

| Pillar | Cloud context |
|---|---|
| **Confidentiality** | encryption at rest (KMS, BYOK), in transit (TLS 1.3), tokenization, data masking, access control (IAM, ABAC) |
| **Integrity** | checksums, digital signatures, immutable logs (CloudTrail, Audit Logs), write-once storage (WORM), blockchain anchoring |
| **Availability** | multi-AZ/region, auto-scaling, DDoS protection (Shield, Cloud Armor), backup/restore, chaos engineering |

---

### Shared Responsibility Model — the Central Concept

| Layer | **Provider secures** (security *of* the cloud) | **Customer secures** (security *in* the cloud) |
|---|---|---|
| **Physical** | data centre, power, cooling, hardware | — |
| **Network** | backbone, DDoS, global network | VPC, security groups, NACLs, WAF, VPN/Direct Connect |
| **Host / Hypervisor** | bare metal, hypervisor patching, host OS | guest OS patching, agent installation, host firewall |
| **Platform / Runtime** | managed services (RDS, S3, Lambda runtime) | application code, libraries, dependencies, config |
| **Data** | encryption at rest (default), replication | encryption keys (KMS/BYOK), classification, lifecycle, access |
| **Identity** | IAM service, MFA, SSO integration | policies (least privilege), roles, rotation, federation |
| **Application** | — | secure coding, WAF, API gateway, secrets management |
| **Compliance** | provider certifications (SOC 2, ISO, PCI) | customer-specific compliance, evidence, audit |

**The rule:** the lower the abstraction (IaaS), the more the customer owns. The higher (SaaS), the more the provider owns. **But data and identity are ALWAYS the customer's responsibility.**

---

### C18 · "Explain the concept of cloud security." [5] 🎯 5-mark

> **Shape: CIA triad + shared responsibility model (table) + data/identity always customer. ~200 words.**

Cloud security protects data, applications, and infrastructure in cloud environments across **CIA**:

* **Confidentiality** — encryption at rest (KMS, BYOK), in transit (TLS 1.3), tokenization, access control (IAM, ABAC).
* **Integrity** — checksums, digital signatures, immutable logs (CloudTrail), WORM storage.
* **Availability** — multi-AZ/region, auto-scaling, DDoS protection (Shield), backup/restore.

**Shared responsibility model** — the central concept:

| Layer | Provider secures (security *of* cloud) | Customer secures (security *in* cloud) |
|---|---|---|
| Physical | data centre, hardware | — |
| Network | backbone, DDoS | VPC, security groups, WAF |
| Host/Hypervisor | bare metal, hypervisor patching | guest OS, agents, host firewall |
| Platform | managed services (RDS, Lambda) | app code, config, dependencies |
| Data | encryption at rest (default) | keys (KMS/BYOK), classification, access |
| Identity | IAM service, MFA | policies, least privilege, rotation |
| Application | — | secure coding, WAF, secrets |

**Data and identity are ALWAYS the customer's responsibility** — regardless of IaaS/PaaS/SaaS. The lower the abstraction (IaaS), the more customer owns; higher (SaaS), more provider owns.

*(208 words)*

---

## 6.2 Security Architecture Design — Layered (C20) 🎯 5-mark

> **Shape: five-layer architecture from perimeter to data + cross-cutting controls. ~200 words.**

A **layered security architecture** (defence in depth) for cloud:

```
┌─────────────────────────────────────┐
│  1. PERIMETER / IDENTITY            │  ← WAF, DDoS, DNS, IAM, MFA, SSO, federation
├─────────────────────────────────────┤
│  2. NETWORK                         │  ← VPC, subnets, security groups, NACLs, VPN/Direct Connect,
│                                     │     micro-segmentation, service mesh (mTLS), PrivateLink
├─────────────────────────────────────┤
│  3. HOST / COMPUTE                  │  ← guest OS hardening, agent (EDR, FIM), host firewall,
│                                     │     image scanning, patch management, bastion/SSM
├─────────────────────────────────────┤
│  4. APPLICATION / RUNTIME           │  ← secure coding, SAST/DAST/SCA, API gateway, WAF,
│                                     │     secrets management (Vault, Secrets Manager), CI/CD gates
├─────────────────────────────────────┤
│  5. DATA                            │  ← encryption (KMS/BYOK), classification, DLP, tokenization,
│                                     │     access control (IAM, ABAC), lifecycle, backup, WORM
└─────────────────────────────────────┘
        ▲                    ▲
   CROSS-CUTTING:        GOVERNANCE:
   Logging (CloudTrail),  Policies (SCPs, Org policies),
   Monitoring (SIEM),     Compliance (Config, Security Hub),
   Alerting, IR playbooks  Audit, Tagging, FinOps
```

---

### C20 · "Describe security architecture in cloud computing." [5] 🎯 5-mark

> Cloud security architecture is a **layered defence-in-depth** model:

**1. Perimeter/Identity** — WAF, DDoS, DNS, IAM, MFA, SSO, federation. First line; controls *who* enters.
**2. Network** — VPC, subnets, security groups, NACLs, VPN/Direct Connect, micro-segmentation, service mesh mTLS, PrivateLink. Controls *where* traffic flows.
**3. Host/Compute** — guest OS hardening, EDR/FIM agents, host firewall, image scanning, patch management, bastion/SSM. Controls *what* runs.
**4. Application/Runtime** — secure coding, SAST/DAST/SCA, API gateway, WAF, secrets management (Vault, Secrets Manager), CI/CD gates. Controls *how* code behaves.
**5. Data** — encryption (KMS/BYOK), classification, DLP, tokenization, access control (IAM/ABAC), lifecycle, backup, WORM. The *crown jewel*.

**Cross-cutting:** logging (CloudTrail), monitoring (SIEM), alerting, IR playbooks. **Governance:** policies (SCPs), compliance (Config, Security Hub), audit, tagging.

*(204 words)*

---

## 6.3 Data and Application Security

### Data Security Issues (B16) 🎯 3-mark

| Issue | Mechanism | Control |
|---|---|---|
| **Confidentiality breach** | unauthorised access to data at rest/in transit | encryption (KMS/BYOK), IAM least privilege, VPC endpoints, PrivateLink |
| **Integrity violation** | unauthorised modification | checksums, signatures, WORM, immutable logs, GitOps |
| **Availability loss** | deletion, ransomware, region outage | multi-AZ replication, backup (cross-region), versioning, MFA delete |
| **Data leakage** | misconfigured storage (public S3), logs, snapshots | bucket policies, block public access, Macie, DLP, Cloud Custodian |
| **Multi-tenancy residue** | data remnant after deallocation | secure erase, encryption (key shredding), dedicated hosts |
| **Compliance failure** | data residency, retention, sovereignty | region lock, Data Residency Guardrails, legal hold |

---

### B16 · "What are common data security issues in cloud computing?" [3] 🎯 3-mark

> **Shape: six issues, one line each with mechanism + control. ~100 words.**

Common data security issues:

1. **Confidentiality breach** — unauthorised access to data at rest/in transit. *Control:* encryption (KMS/BYOK), IAM least privilege, VPC endpoints.
2. **Integrity violation** — unauthorised modification. *Control:* checksums, signatures, WORM, immutable logs.
3. **Availability loss** — deletion, ransomware, region outage. *Control:* multi-AZ replication, cross-region backup, versioning, MFA delete.
4. **Data leakage** — misconfigured storage (public S3), logs, snapshots. *Control:* bucket policies, block public access, Macie, DLP.
5. **Multi-tenancy residue** — data remnant after deallocation. *Control:* secure erase, key shredding, dedicated hosts.
6. **Compliance failure** — data residency, retention, sovereignty. *Control:* region lock, residency guardrails, legal hold.

*(104 words)*

---

## 6.4 Virtual Machine Security (A7) 🎯 1-mark

> **VM security is the protection of the guest/hypervisor boundary — ensuring a compromised VM cannot escape to the host or other VMs, and the host cannot inspect/manipulate the guest without authorisation.**

### Threat Vectors

| Vector | Description | Mitigation |
|---|---|---|
| **VM escape** | guest breaks out to hypervisor/host | hardware isolation (EPT, IOMMU, SEV), hypervisor patching, minimal attack surface |
| **Side-channel** | Spectre/Meltdown, cache timing, cross-VM | CPU microcode updates, KPTI, retpoline, dedicated hosts, SEV-SNP |
| **Image compromise** | malicious base image, injected at build | image signing (cosign, Notary), vulnerability scanning (Trivy, Clair), SBOM |
| **Snapshot theft** | stolen VM snapshot = data + state + keys | encrypt snapshots, restrict snapshot permissions, key management |
| **Resource exhaustion** | noisy neighbour, DoS on host | resource quotas, limits, DRS, dedicated hosts |

---

### A7 · "What do you mean by Virtual Machine Security?" [1] 🎯 1-mark

> VM security protects the guest/hypervisor boundary — preventing VM escape (guest→host), side-channel attacks (Spectre/Meltdown), image compromise, snapshot theft, and resource exhaustion. Mitigations: hardware isolation (EPT, IOMMU, SEV), hypervisor patching, image signing/scanning, snapshot encryption, resource quotas.

*(50 words. Definition + threat vectors + mitigations.)*

---

## 6.5 SaaS Security

| Concern | Control |
|---|---|
| **Identity & access** | SSO (SAML/OIDC), MFA, SCIM provisioning, conditional access, session controls |
| **Data governance** | DLP, eDiscovery, retention policies, legal hold, encryption (customer-managed keys where offered) |
| **Configuration** | secure defaults (disable external sharing), OAuth app governance, admin activity alerts |
| **Threat protection** | CASB (Cloud Access Security Broker), anomaly detection, session risk |
| **Compliance** | provider certifications (SOC 2, ISO 27001), customer evidence, shared responsibility |

---

## 6.6 Security Monitoring (A9) 🎯 1-mark

> **Security monitoring is the continuous collection, analysis, and alerting on security-relevant events across the cloud estate — logs, metrics, threats, and compliance drift.**

### What to Monitor (the Logs)

| Source | Key events |
|---|---|
| **CloudTrail / Audit Logs** | API calls (who, what, when, where), root login, policy changes, resource create/delete |
| **VPC Flow Logs** | network connections (src/dst IP, port, protocol, accept/reject) |
| **GuardDuty / Security Command Center** | threat intel: crypto mining, credential exfiltration, reconnaissance, unusual API |
| **Config / Security Hub** | compliance drift: public S3, unrestricted SG, unencrypted volumes, IAM over-permission |
| **Application logs** | WAF blocks, auth failures, error rates, business logic anomalies |

### Detection → Response Loop

1. **Collect** — centralised log sink (S3, CloudWatch, Logging, Log Analytics)
2. **Detect** — rules (Sigma, KQL), ML (GuardDuty, Chronicle), correlation
3. **Alert** — severity, enrichment, routing (PagerDuty, Slack, email)
4. **Investigate** — timeline, blast radius, attribution
5. **Respond** — contain (revoke keys, isolate SG), eradicate, recover, post-mortem

---

### A9 · "What do you mean by Security Monitoring?" [1] 🎯 1-mark

> Security monitoring is the continuous collection, analysis, and alerting on security events across the cloud estate — CloudTrail/Audit Logs (API calls), VPC Flow Logs (network), GuardDuty (threats), Config/Security Hub (compliance drift), application logs. Loop: collect → detect (rules/ML) → alert → investigate → respond (contain/eradicate/recover).

*(52 words. Definition + log sources + loop.)*

---

## 6.7 Legal Issues and Multi-Tenancy

### Legal Aspects

| Legal aspect | Cloud implication |
|---|---|
| **Data sovereignty** | data must reside in specific jurisdiction → region lock, residency guarantees |
| **GDPR / privacy laws** | controller/processor roles, DPA, SCCs, Art. 28, breach notification (72h) |
| **Industry regulations** | PCI DSS (card data), HIPAA (health), SOX (financial), FedRAMP (gov) |
| **Contractual** | SLA, DPA, liability caps, termination, audit rights, exit assistance |
| **E-discovery** | legal hold, immutable logs, export capability, chain of custody |

### Multi-Tenancy Issues

| Issue | Control |
|---|---|
| **Noisy neighbour** | resource quotas, DRS, dedicated hosts, placement groups |
| **Data leakage across tenants** | hypervisor isolation, encryption, network segmentation, attestation |
| **Side-channel attacks** | CPU microcode, KPTI, SEV-SNP, dedicated cores |
| **Compliance isolation** | dedicated tenancy, gov cloud regions, HSM |

---

## 6.8 D22 · "Explain risks and mitigation strategies in cloud computing security." [10] 🎯 10-mark

> **Shape: risk register (risk → likelihood × impact → control → residual risk) for 6–8 cloud security risks. ~350 words.**

**Risk register approach:** each risk assessed as **Likelihood (L/M/H) × Impact (L/M/H) = Risk Rating**; then **Control** applied; **Residual Risk** after control.

| # | Risk | L × I | Control | Residual |
|---|---|---|---|---|
| 1 | **Misconfiguration** (public S3, open SG, excessive IAM) | H × H = **Critical** | IaC (Terraform), policy-as-code (OPA, Sentinel), drift detection (Config), SCPs, least-privilege IAM | M × M = **Medium** |
| 2 | **Credential compromise** (leaked keys, phishing, CI/CD secrets) | H × H = **Critical** | MFA everywhere, short-lived credentials (STS, Workload Identity), secret scanning (GitLeaks, TruffleHog), rotation, no long-lived keys | M × M = **Medium** |
| 3 | **Data breach / exfiltration** (confidentiality loss) | M × H = **High** | encryption (KMS/BYOK), VPC endpoints, DLP (Macie), tokenization, egress filtering, PrivateLink | L × M = **Low** |
| 4 | **VM escape / side-channel** (Spectre, Meltdown, hypervisor vuln) | L × H = **Medium** | hardware isolation (EPT, IOMMU, SEV-SNP), hypervisor patching, dedicated hosts, CPU microcode | L × M = **Low** |
| 5 | **DDoS / availability attack** | M × H = **High** | Shield/Cloud Armor (L3/4, L7), WAF, auto-scaling, Anycast, rate limiting | L × M = **Low** |
| 6 | **Insider threat / privilege abuse** | L × H = **Medium** | least privilege, JIT access (PAM), session recording, behavioural analytics (UEBA), separation of duties | L × L = **Low** |
| 7 | **Supply chain / dependency attack** (SolarWinds, Log4j) | M × H = **High** | SBOM, SCA (Syft, Grype), signed images (cosign), private registries, minimal base images | L × M = **Low** |
| 8 | **Compliance / legal violation** (GDPR, residency, retention) | M × H = **High** | region lock, residency guardrails, DPA, audit logs, legal hold, automated evidence (Config) | L × M = **Low** |

**Cross-cutting mitigations:** centralised logging (SIEM), continuous monitoring (GuardDuty, Security Hub), IR playbooks (contain/eradicate/recover), chaos engineering (failure injection), red teaming.

**Closing:** the shared responsibility model means the customer *must* implement these controls — the provider secures the cloud, the customer secures *in* the cloud. A risk register is a living document, reviewed quarterly and after every incident.

*(356 words)*

---

## 6.9 Traps

| Trap | Why it costs marks | Fix |
|---|---|---|
| Answering C18 without the shared responsibility table | it's the central concept | table with provider vs customer for each layer |
| Saying "provider secures data" | data is ALWAYS customer's responsibility | "data and identity are ALWAYS customer's responsibility" |
| C20 without the five-layer diagram | layered architecture is the answer | perimeter → network → host → app → data + cross-cutting |
| B16 as a list without mechanism+control | "issues" implies cause + fix | six issues, each: what + mechanism + control |
| A7 without the threat vectors | "VM security" = guest/hypervisor boundary | VM escape, side-channel, image compromise, snapshot theft, resource exhaustion |
| A9 without the detection→response loop | monitoring is a loop, not a list | collect → detect → alert → investigate → respond |
| D22 without a risk register format | "risks and mitigation strategies" = risk register | risk → L×I → control → residual risk |
| Missing cross-cutting controls in C20/D22 | logging, monitoring, governance are not layers | add cross-cutting row + governance row |
| Forgetting MFA delete for availability | it's the #1 ransomware protection | "versioning + MFA delete" for S3/blob |

---

## 6.10 Self-Test (Answers Collapsed)

1. What are the three CIA pillars in cloud, with one control each? *(3 marks)*
2. Draw the shared responsibility model table (provider vs customer for 5 layers). *(3 marks)*
3. Why are data and identity ALWAYS the customer's responsibility? *(2 marks)*
4. Draw the five-layer security architecture (perimeter → network → host → app → data). *(diagram — C20)*
5. Name six data security issues with one control each. *(3 marks — B16)*
6. What is VM security, and what are the five threat vectors? *(1 mark — A7)*
7. What is the security monitoring loop? *(1 mark — A9)*
8. Create a 4-row risk register for cloud security (risk → L×I → control → residual). *(5 marks — D22)*

<details>
<summary>Answers</summary>

1. **Confidentiality** — encryption (KMS/BYOK), TLS, IAM. **Integrity** — checksums, signatures, CloudTrail, WORM. **Availability** — multi-AZ, auto-scaling, DDoS protection, backup.
2. Physical: provider (datacentre) / customer (—). Network: provider (backbone) / customer (VPC, SG). Host: provider (hypervisor) / customer (guest OS). Platform: provider (managed) / customer (app code). Data: provider (encryption at rest) / customer (keys, access).
3. Regardless of IaaS/PaaS/SaaS, the customer owns the *meaning* of the data (classification, access, lifecycle) and *who* accesses it (identity, least privilege). The provider only manages the *storage medium* and *identity service*.
4. Perimeter/Identity → Network → Host/Compute → Application/Runtime → Data. Cross-cutting: Logging, Monitoring, Alerting, IR. Governance: Policies, Compliance, Audit.
5. (1) Confidentiality breach → encryption/IAM. (2) Integrity violation → signatures/WORM. (3) Availability loss → multi-AZ/backup/MFA delete. (4) Data leakage → bucket policies/Macie. (5) Multi-tenancy residue → secure erase/key shredding. (6) Compliance failure → region lock/guardrails.
6. VM security = guest/hypervisor boundary protection. Vectors: VM escape, side-channel, image compromise, snapshot theft, resource exhaustion.
7. Collect (logs) → Detect (rules/ML) → Alert → Investigate → Respond (contain/eradicate/recover).
8. See D22 skeleton: Misconfiguration (Critical→Medium), Credential compromise (Critical→Medium), Data breach (High→Low), DDoS (High→Low).

</details>

---

## 6.11 Sixty-Second Check

Close this file and, on a blank page:

- [ ] CIA triad: three pillars + one cloud control each
- [ ] Shared responsibility table: 5+ layers, provider vs customer
- [ ] "Data and identity ALWAYS customer" — say why
- [ ] Five-layer architecture diagram: perimeter → network → host → app → data
- [ ] Six data security issues + controls
- [ ] VM security: definition + five threat vectors
- [ ] Security monitoring: collect → detect → alert → investigate → respond
- [ ] Risk register format: risk → L×I → control → residual (4+ rows)

If all eight are there, Unit 6's **25 marks** are covered — A7, A9, B16, C18, C20, D22.

---

*Sources: TU FOM syllabus (IT 277, Unit 6, 6 LHs) · TU/FOM model question 2026 (A7, A9, B16, C18, C20, D22) · Saurabh, Cloud Computing, ch. 11–12 (syllabus reading) · Buyya et al., Mastering Cloud Computing, ch. 11–12 (syllabus reading) · NIST SP 800-145 (shared responsibility), CSA Cloud Controls Matrix, AWS/Azure/GCP security documentation — standard references. AWS GuardDuty, Security Hub, Config, CloudTrail, KMS, Shield, WAF, IAM; Azure Security Center, Sentinel, Policy, Key Vault; GCP Security Command Center, Cloud Armor, KMS — standard service examples, not current feature claims.*