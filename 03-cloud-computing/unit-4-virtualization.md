# Unit 4 — Cloud Virtualization Technology

| | |
|---|---|
| **Lecture hours** | 8 |
| **Marks in model question** | 17 — one 1-marker (A6 virtualization definition), two 3-markers (B13 hypervisor types, B14 virtualization types), one 10-marker (D21 virtualization role + hypervisor types) |
| **Difficulty** | ★★★★☆ — **diagrams are mandatory**. B13, B14, D21 all expect labelled diagrams. D21 overlaps B13/B14 but demands triple depth: role in cloud economics + Type 1 & Type 2 diagram with real products + judgement on when each is used. |
| **Exam yield** | 🔴 **second engine** — 8 hours, 17 marks, and virtualization is the *foundation* of cloud (Unit 1's dynamic infrastructure, Unit 2's resource pooling). |
| **Prerequisite** | Unit 1 (NIST five characteristics — virtualization enables resource pooling, rapid elasticity, measured service) |
| **Syllabus** | Introduction to Virtualization · Different types of Virtualization · Implementation Levels of Virtualization Structures · Benefits of virtualization · Server virtualization · Virtualization software · Types of Hypervisor · Load balancing · Infrastructure requirement for virtualization |

> **Read this first:** This unit is **the diagram engine**. You must be able to draw **two diagrams cold in under 90 seconds each**: (1) **Type 1 vs Type 2 hypervisor architecture** — labelled with VMM, host OS, guest OS, hardware, and real products (ESXi, Hyper-V, KVM, VirtualBox, VMware Workstation). (2) **Virtualization types** — server, storage, network, desktop, application. D21 is the 10-mark rewrite of B13/B14 — same content, triple depth: add **role in cloud economics** (multi-tenancy, elasticity, isolation), **both hypervisor diagrams**, and **closing judgement**.

---

## Coverage Map

```
4.1 What Virtualization Is (A6) 🎯 1-mark
├── Definition: abstraction of physical resources into logical resources
└── Cloud link: enables resource pooling, rapid elasticity, multi-tenancy

4.2 Types of Virtualization (B14) 🎯 3-mark
├── Five types: server, storage, network, desktop (VDI), application
└── One example each

4.3 Hypervisors — Type 1 vs Type 2 (B13, D21) 🎯 3-mark / 🎯 10-mark
├── Type 1 (Bare Metal): runs on hardware, no host OS, near-native performance
│   └── Products: ESXi, Hyper-V, KVM, Xen
├── Type 2 (Hosted): runs on host OS, higher overhead
│   └── Products: Workstation, VirtualBox, Parallels, QEMU
├── Diagram 1: Hardware → VMM → VMs (Type 1)
├── Diagram 2: Hardware → Host OS → VMM → VMs (Type 2)
└── Labels mandatory: Hardware, VMM, Host OS, Guest OS, Products

4.4 Implementation Levels of Virtualization Structures
├── ISA, HAL, OS, Application, Library/User-level
└── One example each

4.5 Benefits of Virtualization — Cloud Economics Link (D21)
├── Multi-tenancy → resource pooling (NIST)
├── Isolation → trust, compliance
├── Elasticity → rapid elasticity (NIST)
├── Hardware independence → live migration, DR, measured service
├── Consolidation → capex reduction, energy efficiency
└── Snapshot/backup → DR, testing, patch rollback

4.6 Server Virtualization Key Concepts
├── vCPU, vRAM, Virtual NIC, Virtual disk, Live migration, HA/DRS
└── Thin/thick provisioning, snapshots, cloning

4.7 Virtualization Software Landscape
├── Enterprise bare-metal: vSphere, Hyper-V, RHV, Citrix, Oracle VM
├── Cloud provider: AWS Nitro, Google Cloud (KVM), Azure (Hyper-V)
├── Open source: KVM+libvirt, oVirt, Proxmox, OpenStack, Harvester
└── Desktop/Dev: Workstation, VirtualBox, Parallels, UTM, Lima

4.8 Load Balancing in Virtualized Environments
├── VM-level: DRS, Dynamic Optimization
├── Application-level: ALB, NLB, HAProxy, NGINX
├── Network-level: vSwitch, OVS, NSX
└── Storage-level: Storage DRS, IOPS balancing

4.9 Infrastructure Requirements
├── CPU: VT-x/AMD-V, EPT/RVI, multiple cores
├── Memory: sufficient RAM, ECC, NUMA awareness
├── Storage: shared storage for live migration, IOPS, thin provisioning
├── Network: 10GbE+, VLAN/VXLAN, dedicated management network
└── Power/Cooling: density increases power/heat, redundant PSU, UPS

4.10 D21 — Virtualization Role + Hypervisor Types [10] 🎯 10-mark
├── Definition + cloud economics role (4 pillars)
├── Type 1 diagram + products
├── Type 2 diagram + products
└── Judgement table: scenario → choose Type 1/2 → why
```

