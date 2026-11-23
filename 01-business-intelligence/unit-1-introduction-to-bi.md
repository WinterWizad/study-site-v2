# Unit 1 â€” Introduction to Business Intelligence

| | |
|---|---|
| **Lecture hours** | 5 |
| **Marks in 2026 paper** | 6 (three 1-markers + one 3-marker) |
| **Difficulty** | â˜…â˜…â˜†â˜†â˜† â€” easy to understand, easy to lose marks on wording |
| **Exam yield** | ðŸŸ¡ medium â€” always present, never large. Cheap marks. |
| **Prerequisite** | none. This is the vocabulary the rest of the paper assumes. |
| **Syllabus** | Definition and scope of BI Â· Importance of BI in decision-making Â· Overview of BI tools and technologies |

> **Read this first:** This unit is the vocabulary for the whole paper. You can't answer the 20-mark case ("how does Amazon use BI?") without defining BI exactly. Get definitions right here and you get free marks in Groups A and D simultaneously.

## Learn in Motion

<div class="learn-motion-demo" style="font-family: system-ui, sans-serif; margin: 1rem 0;">
  <h3 style="margin-top: 0;">C-T-P-D: The BI Pipeline in Motion</h3>
  
  <svg id="ctpd-svg" width="640" height="180" viewBox="0 0 640 180" style="max-width: 100%; height: auto; display: block; margin: 0 auto 1rem auto;">
    <rect id="box1" x="40" y="60" width="120" height="60" rx="8" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/>
    <rect id="box2" x="200" y="60" width="120" height="60" rx="8" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/>
    <rect id="box3" x="360" y="60" width="120" height="60" rx="8" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/>
    <rect id="box4" x="520" y="60" width="120" height="60" rx="8" fill="#e2e8f0" stroke="#64748b" stroke-width="2"/>
    
    <text x="100" y="85" text-anchor="middle" font-weight="600" fill="#334155" font-family="system-ui, sans-serif" font-size="14">1 · COLLECT</text>
    <text x="100" y="105" text-anchor="middle" font-size="12" fill="#64748b" font-family="system-ui, sans-serif">sources</text>
    
    <text x="260" y="85" text-anchor="middle" font-weight="600" fill="#334155" font-family="system-ui, sans-serif" font-size="14">2 · TRANSFORM</text>
    <text x="260" y="105" text-anchor="middle" font-size="12" fill="#64748b" font-family="system-ui, sans-serif">ETL / clean</text>
    
    <text x="420" y="85" text-anchor="middle" font-weight="600" fill="#334155" font-family="system-ui, sans-serif" font-size="14">3 · PRESENT</text>
    <text x="420" y="105" text-anchor="middle" font-size="12" fill="#64748b" font-family="system-ui, sans-serif">dashboards</text>
    
    <text x="580" y="85" text-anchor="middle" font-weight="600" fill="#334155" font-family="system-ui, sans-serif" font-size="14">4 · DECIDE</text>
    <text x="580" y="105" text-anchor="middle" font-size="12" fill="#64748b" font-family="system-ui, sans-serif">action</text>
    
    <line id="arrow1" x1="160" y1="90" x2="200" y2="90" stroke="#94a3b8" stroke-width="3" marker-end="url(#arrowhead)"/>
    <line id="arrow2" x1="320" y1="90" x2="360" y2="90" stroke="#94a3b8" stroke-width="3" marker-end="url(#arrowhead)"/>
    <line id="arrow3" x1="480" y1="90" x2="520" y2="90" stroke="#94a3b8" stroke-width="3" marker-end="url(#arrowhead)"/>
    
    <defs>
      <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
        <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8"/>
      </marker>
    </defs>
  </svg>
  
  <div id="ctpd-caption" style="margin-top: 1rem; padding: 1rem; background: #f8fafc; border-left: 4px solid #2563eb; border-radius: 0 6px 6px 0; font-size: 0.95rem; color: #334155; min-height: 3em;">
    Click a stage to see what happens at each step.
  </div>
  
  <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem; align-items: center;">
    <button onclick="ctpdPlay('auto')" style="padding: 0.4rem 0.8rem; cursor: pointer;">▶ Auto Play</button>
    <button onclick="ctpdPlay('loop')" style="padding: 0.4rem 0.8rem; cursor: pointer;">🔁 Loop</button>
    <button onclick="ctpdReset()" style="padding: 0.4rem 0.8rem; cursor: pointer;">↺ Reset</button>
  </div>
