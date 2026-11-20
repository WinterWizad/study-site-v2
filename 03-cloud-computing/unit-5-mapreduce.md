# Unit 5 — MapReduce and Applications

| | |
|---|---|
| **Lecture hours** | 7 |
| **Marks in model question** | 9 — one 1-marker (A8 parallel computing definition), one 3-marker (B15 parallel efficiency of MapReduce), one 5-marker (C19 MapReduce architecture working) |
| **Difficulty** | ★★★☆☆ — the concepts are standard; the diagram (MapReduce word-count flow) is mandatory for C19; Amdahl's law and straggler mitigation are the marks separators |
| **Exam yield** | 🔴 high — 7 hours, 9 marks, and MapReduce is the *classic* parallel processing model that Hadoop/Spark built on |
| **Prerequisite** | Unit 1 (cloud elasticity enables MapReduce clusters) · basic programming concepts |
| **Syllabus** | Parallel computing · MapReduce model · MapReduce applications · Parallel efficiency of MapReduce · Enterprise batch processing using MapReduce |

> **Read this first:** This unit has **three questions, all mapped directly**. A8 is a 1-marker definition. B15 is a 3-marker on *parallel efficiency* — you need Amdahl's law, speedup formula, and straggler mitigation. C19 is a 5-marker on *MapReduce architecture working* — you must draw the **map → shuffle → reduce** diagram with the word-count example. The diagram is mandatory; prose loses marks.

---

## Coverage Map

```
5.1 Parallel Computing (A8) 🎯 1-mark
├── Definition: problem divided into sub-problems, executed simultaneously, results combined
└── Contrast with serial and distributed computing

5.2 The MapReduce Model
├── Two functions: Map (key,value) → list(key',value'), Reduce (key',list(value')) → list(key'',value'')
├── Three phases: Map → Shuffle & Sort → Reduce (diagram mandatory for C19)
└── Word-count example (canonical C19 illustration)

5.3 MapReduce Applications
├── Word count, Inverted index, Distributed grep, Log analysis, PageRank, Join
└── Map/Reduce function for each pattern

5.4 Parallel Efficiency of MapReduce (B15) 🎯 3-mark
├── Speedup = T₁/Tₚ, Efficiency = Speedup/p
├── Amdahl's Law: Speedup_max = 1 / (f + (1−f)/p)
└── Three limiting factors: serial fraction, stragglers, shuffle overhead + mitigations

5.5 Enterprise Batch Processing Using MapReduce
├── Input/Output: HDFS, S3, GCS, Azure Blob
├── Resource management: YARN, Kubernetes, Mesos
├── Fault tolerance: task re-execution, speculative execution, checkpointing
├── Optimisation: combiners, partitioners, compression, join strategies
└── Beyond MapReduce: Spark (in-memory DAG), Flink (streaming), Tez (DAG engine)
```

---

## 5.1 Parallel Computing (A8) 🎯 1-mark

> **Parallel computing is a form of computation where many calculations or processes are carried out simultaneously — dividing a problem into sub-problems that can be solved concurrently on multiple processors, then combining the results.**

---

### A8 · "What is parallel computing?" [1] 🎯 1-mark

> Parallel computing is a computation model where a problem is divided into independent sub-problems that execute simultaneously on multiple processors, with results combined at the end. It exploits concurrency to reduce wall-clock time. Contrast with serial computing (one task at a time) and distributed computing (networked computers with message passing).

*(48 words. Definition + how it works + contrast.)*

---

## 5.2 The MapReduce Model

> **MapReduce is a programming model and execution framework for processing large datasets in parallel across a cluster — it abstracts the complexity of distributed systems (partitioning, scheduling, fault tolerance) into two user-defined functions: Map and Reduce.**

### The Two Functions

| Function | Signature | What it does |
|---|---|---|
| **Map** | `(key, value) → list(key', value')` | processes input split, emits intermediate key-value pairs |
| **Reduce** | `(key', list(value')) → list(key'', value'')` | aggregates all values for each intermediate key, emits final output |

---

### The Three Phases (the diagram C19 demands)