---

## 4.1 What Virtualization Is (A6) 🎯 1-mark

> **Virtualization is the abstraction of physical computing resources (CPU, memory, storage, network) into logical/virtual resources, enabling multiple isolated environments to run on a single physical host.**

---

### A6 · "What is Virtualization?" [1] 🎯 1-mark

> Virtualization is the abstraction of physical computing resources (CPU, memory, storage, network) into logical/virtual resources, enabling multiple isolated environments (VMs) to run on a single physical host. It is the foundation of cloud computing — enabling resource pooling, rapid elasticity, and multi-tenancy.

*(50 words. Definition + what it enables + cloud link.)*

---

## 4.2 Types of Virtualization (B14) 🎯 3-mark

| Type | What is virtualised | Key benefit | Example |
|---|---|---|---|
| **Server virtualization** | physical server → multiple VMs | consolidation, isolation, hardware independence | VMware ESXi, Hyper-V, KVM, Xen |
| **Storage virtualization** | physical disks → logical volumes/pools | tiering, replication, snapshots, thin provisioning | VMware vSAN, NetApp ONTAP, Ceph, AWS EBS |
| **Network virtualization** | physical network → virtual networks (VXLAN, VLAN, SDN) | micro-segmentation, multi-tenancy, automation | VMware NSX, Cisco ACI, AWS VPC, Azure VNet |
| **Desktop virtualization** (VDI) | desktop OS → hosted in datacenter | security, manageability, BYOD | VMware Horizon, Citrix, Windows 365, Azure Virtual Desktop |
| **Application virtualization** | app + dependencies → isolated package | conflict-free, portable, streamed | Docker, App-V, ThinApp, Flatpak |

---

### B14 · "Discuss types of virtualization with example." [3] 🎯 3-mark

> **Shape: table of five types + one example each. ~100 words.**

| Type | What is virtualised | Example |
|---|---|---|
| **Server** | physical server → multiple VMs | VMware ESXi, Hyper-V, KVM |
| **Storage** | physical disks → logical pools | vSAN, NetApp ONTAP, Ceph, EBS |
| **Network** | physical net → virtual nets (VXLAN, SDN) | NSX, ACI, AWS VPC, Azure VNet |
| **Desktop** (VDI) | desktop OS hosted in datacenter | Horizon, Citrix, Windows 365 |
| **Application** | app + deps → isolated package | Docker, App-V, ThinApp, Flatpak |

*(98 words. Five types, one line each, one example each.)*

---

## 4.3 Hypervisors — Type 1 vs Type 2 (B13, D21) 🎯 3-mark / 🎯 10-mark

> **A hypervisor (Virtual Machine Monitor / VMM) is the software layer that creates and runs VMs, managing hardware resource allocation and isolation between guests.**

### Type 1 — Bare Metal

| Aspect | Detail |
|---|---|
| **Runs** | directly on hardware; no host OS |
| **Architecture** | VMM = minimal OS (kernel + drivers + VM management) |
| **Products** | **VMware ESXi**, **Microsoft Hyper-V** (Type 1 mode), **KVM** (Linux kernel module), **Xen**, **Citrix Hypervisor** |
| **Performance** | near-native (minimal overhead) |
| **Use case** | production, enterprise, cloud providers |

```
 HARDWARE
     │
     ▼
┌───────────────┐
│   TYPE 1 VMM  │  ← ESXi, Hyper-V, KVM, Xen
│  (ESXi kernel)│
└───────┬───────┘
        │
  ┌─────┴─────┐
  ▼           ▼
┌──────┐   ┌──────┐
│ VM 1 │   │ VM 2 │  Guest OSs
│ Linux│   │Windows│
└──────┘   └──────┘
```

---

### Type 2 — Hosted

| Aspect | Detail |
|---|---|
| **Runs** | as an application on a host OS |
| **Architecture** | host OS → hypervisor process → guest VMs |
| **Products** | **VMware Workstation/Fusion**, **Oracle VirtualBox**, **Parallels Desktop**, **QEMU** (user-mode) |
| **Performance** | higher overhead (host OS scheduling, double context switch) |
| **Use case** | development, testing, desktop, education |

