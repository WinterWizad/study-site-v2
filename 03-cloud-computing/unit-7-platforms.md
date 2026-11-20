# Unit 7 — Cloud Platforms and Applications

| | |
|---|---|
| **Lecture hours** | 12 |
| **Marks in model question** | 1 — one 1-marker (A10 AppEngine definition) |
| **Difficulty** | ★☆☆☆☆ — **name-drop only**. 12 hours for 1 mark. Know the four platforms and one-line descriptions. |
| **Exam yield** | 🟢 lowest — but a board setter could put a 5-marker here. Read once, be ready to name and describe. |
| **Prerequisite** | Units 1–2 (service models, deployment models) |
| **Syllabus** | Web services · AppEngine · Azure Platform · Aneka · Open challenges · Scientific applications · Business and Consumer applications |

> **Read this first:** This unit is **12 hours for 1 mark** in the model question. The only model question is A10: "Define AppEngine." That's it. But a board setter could easily put a 5-marker on "Compare AppEngine, Azure, and Aneka" or "Describe web services in cloud" or "Explain open challenges in cloud platforms." Read it once, know the four platforms + web services + challenges, and you're insured.

---

## Coverage Map

```
7.1 Web Services
├── SOAP vs REST vs gRPC vs GraphQL: protocol, data format, use case
├── Key standards: WSDL, OpenAPI/Swagger, UDDI, WS-Security/WS-*
└── SOAP = enterprise/XML; REST = web/mobile/JSON

7.2 AppEngine (A10) — Google's PaaS 🎯 1-mark
├── Fully managed PaaS, code-only deploy
├── Two environments: Standard (instance-based) + Flexible (Docker)
├── Languages: Python, Java, Node.js, Go, PHP, Ruby, .NET, custom runtimes
├── Services: Datastore, Cloud SQL, Cloud Storage, Memcache, Task Queues, Pub/Sub
└── Deployment: gcloud app deploy — versioned, traffic splitting, rollback

7.3 Azure Platform — Microsoft's Cloud
├── IaaS + PaaS + SaaS, deep Microsoft ecosystem integration
├── Key PaaS: App Service, Functions, Container Apps, AKS, Azure SQL, Cosmos DB
├── Hybrid/Enterprise: Azure Arc, Azure Stack, Entra ID, Microsoft 365 integration
└── Dev toolchain: Visual Studio, GitHub, DevOps

7.4 Aneka — Managed PaaS for .NET
├── .NET-specific PaaS, Manjrasoft, commercial licence
├── Programming models: Task, Thread, MapReduce, Grid, Parameter Sweep
├── Deployment: Windows Server, Azure, AWS, private cloud
└── Visual Studio plugin integration

7.5 Open Challenges in Cloud Platforms
├── Vendor lock-in, multi-cloud complexity, security/compliance, cost management
├── Skills gap, performance variability, legacy migration, governance, sustainability
└── 9 challenges listed

7.6 Scientific Applications
├── Genomics/bioinformatics, climate/weather, physics/particle, astronomy, AI/ML training
└── Cloud fit: burst to cloud, HPC on cloud, petabyte processing, distributed training

7.7 Business and Consumer Applications
├── SaaS productivity, e-commerce, streaming/media, FinTech/payments, IoT/edge
└── Cloud value: elastic scaling, global CDN, compliance, personalisation, device management
```

---

## 7.1 Web Services

> **Web services are standardised interfaces that allow applications to communicate over the network — typically using HTTP/HTTPS, with SOAP (XML) or REST (JSON) as the message format.**

| Type | Protocol | Data format | Use case |
|---|---|---|---|
| **SOAP** | HTTP, SMTP, others | XML (envelope, header, body, fault) | enterprise, strict contracts, WS-* standards |
| **REST** | HTTP | JSON (mostly), XML, plain text | web/mobile APIs, microservices, public APIs |
| **gRPC** | HTTP/2 | Protobuf (binary) | high-performance internal services, polyglot |
| **GraphQL** | HTTP | JSON | flexible queries, frontend-driven APIs |

### Key Standards

| Standard | Purpose |
|---|---|
| **WSDL** | Web Services Description Language — describes SOAP service (operations, messages, bindings) |
| **OpenAPI / Swagger** | describes REST API (endpoints, parameters, responses, auth) |
| **UDDI** | Universal Description, Discovery, Integration — registry for SOAP services (legacy) |
| **WS-Security / WS-*** | SOAP extensions for security, reliability, transactions |

---

## 7.2 AppEngine (A10) — Google's PaaS 🎯 1-mark

> **AppEngine is Google Cloud's fully managed Platform-as-a-Service (PaaS) — developers deploy code (Python, Java, Node.js, Go, PHP, Ruby, .NET) and Google manages the infrastructure: servers, scaling, load balancing, patching, and availability.**

### Key Characteristics

