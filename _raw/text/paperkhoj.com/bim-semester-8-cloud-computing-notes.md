# Unit 1: Introduction to Cloud Computing — IT 277 Cloud Computing Study Notes | Paper Khoj
_Source: https://paperkhoj.com/bim/semester-8/cloud-computing/notes_

[Home](/)/[BIM](/bim)/[Semester 8](/bim/semester-8)/[IT 277](/bim/semester-8/cloud-computing/papers)/Study notes

IT 277

# Cloud Computing

TU BIM · Semester 8 · BIM curriculum effective from 2021

Requirementelective

Credits3

Study Guide7 units available
[Past papers](/bim/semester-8/cloud-computing/papers)[Practice sets](/bim/semester-8/cloud-computing/practice-sets)[Syllabus](/bim/semester-8/cloud-computing/syllabus)[Chapter questions](/bim/semester-8/cloud-computing/chapter-questions)[Study notes](/bim/semester-8/cloud-computing/notes)

## Chapter notes

Authoritative study guide across 7 syllabus units

Open a unit to read its study notes.

### Syllabus Units

Unit 1Introduction to Cloud Computing

→

Unit 2Cloud Computing Architecture

→

Unit 3Cloud Applications

→

Unit 4Cloud Virtualization Technology

→

Unit 5MapReduce and Applications

→

Unit 6Cloud Security

→

Unit 7Cloud Platforms and Applications

→

## Unit 1: Introduction to Cloud Computing· 5 LHs· ~6 marks

Print Unit[Suggest correction](/feedback?course_code=IT+277&chapter_unit=Unit+1&chapter_title=Introduction+to+Cloud+Computing)

Pass path: Learn the 5 essential characteristics of cloud computing (NIST SP 800-145: On-demand self-service, Broad network access, Resource pooling, Rapid elasticity, Measured service).
Top path: Trace the historical evolution of distributed computing (Mainframes -> Grid Computing -> Utility Computing -> Cloud), analyze multi-tenancy, and evaluate cloud adoption frameworks.

### Part 1: Core Concepts (2 Marks)

- ★ Cloud Computing (NIST Definition): A model for enabling ubiquitous, convenient, on-demand network access to a shared pool of configurable computing resources (networks, servers, storage, applications) that can be rapidly provisioned with minimal management effort or service provider interaction.

- ★ Resource Pooling: An essential cloud characteristic where the provider’s computing resources are pooled to serve multiple consumers using a multi-tenant model, with physical and virtual resources dynamically assigned based on demand.

- ★ Rapid Elasticity: The ability of cloud computing infrastructure to elastically provision and release computing resources (CPU, RAM, storage) dynamically and automatically in response to fluctuating application workloads.

### Part 2: Structural Frameworks (10 Marks)

#### 1. Cloud Computing Foundations: NIST Characteristics, Evolution, and Adoption Drivers

- Introduction: Define Cloud Computing. Emphasize that cloud computing is not just “someone else’s computer”; it represents the commercial industrialization of IT infrastructure into an on-demand utility (analogous to electricity generation).

- The Five Essential NIST Characteristics (NIST SP 800-145):

- On-Demand Self-Service: Consumers can provision computing capabilities (server time, network storage) automatically as needed without requiring human interaction with the cloud service provider.

- Broad Network Access: Capabilities are available over the standard network (Internet) and accessed through standardized mechanisms that promote use by heterogeneous client platforms (smartphones, tablets, laptops).

- Resource Pooling: Multi-tenant pooling of physical and virtual hardware; location independence where consumers generally have no control or knowledge of the exact physical location of resources.

- Rapid Elasticity: Capabilities can be scaled outward or inward elastically; to the consumer, available capabilities often appear virtually infinite.

- Measured Service: Cloud systems automatically control and optimize resource usage by leveraging metering capabilities (pay-as-you-go utility pricing based on gigabytes stored, CPU hours used, or bandwidth consumed).

- Evolutionary Trajectory of Distributed Computing:

- Mainframe Computing (1960s): Centralized processing via dumb terminals.

- Client-Server Architecture (1980s): Decentralized personal computers connecting to local network servers.

- Cluster & Grid Computing (1990s): Harnessing geographically distributed heterogeneous nodes to solve massive computational problems.

- Utility Computing & Virtualization (2000s): Hardware abstraction enabling seamless slicing of physical servers into virtual machines.

- Cloud Computing (2006-Present): Launch of Amazon Web Services (AWS EC2, S3) commoditizing infrastructure via public internet APIs.

- Enterprise Benefits and Adoption Challenges:

- Benefits: Shifting Capital Expenditure (CapEx) to Operational Expenditure (OpEx); zero hardware procurement lead time; global presence in minutes; automated disaster recovery.