```
 HARDWARE
     │
     ▼
┌───────────────┐
│   HOST OS     │  ← Windows, macOS, Linux
│  (Windows 11) │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│  TYPE 2 VMM   │  ← Workstation, VirtualBox, Parallels
│ (VMware WS)   │
└───────┬───────┘
        │
  ┌─────┴─────┐
  ▼           ▼
┌──────┐   ┌──────┐
│ VM 1 │   │ VM 2 │
│ Linux│   │Windows│
└──────┘   └──────┘
```

---

### B13 · "Explain the different types of Hypervisor." [3] 🎯 3-mark

> **Shape: Type 1 vs Type 2 comparison + diagram description + products. ~100 words.**

**Type 1 (Bare Metal):** runs directly on hardware; no host OS. VMM = minimal kernel + drivers + VM management. **Near-native performance.** Products: **VMware ESXi**, **Hyper-V**, **KVM**, **Xen**. Use case: production, cloud providers.

**Type 2 (Hosted):** runs as application on host OS. Host OS schedules hypervisor process → higher overhead (double context switch). Products: **VMware Workstation**, **VirtualBox**, **Parallels**, **QEMU**. Use case: dev/test, desktop.

**Diagram:** Type 1: Hardware → VMM (ESXi) → VMs. Type 2: Hardware → Host OS → VMM (Workstation) → VMs.

*(104 words)*

---

## 4.4 Implementation Levels of Virtualization Structures

| Level | What is virtualised | Example |
|---|---|---|
| **Instruction Set Architecture (ISA)** | CPU instructions → binary translation / hardware assist (VT-x, AMD-V) | VMware binary translation, KVM hardware assist |
| **Hardware Abstraction Layer (HAL)** | devices → paravirtualised drivers (virtio) | virtio-blk, virtio-net, PV drivers |
| **Operating System** | kernel → containers (shared kernel) / zones | Docker, LXC, Solaris Zones, FreeBSD Jails |
| **Application** | runtime → JVM/CLR, language-level | JVM, .NET CLR, Python VM |
| **Library / User-level** | API interception → sandboxing | gVisor, seccomp, Firecracker |

---

## 4.5 Benefits of Virtualization — Cloud Economics Link for D21

| Benefit | Cloud economics role |
|---|---|
| **Multi-tenancy** | multiple customers on same hardware → resource pooling (NIST) → cost sharing |
| **Isolation** | security boundary between tenants → trust, compliance |
| **Elasticity** | VMs provisioned in seconds → rapid elasticity (NIST) |
| **Hardware independence** | VM portable across hosts → live migration, DR, cloud burst |
| **Consolidation** | higher utilisation (15% → 80%+) → capex reduction, energy efficiency |
| **Snapshot/backup** | point-in-time state → DR, testing, patch rollback |
| **Legacy support** | old OS/apps on modern hardware → extend life |

---

## 4.6 Server Virtualization — Key Concepts

| Concept | What it is |
|---|---|
| **vCPU** | virtual CPU = time-sliced physical core; hypervisor schedules vCPU threads |
| **vRAM** | virtual RAM = allocated from host physical RAM; ballooning, reclamation |
| **Virtual NIC** | virtual network interface → connects to virtual switch (vSwitch, OVS) |
| **Virtual disk** | .vmdk, .vhdx, .qcow2 — thin/thick provisioned, snapshots, cloning |
| **Live migration** | move running VM between hosts (vMotion, Live Migration) — shared storage + network |
| **HA / DRS** | High Availability (restart on failure), Distributed Resource Scheduler (load balance) |

---

## 4.7 Virtualization Software — the Landscape

| Category | Products |
|---|---|
| **Enterprise bare-metal** | VMware vSphere (ESXi + vCenter), Microsoft Hyper-V + SCVMM, Red Hat Virtualization (KVM + oVirt), Citrix Hypervisor (Xen), Oracle VM |
| **Cloud provider** | AWS Nitro (custom), Google Cloud (KVM-based), Azure (Hyper-V based) |
| **Open source** | KVM + libvirt + QEMU, oVirt, Proxmox VE, OpenStack (Nova), Harvester |
| **Desktop / Dev** | VMware Workstation/Fusion, VirtualBox, Parallels, UTM (macOS), Lima |

---

## 4.8 Load Balancing in Virtualized Environments