| Feature | Detail |
|---|---|
| **Abstraction** | code-only; no VMs, no containers to manage (unless using Flexible Environment) |
| **Scaling** | automatic: **Standard Environment** (instance-based, milliseconds), **Flexible Environment** (container-based, Docker) |
| **Languages** | Python, Java, Node.js, Go, PHP, Ruby, .NET Core, custom runtimes (Docker) |
| **Services** | Datastore (NoSQL), Cloud SQL, Cloud Storage, Memcache, Task Queues, Cloud Scheduler, Pub/Sub |
| **Deployment** | `gcloud app deploy` — versioned, traffic splitting, rollback |
| **Pricing** | pay-per-use (instance hours, storage, network); free tier available |

---

### A10 · "Define AppEngine." [1] 🎯 1-mark

> AppEngine is Google Cloud's fully managed PaaS — developers deploy code (Python, Java, Node.js, Go, PHP, Ruby, .NET) and Google manages infrastructure: servers, auto-scaling, load balancing, patching, availability. Two environments: **Standard** (instance-based, milliseconds scale) and **Flexible** (Docker containers). Services: Datastore, Cloud SQL, Cloud Storage, Pub/Sub.

*(54 words. Definition + managed services + two environments + key services.)*

---

## 7.3 Azure Platform — Microsoft's Cloud

> **Microsoft Azure is a comprehensive cloud platform offering IaaS, PaaS, and SaaS — with deep integration into the Microsoft ecosystem (Windows Server, SQL Server, Active Directory, Office 365, Dynamics, Visual Studio, GitHub).**

### Key PaaS Services (the AppEngine equivalents)

| Service | What it is | AppEngine equivalent |
|---|---|---|
| **Azure App Service** | fully managed web app hosting (Windows/Linux, containers) | AppEngine Standard/Flexible |
| **Azure Functions** | serverless event-driven compute (FaaS) | Cloud Functions / Cloud Run |
| **Azure Container Apps** | serverless containers, Dapr, KEDA | Cloud Run |
| **Azure Kubernetes Service (AKS)** | managed Kubernetes | GKE |
| **Azure SQL / Cosmos DB** | managed relational / NoSQL | Cloud SQL / Datastore / Firestore |
| **Azure Service Fabric** | microservices platform (stateful, actors) | — |

### Hybrid / Enterprise Differentiators

| Feature | Why it matters |
|---|---|
| **Azure Arc** | manage on-prem, multi-cloud, edge from Azure control plane |
| **Azure Stack** | run Azure services on-premises (hardware partners) |
| **Entra ID (formerly Azure AD)** | identity as a service; hybrid AD join, conditional access |
| **Microsoft 365 integration** | Teams, SharePoint, Exchange, Power Platform — single identity |
| **Visual Studio / GitHub / DevOps** | end-to-end developer toolchain |

---

## 7.4 Aneka — Managed PaaS for .NET

> **Aneka is a Platform-as-a-Service framework for .NET — developed by Manjrasoft, it provides a runtime environment and SDK for building, deploying, and managing distributed applications on cloud infrastructure (public, private, hybrid).**

### Key Characteristics

| Feature | Detail |
|---|---|
| **Focus** | .NET applications; task/thread/grid programming models |
| **Deployment** | on Windows Server, Azure, AWS, private cloud |
| **Programming models** | Task, Thread, MapReduce, Grid, Parameter Sweep |
| **Services** | scheduling, load balancing, monitoring, persistence, security |
| **Integration** | Visual Studio plugin, Azure, AWS, VMware |
| **Licensing** | commercial (free trial); not open source |

**Exam note:** Aneka is the *only* .NET-specific PaaS in the syllabus. Know: ".NET PaaS, task/thread/MapReduce models, runs on Windows/Azure/AWS, Manjrasoft, commercial."

---

## 7.5 Open Challenges in Cloud Platforms

| Challenge | Description |
|---|---|
| **Vendor lock-in** | proprietary APIs, data egress fees, non-portable services |
| **Multi-cloud complexity** | different APIs, identities, networking, billing, skills |
| **Security & compliance** | shared responsibility confusion, misconfiguration, data sovereignty |
| **Cost management** | unpredictable billing, idle resources, lack of visibility |
| **Skills gap** | cloud-native skills (Kubernetes, serverless, IaC) scarce |
| **Performance variability** | noisy neighbour, cold starts, network latency |
| **Legacy migration** | refactoring cost, mainframe/COBOL, data gravity |
| **Governance** | policy enforcement, tagging, drift detection, FinOps |
| **Sustainability** | carbon footprint, green regions, efficiency metrics |

---

## 7.6 Scientific Applications

| Application | Cloud fit |
|---|---|
| **Genomics / bioinformatics** | large-scale sequence alignment (BWA, GATK), variant calling — burst to cloud |
| **Climate / weather modelling** | WRF, NEMO — HPC on cloud (HPC clusters, MPI, InfiniBand) |
| **Physics / particle physics** | LHC data processing (ATLAS, CMS) — HTCondor, PanDA on cloud |
| **Astronomy** | SKA, LSST — petabyte image processing, radio interferometry |
| **AI/ML training** | distributed training (PyTorch DDP, Horovod, DeepSpeed) on GPU clusters |