```
 INPUT DATA
     │
     ▼
┌─────────────┐
│   SPLIT     │  ← InputFormat splits into 64–128MB blocks
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   MAP TASKS │────►│  SHUFFLE &  │────►│  REDUCE     │
│  (parallel) │     │    SORT     │     │  TASKS      │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
  (key, value)      (key', list(v'))      (key'', value'')
  intermediate        grouped by key         final output
```

1. **Map phase** — input splits processed in parallel; each map task emits `(key, value)` pairs.
2. **Shuffle & Sort** — framework partitions map outputs by key, sorts within partition, transfers to reducers (the "shuffle" is network-intensive).
3. **Reduce phase** — each reducer receives all values for its keys, aggregates, writes final output.

---

### Word-count example (the canonical C19 illustration)

```
 INPUT: "the quick brown fox"
              │
              ▼
 MAP: (the,1) (quick,1) (brown,1) (fox,1)
              │
              ▼
 SHUFFLE: group by key
 (brown,[1]) (fox,[1]) (quick,[1]) (the,[1])
              │
              ▼
 REDUCE: sum values
 (brown,1) (fox,1) (quick,1) (the,1)
```

---

## 5.3 MapReduce Applications

| Application pattern | Map function | Reduce function |
|---|---|---|
| **Word count** | emit (word, 1) | sum counts per word |
| **Inverted index** | emit (word, docID) | collect docIDs per word |
| **Distributed grep** | emit (line, 1) if pattern matches | identity (pass through) |
| **Log analysis** | parse log, emit (error_code, 1) | count errors by code |
| **PageRank** | emit (target_url, rank/outlinks) | sum contributions, apply damping |
| **Join** | emit (join_key, (tag, value)) | join on key, combine tagged values |

---

## 5.4 Parallel Efficiency of MapReduce (B15) 🎯 3-mark

> **Speedup** = T₁ / Tₚ (serial time / parallel time with p processors).
> **Efficiency** = Speedup / p = T₁ / (p × Tₚ).
> **Amdahl's Law** — maximum speedup is limited by the serial fraction *f*:
> **Speedup_max = 1 / (f + (1−f)/p)**

### Three Factors That Limit MapReduce Efficiency

| Factor | What it is | Mitigation |
|---|---|---|
| **Serial fraction (Amdahl)** | job setup, commit, single-threaded parts | minimise serial code; use combiners |
| **Stragglers** | slow tasks (slow disk, GC pauses, data skew) | speculative execution (run duplicate task), better partitioning |
| **Shuffle overhead** | network transfer of intermediate data | combiners (local reduce), compression (Snappy, LZO), fewer reducers |

---

### B15 · "Describe the parallel efficiency of MapReduce." [3] 🎯 3-mark

> **Shape: speedup/efficiency formulas + Amdahl's law + three limiting factors with mitigations. ~100 words.**

**Speedup** = T₁ / Tₚ. **Efficiency** = Speedup / p = T₁ / (p·Tₚ). **Amdahl's Law** limits max speedup by serial fraction *f*: Speedup_max = 1 / (f + (1−f)/p).

**Three factors limiting MapReduce efficiency:**

1. **Serial fraction** — job setup, commit, single-threaded parts. *Mitigation:* minimise serial code; use combiners for local aggregation.
2. **Stragglers** — slow tasks from disk, GC, data skew. *Mitigation:* speculative execution (duplicate slow task); better partitioning (custom Partitioner).
3. **Shuffle overhead** — network transfer of intermediate data. *Mitigation:* combiners (local reduce before shuffle); compression (Snappy, LZO); optimal reducer count.

*(108 words)*

---

## 5.5 Enterprise Batch Processing Using MapReduce

| Aspect | What it means in practice |
|---|---|
| **Input/Output** | HDFS, S3, GCS, Azure Blob — InputFormat/OutputFormat handle splits and serialization |
| **Resource management** | YARN (Hadoop), Kubernetes, Mesos — allocate containers for map/reduce tasks |
| **Fault tolerance** | task re-execution on failure; speculative execution for stragglers; checkpointing |
| **Monitoring** | JobHistory Server, YARN UI, Spark UI (if Spark on MapReduce) |
| **Optimisation** | combiners, partitioners, compression, join strategies (map-side join, reduce-side join) |
| **Beyond MapReduce** | Spark (in-memory DAG), Flink (streaming), Tez (DAG engine) — same patterns, better performance |