| Layer | Mechanism |
|---|---|
| **VM-level** | DRS (VMware) / Dynamic Optimization (Hyper-V) — move VMs across hosts |
| **Application-level** | load balancer (ALB, NLB, HAProxy, NGINX) distributes traffic across VMs/containers |
| **Network-level** | virtual switch (vSwitch, OVS, NSX) — VXLAN, distributed routing |
| **Storage-level** | Storage DRS / IOPS balancing — move vDisks across datastores |

---

## 4.9 Infrastructure Requirements for Virtualization

| Requirement | Detail |
|---|---|
| **CPU** | hardware virtualization extensions (Intel VT-x, AMD-V), EPT/RVI for nested paging, multiple cores |
| **Memory** | sufficient RAM for host + all VMs; ECC preferred; NUMA awareness |
| **Storage** | shared storage for live migration (SAN, NAS, vSAN, Ceph); IOPS for VM density; thin provisioning |
| **Network** | 10GbE+ for migration/storage traffic; VLAN/VXLAN support; dedicated management network |
| **Power/Cooling** | density increases power/heat per rack; redundant PSU, UPS |

---

## 4.10 D21 · "Explain virtualization and its role in cloud computing, and also explain the hypervisor types and examples." [10] 🎯 10-mark

> **Shape: definition + cloud economics role (4 benefits) + Type 1 diagram + Type 2 diagram + products + judgement. ~350 words.**

**Virtualization** is the abstraction of physical computing resources (CPU, memory, storage, network) into logical/virtual resources, enabling multiple isolated environments (VMs) to run on a single physical host.

**Role in cloud computing — four pillars:**

1. **Multi-tenancy** — virtualization creates the isolation boundary that allows multiple customers to share physical hardware safely. This is the *enabler* of NIST's **resource pooling**.
2. **Elasticity** — VMs can be provisioned, scaled, and terminated in seconds. This is the *enabler* of NIST's **rapid elasticity** and **on-demand self-service**.
3. **Isolation & security** — hardware-enforced boundaries (EPT, IOMMU) between VMs provide the trust foundation for multi-tenant clouds.
4. **Hardware independence** — VMs encapsulate OS + app + state into portable files (.vmdk, .vhdx). This enables live migration, disaster recovery, cloud burst, and **measured service** (metering per VM).

---

**Hypervisor types — with diagrams and products:**

### Type 1 (Bare Metal) — production, cloud providers
```
 HARDWARE
     │
     ▼
┌───────────────┐
│   TYPE 1 VMM  │  ← ESXi, Hyper-V, KVM, Xen
└───────┬───────┘
        │
  ┌─────┴─────┐
  ▼           ▼
┌──────┐   ┌──────┐
│ VM 1 │   │ VM 2 │  Guest OSs
└──────┘   └──────┘
```
**Products:** **VMware ESXi** (enterprise standard), **Microsoft Hyper-V** (Windows Server role), **KVM** (Linux kernel module, used by AWS, Google, OpenStack), **Xen** (Citrix Hypervisor), **Oracle VM**.

---

### Type 2 (Hosted) — development, testing, desktop
```
 HARDWARE
     │
     ▼
┌───────────────┐
│   HOST OS     │  ← Windows, macOS, Linux
└───────┬───────┘
        │
        ▼
┌───────────────┐
│  TYPE 2 VMM   │  ← Workstation, VirtualBox, Parallels
└───────┬───────┘
        │
  ┌─────┴─────┐
  ▼           ▼
┌──────┐   ┌──────┐
│ VM 1 │   │ VM 2 │
└──────┘   └──────┘
```
**Products:** **VMware Workstation/Fusion** (dev standard), **Oracle VirtualBox** (free, cross-platform), **Parallels Desktop** (macOS), **QEMU** (user-mode, Linux).

---

**Judgement — when to use which:**

| Scenario | Choose | Why |
|---|---|---|
| Production workloads, cloud provider, enterprise | **Type 1** | near-native performance, direct hardware control, security |
| Developer laptop, CI/CD agents, education, desktop | **Type 2** | runs on host OS, easy install, snapshots, USB/GPU passthrough |
| Nested virtualization (VM inside VM) | **Type 1 on Type 1** | KVM on ESXi, Hyper-V on Hyper-V — for lab/cloud-in-cloud |

**Closing line:** Virtualization is not optional for cloud — it is the *substrate* that turns physical hardware into the pooled, elastic, metered, multi-tenant resource that the NIST definition describes. Type 1 is the production standard; Type 2 is the developer tool.

*(386 words)*

---

## 4.11 Traps

