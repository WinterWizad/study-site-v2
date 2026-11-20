# Cloud Computing — TU/FOM 2026 Model Question Complete Written Answers

**Paper:** IT 277 Cloud Computing | **Full Marks:** 60 | **Pass Marks:** 30 | **Time:** 3 Hours
**Source:** TU/FOM 2026 Official Model Question

> **Note:** This is the official model question. Word-count guidance: Group A (1 mark) ≈ 30–50 words · Group B (3 marks) ≈ 100–150 words · Group C (5 marks) ≈ 200–250 words · Group D (10 marks) ≈ 400–500 words. Diagrams are part of the answer where indicated.

---

## Group A — Brief Answer Questions [10 × 1 = 10]

### A1. Define Cloud Computing.

**Cloud Computing** (NIST SP 800-145) is a model for enabling **ubiquitous, convenient, on-demand network access** to a shared pool of configurable computing resources (networks, servers, storage, applications, services) that can be rapidly provisioned and released with minimal management effort or service provider interaction.

**Five essential characteristics:**
1. **On-demand self-service** — users provision resources automatically.
2. **Broad network access** — available over standard networks (internet, intranet).
3. **Resource pooling** — multi-tenant model with location independence.
4. **Rapid elasticity** — scale out/in commensurate with demand.
5. **Measured service** — usage metered, controlled, reported (pay-per-use).

**Three service models:** IaaS, PaaS, SaaS. **Four deployment models:** Public, Private, Community, Hybrid.

---

### A2. What do you mean by SaaS?

**SaaS (Software as a Service)** is a cloud service model where the **provider delivers a complete application** over the internet, managing all underlying infrastructure, middleware, and application software. Users access it via a thin client (web browser or API) without installing or managing anything locally.

**Key traits:** Multi-tenant architecture, subscription pricing, automatic updates, accessible from any device.
**Examples:** Google Workspace (Gmail, Docs), Microsoft 365, Salesforce, Slack, Zoom, Dropbox.

---

### A3. Define private cloud.

**Private cloud** is a cloud deployment model where the infrastructure is **dedicated to a single organisation** (single-tenant). It may be hosted on-premises or by a third party, but the key distinction is **exclusive access** — resources are not shared with other organisations.

**Characteristics:** Higher control and customisation; compliance-friendly (data sovereignty); higher CapEx/OpEx; organisation manages or outsources management. Used for sensitive workloads (banking core, defence, healthcare records).

---

### A4. What is Cloud Storage?

**Cloud Storage** is a service model where data is stored on remote servers accessed via the internet, managed by a cloud provider. It provides **scalable, durable, and highly available** storage without the user owning physical storage hardware.

**Types:**
- **Object storage** — unstructured data (S3, GCS, Azure Blob); flat namespace, metadata-rich.
- **Block storage** — raw volumes for VMs (EBS, Persistent Disk); low latency, file system on top.
- **File storage** — shared file systems (EFS, Azure Files, Filestore); NFS/SMB protocols.

**Features:** Pay-per-GB, geo-replication, lifecycle policies, encryption at rest/in transit.

---

### A5. Define SOA.

**SOA (Service-Oriented Architecture)** is an architectural style where **business functionality is exposed as reusable, loosely-coupled services** communicating via standard protocols (typically HTTP/REST or SOAP/XML) over a network (often an ESB — Enterprise Service Bus).

**Core principles:** Service contract (WSDL/OpenAPI), loose coupling, abstraction, reusability, composability, autonomy, statelessness, discoverability.

**Cloud relevance:** Cloud native applications use **microservices** (fine-grained SOA) deployed on containers/Kubernetes; SOA's ESB is replaced by API gateways and service meshes.

---

### A6. What is Virtualization?

**Virtualization** is the **abstraction of physical computing resources** (CPU, memory, storage, network) into logical/virtual representations, enabling multiple isolated environments (Virtual Machines) to run on a single physical host.

**Core mechanism:** A **hypervisor** (VMM) intercepts privileged instructions from guest OS and translates them to hardware, providing isolation, resource scheduling, and hardware independence.

---

### A7. What do you mean by Virtual Machine Security?

**Virtual Machine Security** refers to protecting the **guest VM and the hypervisor boundary** from threats that exploit the shared physical infrastructure:

| Threat | Description |
|--------|-------------|
| **VM Escape** | Malicious code breaks out of guest to hypervisor/host (e.g., VENOM, CVE-2015-3456). |
| **Inter-VM Attacks** | Side-channel attacks (cache timing, Spectre/Meltdown) leaking data across co-resident VMs. |
| **VM Sprawl** | Unmanaged/forgotten VMs become unpatched attack surface. |
| **Image/Template Tampering** | Compromised golden images propagate vulnerabilities to all deployed VMs. |
| **Hypervisor Vulnerabilities** | Bugs in VMM code (VMware ESXi, Hyper-V, KVM) affect all guests. |

**Mitigations:** Hardened hypervisor, patch management, network micro-segmentation, introspection agents, secure boot, TPM/vTPM, confidential computing (AMD SEV, Intel TDX).

---

### A8. What is parallel computing?

**Parallel computing** is a computation model where **multiple processors/cores execute instructions simultaneously** to solve a problem faster than a single processor. It divides a task into sub-tasks that run concurrently.

**Key metrics:**
- **Speedup** = T₁ / Tₚ (serial time / parallel time)
- **Efficiency** = Speedup / p (p = processors)
- **Amdahl's Law** — maximum speedup limited by serial fraction: Sₘₐₓ = 1 / (s + (1-s)/p)

**Types:** Bit-level, instruction-level, data-level (SIMD), task-level (MIMD). Cloud relevance: MapReduce, Spark, distributed training are parallel computing frameworks on commodity clusters.

---

### A9. What do you mean by Security Monitoring?

**Security Monitoring** is the **continuous collection, analysis, and alerting on security-relevant events** across cloud infrastructure to detect, investigate, and respond to threats in real time.

**Core components:**
- **Logging** — centralised collection (CloudTrail, Cloud Audit Logs, VPC Flow Logs).
- **SIEM** — correlation, anomaly detection (Splunk, Elastic, Chronicle, AWS Security Hub).
- **IDS/IPS** — network/host intrusion detection (GuardDuty, Azure Defender, Falco).
- **CSPM** — posture management (misconfiguration drift, compliance checks).
- **Threat Intelligence** — IOC feeds, ATT&CK mapping.

**Cloud-specific:** Shared responsibility means customer monitors **in-guest, application, identity, data**; provider monitors **physical, hypervisor, control plane**.

---

### A10. Define AppEngine.

**Google App Engine (GAE)** is a **fully managed PaaS (Platform as a Service)** on Google Cloud that lets developers build and deploy applications without managing infrastructure. It handles provisioning, scaling, load balancing, health checks, and runtime patching automatically.

**Key features:**
- **Standard Environment** — sandboxed runtimes (Python, Java, Go, Node.js, PHP, Ruby); sub-second scaling to zero.
- **Flexible Environment** — custom Docker containers; more control, slower scale.
- **Integrated services** — Cloud SQL, Datastore/Firestore, Memcache, Cloud Tasks, Pub/Sub.
- **Pricing** — pay per instance-hour (standard) or vCPU/GB-hour (flexible); free tier available.

**Use case:** Web apps, mobile backends, APIs, microservices where ops overhead must be minimal.