- Challenges: Security and data sovereignty compliance; unexpected cloud bill shock (lack of FinOps governance); vendor lock-in; dependency on public internet latency.

- Conclusion: Cloud computing has become the de-facto foundation for modern enterprise software, powering everything from startup MVPs to multinational banking backbones.

### Part 3: Distinction Tables

Criteria |
Capital Expenditure (CapEx - On-Premise) |
Operational Expenditure (OpEx - Cloud) |

Payment Timing |
Massive upfront capital investment prior to deployment |
Pay-as-you-go recurring operational subscription |

Financial Accounting |
Depreciated over 3 to 7 years on corporate balance sheet |
Deducted as direct operating expense on income statement |

Capacity Sizing |
Must be provisioned for peak historical demand (wasted idle capacity) |
Scales dynamically with real-time demand (zero idle waste) |

Hardware Maintenance |
Company responsible for physical data centers, HVAC, UPS, repairs |
100% managed by cloud vendor under strict Service Level Agreements |

Procurement Lead Time |
6 to 12 weeks to order, ship, rack, and cable physical servers |
Under 60 seconds to provision instances via API or console |

### Part 4: Worked Problems & Exam Traps

- Problem 1 (Easy): A retail e-commerce website experiences 1,000 visitors per hour normally, but surges to 50,000 visitors per hour during a 3-day Dashain flash festival. Which NIST cloud characteristic is essential here, and why?

- Solution:

- The essential characteristic is Rapid Elasticity (Auto-Scaling).

- Under traditional on-premise infrastructure, the firm would have to purchase 50 expensive physical servers that sit completely idle for 362 days a year.

- In the cloud, Auto-Scaling Groups automatically spin up 50 virtual instances when CPU utilization exceeds 70%, and automatically terminate them when the festival concludes, paying only for the exact hours utilized.

- Problem 2 (Exam-Level Economic Sizing): An enterprise is considering migrating its internal server farm to the cloud.

- On-Premise Option: Purchase 10 servers at Rs. 500,000 each. Data center power, cooling, and network costs are Rs. 100,000/month. A dedicated system administrator earns Rs. 80,000/month.

- Cloud IaaS Option: 10 equivalent cloud virtual instances cost Rs. 25,000/month each (all inclusive of power, hardware maintenance, and hypervisor).
Calculate the Total Cost of Ownership (TCO) for both options over a 3-year (36-month) operational horizon.

- Solution:

- On-Premise TCO:

- Initial Hardware: 10×500,000=Rs. 5,000,00010 \times 500,000 = \text{Rs. } 5,000,00010×500,000=Rs. 5,000,000.

- Operating Overhead (36 months): (100,000+80,000)×36=180,000×36=Rs. 6,480,000(100,000 + 80,000) \times 36 = 180,000 \times 36 = \text{Rs. } 6,480,000(100,000+80,000)×36=180,000×36=Rs. 6,480,000.

- Total On-Premise TCO=5,000,000+6,480,000=Rs. 11,480,000\text{Total On-Premise TCO} = 5,000,000 + 6,480,000 = \text{Rs. } 11,480,000Total On-Premise TCO=5,000,000+6,480,000=Rs. 11,480,000.

- Cloud IaaS TCO:

- Initial Upfront Hardware: Rs. 0.

- Cloud Subscription (36 months): (10×25,000)×36=250,000×36=Rs. 9,000,000(10 \times 25,000) \times 36 = 250,000 \times 36 = \text{Rs. } 9,000,000(10×25,000)×36=250,000×36=Rs. 9,000,000.

- Total Cloud TCO=Rs. 9,000,000\text{Total Cloud TCO} = \text{Rs. } 9,000,000Total Cloud TCO=Rs. 9,000,000.

- Decision: Cloud migration saves the enterprise Rs. 2,480,000 over 3 years while eliminating hardware obsolescence risks.

- Problem 3 (Twist / Case Scenario): A company hosts a private website on an isolated virtual machine inside its own corporate office intranet. Does this constitute “Cloud Computing”?

- Solution:

- Simply running a Virtual Machine does NOT constitute cloud computing.

- To be classified as a true cloud (even a Private Cloud), the system must possess the 5 NIST characteristics: it must offer an automated on-demand self-service provisioning portal, pooled resources, measurable usage metering, rapid elasticity, and broad network access.

- If an employee must submit a manual helpdesk ticket to an IT technician who manually clicks buttons in VirtualBox, it is merely legacy hosted virtualization, not cloud computing.

- Students lose marks here because they confuse virtualization with cloud computing (virtualization is the enabling technology; cloud is the business and service delivery model), or they omit measured service from NIST characteristics.