| Trap | Why it costs marks | Fix |
|---|---|---|
| Answering B13/B14/D21 without diagrams | diagrams are mandatory; prose loses marks | draw Type 1 and Type 2 stacks with labels |
| Confusing Type 1 vs Type 2 products | ESXi is Type 1; Workstation is Type 2 | memorise: ESXi, Hyper-V, KVM, Xen = Type 1; Workstation, VirtualBox, Parallels = Type 2 |
| Forgetting Hyper-V is Type 1 | Hyper-V runs in Windows Server but is Type 1 architecture | "Hyper-V (Type 1 mode)" — the hypervisor loads before host OS partition |
| Missing KVM as Type 1 | KVM is a Linux kernel module = Type 1 | "KVM (Linux kernel module)" — used by AWS, Google, OpenStack |
| D21 without "role in cloud economics" | the question asks for "role in cloud computing" | four pillars: multi-tenancy, elasticity, isolation, hardware independence |
| D21 without judgement | "when to use which" is the 10-mark differentiator | table: scenario → choose → why |
| Drawing diagram without labels | unlabelled diagram = no marks | label: Hardware, VMM, Host OS, Guest OS, Products |

---

## 4.12 Self-Test (Answers Collapsed)

1. Define virtualization in one sentence, and name the three NIST characteristics it enables. *(1 mark — A6)*
2. Name the five types of virtualization with one example each. *(3 marks — B14)*
3. Compare Type 1 and Type 2 hypervisors in a three-row table (architecture, performance, products). *(3 marks — B13)*
4. Draw the Type 1 hypervisor diagram with labels. *(diagram — B13/D21)*
5. Draw the Type 2 hypervisor diagram with labels. *(diagram — B13/D21)*
6. Give four roles of virtualization in cloud economics. *(5 marks — part of D21)*
7. When would you choose Type 1 vs Type 2? Give a three-row scenario table. *(5 marks — part of D21)*

<details>
<summary>Answers</summary>

1. Virtualization = abstraction of physical resources into logical resources, enabling multiple isolated VMs on one host. Enables: resource pooling, rapid elasticity, multi-tenancy (measured service).
2. Server (ESXi), Storage (vSAN), Network (NSX/VPC), Desktop/VDI (Horizon), Application (Docker).
3. **Type 1:** Hardware → VMM (ESXi, KVM) → VMs; near-native; ESXi, Hyper-V, KVM, Xen. **Type 2:** Hardware → Host OS → VMM (Workstation) → VMs; overhead; Workstation, VirtualBox, Parallels, QEMU.
4. Hardware → VMM (ESXi/Hyper-V/KVM) → VM1, VM2. Labels: Hardware, Type 1 VMM, Guest OSs, Products (ESXi, Hyper-V, KVM).
5. Hardware → Host OS → VMM (Workstation/VirtualBox) → VM1, VM2. Labels: Hardware, Host OS, Type 2 VMM, Guest OSs, Products.
6. (1) Multi-tenancy → resource pooling. (2) Elasticity → rapid elasticity. (3) Isolation → trust/security. (4) Hardware independence → live migration, DR, measured service.
7. **Production/cloud** → Type 1 (performance, security). **Dev laptop/CI/education** → Type 2 (runs on host OS, easy install). **Nested virt** → Type 1 on Type 1.

</details>

---

## 4.13 Sixty-Second Check

Close this file and, on a blank page:

- [ ] Virtualization definition + three NIST characteristics
- [ ] Five virtualization types + examples
- [ ] Type 1 vs Type 2: three-row table (architecture, performance, products)
- [ ] Type 1 diagram: Hardware → VMM → VMs (labelled with products)
- [ ] Type 2 diagram: Hardware → Host OS → VMM → VMs (labelled with products)
- [ ] Four roles in cloud economics: multi-tenancy, elasticity, isolation, hardware independence
- [ ] Judgement table: scenario → choose Type 1/2 → why

If all seven are there, Unit 4's **17 marks** are covered — A6, B13, B14, D21.

---

*Sources: TU FOM syllabus (IT 277, Unit 4, 8 LHs) · TU/FOM model question 2026 (A6, B13, B14, D21) · Saurabh, Cloud Computing, ch. 7–8 (syllabus reading) · Buyya et al., Mastering Cloud Computing, ch. 3, 8 (syllabus reading) · VMware/VMware vSphere documentation, Microsoft Hyper-V documentation, KVM/QEMU documentation — standard product architecture references. VMware ESXi, Hyper-V, KVM, Xen, VMware Workstation, VirtualBox, Parallels, QEMU are standard product examples, not current feature claims.*