---

## Group B — Short Answer Questions (attempt any FIVE) [5 × 3 = 15]

### B11. Compare PaaS with IaaS. What do you mean by public cloud?

#### **PaaS vs IaaS**

| Dimension | **IaaS (Infrastructure as a Service)** | **PaaS (Platform as a Service)** |
|-----------|----------------------------------------|----------------------------------|
| **Abstraction level** | Virtualised hardware (VMs, storage, network) | Application runtime + middleware + OS |
| **User manages** | OS, runtime, middleware, applications, data | Applications, data only |
| **Provider manages** | Physical, hypervisor, network, storage | Physical to runtime (incl. OS patching, scaling) |
| **Control** | High (full OS access, kernel modules) | Medium (app config, scaling rules) |
| **Flexibility** | Any OS, any software, legacy lift-and-shift | Constrained to supported runtimes/frameworks |
| **Typical use** | Migration, custom stacks, HPC, databases | Web apps, APIs, microservices, CI/CD pipelines |
| **Examples** | AWS EC2, Azure VMs, GCP Compute Engine | AWS Elastic Beanstalk, Google App Engine, Azure App Service, Heroku |

#### **Public Cloud**

**Public cloud** is a deployment model where cloud services are delivered over the **public internet** by a third-party provider (AWS, Azure, GCP, Oracle, Alibaba) to **multiple organisations (multi-tenant)** on a pay-per-use basis. Resources are shared at the physical level but logically isolated. The provider owns and operates all infrastructure.

**Traits:** No CapEx, massive scale, global regions, broad service portfolio, shared responsibility model.

---

### B12. Describe advantages and disadvantages of cloud computing.

#### **Advantages**

| Benefit | Explanation |
|---------|-------------|
| **Cost model** | CapEx → OpEx; pay-as-you-go; no idle capacity waste. |
| **Elasticity** | Scale up/down in minutes; handle traffic spikes (e.g., Black Friday). |
| **Agility** | Provision servers in minutes vs. weeks for physical procurement. |
| **Global reach** | Deploy in regions worldwide for latency/compliance (data sovereignty). |
| **Managed services** | Offload undifferentiated heavy lifting (DB, queue, ML, security). |
| **Reliability** | Multi-AZ/region architectures; SLAs 99.9%–99.99%. |
| **Innovation speed** | Access to latest tech (GPUs, TPUs, serverless, AI APIs) without procurement. |
| **Collaboration** | Distributed teams access same environment; remote work ready. |

#### **Disadvantages**

| Drawback | Explanation |
|----------|-------------|
| **Vendor lock-in** | Proprietary APIs, data gravity, egress fees make migration hard. |
| **Security/shared responsibility confusion** | Misconfiguration is #1 cause of breaches (S3 public buckets, open SGs). |
| **Compliance complexity** | Data residency, GDPR, HIPAA, sectoral regs vary by region. |
| **Unpredictable costs** | Runaway bills from orphaned resources, runaway scaling, egress fees. |
| **Performance variability** | Noisy neighbours, network latency, cold starts (serverless). |
| **Internet dependency** | Requires reliable connectivity; edge/offline limited. |
| **Skill gap** | Cloud-native skills (K8s, Terraform, serverless) scarce and expensive. |
| **Single points of failure** | Provider outages (AWS us-east-1 2021, Azure 2023) affect all tenants. |

---

### B13. Explain the different types of Hypervisor.

**Hypervisor (VMM — Virtual Machine Monitor)** is the software layer that creates and runs VMs. Two types:

---

#### **Type 1 — Bare Metal (Native)**

Runs **directly on host hardware**; no host OS. The hypervisor *is* the OS.

| Product | Vendor | Use Case |
|---------|--------|----------|
| **VMware ESXi** | Broadcom/VMware | Enterprise data centres, vSphere |
| **Microsoft Hyper-V** | Microsoft | Windows Server, Azure Stack |
| **KVM (Kernel-based VM)** | Linux (Red Hat, Ubuntu, Proxmox) | OpenStack, oVirt, GCP, AWS Nitro |
| **Xen** | Citrix / Linux Foundation | XenServer, AWS (legacy), Citrix Hypervisor |
| **Oracle VM Server** | Oracle | Oracle workloads |

**Characteristics:** High performance (near-bare-metal), small attack surface, direct hardware access, used in production clouds.

**Architecture:**
```
[Guest VM 1] [Guest VM 2] [Guest VM 3]
      ↓           ↓           ↓
[Type 1 Hypervisor (ESXi/KVM/Hyper-V)]
      ↓
[Physical Hardware: CPU, RAM, NIC, Storage]
```

---

#### **Type 2 — Hosted**

Runs **as an application on a host OS** (Windows, macOS, Linux). The host OS manages hardware.

| Product | Vendor | Use Case |
|---------|--------|----------|
| **VMware Workstation / Fusion** | Broadcom/VMware | Developer desktops, testing |
| **Oracle VirtualBox** | Oracle | Cross-platform dev/test, free |
| **Parallels Desktop** | Corel | macOS → Windows/Linux |
| **QEMU (user-mode)** | Open Source | Emulation, embedded dev |

**Characteristics:** Lower performance (double privilege transitions), easier to install, used for development/testing, not production.

**Architecture:**
```
[Guest VM 1] [Guest VM 2]
      ↓           ↓
[Type 2 Hypervisor (VirtualBox/Workstation)]
      ↓
[Host OS (Windows/macOS/Linux)]
      ↓
[Physical Hardware]
```

---

#### **Comparison Summary**

| Factor | Type 1 | Type 2 |
|--------|--------|--------|
| **Performance** | ~95–99% native | ~80–90% native |
| **Security** | Smaller TCB, no host OS | Larger TCB, host OS attack surface |
| **Management** | Dedicated console (vCenter, SCVMM) | Desktop UI |
| **Use case** | Production, cloud, enterprise | Dev, test, lab, desktop virtualization |

---

### B14. Discuss types of virtualization with example.

Virtualization abstracts physical resources into logical pools. Five main types:

| Type | What is Virtualised | Example Technologies | Cloud Relevance |
|------|---------------------|---------------------|-----------------|
| **Server/Compute** | Physical server → multiple VMs | VMware ESXi, Hyper-V, KVM, Xen | Foundation of IaaS (EC2, Compute Engine) |
| **Storage** | Physical disks → logical volumes/pools | LVM, ZFS, Ceph, NetApp ONTAP, AWS EBS/S3 | Decouples capacity from hardware; enables snapshots, thin provisioning |
| **Network** | Physical switches/routers → virtual networks | VLAN, VXLAN, OVS, NSX, AWS VPC, Azure VNet | SDN; multi-tenancy; micro-segmentation; NFV |
| **Desktop (VDI)** | User desktop OS → hosted in data centre | VMware Horizon, Citrix Virtual Apps, Azure Virtual Desktop, Amazon WorkSpaces | Remote work; BYOD security; GPU virtualization for CAD/AI |
| **Application** | App isolated from OS/other apps | Docker, Podman, VMware ThinApp, MSIX, Flatpak | Microservices; CI/CD; dependency isolation; "container ≠ VM" (OS-level virtualization) |

**Additional types:**
- **GPU Virtualization** — vGPU (NVIDIA GRID), MIG (Multi-Instance GPU) for AI/VDI workloads.
- **I/O Virtualization** — SR-IOV (Single Root I/O Virtualization) for near-native NIC/storage performance.
- **Memory Virtualization** — Transparent Page Sharing, ballooning, compression (ESXi); KSM (KVM).