</div>

<script>
(function(){
  const boxes = ['box1','box2','box3','box4'];
  const arrows = ['arrow1','arrow2','arrow3'];
  const captions = [
    'Collect: Data flows in from ERP, CRM, Excel, web APIs, and sensors — raw and multi-source.',
    'Transform: ETL cleans, deduplicates, and loads data into a query-ready warehouse.',
    'Present: Dashboards, reports, and alerts put information in front of managers.',
    'Decide: The output is a decision — not just a chart. That is the point of BI.'
  ];
  let loopTimer = null;

  function highlight(i){
    boxes.forEach((b, idx) => {
      const el = document.getElementById(b);
      el.setAttribute('fill', idx === i ? '#dbeafe' : '#e2e8f0');
      el.setAttribute('stroke', idx === i ? '#2563eb' : '#64748b');
    });
    arrows.forEach((a, idx) => {
      document.getElementById(a).setAttribute('stroke', idx === i ? '#2563eb' : '#94a3b8');
    });
    const cap = document.getElementById('ctpd-caption');
    if (i >= 0 && i < captions.length) cap.textContent = captions[i];
  }

  function autoPlay(){
    clearTimeout(loopTimer);
    let step = 0;
    function next(){
      if (step > 3){ ctpdReset(); return; }
      highlight(step - 1);
      loopTimer = setTimeout(next, 2200);
      step++;
    }
    next();
  }

  window.ctpdPlay = function(mode){
    if (mode === 'loop'){ autoPlay(); }
    else if (mode === 'auto'){ clearTimeout(loopTimer); autoPlay(); }
  };

  window.ctpdReset = function(){
    clearTimeout(loopTimer);
    highlight(-1);
    document.getElementById('ctpd-caption').textContent = 'Click a stage to see what happens at each step.';
  };

  boxes.forEach((b, i) => {
    document.getElementById(b).style.cursor = 'pointer';
    document.getElementById(b).onclick = () => { clearTimeout(loopTimer); highlight(i); };
  });
})();
</script>

<style>
.learn-motion-demo rect{transition: fill 0.3s, stroke 0.3s;}
.learn-motion-demo line{transition: stroke 0.3s;}
</style>

---

## Coverage Map

```
1.1 BI Definition
â”œâ”€â”€ 4-part definition (Processes, Technologies, Transformation, Decision)
â”œâ”€â”€ Memory hook: C-T-P-D
â””â”€â”€ Common trap: BI â‰  tool

1.2 BI Scope
â”œâ”€â”€ Analytical ladder (Descriptive â†’ Diagnostic â†’ Predictive â†’ Prescriptive)
â”œâ”€â”€ Organisational scope (Functional â†’ Enterprise)
â”œâ”€â”€ Data, Time, User scope
â””â”€â”€ Nepal bank example

1.3 BI Importance in Decision-Making
â”œâ”€â”€ Why data matters (opinion â†’ evidence)
â”œâ”€â”€ 5 importance points (F-B-S-T-C)
â”œâ”€â”€ What BI does NOT fix
â””â”€â”€ Nepal reality check

1.4 BI Tools & Technologies
â”œâ”€â”€ BI Stack (5 stages, draw it)
â”œâ”€â”€ 6 tool categories + examples
â”œâ”€â”€ A9: name two BI tools
â””â”€â”€ Nepal reality check

1.5 Answer Skeletons (inline)
```

---

## 1.1 The BI Definition â€” Write This Version

> **Business Intelligence (BI) is the set of processes, technologies and tools that collect data from multiple sources, transform it into a reliable, query-ready form, and present it as information managers use to make faster and better decisions.**

Break it into the four parts an examiner looks for:

| Part | What it means | Why it's in the definition |
|---|---|---|
| **Processes** | ETL, reporting cycles, governance | BI is a discipline, not a product |
| **Technologies & tools** | Data warehouse, OLAP, dashboards, Tableau/Power BI | Syllabus Units 2 and 5 |
| **Transformation** | Raw, messy, multi-source â†’ clean, consistent | The work nobody sees |
| **Decision** | Output is a *decision*, not a chart | The point of the whole course |

