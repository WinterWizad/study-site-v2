# IT 277 - Cloud Computing (Syllabus)

**Source:** TU, Faculty of Management, Office of the Dean - *BIM 8th Semester Syllabus 2025*.
**Verified against the PDF itself** (not a blog transcription): `_raw/text/pdf/syllabuses-bim-...pdf`. Units, hours and readings below match the Dean's Office document exactly. Official PDF: `fomecd.edu.np/syllabuses/BIM 8th Semester Syllabus 2025.pdf`

| Field | Value |
|---|---|
| Course title | Cloud Computing |
| Course code | IT 277 |
| Semester | 8 |
| Nature | Elective |
| Full marks | **60** (model question) / 30 pass |
| Credit hours | 3 Cr. |
| Curriculum | BIM, effective from 2021 |
| Total lecture hours | 48 |

## Course objectives

The main objectives of this course are to provide theoretical as well as practical knowledge of cloud computing, including designing, implementing, and managing cloud computing.

## Course description

This course provides both theoretical and practical knowledge of cloud computing. It covers key concepts and practices related to designing, implementing, and managing cloud-based systems. Students will learn about various cloud service models, deployment strategies, and management techniques essential for building efficient and scalable cloud solutions.

## Units

### Unit 1 - Introduction to Cloud Computing — 5 LHs
- Evolution of Cloud Computing
- Characteristics of Cloud Computing (NIST five essential characteristics)
- Types of Cloud and its Cloud services
- Benefits and challenges of cloud computing
- Applications of Cloud Computing
- Cloud Storage
- Cloud services requirements
- Cloud and dynamic infrastructure
- Cloud adoption

### Unit 2 - Cloud Computing Architecture — 5 LHs
- Platform as a Service (PaaS)
- Software as a Service (SaaS)
- Infrastructure as a Service (IaaS)
- Public clouds, Private clouds, Community cloud, Hybrid clouds
- Cloud design and implementation using SOA
- Security, trust, and privacy

### Unit 3 - Cloud Applications — 5 LHs
- Migrating to the cloud
- Software licenses
- Cloud cost model
- Service levels for cloud applications — security
- Web applications design

### Unit 4 - Cloud Virtualization Technology — 8 LHs
- Introduction to Virtualization
- Different types of Virtualization
- Implementation Levels of Virtualization Structures
- Benefits of virtualization
- Server virtualization
- Virtualization software
- Types of Hypervisor (Type 1 / Type 2)
- Load balancing
- Infrastructure requirement for virtualization

### Unit 5 - MapReduce and Applications — 7 LHs
- Parallel computing
- MapReduce model
- MapReduce applications
- Parallel efficiency of MapReduce
- Enterprise batch processing using MapReduce

### Unit 6 - Cloud Security — 6 LHs
- Cloud Security issues, challenges, and Risks
- Software-as-a-Service Security
- Security Monitoring
- Security Architecture Design
- Data and application Security
- Virtual Machine Security
- Legal issues and Aspects
- Multi-tenancy issues

### Unit 7 - Cloud Platforms and Applications — 12 LHs
- Web services
- AppEngine
- Azure Platform
- Aneka
- Open challenges
- Scientific applications
- Business and Consumer applications

## Suggested readings

- Saurabh, K. (2017). *Cloud computing* (4th ed.). Wiley.
- Buyya, R., Vecchiola, C., & Selvi, S. T. (2013). *Mastering cloud computing: Foundations and applications programming*. Morgan Kaufmann.
- Linthicum, D. S. (n.d.). *Cloud computing and SOA convergence in your enterprise*.
- Sosinsky, B. (n.d.). *Cloud computing bible*.
- Saurabh, K. (2011). *Cloud computing: Insights into new era infrastructure*. Wiley India.

## How the 48 hours should be read

| Unit | Hours | Model question marks | Exam weight |
|---|---|---|---|
| 1 Introduction | 5 | 5 | 🟡 low — but definitions are free marks |
| 2 Architecture (IaaS/PaaS/SaaS, deployment, SOA) | 5 | 11 | 🔴 high — service models, deployment models, SOA |
| 3 Cloud Applications | 5 | **0** in model question | 🟢 lowest priority — but a board setter could put a 5-marker here |
| 4 Virtualization Technology | 8 | **17** | 🔴 **highest yield per hour** — hypervisors, virtualization types, D21 (10 marks) |
| 5 MapReduce and Applications | 7 | 9 | 🔴 high — MapReduce architecture, parallel efficiency |
| 6 Cloud Security | 6 | **25** | 🔴 **owns the case** — 25/60 marks including one Group D case |
| 7 Cloud Platforms and Applications | 12 | 1 | 🟢 low yield — AppEngine, Azure, Aneka, web services; know names and one-line descriptions |

**Three things the model question makes clear:**

1. **Security is the case.** 25 of 60 marks — a quarter of the paper — including one full Group D case. Unit 6 is 6 lecture hours. Marks and hours are nearly inverted for this unit.
2. **Virtualization is the second engine.** 17 marks, and D21 asks about it at 10 marks, which means it appears in both Group B and Group D. It cannot be learned as prose — you need a labelled diagram of Type 1 and Type 2 hypervisors with real products.
3. **Unit 3 carries nothing in the model question, and Unit 7 carries 1 mark despite being the largest unit (12 LHs).** Do not read as "skip" — a model question is one sample. Unit 3 (migration, licensing, cost, SLA, web app design) is where a different setter would put a 5-marker. Unit 7 is low-yield but must be nameable.

**Group D shape — prepare for both:** the model paper gives **2 × 10 = 20** with no choice; a board paper may use **1 × 20**. Rehearse both shapes.

**Critical overlap:** D21 ("Explain virtualization, its role, hypervisor types and examples") overlaps B13 and B14. The 10-mark answer must add what the 3-markers cannot hold: the **role in cloud economics** (multi-tenancy, elasticity, isolation), a **labelled diagram of Type 1 and Type 2 with real products**, and a **closing judgement on when each is used**.