---

### B15. Describe the parallel efficiency of MapReduce.

**MapReduce** (Google 2004, Hadoop open-source) is a **batch parallel processing framework** for large datasets on commodity clusters. Its parallel efficiency depends on how well the workload parallelises.

---

#### **Execution Flow & Parallelism**

```
Input Splits → MAP (parallel) → SHUFFLE/SORT (network) → REDUCE (parallel) → Output
```

- **Map Phase** — **Embarrassingly parallel**: each input split processed independently. Ideal speedup = number of map tasks (limited by splits).
- **Shuffle Phase** — **Communication-bound**: all-to-all data transfer (map outputs → reduce partitions). Network is bottleneck.
- **Reduce Phase** — **Parallel per partition**: each reducer processes one partition. Parallelism = number of reducers.

---

#### **Efficiency Factors**

| Factor | Impact on Efficiency | Mitigation |
|--------|---------------------|------------|
| **Data Locality** | Map tasks scheduled where data resides (HDFS rack awareness) → avoids network reads. | Rack-aware scheduler; speculative execution. |
| **Stragglers** | Slow tasks delay job completion (skew, hardware issues). | Speculative execution (backup tasks); combiner. |
| **Skew** | Uneven key distribution → some reducers overloaded. | Custom partitioner; salting keys; combine phase. |
| **Shuffle Volume** | Map output size >> input (no combiner) → network saturation. | **Combiner** (local reduce before shuffle); compression (Snappy, Zstd). |
| **Serial Fractions** | Job setup, commit, cleanup are serial. | Amdahl's Law limits max speedup. |

---

#### **Amdahl's Law Application**

If fraction `s` of job is serial (e.g., 5% setup/commit), max speedup with `p` reducers:

```
S_max = 1 / (s + (1-s)/p)
```

Example: s=0.05, p=100 → S_max = 1 / (0.05 + 0.95/100) ≈ **16.6×** (not 100×).

**Practical efficiency:** Well-tuned MapReduce jobs achieve 60–80% of linear speedup for CPU-bound tasks; I/O-bound tasks lower. Spark (in-memory, DAG) improves on MapReduce by avoiding disk spill between stages.

---

### B16. What are common data security issues in cloud computing?

Data security in cloud spans **confidentiality, integrity, availability** across the shared responsibility model:

| Issue | Description | Cloud Context |
|-------|-------------|---------------|
| **Data Breach / Leakage** | Unauthorized access to sensitive data (PII, IP, credentials). | Misconfigured S3 buckets, public snapshots, exposed databases (MongoDB, Elasticsearch). |
| **Insufficient Encryption** | Data at rest/in transit not encrypted; weak key management. | Default encryption off (older services); customer-managed keys (CMK) not used; keys stored with data. |
| **Data Loss** | Accidental deletion, corruption, ransomware, provider failure. | No versioning/backup; single-region; shared responsibility misunderstanding. |
| **Multi-tenancy Residue** | Data remnants accessible after tenant moves/deletes. | Insecure deletion; shared storage/media not wiped; side-channel leaks. |
| **Insecure APIs/Interfaces** | Weak auth, excessive permissions, no rate limiting. | Exposed management APIs, leaked access keys in code (GitHub), service account over-privilege. |
| **Insider Threat** | Malicious/negligent provider staff or customer admins. | Privileged access abuse; no separation of duties; audit log gaps. |
| **Compliance Violations** | Data residency, sovereignty, sectoral regs breached. | Data replicated to wrong region; GDPR Art. 28 DPA missing; HIPAA BAA not signed. |
| **Shadow IT / Unmanaged Data** | Departments use unsanctioned cloud services. | Marketing uses unapproved SaaS; data exfiltration via personal drives. |
| **Key Management Failures** | Keys lost, rotated incorrectly, stored in code. | KMS not used; hardcoded keys; no HSM; single-region keys. |
| **Data Sovereignty / Legal Access** | Foreign government access (CLOUD Act, China NISL). | Data in US regions accessible to US govt; EU Schrems II invalidates Privacy Shield. |

**Mitigation framework:** Encrypt everywhere (CMEK/CSEK), classify data, DLP, CSPM, DSPM, zero-trust network, immutable backups, regular key rotation, audit logs, compliance automation.

---

## Group C — Long Answer Questions (attempt any THREE) [3 × 5 = 15]

### C17. Explain the Cloud services requirements with example.

**Cloud service requirements** are the non-functional criteria a cloud service (IaaS/PaaS/SaaS) must satisfy to be fit for enterprise production use. They form the basis of **SLAs, architecture decisions, and vendor evaluation**.

---

#### **Core Requirements (NIST / ISO 19086 / CSA CCM)**