ðŸ§  **Memory hook: C-T-P-D** â€” Collect â†’ Transform â†’ Present â†’ Decide.

âš  **Trap:** Writing "BI is software like Power BI" loses the mark. That's a *tool used by* BI. A tool-only answer ruins the definition and weakens the case later.

### Where BI Sits Among Its Neighbours

This table does more work than any paragraph â€” several 1-markers come from the edges between these terms:

| Term | What it does | Output |
|---|---|---|
| **Data** | Raw facts, unorganised | `3400, 12/03, KTM` |
| **Information** | Data in context | "3400 units sold in Kathmandu in March" |
| **Data analysis** | Inspecting/cleaning/modelling data to find useful info | An insight or finding |
| **Data mining** | Algorithmic search for *hidden patterns* in large data | A rule, cluster, or model |
| **Reporting** | Presenting predefined metrics on a schedule | A static report |
| **BI** | The whole pipeline that makes the above repeatable and decision-ready | Decisions |

âšª **DIKW note:** Data â†’ Information â†’ Knowledge â†’ Wisdom is a common 1-mark question elsewhere; keep it in your head, one line each. Not asked in 2026 for BI, but it's the standard framing.

---

### A1 Â· "List any two scope of business intelligence." [1]

> BI's scope ranges from **descriptive reporting** (what happened) through **diagnostic drill-down** (why) to **predictive forecasting** and **prescriptive recommendation**; organisationally it extends from a single department's reports to enterprise-wide, governed analytics.

---

### A4 Â· "What is data analysis?" [1]

> Data analysis is the process of inspecting, cleaning and modelling data to discover useful information, draw conclusions and support decision-making.

âš  Do **not** swap in a definition of data mining. Mining is a *technique within* analysis: algorithmic pattern discovery in large datasets. If the question says "analysis", keep it general.

---

## 1.2 Scope of BI â€” How to Answer "List Any Two"

"Scope" means **how far BI reaches** â€” across the organisation and across levels of analysis. Students lose this mark because "scope" sounds like "features" and they list tool names.

### Scope Across the Analytical Ladder (answer this if asked for scope)

| Level | Question answered | BI capability | Example |
|---|---|---|---|
| 1. **Descriptive** | What happened? | Dashboards, reports | Last month's sales by branch |
| 2. **Diagnostic** | Why did it happen? | Drill-down, OLAP, root-cause | Which product drove the drop |
| 3. **Predictive** | What will happen? | Forecasting, data mining models | Next quarter's demand |
| 4. **Prescriptive** | What should we do? | Optimisation, recommendation | Reorder quantities per store |

### Scope Across the Organisation

- **Functional scope** â€” one department (sales, HR, finance) â†’ **Enterprise scope** â€” one governed warehouse feeding every function.
- **Data scope** â€” internal transactional data â†’ external data (market, competitor, social, web).
- **Time scope** â€” historical reporting â†’ real-time/near-real-time monitoring.
- **User scope** â€” analyst-authored reports â†’ self-service BI for managers on mobile.

ðŸ‡³ðŸ‡µ **Nepal anchor (use in a 3- or 5-marker, and in a case):** A Nepali commercial bank's BI scope runs from *branch-level daily deposit and loan reports* (descriptive, functional) to *NPL early-warning dashboards and customer churn scoring* (predictive, enterprise). Same discipline, different rung of the ladder.

**A2-safe answer (1 mark):** "BI's scope spans descriptive reporting, diagnostic drill-down, predictive forecasting and prescriptive recommendation, across functions from a single department to the whole enterprise."

---

## 1.3 Why BI Matters in Decision-Making

### First, Why Data Matters (this was a 1-marker)

Because decisions made on intuition are **unverifiable and unrepeatable**; data makes a decision traceable to evidence, comparable across periods, and correctable when wrong. In one line: *data converts opinion into evidence.*

### The Five Importance Points (the 3-marker "discuss any three importance")