---

## 5.6 Traps

| Trap | Why it costs marks | Fix |
|---|---|---|
| Answering C19 without the map→shuffle→reduce diagram | diagram is mandatory; prose loses marks | draw the three-phase flow with word-count example |
| Confusing MapReduce with Hadoop | MapReduce is the *model*; Hadoop is an *implementation* | "MapReduce is the programming model; Hadoop MapReduce is one implementation" |
| Forgetting the shuffle phase | it's the network-intensive phase that distinguishes MapReduce | "Shuffle = partition by key + sort + network transfer to reducers" |
| Writing Amdahl's law without the formula | B15 asks for "parallel efficiency" — formula is the mark | Speedup_max = 1 / (f + (1−f)/p) |
| Missing straggler mitigation in B15 | it's the #1 practical MapReduce problem | speculative execution + custom partitioner |
| Saying "MapReduce is slow" without the why | shuffle + stragglers + serial fraction are the reasons | three factors + mitigations |

---

## 5.7 Self-Test (Answers Collapsed)

1. Define parallel computing in one sentence. *(1 mark — A8)*
2. What are the two MapReduce functions, and their signatures? *(2 marks)*
3. Draw the MapReduce three-phase diagram (map → shuffle → reduce). *(diagram — C19)*
4. Trace the word-count example through Map, Shuffle, Reduce. *(3 marks — C19)*
5. Give the speedup and efficiency formulas, and Amdahl's law. *(2 marks — B15)*
6. Name three factors limiting MapReduce parallel efficiency, with one mitigation each. *(3 marks — B15)*
7. What is a combiner, and when does it run? *(2 marks)*

<details>
<summary>Answers</summary>

1. Parallel computing = problem divided into independent sub-problems executed simultaneously on multiple processors, results combined; exploits concurrency to reduce wall-clock time.
2. **Map:** `(key, value) → list(key', value')` — processes input split, emits intermediate pairs. **Reduce:** `(key', list(value')) → list(key'', value'')` — aggregates values per key, emits final output.
3. INPUT → SPLIT → MAP TASKS (parallel) → SHUFFLE & SORT (partition by key, sort, network transfer) → REDUCE TASKS → OUTPUT.
4. "the quick brown fox" → MAP: (the,1) (quick,1) (brown,1) (fox,1) → SHUFFLE: group by key → (the,[1]) (quick,[1]) (brown,[1]) (fox,[1]) → REDUCE: sum → (the,1) (quick,1) (brown,1) (fox,1).
5. Speedup = T₁/Tₚ. Efficiency = Speedup/p = T₁/(p·Tₚ). Amdahl: Speedup_max = 1 / (f + (1−f)/p).
6. (1) Serial fraction → minimise serial code, use combiners. (2) Stragglers → speculative execution, custom Partitioner. (3) Shuffle overhead → combiners, compression (Snappy/LZO), optimal reducer count.
7. Combiner = local reducer that runs on map output *before* shuffle; same logic as Reduce but on single map's output; reduces shuffle volume.

</details>

---

## 5.8 Sixty-Second Check

Close this file and, on a blank page:

- [ ] Parallel computing definition (one sentence)
- [ ] Map signature + Reduce signature
- [ ] MapReduce three-phase diagram: map → shuffle → reduce
- [ ] Word-count trace: input → map → shuffle → reduce → output
- [ ] Speedup, efficiency, Amdahl's law formulas
- [ ] Three efficiency limiters: serial fraction, stragglers, shuffle + mitigations
- [ ] Combiner: local reducer on map output, before shuffle

If all seven are there, Unit 5's **9 marks** are covered — A8, B15, C19.

---

*Sources: TU FOM syllabus (IT 277, Unit 5, 7 LHs) · TU/FOM model question 2026 (A8, B15, C19) · Saurabh, Cloud Computing, ch. 9 (syllabus reading) · Buyya et al., Mastering Cloud Computing, ch. 10 (syllabus reading) · Dean & Ghemawat, "MapReduce: Simplified Data Processing on Large Clusters" (OSDI 2004) — the original paper. Hadoop MapReduce, Spark, Flink are standard implementations, not current version claims.*