| Requirement | Definition | Measurement | Example |
|-------------|------------|-------------|---------|
| **Availability** | Service operational and accessible when needed. | Uptime % (99.9% = 8.76h/yr downtime); MTBF/MTTR. | AWS EC2 SLA: 99.99% per region; Multi-AZ RDS: 99.95%. |
| **Reliability** | Consistent correct operation over time. | Error rate, durability (S3: 99.999999999% = 11 9's). | S3 Standard durability; Cloud SQL automatic failover. |
| **Scalability / Elasticity** | Handle load variation by adding/removing resources. | Scale-out time; max capacity; scale-to-zero. | App Engine scales 0→1000 instances in seconds; K8s HPA. |
| **Performance** | Response time, throughput, latency under load. | p50/p95/p99 latency; IOPS; throughput (MB/s). | ElastiCache p99 < 1ms; Cloud CDN cache hit ratio > 90%. |
| **Security** | Confidentiality, integrity, availability of data/systems. | Certifications (ISO 27001, SOC 2, FedRAMP); encryption; IAM. | KMS with HSM; VPC-SC; Binary Authorization; CMEK. |
| **Interoperability / Portability** | Move workloads/data between clouds/on-prem. | Open APIs (OCI, CNCF); standard formats (OVA, OVF, Helm). | Kubernetes runs anywhere; Terraform multi-cloud; Anthos. |
| **Manageability / Observability** | Monitor, log, trace, debug, automate operations. | Logs/metrics/traces retention; alerting latency; IaC coverage. | Cloud Logging/Monitoring/Trace; Prometheus/Grafana; Terraform. |
| **Compliance / Auditability** | Meet regulatory, legal, contractual obligations. | Audit reports (SOC 2 Type II); data residency controls; DPA. | AWS Artifact; Azure Compliance Manager; GCP Assured Workloads. |
| **Cost Transparency / Predictability** | Understand, forecast, optimise spend. | Per-resource billing; budgets/alerts; committed use discounts. | AWS Cost Explorer; GCP Billing Reports; FinOps practice. |
| **Disaster Recovery / Business Continuity** | Recover from failures/disasters within RTO/RPO. | RTO (recovery time), RPO (recovery point); cross-region DR. | Cross-region replication; Pilot Light / Warm Standby / Hot Standby. |

---

#### **Example: E-commerce Platform on AWS**

| Requirement | Implementation |
|-------------|----------------|
| **Availability** | Multi-AZ ALB → Auto Scaling Group (min 3, max 50) across 3 AZs; RDS Multi-AZ; ElastiCache replication group. |
| **Scalability** | Target tracking scaling policy (CPU 70%); scheduled scaling for known peaks (Diwali sale); DynamoDB on-demand for session store. |
| **Performance** | CloudFront CDN (edge caching); ElastiCache Redis (product catalog); RDS Read Replicas (reporting queries). |
| **Security** | WAF (OWASP Top 10); Secrets Manager (DB creds, API keys); IAM least privilege; GuardDuty + Security Hub; VPC flow logs. |
| **Observability** | X-Ray (distributed tracing); CloudWatch metrics/alarms; CloudTrail audit; synthetic canaries (Synthetics). |
| **DR** | Cross-region Aurora Global Database (RPO < 1s, RTO < 1min); S3 Cross-Region Replication; Route 53 failover. |
| **Cost** | Savings Plans (EC2, RDS); S3 Intelligent-Tiering; Compute Optimizer rightsizing; monthly FinOps review. |

---

#### **Key Insight**

Requirements **trade off** against each other: higher availability → higher cost; stronger isolation → lower density/performance. Architecture decisions document these trade-offs in an **Architecture Decision Record (ADR)**. The model question expects you to list requirements, define them, and map to concrete cloud services with configuration details.

---

### C18. Explain the concept of cloud security.

**Cloud security** is the set of policies, technologies, controls, and practices that protect cloud-based systems, data, and infrastructure. It operates under the **Shared Responsibility Model** — the foundational concept distinguishing cloud from on-premises security.

---

#### **Shared Responsibility Model**

| Layer | **Provider Responsibility** (Security *of* the Cloud) | **Customer Responsibility** (Security *in* the Cloud) |
|-------|------------------------------------------------------|------------------------------------------------------|
| **Physical** | Data centres, power, cooling, network cables, hardware lifecycle. | — |
| **Hypervisor / Host OS** | ESXi, Hyper-V, KVM hardening; patching; isolation. | — |
| **Network Infrastructure** | Backbone, DDoS protection (Shield, Armor), global network. | VPC design, SG/NACL, TLS, WAF, PrivateLink. |
| **Storage Hardware** | Disk encryption, erasure coding, durability. | Bucket policies, encryption (SSE-S3/SSE-KMS/CSE), versioning, lifecycle. |
| **Compute (IaaS)** | Hypervisor, host OS, hardware. | **Guest OS patching, host firewall, endpoint protection, hardening.** |
| **Platform (PaaS)** | Runtime, middleware, OS patching, scaling. | **App code, data, IAM, network config, secrets.** |
| **Software (SaaS)** | Application, infrastructure, platform. | **User access, data classification, configuration, identity.** |
| **Identity & Access** | IAM service availability, MFA options, IdP integration. | **Policies, roles, least privilege, MFA enforcement, access reviews.** |
| **Data** | Encryption at rest (default), key hierarchy. | **Classification, encryption (CMEK/CSEK), DLP, retention, disposal.** |
| **Compliance** | Certifications (ISO, SOC, FedRAMP), audit reports. | **Control implementation, evidence collection, attestation.** |

**Rule:** The **lower** the service model (IaaS), the **more** customer responsibility. The **higher** (SaaS), the **more** provider responsibility.

---

#### **Cloud Security Domains (CSA CCM / NIST 800-53 / ISO 27017)**

| Domain | Key Controls |
|--------|--------------|
| **Identity & Access (IAM)** | Least privilege, RBAC/ABAC, MFA (phishing-resistant), JIT access, PAM, service accounts, workload identity (IRSA, WIF), Zero Trust. |
| **Network Security** | VPC segmentation (public/private/protected), SG/NACL, PrivateLink/Service Endpoints, TLS 1.2+ everywhere, WAF, DDoS protection, DNSSEC. |
| **Data Protection** | Encryption at rest (CMEK/CSEK, HSM), in transit (TLS 1.3, mTLS), in use (Confidential Computing: AMD SEV, Intel TDX, NVIDIA H100 TEEs), tokenisation, DLP, key rotation, HSM/Cloud KMS. |
| **Application Security** | SAST/DAST/SCA in CI/CD, container image scanning (Trivy, Syft), admission control (OPA/Gatekeeper), runtime protection (Falco, Tetragon), WAF/Bot management. |
| **Vulnerability Management** | Continuous scanning (Inspector, Defender, SCC), patch automation (Systems Manager, OS Config), SBOM (Syft), CVE triage SLA. |
| **Security Monitoring (SecOps)** | Centralised logging (CloudTrail, Audit Logs), SIEM (Security Hub, Chronicle, Sentinel), threat intel (GuardDuty, Defender, Mandiant), SOAR, MITRE ATT&CK mapping. |
| **Governance & Compliance** | Policy-as-code (OPA, Sentinel, Config Rules), drift detection, CSPM (Wiz, Orca, Prowler), DSPM, compliance frameworks (CIS Benchmarks, PCI DSS, HIPAA, GDPR). |
| **Incident Response** | IR plan, playbooks, forensics readiness (disk snapshots, VPC flow logs), communication tree, legal/regulatory notification. |
| **Resilience / DR** | Multi-AZ/Region, backup (immutable, air-gapped), RTO/RPO tested, chaos engineering (Gremlin, AWS FIS). |

---

#### **Threat Model: MITRE ATT&CK for Cloud**

| Tactic | Cloud Techniques |
|--------|------------------|
| **Initial Access** | Valid accounts (phished keys), public buckets, exposed services, supply chain. |
| **Credential Access** | Instance metadata service (IMDSv1), container service accounts, keychain dump. |
| **Discovery** | Cloud resource enumeration (CloudSploit, ScoutSuite), IAM reconnaissance. |
| **Lateral Movement** | Pass-the-role (STS AssumeRole), container escape, VPC peering abuse. |
| **Persistence** | Backdoor IAM keys, malicious Lambda/Cloud Functions, startup scripts. |
| **Exfiltration** | Data transfer to external bucket, DNS tunnelling, snapshot sharing. |
| **Impact** | Ransomware (encrypt S3/EBS), crypto-mining (EC2, Cloud Run), resource hijacking. |

---

#### **Key Takeaway for Exam**

Cloud security = **CIA triad + Shared Responsibility + Continuous Assurance**. It is not a product but a **process** spanning identity, data, network, application, operations, and governance — with automation (policy-as-code) as the only scalable enforcement mechanism.

---

### C19. Describe the working of MapReduce architecture.

**MapReduce** is a **distributed batch processing framework** (Google 2004, Hadoop 2006) that processes large datasets on commodity clusters using a **two-phase map-reduce paradigm** with automatic parallelisation, fault tolerance, and data locality.

---

#### **Architecture Components (Hadoop 2.x / YARN)**

| Component | Role |
|-----------|------|
| **Client** | Submits job (JAR + config + input/output paths). |
| **ResourceManager (RM)** | Cluster-wide resource scheduler; tracks NodeManagers. |
| **NodeManager (NM)** | Per-node agent; launches containers; reports health. |
| **ApplicationMaster (AM)** | Per-job manager; negotiates containers; tracks tasks. |
| **MapTask / ReduceTask** | Containers executing user map/reduce functions. |
| **HDFS** | Distributed storage; NameNode (metadata) + DataNodes (blocks). |

---

#### **Job Execution Flow**

```
1. Client submits job → RM
2. RM allocates AM container → NM
3. AM reads input splits from HDFS → calculates #maps
4. AM requests map containers from RM → RM grants
5. AM launches MapTasks on NMs (data-local where possible)
6. MapTasks read splits → map(k1,v1) → list(k2,v2) → memory buffer → spill to local disk (partitioned by reducer)
7. MapTask notifies AM of partition locations
8. AM requests reduce containers → launches ReduceTasks
9. ReduceTasks **pull** map outputs (shuffle) → merge-sort → reduce(k2, list(v2)) → list(k3,v3)
10. ReduceTasks write output to HDFS (part-r-XXXXX)
11. AM commits job → notifies Client
```

---

#### **Data Flow Diagram**

```
INPUT (HDFS)
    │
    ▼
┌─────────────────────────────────────┐
│        SPLITS (64/128 MB)           │  ← InputFormat defines splits
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│           MAP PHASE                 │  ← Parallel, one task per split
│  map(k1, v1) → list(k2, v2)         │
│  Partitioner → Spill to local disk  │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│         SHUFFLE & SORT              │  ← Network-intensive
│  ReduceTasks FETCH partitions       │
│  Merge-sort (external sort)         │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│          REDUCE PHASE               │  ← Parallel, one task per partition
│  reduce(k2, list(v2)) → list(k3,v3) │
└─────────────────────────────────────┘
    │
    ▼
OUTPUT (HDFS)  ── part-r-00000, part-r-00001, ...
```

---

#### **Key Mechanisms**

| Mechanism | Purpose |
|-----------|---------|
| **InputFormat** | Splits input (TextInputFormat → lines; KeyValueTextInputFormat → k,v). |
| **RecordReader** | Deserialises split into (key, value) pairs for map. |
| **Partitioner** | `hash(key) % numReducers` → deterministic shuffle routing. Custom for skew. |
| **Combiner** | **Local reduce** on map output before shuffle (optional; associative + commutative only). |
| **Shuffle** | HTTP pull from map tasks → reduce tasks; merge-sort (memory + disk). |
| **Sort** | Keys sorted within partition; enables reduce to stream values per key. |
| **OutputFormat** | Writes (k3,v3) to HDFS (TextOutputFormat, SequenceFileOutputFormat). |
| **Speculative Execution** | Slow task → duplicate on another node; first completion wins. |
| **Fault Tolerance** | Task failure → re-schedule on another node; HDFS replication (3x) protects data. |

---

#### **Classic Example: Word Count**

```java
// Map
map(docId, text) → for each word w: emit(w, 1)

// Combiner (optional, same as reducer)
combine(w, list(1,1,1...)) → emit(w, sum)

// Reduce
reduce(w, list(counts)) → emit(w, totalCount)
```

**Shuffle volume:** Without combiner, map emits (word, 1) per occurrence → massive network traffic. With combiner, emits (word, localCount) → drastically reduced.

---

#### **Limitations & Evolution**

| Limitation | Modern Successor |
|------------|------------------|
| Disk I/O between stages | **Spark** — in-memory RDDs/DAG; 10–100× faster for iterative/ML. |
| Rigid map-reduce only | **Flink** — streaming + batch; event-time; exactly-once. |
| No DAG optimisation | **Tez** — DAG engine on YARN; Hive/Tez, Pig/Tez. |
| Batch only | **Beam** — unified batch/stream API; portable runners. |

---

#### **Exam Answer Checklist**

- ✅ Architecture diagram (Client → RM → AM → Map/Reduce → HDFS)
- ✅ Data flow: Input → Split → Map → Spill → Shuffle → Sort → Reduce → Output
- ✅ Key components: Partitioner, Combiner, RecordReader, InputFormat, OutputFormat
- ✅ Fault tolerance: task re-execution, HDFS replication, speculative execution
- ✅ Word-count example with code sketch
- ✅ Mention Amdahl's Law / parallel efficiency limits

---

### C20. Describe security architecture in cloud computing.

**Cloud security architecture** is a **layered defence-in-depth model** that applies controls at every stratum of the cloud stack — from physical facilities to identity and data — under the shared responsibility model. It is not a single product but an **integrated framework** of policies, technologies, and processes.

---

#### **Layered Security Architecture (Bottom-Up)**

| Layer | Scope | Key Controls | Cloud Services |
|-------|-------|--------------|----------------|
| **1. Physical & Environmental** | Data centres, power, cooling, hardware supply chain | Biometric access, 24/7 surveillance, fire suppression, tamper-evident racks, hardware root of trust (TPM, HSM) | Provider-managed (AWS/Azure/GCP certifications: ISO 27001, SOC 2, FedRAMP) |
| **2. Host / Hypervisor** | Bare-metal, firmware, hypervisor, host OS | Secure boot, measured boot (TPM), hypervisor hardening, live patching, side-channel mitigations (KPTI, retpoline), firmware signing | Nitro (AWS), Azure Host, Google Titan; confidential computing (SEV, TDX) |
| **3. Network & Perimeter** | VPC, subnets, gateways, edge, DNS | **Segmentation** (public/private/protected), SG/NACL, **PrivateLink/Service Endpoints**, TLS 1.2+ everywhere, WAF, DDoS (Shield/Armor/Cloud Armor), DNSSEC, Certificate Manager | VPC, Transit Gateway, Cloud NAT, Global Accelerator, Cloudflare/WAF |
| **4. Identity & Access (IAM)** | Human + workload identities, federation, least privilege | **Zero Trust**: RBAC/ABAC, **MFA (phishing-resistant: FIDO2/WebAuthn)**, JIT/PAM, service accounts, workload identity (IRSA, WIF, GKE Workload Identity), permission boundaries, SCPs, CIEM | IAM, IAM Identity Center, Azure AD/Entra ID, Cloud IAM, Identity-Aware Proxy |
| **5. Compute / Workload** | VMs, containers, serverless, functions | **Image scanning** (Trivy, Inspector), **runtime protection** (Falco, GuardDuty, Defender), admission control (OPA/Kyverno), immutable images, distroless, gVisor/Kata, confidential VMs | EC2, ECS/EKS/Fargate, Lambda, Cloud Run, Cloud Functions, Azure Container Apps |
| **6. Data & Storage** | Object, block, file, database, warehouse | **Encryption**: at rest (CMEK/CSEK, HSM/Cloud KMS), in transit (TLS 1.3, mTLS), in use (Confidential Computing), **tokenisation**, DLP, classification, versioning, immutable backups (Vault Lock, Object Lock) | S3/GCS/Blob, EBS/PD, RDS/Cloud SQL, DynamoDB/Firestore, Redshift/BigQuery |
| **7. Application & API** | Microservices, APIs, event-driven | **API Gateway** (auth, rate limit, schema validation), **WAF** (OWASP, bot), **SAST/DAST/SCA** in CI/CD, SBOM, secret scanning, mutual TLS, service mesh (Istio, Linkerd, App Mesh) | API Gateway, Apigee, Cloud Endpoints, EventBridge, Event Grid, Pub/Sub |
| **8. Security Operations (SecOps)** | Monitoring, detection, response, forensics | **Centralised logging** (CloudTrail, Audit Logs, VPC Flow), **SIEM** (Security Hub, Chronicle, Sentinel), **Threat Intel** (GuardDuty, Defender, Mandiant), **CSPM** (Config Rules, Security Command Center), **SOAR**, MITRE ATT&CK | CloudWatch/Logging, Security Hub, Chronicle, Sentinel, Defender, Wiz, Orca, Prowler |
| **9. Governance, Risk, Compliance** | Policy, audit, compliance, risk | **Policy-as-Code** (OPA, Sentinel, Config Rules, Organization Policies), drift detection, **CSPM/DSPM**, compliance frameworks (CIS, PCI, HIPAA, GDPR, FedRAMP), evidence automation | AWS Config, Azure Policy, Org Policies, Audit Manager, Artifact, Trust Center |

---

#### **Cross-Cutting Principles**

| Principle | Implementation |
|-----------|----------------|
| **Defence in Depth** | No single layer trusted; failure at one layer contained by next. |
| **Least Privilege** | Every identity (human/workload) gets minimum permissions; reviewed quarterly. |
| **Zero Trust** | Never trust, always verify; network location ≠ trust; continuous authentication. |
| **Immutable Infrastructure** | No patching in place; replace via CI/CD; golden images scanned pre-deploy. |
| **Automation First** | Policy-as-code, drift remediation, auto-rotation, self-healing. |
| **Data-Centric Security** | Protect the data, not just the perimeter; encryption follows data. |
| **Shared Fate** | Provider and customer aligned on security outcomes (SLAs, shared dashboards). |

---

#### **Reference Architecture: Enterprise Landing Zone (AWS / Azure / GCP)**

```
┌─────────────────────────────────────────────────────────────┐
│                    ORGANISATION ROOT                        │
│  SCPs (guardrails) │ Audit Logging │ Billing │ Identity    │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  SECURITY     │     │  SHARED       │     │  WORKLOADS    │
│  (Log Archive,│     │  SERVICES     │     │  (Prod, Dev,  │
│   Audit,      │     │  (DNS, Certs, │     │   Stage, Test)│
│   Forensics)  │     │   Connectivity)│     │               │
└───────────────┘     └───────────────┘     └───────────────┘
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  Network      │     │  Identity     │     │  Data         │
│  (Firewall,   │     │  (SSO,        │     │  (KMS,        │
│   Inspection, │     │   PAM,        │     │   DLP,        │
│   DDoS)       │     │   CIEM)       │     │   Backup)     │
└───────────────┘     └───────────────┘     └───────────────┘
```

---

#### **Key Exam Points**

- ✅ **Layered diagram** (Physical → Identity → Data → SecOps → Governance)
- ✅ **Shared Responsibility Matrix** (Provider vs Customer per service model)
- ✅ **Zero Trust** as architectural mandate, not product
- ✅ **Policy-as-Code** for scalable governance (OPA/Sentinel/Config Rules)
- ✅ **CIA Triad** mapped to cloud controls (Confidentiality→Encryption/IAM; Integrity→Immutable logs/Hashing; Availability→Multi-AZ/DR)
- ✅ **Confidential Computing** (SEV/TDX/TEE) as emerging "in-use" encryption layer
- ✅ **MITRE ATT&CK for Cloud** for threat modelling

---

## Group D — Comprehensive Answer / Case / Situation Analysis [2 × 10 = 20]

### D21. Explain virtualization and its role in cloud computing, and also explain the hypervisor types and examples.

> **Note:** This is a **10-mark rewrite** of B13 + B14. The 3-markers test recall; the 10-marker demands **synthesis**: virtualization's economic/architectural role in cloud, a **labelled diagram** of both hypervisor types with real products, and a **judgement on when each is used**.

---

#### **1. Virtualization: Definition & Cloud Role**

**Virtualization** is the abstraction of physical computing resources (CPU, memory, storage, network) into logical/virtual representations, enabling multiple isolated execution environments (Virtual Machines) to run concurrently on a single physical host.

**Role in Cloud Computing — The Economic & Architectural Foundation:**

| Cloud Property | How Virtualization Enables It |
|----------------|-------------------------------|
| **Multi-tenancy** | Isolation boundaries (VMs) allow mutually-untrusted customers to share physical hardware safely. |
| **Elasticity / Rapid Provisioning** | VMs spin up in seconds (vs. hours for physical servers); templates/golden images enable clone-and-run. |
| **Resource Pooling** | Physical resources aggregated into logical pools; scheduler allocates dynamically (DRS, DPM). |
| **Workload Mobility** | Live migration (vMotion, Live Migration) moves running VMs across hosts for load balancing, maintenance, failure avoidance — zero downtime. |
| **Disaster Recovery** | VM encapsulation (disk + config + state as files) enables replication, backup, failover to any compatible host. |
| **Server Consolidation** | 10:1 to 20:1 consolidation ratios typical → massive CapEx/OpEx reduction (power, cooling, rack space). |
| **Heterogeneous OS Support** | Windows, Linux, BSD, custom kernels run side-by-side on same hardware. |
| **Testing / Dev Environments** | Snapshots, clones, linked clones enable instant environment reproduction. |
| **Legacy Application Support** | Old OS/apps run in VMs on modern hardware (no driver rewrites). |
| **Security Boundaries** | Hypervisor-enforced isolation (CPU rings, EPT/NPT, IOMMU) contains breaches within VM. |

**Without virtualization, cloud as we know it (IaaS, PaaS, serverless) would not exist.** Containers (OS-level virtualization) and serverless (microVMs like Firecracker) are evolutionary descendants.

---

#### **2. Hypervisor Types — Labelled Architecture Diagrams**

---

##### **Type 1 — Bare Metal (Native) Hypervisor**

Runs **directly on host hardware**; no host OS. The hypervisor *is* the privileged OS.

```
┌─────────────────────────────────────────────────────────────┐
│                    GUEST VIRTUAL MACHINES                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  VM 1    │  │  VM 2    │  │  VM 3    │  │  VM N    │    │
│  │ (Linux)  │  │ (Windows)│  │ (Linux)  │  │ (BSD)    │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
└───────┼──────────────┼──────────────┼──────────────┼────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│              TYPE 1 HYPERVISOR (VMM)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ CPU Scheduler│  │ Memory Mgmt  │  │ I/O Virtualis│      │
│  │ (vCPU, shares│  │ (Ballooning, │  │ (SR-IOV,     │      │
│  │  reservations)│  │  TPS, swap)  │  │  virtio)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
        │              │              │              │
        ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PHYSICAL HARDWARE                         │
│  [CPU Sockets]  [RAM DIMMs]  [NICs: 10/25/100GbE]  [NVMe/SSD]│
└─────────────────────────────────────────────────────────────┘
```

**Real Products & Use Cases:**

| Hypervisor | Vendor | Ecosystem | Primary Use |
|------------|--------|-----------|-------------|
| **VMware ESXi** | Broadcom | vCenter, vSAN, NSX, Tanzu | Enterprise private/hybrid cloud; largest install base |
| **Microsoft Hyper-V** | Microsoft | SCVMM, Azure Stack HCI, Azure Arc | Windows-centric shops; Azure Stack; nested virtualization |
| **KVM (Kernel-based VM)** | Linux (Red Hat, Ubuntu, SUSE) | OpenStack, oVirt, Proxmox, GCP, AWS Nitro | Open source clouds; Linux-native; highest performance |
| **Xen** | Citrix / Linux Foundation | XenServer, XCP-ng, AWS (legacy) | Paravirtualization pioneer; Citrix VDI; embedded |
| **Nitro Hypervisor** | AWS | Proprietary (Nitro cards) | AWS EC2 — offloads virtualization to dedicated hardware |

**Key Technical Features (Type 1):**
- **Ring 0 / Root Mode** execution; direct hardware access via **EPT (Intel) / NPT (AMD)** for nested paging.
- **IOMMU / VT-d / AMD-Vi** for device assignment (SR-IOV, GPU passthrough).
- **vTPM / vBSP** for measured boot, shielded VMs.
- **Live Migration** (vMotion, Live Migration) — shared-nothing migration via page tracking.

---

##### **Type 2 — Hosted Hypervisor**

Runs **as a user-space application on a host OS** (Windows, macOS, Linux). Host OS manages hardware.

```
┌─────────────────────────────────────────────────────────────┐
│                    GUEST VIRTUAL MACHINES                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  VM 1    │  │  VM 2    │  │  VM 3    │                  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                  │
└───────┼──────────────┼──────────────┼──────────────────────┘
        │              │              │
        ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│              TYPE 2 HYPERVISOR (Application)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ VM Execution │  │ Virtual Devs │  │ UI / API     │      │
│  │ (Binary Trans│  │ (NIC, Disk,  │  │ (Console,    │      │
│  │  lation /    │  │  GPU, USB)   │  │  CLI, REST)  │      │
│  │  HW Assist)  │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
        │              │              │
        ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                    HOST OPERATING SYSTEM                     │
│  [Windows 10/11]  [macOS]  [Ubuntu/Fedora]  [Kernel Module] │
└─────────────────────────────────────────────────────────────┘
        │              │              │
        ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                    PHYSICAL HARDWARE                         │
└─────────────────────────────────────────────────────────────┘
```

**Real Products & Use Cases:**

| Hypervisor | Vendor | Platform | Primary Use |
|------------|--------|----------|-------------|
| **VMware Workstation Pro** | Broadcom | Windows, Linux | Enterprise dev/test; nested ESXi; Kubernetes (vSphere) |
| **VMware Fusion** | Broadcom | macOS | Mac developers running Windows/Linux; Apple Silicon (Rosetta) |
| **Oracle VirtualBox** | Oracle | Windows, macOS, Linux, Solaris | Free, cross-platform; dev/test; Kubernetes (minikube driver) |
| **Parallels Desktop** | Corel | macOS | Best macOS↔Windows integration; Coherence mode; Apple Silicon |
| **QEMU (TCG / KVM)** | Open Source | Linux, macOS, Windows | Emulation (TCG) + Acceleration (KVM); embedded, kernel dev |

**Key Technical Features (Type 2):**
- **Binary translation + hardware assist (VT-x/AMD-V)** for privileged instruction trapping.
- **Host OS manages devices** → hypervisor calls host APIs (higher latency, double context switch).
- **Ease of install** — no dedicated host; runs alongside user apps.
- **Not for production** — larger TCB (host OS + hypervisor), lower performance, no HA/DRM features.

---

#### **3. When to Use Each — Judgement**

| Scenario | Recommended | Rationale |
|----------|-------------|-----------|
| **Production cloud (IaaS/PaaS)** | **Type 1** (ESXi, KVM, Hyper-V, Nitro) | Performance, security, HA, live migration, DRS, enterprise management. |
| **Enterprise private/hybrid cloud** | **Type 1** (vSphere, Hyper-V, OpenStack/KVM) | Multi-tenancy, compliance, integration with existing ops tools. |
| **Edge / Telecom (NFV)** | **Type 1** (KVM, OpenStack, OpenShift) | Low latency, SR-IOV, DPDK, real-time kernels; bare-metal performance. |
| **Developer laptop (Windows/Linux)** | **Type 2** (Workstation, VirtualBox, QEMU/KVM) | Coexistence with host apps; nested virt for learning Kubernetes. |
| **Developer Mac (Apple Silicon)** | **Type 2** (Parallels, Fusion, UTM) | Only option on M-series; Rosetta + HV.framework for ARM64 guests. |
| **Cross-platform testing (free)** | **Type 2** (VirtualBox, Vagrant) | Zero cost; runs everywhere; good enough for functional tests. |
| **Nested virtualization (lab)** | **Type 1 inside Type 2** (ESXi in Workstation) | Learning vSphere, OpenStack without spare hardware. |
| **High-performance GPU/AI workloads** | **Type 1** (ESXi + vGPU/MIG, KVM + MIG) | GPU virtualization (NVIDIA GRID, MIG) requires Type 1 direct device assignment. |

**Emerging Blur:** **MicroVMs** (Firecracker, crosvm, Cloud Hypervisor) — minimal Type 1 VMMs written in Rust, designed for **serverless** (Lambda, Cloud Run, Fargate) and **container isolation** (Kata Containers, gVisor). They boot in <100ms, have minimal device model, and are the future of **function-as-a-service** and **secure multi-tenancy**.

---

#### **Exam Answer Checklist for D21 (10 Marks)**

- ✅ **Definition** of virtualization (1 line)
- ✅ **Role in cloud** — 5+ bullet points linking to cloud properties (multi-tenancy, elasticity, mobility, consolidation, DR, legacy support)
- ✅ **Type 1 diagram** with labels (Guests → Hypervisor components → Hardware) + 3 real products (ESXi, KVM, Hyper-V/Nitro)
- ✅ **Type 2 diagram** with labels (Guests → Hypervisor app → Host OS → Hardware) + 3 real products (Workstation, VirtualBox, Parallels)
- ✅ **Comparison table** (Performance, Security, Management, Use Case)
- ✅ **Judgement** — when to use each (production vs dev, edge vs laptop, GPU vs CPU)
- ✅ **Forward-looking** — MicroVMs (Firecracker) for serverless/secure containers

---

### D22. Explain risks and mitigation strategies in cloud computing security.

> **Note:** This is a **risk register style** answer — identify risks, assess impact/likelihood, map controls, show residual risk. Structure: **Risk → Inherent Risk → Controls (Preventive/Detective/Corrective) → Residual Risk**.

---

#### **Cloud Security Risk Register (Top 10 Risks)**

| # | Risk | Description | Inherent Risk | Key Controls (Preventive / Detective / Corrective) | Residual Risk |
|---|------|-------------|---------------|---------------------------------------------------|---------------|
| **1** | **Misconfiguration** | Public S3 buckets, open SGs, excessive IAM, unencrypted storage. | **Critical** (CSA #1 threat; 99% of breaches per Gartner) | **P:** IaC scanning (Checkov, tfsec), CSPM (Config Rules, Security Hub), preventative guardrails (SCPs, Org Policies), drift detection.<br>**D:** Continuous compliance (Prowler, Wiz), alert on public resources.<br>**C:** Auto-remediation (Lambda/EventBridge), forensic snapshots. | **Medium** (automation reduces but human error persists) |
| **2** | **Identity & Credential Compromise** | Phished keys, leaked GitHub tokens, IMDSv1 abuse, over-privileged roles. | **Critical** (80%+ breaches involve credentials per Verizon DBIR) | **P:** Phishing-resistant MFA (FIDO2), **no long-lived keys** (STS, IRSA, WIF, Workload Identity), least privilege, permission boundaries, SCPs.<br>**D:** GuardDuty/Defender credential exfiltration alerts, CloudTrail anomaly detection.<br>**C:** Auto-revoke compromised keys, session invalidation, IR playbook. | **Medium** (MFA bypass evolving; supply chain risk) |
| **3** | **Data Breach / Exfiltration** | Unencrypted data, misclassified PII, insider theft, snapshot sharing. | **Critical** (regulatory fines, reputational) | **P:** Encryption everywhere (CMEK/CSEK, HSM), DLP (Macie, DLP API), tokenisation, data classification tags, PrivateLink.<br>**D:** DSPM (data posture), access anomalies (GuardDuty), VPC flow log analysis.<br>**C:** Immutable backups (Object Lock), key revocation, breach notification automation. | **Low-Medium** (encryption renders data useless without keys) |
| **4** | **Insecure Interfaces / APIs** | Exposed management APIs, unauthenticated endpoints, rate limit bypass, GraphQL depth attacks. | **High** (OWASP API Top 10) | **P:** API Gateway (auth, schema validation, rate limit, WAF), mutual TLS, PrivateLink, deprecate legacy APIs.<br>**D:** API access logging, anomaly detection (burst, geo-impossible).<br>**C:** Emergency API key rotation, gateway shutdown toggle. | **Medium** (new API surfaces constantly added) |
| **5** | **Account / Service Hijacking** | Session hijack, token replay, cookie theft, SAML/OIDC misconfig. | **High** | **P:** Short-lived tokens (STS 1hr), phishing-resistant MFA, Conditional Access, token binding, workload identity.<br>**D:** Impossible travel alerts, token reuse detection, CASB.<br>**C:** Session revocation, forced re-auth, compromised account playbook. | **Medium** |
| **6** | **Malicious Insider / Privilege Abuse** | Admin overreach, data theft, sabotage, shadow admin creation. | **High** (trusted access) | **P:** Separation of duties, JIT/PAM (CyberArk, AWS IAM Access Analyzer), break-glass with approval, no standalone admin.<br>**D:** UEBA (User Entity Behaviour Analytics), privileged action logging (CloudTrail), data access monitoring.<br>**C:** Immediate suspension, forensic preservation, legal hold. | **Medium** (hard to prevent; detect & respond) |
| **7** | **Shared Technology Vulnerabilities** | Hypervisor escape (VENOM), CPU side-channels (Spectre/Meltdown), container escape (CVE-2019-5736). | **High** (affects all tenants) | **P:** Provider patching (zero-day response), confidential computing (SEV/TDX), microVMs (Firecracker), host patching automation.<br>**D:** Threat intel feeds, CVE scanning, runtime anomaly (Falco).<br>**C:** Emergency maintenance windows, workload migration, provider coordination. | **Low** (provider responsibility; customer mitigates via diversity) |
| **8** | **Data Loss / Unavailability** | Ransomware (encrypt S3/EBS), accidental deletion, region outage, provider failure. | **High** | **P:** Immutable backups (Object Lock, Vault Lock), cross-region replication, versioning, soft delete, DR strategy (Pilot Light/Warm/Hot).<br>**D:** Backup health checks, restore drills (quarterly), RPO/RTO monitoring.<br>**C:** Point-in-time recovery, failover automation, chaos engineering (FIS). | **Low** (if DR tested) |
| **9** | **Insufficient Due Diligence / Vendor Lock-in** | Proprietary APIs, data gravity, egress fees, no exit strategy. | **Medium-High** (strategic) | **P:** Multi-cloud architecture (K8s, Terraform, Anthos), open standards (OCI, CNCF), data portability (Parquet, Avro), contractual exit clauses.<br>**D:** Cost anomaly (egress spikes), dependency mapping.<br>**C:** Migration playbooks, parallel run capability. | **Medium** (architectural; hard to retrofit) |
| **10** | **Compliance / Legal Violations** | Data residency breach, GDPR Schrems II, sectoral regs (HIPAA, PCI), sovereign access (CLOUD Act). | **High** (fines, licence loss) | **P:** Data residency controls (region locking, Resource Location Restriction), DPA/BAA, CMEK with sovereign KMS, Assured Workloads.<br>**D:** Compliance dashboards (Security Hub, Audit Manager), continuous audit evidence.<br>**C:** Automated evidence export, legal hold, breach notification (72h GDPR). | **Low-Medium** (automation + legal review) |

---

#### **Risk Treatment Strategy Summary**

| Strategy | Risks Addressed | Cloud-Native Implementation |
|----------|-----------------|----------------------------|
| **Avoid** | Vendor lock-in (9), Unnecessary data collection | Multi-cloud, data minimisation, open standards |
| **Mitigate (Prevent)** | Misconfiguration (1), Credential compromise (2), Insecure APIs (4) | Policy-as-Code (OPA/Sentinel/Config Rules), Preventative Guardrails (SCPs/Org Policies), Zero Trust (MFA, Workload Identity, mTLS) |
| **Mitigate (Detect)** | All — especially Insider (6), Hijacking (5), Exfiltration (3) | Centralised Logging → SIEM → UEBA/Threat Intel → SOAR |
| **Mitigate (Correct)** | Breach (3), Ransomware (8), Hijacking (5) | Immutable Backups, Auto-Remediation, IR Playbooks, Forensic Readiness |
| **Transfer** | Provider-layer vulns (7), Regional outage (8) | Cyber Insurance, Provider SLAs, Multi-Region DR |
| **Accept** | Residual risk after controls | Risk appetite statement; board reporting |

---

#### **Cloud-Specific Risk Management Framework (NIST 800-53 / CSA CCM / ISO 27017)**

1. **Frame** — Define risk appetite (board), scope (accounts, regions, services), roles (CISO, Cloud Architect, SecOps).
2. **Assess** — Continuous asset inventory (CloudQuery, Steampipe), threat modelling (MITRE ATT&CK for Cloud), vulnerability scanning (Inspector, Defender, Trivy), compliance checks (CIS Benchmarks, PCI DSS).
3. **Respond** — Prioritise by **CVSS × Exposure × Business Criticality**; apply controls via **Policy-as-Code** (preventative) and **SIEM/SOAR** (detective/corrective).
4. **Monitor** — **Continuous compliance** (Config Rules, Security Hub, Prowler), **drift detection** (Terraform drift, Cloud Custodian), **KRI dashboard** (open buckets, unencrypted volumes, MFA gaps, patch lag).
5. **Report** — Monthly risk dashboard to CISO; quarterly to board; annual third-party audit (SOC 2 Type II, ISO 27001).

---

#### **Key Exam Points for D22 (10 Marks)**

- ✅ **Risk Register format** (Risk → Inherent → Controls P/D/C → Residual)
- ✅ **Top 5–7 risks** with cloud-specific examples (misconfig, credentials, data breach, API, insider)
- ✅ **P/D/C controls** mapped to each risk with **cloud-native tools** (GuardDuty, Config Rules, IRSA, Object Lock, SOAR)
- ✅ **Shared Responsibility** mapped to risk ownership (Provider: 7; Customer: 1–6, 8–10; Shared: 3, 4)
- ✅ **Residual risk assessment** — honest about what remains (credential phishing, zero-day, insider)
- ✅ **Frameworks** — NIST 800-53, CSA CCM, ISO 27017, MITRE ATT&CK for Cloud
- ✅ **Continuous / Automation** — Policy-as-Code, CSPM, SOAR, drift detection
- ✅ **Emerging** — Confidential Computing, MicroVMs, Zero Trust, DSPM

---

*End of Cloud Computing Model Question Answers*