---

## 7.7 Business and Consumer Applications

| Category | Examples | Cloud value |
|---|---|---|
| **SaaS productivity** | Microsoft 365, Google Workspace, Salesforce, ServiceNow, Slack, Zoom | zero ops, auto-updates, collaboration |
| **E-commerce** | Shopify, Magento Cloud, BigCommerce, custom on Kubernetes | elastic scaling (Black Friday), global CDN, payments |
| **Streaming / media** | Netflix, Spotify, YouTube, Twitch — CDN, transcoding, recommendation | global delivery, elastic encode, personalisation |
| **FinTech / payments** | Stripe, Adyen, Plaid, banking APIs — serverless, event-driven | compliance (PCI), low latency, global |
| **IoT / edge** | AWS IoT, Azure IoT Hub, GCP IoT Core — device management, rules, analytics | scale to millions, offline sync, edge compute |

---

## 7.8 Traps

| Trap | Why it costs marks | Fix |
|---|---|---|
| Writing "AppEngine = Google's cloud" | vague; it's a specific PaaS | "fully managed PaaS, code-only, Google manages infra" |
| Missing the two environments (Standard vs Flexible) | it's a key differentiator | Standard = instance-based; Flexible = Docker containers |
| Confusing Aneka with AppEngine/Azure | Aneka is .NET-specific, commercial, Manjrasoft | ".NET PaaS, Task/Thread/MapReduce models, runs on Windows/Azure/AWS" |
| Listing web services without SOAP/REST distinction | syllabus says "web services" | SOAP (XML, enterprise) vs REST (JSON, web/mobile) |
| Missing open challenges in a 5-marker | syllabus bullet: "open challenges" | 9 challenges listed above |

---

## 7.9 Self-Test (Answers Collapsed)

1. Define AppEngine in one sentence with key services. *(1 mark — A10)*
2. What are the two AppEngine environments? *(1 mark)*
3. Name the Azure PaaS equivalent of AppEngine. *(1 mark)*
4. What is Aneka, and what is its focus? *(2 marks)*
5. SOAP vs REST: protocol, data format, use case. *(3 marks)*
6. Name five open challenges in cloud platforms. *(3 marks)*
7. Give one scientific application and its cloud fit. *(2 marks)*
8. Give one business application category and its cloud value. *(2 marks)*

<details>
<summary>Answers</summary>

1. AppEngine = Google's fully managed PaaS; deploy code (Python, Java, Node.js, Go, PHP, Ruby, .NET); Google manages servers, auto-scaling, load balancing, patching. Services: Datastore, Cloud SQL, Cloud Storage, Pub/Sub.
2. **Standard** (instance-based, milliseconds scale, sandboxed) and **Flexible** (Docker containers, custom runtimes).
3. **Azure App Service** — fully managed web app hosting (Windows/Linux/containers), deployment slots, hybrid via Arc.
4. Aneka = .NET-specific PaaS (Manjrasoft); Task/Thread/MapReduce/Grid programming models; runs on Windows, Azure, AWS, private cloud; commercial licence.
5. **SOAP:** HTTP/SMTP, XML, enterprise/strict contracts. **REST:** HTTP, JSON, web/mobile APIs, microservices.
6. Vendor lock-in, multi-cloud complexity, security/compliance, cost management, skills gap, performance variability, legacy migration, governance, sustainability.
7. Genomics (BWA/GATK) — burst to cloud for large-scale alignment. Climate modelling (WRF) — HPC on cloud with MPI/InfiniBand.
8. E-commerce (Shopify) — elastic scaling for Black Friday, global CDN. Streaming (Netflix) — global delivery, personalisation. FinTech (Stripe) — PCI compliance, low latency.

</details>

---

## 7.10 Sixty-Second Check

Close this file and, on a blank page:

- [ ] AppEngine: definition + two environments + three services
- [ ] Azure App Service: AppEngine equivalent + hybrid/enterprise features
- [ ] Aneka: .NET PaaS + programming models + deployment targets
- [ ] Web services: SOAP vs REST (protocol, format, use case)
- [ ] Five open challenges (vendor lock-in, multi-cloud, security, cost, skills)
- [ ] One scientific + one business application with cloud value

If all six are there, Unit 7's **1 mark (A10) + insurance** is covered.

---

*Sources: TU FOM syllabus (IT 277, Unit 7, 12 LHs) · TU/FOM model question 2026 (A10) · Saurabh, Cloud Computing, ch. 13–14 (syllabus reading) · Buyya et al., Mastering Cloud Computing, ch. 12–13 (syllabus reading) · Google Cloud AppEngine documentation, Microsoft Azure App Service documentation, Manjrasoft Aneka documentation — standard product references. Google Cloud, Microsoft Azure, AWS service names are standard examples, not current feature claims.*