| # | Importance | One-line justification | Example |
|---|---|---|---|
| 1 | **Faster decisions** | Pre-aggregated, query-ready data removes the wait for a report | Branch manager sees yesterday's position today |
| 2 | **Better-quality decisions** | One governed version of truth removes conflicting spreadsheets | Finance and sales quote the same revenue figure |
| 3 | **Single source of truth** | Central warehouse + definitions (Unit 2) | "Active customer" defined once |
| 4 | **Trend and pattern discovery** | Historical data reveals seasonality and anomalies | Dashainâ€“Tihar demand spikes, visible in advance |
| 5 | **Competitive advantage / cost control** | Spot loss-making products and idle inventory early | Discontinue a product line before the year-end loss |

ðŸ§  Memory hook for the five: **F-B-S-T-C** â€” *Faster, Better, Single truth, Trends, Competitive edge.* In the exam write any three with a justification line each â€” never three bare words.

âš  **Trap:** "Importance" questions want **consequence**, not definition. "BI means business intelligence" earns zero of three. Each point must say *what improves as a result*.

### What BI Does NOT Fix (worth one line in any evaluation answer)

BI improves the *evidence*; it does not improve the *decision-maker*. Poor data quality, unclear ownership and unexploded recommendations (dashboards nobody acts on â€” the "BI shelfware" problem) all survive a perfect warehouse. Examiners like this sentence in 5-markers and in the case's ethics part.

---

## 1.4 Overview of BI Tools and Technologies

You need two things here: the **stack** (in order) and **two tool names** (that is literally a 1-marker: "list any two BI tools").

### The BI Stack â€” Draw This, It Earns Marks Everywhere

```
   SOURCES            INTEGRATION          STORAGE            ANALYSIS           PRESENTATION
  â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”      â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”      â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”     â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
  â”‚ ERP/POS  â”‚      â”‚            â”‚      â”‚   Data     â”‚     â”‚   OLAP     â”‚     â”‚  Dashboards  â”‚
  â”‚ CRM      â”‚ â”€â”€â”€â–º â”‚    ETL     â”‚ â”€â”€â”€â–º â”‚ Warehouse  â”‚ â”€â”€â–º â”‚  Mining    â”‚ â”€â”€â–º â”‚  Reports     â”‚
  â”‚ Excel    â”‚      â”‚ (extract,  â”‚      â”‚  / Data    â”‚     â”‚  Statisticsâ”‚     â”‚  Alerts      â”‚
  â”‚ Web/API  â”‚      â”‚ transform, â”‚      â”‚   Marts    â”‚     â”‚  Queries   â”‚     â”‚  Mobile      â”‚
  â”‚ Sensors  â”‚      â”‚  load)     â”‚      â”‚            â”‚     â”‚            â”‚     â”‚              â”‚
  â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜      â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜     â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                                                                                    â”‚
                                                                                    â–¼
                                                                             DECISION / ACTION
```

That diagram is the skeleton of the whole course: Unit 2 is columns 2â€“3, Unit 3 is column 4, Unit 4 is column 5, Unit 5 is the tooling across columns, Unit 6 is making it survive in a real organisation.

### Tool Categories and Named Examples (Name Two, Know the Category)

| Category | What it is | Named tools |
|---|---|---|
| **Visualisation / dashboard BI** | Drag-and-drop analysis and dashboards | **Tableau, Microsoft Power BI**, Qlik Sense, Google Looker Studio |
| **Reporting layer** | Paginated, scheduled operational reports | SQL Server Reporting Services (SSRS), Crystal Reports |
| **Spreadsheet BI** | The tool everyone actually uses | Excel (Power Pivot, PivotTables) |
| **Database / OLAP engine** | Stores and pre-aggregates | SQL Server Analysis Services (SSAS), Oracle OLAP, ClickHouse |
| **ETL / integration** | Moves and cleans data | Informatica, Talend, Apache NiFi, SSIS |
| **Programming / advanced analytics** | Custom models | Python (pandas, scikit-learn), R |

**A9-safe answer (1 mark):** "Tableau and Microsoft Power BI." Two words, full mark. Do not write a paragraph.

ðŸ‡³ðŸ‡µ **Nepal reality check (use in a 3/5-marker):** Most Nepali mid-size organisations run BI on **Excel + Power BI** against a SQL database, with Tableau in larger banks and telecoms. Say that instead of pretending everyone has a full warehouse â€” it reads like someone who has seen the inside of a Nepali office, which examiners reward in evaluation and case parts.

---

## 1.5 Answer Skeletons for 2026 Questions

