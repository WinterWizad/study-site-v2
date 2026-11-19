# IT 277 — Official Model Question (TU / FOM 2026)

> **Verbatim.** Issued by Tribhuvan University, Faculty of Management, Office of the Dean, in the 2026 model-question set for BIM 8th semester. **Full Marks 60 · Pass Marks 30 · Time 3 Hours.**
>
> - Source PDF: `fomecd.edu.np/noticeattachments/Model Question for BITM 1st and BBA BIM and BBM 8th Semester Final.pdf`
> - Local copy: `_raw/pdf/noticeattachments-model-20question-...final-pdf.pdf`
> - Wording reproduced as printed. Nothing paraphrased.

> ⚠ **This is the only official artifact that exists for this subject.** There is no board paper: BIM 8th semester under the new syllabus was first examined in 2026, and IT 277 is an elective that no public source has posted a paper for. Everything previously written in this workspace about "zero published questions" applies to *past papers* only — a model question now exists, and it is a much better guide than nothing.

---

## The paper

**TRIBHUVAN UNIVERSITY — FACULTY OF MANAGEMENT — Office of the Dean**
**Model Question 2026**
**BIM / Eighth Semester / IT 277: Cloud Computing**
Full Marks: 60 · Pass Marks: 30 · Time: 3 Hours

Candidates are required to give their answers in their own words as far as possible.

### Group "A" — Brief answer questions [10 × 1 = 10]

1. Define Cloud Computing.
2. What do you mean by SaaS?
3. Define private cloud.
4. What is Cloud Storage?
5. Define SOA.
6. What is Virtualization?
7. What do you mean by Virtual Machine Security?
8. What is parallel computing?
9. What do you mean by Security Monitoring?
10. Define AppEngine.

### Group "B" — Short answer questions (attempt any FIVE) [5 × 3 = 15]

11. Compare PaaS with IaaS. What do you mean by public cloud?
12. Describe advantages and disadvantages of cloud computing.
13. Explain the different types of Hypervisor.
14. Discuss types of virtualization with example.
15. Describe the parallel efficiency of MapReduce.
16. What are common data security issues in cloud computing?

### Group "C" — Long answer questions (attempt any THREE) [3 × 5 = 15]

17. Explain the Cloud services requirements with example.
18. Explain the concept of cloud security.
19. Describe the working of MapReduce architecture.
20. Describe security architecture in cloud computing.

### Group "D" — Comprehensive answer / case / situation analysis [2 × 10 = 20]

21. Explain virtualization and its role in cloud computing, and also explain the hypervisor types and examples.
22. Explain risks and mitigation strategies in cloud computing security.

---

## What each question demands, and where the answer will live

| Q | Asks for | Unit | Note |
|---|---|---|---|
| A1 | cloud computing definition (NIST-style) | 1 | definition plus the five essential characteristics |
| A2 | SaaS definition | 2 | service model, with an everyday example |
| A3 | private cloud definition | 2 | deployment model, single-tenant |
| A4 | cloud storage definition | 1 | syllabus Unit 1 bullet |
| A5 | SOA definition | 2 | *Linthicum* is a syllabus reading for exactly this |
| A6 | virtualization definition | 4 | one line: abstraction of physical resources |
| A7 | VM security | 6 | threat to the guest/hypervisor boundary |
| A8 | parallel computing definition | 5 | Unit 5's opening bullet |
| A9 | security monitoring | 6 | logging, IDS/IPS, SIEM |
| A10 | AppEngine | 7 | Google's PaaS |
| B11 | PaaS vs IaaS **+** public cloud | 2 | two answers in one question — split the marks |
| B12 | advantages **and** disadvantages | 1 | balanced list, not a sales pitch |
| B13 | hypervisor types (1 vs 2) | 4 | diagram expected |
| B14 | types of virtualization | 4 | server, storage, network, desktop, application |
| B15 | parallel efficiency of MapReduce | 5 | speedup, Amdahl's law, stragglers |
| B16 | data security issues | 6 | confidentiality, integrity, availability, multi-tenancy |
| C17 | cloud service requirements | 2 | what a service must satisfy — availability, elasticity, SLA |
| C18 | cloud security concept | 6 | CIA + shared responsibility |
| C19 | MapReduce architecture + working | 5 | map → shuffle → reduce, with the word-count diagram |
| C20 | security architecture in cloud | 6 | layered: identity, network, data, VM, governance |
| D21 | virtualization's role + hypervisor types | 4 | **a 10-mark rewrite of B13/B14** — see the warning below |
| D22 | risks + mitigation | 6 | risk register → control → residual risk |