### A1 Â· "List any two scope of business intelligence." [1]
> BI's scope ranges from **descriptive reporting** (what happened) through **diagnostic drill-down** (why) to **predictive forecasting** and **prescriptive recommendation**; organisationally it extends from a single department's reports to enterprise-wide, governed analytics.

### A4 Â· "What is data analysis?" [1]
> Data analysis is the process of inspecting, cleaning and modelling data to discover useful information, draw conclusions and support decision-making.

### A5 Â· "Why is data considered as important factor for decision making?" [1]
> Because data-based decisions are evidence-based: data makes a decision traceable to facts, comparable over time, and correctable when outcomes differ â€” unlike intuition, which cannot be verified or repeated.

### B1 Â· "Discuss any three importance of business intelligence." [3]
> *Structure: 1 opening line + three points, each with a consequence + 1 closing line. ~100 words.*
>
> Business intelligence matters because it converts scattered operational data into decision-ready evidence. **First, it speeds up decisions** â€” pre-aggregated warehouse data removes the wait for manual reports, so managers act within the reporting cycle rather than after it. **Second, it improves decision quality** by giving every function a single governed version of the truth, ending the situation where finance and sales quote different revenue figures. **Third, it exposes trends and anomalies** â€” seasonality, declining products, idle inventory â€” early enough to act on. Together these shift management from reactive reporting to proactive control.

---

## 1.6 Self-Test (Answers Collapsed)

1. Define BI in one sentence containing the words *process*, *technologies* and *decision*. *(1 mark)*
2. Name the four levels of analytical scope and give the question each answers. *(3 marks)*
3. Give any three importances of BI, each with a consequence. *(3 marks)*
4. What is the difference between data analysis and data mining? *(1â€“3 marks, depending on paper mood)*
5. Name the five stages of the BI stack from source to decision. *(3 marks)*
6. ðŸ‡³ðŸ‡µ A Kathmandu retail chain has POS data from 40 outlets, one Excel report per outlet, and managers who argue about whose number is right. Name the *first* BI problem to fix and which stack stage it belongs to. *(5 marks â€” this is a mini case)*

<details>
<summary>Answers</summary>

1. "Business Intelligence is the set of processes, technologies and tools that collect data from multiple sources, transform it into reliable, query-ready information, and present it so managers can make faster, better decisions."
2. Descriptive (what happened) Â· Diagnostic (why it happened) Â· Predictive (what will happen) Â· Prescriptive (what should we do).
3. Any three of: faster decisions (pre-aggregated data removes report waits) Â· better quality (single governed version of the truth) Â· trend/pattern discovery (seasonality and anomalies surface early) Â· cost/competitive control (loss-making products identified) Â· single source of truth (consistent definitions across functions).
4. Analysis is the broad process of inspecting and modelling data to extract useful information; mining is a specific algorithmic search for hidden patterns (classification, clustering, association rules) in large datasets.
5. Sources â†’ ETL/integration â†’ data warehouse (and marts) â†’ OLAP/mining/analysis â†’ visualisation/dashboards â†’ decision.
6. The first problem is **inconsistent, ungoverned reporting** â€” 40 Excel reports produce 40 definitions of "sales", so the organisation cannot agree on a fact. It belongs to the **integration + storage** stages: standardise the metric definitions and load POS data into a single warehouse/mart with one "sales" definition. Tooling comes later; without this, a dashboard just displays the argument faster.

</details>

---

## 1.7 Sixty-Second Check

Close this file and, on a blank page:

- [ ] Write the BI definition from memory (all four parts)
- [ ] Draw the five-stage BI stack
- [ ] Name three importance points, each with a consequence
- [ ] Name two BI tools **and** two ETL tools
- [ ] Give one line distinguishing data analysis from data mining

If you can do all five in 60 seconds, this unit is marks-safe. Move to Unit 2 â€” Data Warehousing, which carries 11 marks and the paper's most reliable 5-marker.

---

*Sources: TU FOM syllabus (IT 249, Unit 1, 5 LHs) Â· TU 2026 paper (A1, A2, A4, A5, B1) Â· TU/FOM model Q 2026 (A1, A2, A4, A5, B1) Â· Inmon's BI definition Â· Kimball's BI stack Â· standard BI tool categories.*