### Marks by unit if every question is attempted

| Unit | Topic | Hours | Questions | Marks |
|---|---|---|---|---|
| 1 | Introduction to Cloud Computing | 5 | A1, A4, B12 | 5 |
| 2 | Cloud Architecture (IaaS/PaaS/SaaS, deployment, SOA) | 5 | A2, A3, A5, B11, C17 | 11 |
| 3 | Cloud Applications (migration, licensing, cost, SLA) | 5 | — | **0** |
| 4 | Virtualization Technology | 8 | A6, B13, B14, D21 | **17** |
| 5 | MapReduce and Applications | 7 | A8, B15, C19 | 9 |
| 6 | Cloud Security | 6 | A7, A9, B16, C18, C20, D22 | **25** |
| 7 | Cloud Platforms and Applications | 12 | A10 | 1 |
| | | 48 | | **68 attempted → 60 counted** |

Three things fall out of that table, and they are the study plan for this subject:

1. **Security is the case.** 25 of 60 marks — a quarter of the paper — including one full Group D case. Unit 6 is 6 lecture hours. Marks and hours are nearly inverted for this unit.
2. **Virtualization is the second engine.** 17 marks, and D21 asks about it at 10 marks, which means it appears in both Group B *and* Group D. It cannot be learned as prose.
3. **Unit 3 carries nothing here, and Unit 7 carries 1 mark despite being the largest unit (12 LHs).** Do not read that as "skip them" — a model question is one sample, and Unit 7 (AppEngine, Azure, Aneka, web services) is where a different setter would put a 5-marker. Read it as: **Unit 3 is lowest priority, Unit 7 is low-yield but must be nameable**, and Units 6 → 4 → 2 → 5 in that order are where the marks are.

## Group D shape — and the trap it sets

Like IT 249, the model paper gives **2 × 10 = 20** with no choice, while a board paper may use **1 × 20**. Prepare for both.

⚠ **D21 overlaps Group B badly.** "Explain virtualization, its role, hypervisor types and examples" is essentially B13 + B14 at triple length. If you write the B15/B13 answer and then repeat it for D21, you have written ~6 marks of content twice in a 3-hour paper. The 10-mark answer must add what the 3-markers cannot hold: the **role** in cloud economics (multi-tenancy, elasticity, isolation), a labelled diagram of Type 1 **and** Type 2 with real products, and a closing judgement on when each is used.

## How to use this file — the acceptance test

1. **Per unit, before calling it finished:** close the notes, read that unit's rows above, and answer each one out loud. A mapped question that cannot be answered from that unit's notes alone means the unit is **not** done.
2. **Never borrow across units to answer a mapped question.** If D21 needs the cloud-economics framing that lives in Unit 1, then Unit 4 must restate it in one line.
3. **Diagrams are part of the answer.** A written-as-prose answer to B13, C19 or D21 loses the marks the diagram carries.
4. **Re-run the whole table as a mock** once all seven units exist: 3 hours, no notes, all of Group A, one full Group B/C selection, both Group D cases.
5. Anything the notes add beyond this table is **insurance**, not waste — but it is labelled, and it is cut first if time runs short.

> ⚠ A model question is a **shape**, not a leak. The safest assumption is that a board setter keeps the structure, keeps the weight on security and virtualization, and changes the examples.
