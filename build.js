import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import fm from 'front-matter';
import { glob } from 'glob';
import { collectSectionHeadingNames, createHeadingIdAssigner, extractReelContent, repairMojibake } from './reels/content.mjs';
import { buildNarrationManifest, narrationProfileFromEnv, buildAiTranscriptManifest, DEFAULT_AI_TRANSCRIPT_PROFILE } from './reels/speech.mjs';
import { BI_QUESTION_MANIFEST } from './reels/bi-question-manifest.mjs';
import { ENTREPRENEURSHIP_QUESTION_MANIFEST } from './reels/entrepreneurship-question-manifest.mjs';
import { CLOUD_QUESTION_MANIFEST } from './reels/cloud-question-manifest.mjs';
import { DIGITAL_ECONOMY_QUESTION_MANIFEST } from './reels/digital-economy-question-manifest.mjs';

const REEL_SUBJECT_IDS = ['bi', 'entrepreneurship', 'cloud', 'de'];

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = __dirname;
const DIST_DIR = path.join(__dirname, 'dist');

// Exam Routine — single source of truth (8th Semester NC only, from Dean's Office 2083/07/28)
const EXAM_ROUTINE = [
  { iso: '2026-12-01', bs: 'Mangsir 15, 2083', day: 'Tuesday', code: 'IT 248', short: 'Entrepreneur', railName: 'Entrepreneurship', color: '#dc2626', title: 'IT Entrepreneurship & Management (NC)', subjectId: 'entrepreneurship', isOurs: true },
  { iso: '2026-12-03', bs: 'Mangsir 17, 2083', day: 'Thursday', code: 'IT 250', short: 'Digital Economy', railName: 'Digital Economy', color: '#059669', title: 'Digital Economy (NC)', subjectId: 'de', isOurs: true },
  { iso: '2026-12-06', bs: 'Mangsir 20, 2083', day: 'Sunday', code: 'IT 249', short: 'Business Intel.', railName: 'Business Intelligence', color: '#2563eb', title: 'Business Intelligence (NC)', subjectId: 'bi', isOurs: true },
  { iso: '2026-12-10', bs: 'Mangsir 24, 2083', day: 'Thursday', code: 'IT 277', short: 'Cloud Computing', railName: 'Cloud Computing', color: '#7c3aed', title: 'Cloud Computing (NC)', subjectId: 'cloud', isOurs: true },
];

// Two real cinema releases on 18 Dec 2026. Kept out of EXAM_ROUTINE so the
// countdown, sidebar and subject doors still answer only for exam papers.
// Sources: Wikipedia — "Avengers: Doomsday" and "Dune: Part Three".
const CINEMA_STOP = {
  iso: '2026-12-18',
  code: 'Dune 3 + Avengers',
  view: ['Dune 3', 'Avengers'],
  title: 'Dune: Part Three + Avengers: Doomsday — both in cinemas 18 December 2026',
  isMovie: true,
};
const RAIL_STOPS = [...EXAM_ROUTINE, CINEMA_STOP];

const EXAM_CENTRE = 'Kirtipur';

const SYLLABUS_FILES = {
  'IT 248': 'IT248-it-entrepreneurship-management.md',
  'IT 249': 'IT249-business-intelligence.md',
  'IT 250': 'IT250-digital-economy.md',
  'IT 277': 'IT277-cloud-computing.md',
};

const EXAM_NOTES = [
  'Exam centre: Kirtipur (Tribhuvan University). Time will be notified by campus.',
  'No mobile phones, smart watches, or digital watches allowed in exam hall.',
  'Graph / chart / log paper may be used only with prior written approval.',
  'Admit card is mandatory for every paper. No admit card = no entry.',
];

// Subject configuration
const SUBJECTS = {
  bi: {
    id: 'bi',
    code: 'IT 249',
    name: 'Business Intelligence',
    folder: '01-business-intelligence',
    marks: 60,
    passMarks: 30,
    color: '#2563eb',
    units: [
      { num: 1, title: 'Introduction to Business Intelligence', file: 'unit-1-introduction-to-bi.md' },
      { num: 2, title: 'Data Warehousing', file: 'unit-2-data-warehousing.md' },
      { num: 3, title: 'Data Mining', file: 'unit-3-data-mining.md' },
      { num: 4, title: 'Data Visualization', file: 'unit-4-data-visualization.md' },
      { num: 5, title: 'BI Tools and Technologies', file: 'unit-5-bi-tools-and-technologies.md' },
      { num: 6, title: 'BI Implementation', file: 'unit-6-bi-implementation.md' }
    ]
  },
  de: {
    id: 'de',
    code: 'IT 250',
    name: 'Digital Economy',
    folder: '02-digital-economy',
    marks: 100,
    passMarks: 50,
    color: '#059669',
    units: [
      { num: 1, title: 'Introduction to Digital Economy', file: 'unit-1-introduction.md' },
      { num: 2, title: 'Fundamentals of Digital Economy', file: 'unit-2-fundamentals.md' },
      { num: 3, title: 'Digital Markets and Strategy', file: 'unit-3-markets-strategy.md' },
      { num: 4, title: 'Digital Transformation', file: 'unit-4-transformation.md' },
      { num: 5, title: 'Economics of Information', file: 'unit-5-economics-of-information.md' },
      { num: 6, title: 'Nepal Perspective', file: 'unit-6-nepal-perspective.md' }
    ]
  },
  cloud: {
    id: 'cloud',
    code: 'IT 277',
    name: 'Cloud Computing',
    folder: '03-cloud-computing',
    marks: 60,
    passMarks: 30,
    color: '#7c3aed',
    units: [
      { num: 1, title: 'Introduction to Cloud Computing', file: 'unit-1-introduction.md' },
      { num: 2, title: 'Cloud Architecture', file: 'unit-2-architecture.md' },
      { num: 3, title: 'Cloud Applications', file: 'unit-3-applications.md' },
      { num: 4, title: 'Virtualization', file: 'unit-4-virtualization.md' },
      { num: 5, title: 'MapReduce', file: 'unit-5-mapreduce.md' },
      { num: 6, title: 'Cloud Security', file: 'unit-6-security.md' },
      { num: 7, title: 'Cloud Platforms', file: 'unit-7-platforms.md' }
    ]
  },
  entrepreneurship: {
    id: 'entrepreneurship',
    code: 'IT 248',
    name: 'IT Entrepreneurship & Management',
    folder: '04-it-entrepreneurship-management',
    marks: 100,
    passMarks: 50,
    color: '#dc2626',
    units: [
      { num: 1, title: 'Foundations of Entrepreneurship', file: 'unit-1-foundations.md' },
      { num: 2, title: 'Idea Generation & Market Analysis', file: 'unit-2-idea-market.md' },
      { num: 3, title: 'Business Model Development', file: 'unit-3-business-model.md' },
      { num: 4, title: 'Legal & Compliance', file: 'unit-4-legal.md' },
      { num: 5, title: 'Finance & Marketing', file: 'unit-5-finance-marketing.md' },
      { num: 6, title: 'Leadership & CSR', file: 'unit-6-leadership-csr.md' }
    ]
  }
};

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  mangle: false
});

// Cheat sheet HTML template
const CHEAT_SHEET_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BI Cheat Sheet | Business Intelligence | Worst Generation</title>
  <meta name="description" content="One-page BI cheat sheet for exam revision - printable PDF ready — Worst Generation">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#2563eb">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../styles.css">
  <style>
    @media print {
      .site-header, .sidebar, .sidebar-toggle, .sidebar-overlay, .theme-toggle, .print-hide { display: none !important; }
      .layout { display: block !important; }
      .content { max-width: none !important; margin: 0 !important; padding: 0 !important; }
      .cheat-sheet { font-size: 7pt !important; line-height: 1.15 !important; }
      .cheat-sheet h2 { font-size: 8pt !important; margin: 4pt 0 2pt !important; }
      .cheat-sheet h3 { font-size: 7.5pt !important; margin: 3pt 0 1pt !important; }
      .cheat-sheet p, .cheat-sheet li { font-size: 7pt !important; margin: 1pt 0 !important; }
      .cheat-sheet table { font-size: 6.5pt !important; }
      .cheat-sheet td, .cheat-sheet th { padding: 1pt 2pt !important; }
      .cheat-sheet code { font-size: 6.5pt !important; }
      .cheat-sheet .formula { font-size: 7pt !important; }
      .cheat-sheet .diagram { font-size: 6pt !important; line-height: 1.1 !important; }
      .cheat-sheet hr { margin: 3pt 0 !important; border-color: #ccc !important; }
      .cheat-sheet .two-col { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 4pt !important; }
      .cheat-sheet table, .cheat-sheet .diagram, .cheat-sheet .formula { page-break-inside: avoid !important; break-inside: avoid !important; }
      .print-header {
        display: flex !important; justify-content: space-between; align-items: baseline;
        border-bottom: 1.5pt solid var(--accent) !important; padding-bottom: 2pt !important;
        margin-bottom: 4pt !important; font-size: 8pt !important; color: #444 !important;
      }
      .print-header strong { color: var(--accent) !important; font-size: 9pt !important; }
      @page { margin: 8mm !important; size: A5 !important; }
      body { background: white !important; }
    }
    .print-header { display: none; }
    
    @media screen {
      .cheat-sheet { max-width: 480px; margin: 0 auto; padding: 16px; font-size: 12px; line-height: 1.35; }
      .cheat-sheet h2 { font-size: 13px; margin: 12px 0 4px; color: #1e3a5f; border-bottom: 1px solid var(--accent); padding-bottom: 2px; }
      .cheat-sheet h3 { font-size: 12px; margin: 8px 0 3px; color: var(--accent); }
      .cheat-sheet p, .cheat-sheet li { margin: 2px 0; }
      .cheat-sheet table { width: 100%; border-collapse: collapse; margin: 4px 0; font-size: 11px; }
      .cheat-sheet th, .cheat-sheet td { border: 1px solid #ddd; padding: 3px 5px; text-align: left; }
      .cheat-sheet th { background: #f0f4f8; font-weight: 600; }
      .cheat-sheet code { background: #f0f4f8; padding: 1px 3px; border-radius: 3px; font-size: 11px; }
      .cheat-sheet .formula { background: #fffbe6; border: 1px solid #ffe58f; padding: 3px 6px; border-radius: 4px; font-family: monospace; margin: 3px 0; display: inline-block; }
      .cheat-sheet .diagram { font-family: monospace; font-size: 10px; line-height: 1.2; background: #fafafa; border: 1px solid #eee; padding: 6px; border-radius: 4px; overflow-x: auto; white-space: pre; }
      .cheat-sheet hr { border: none; border-top: 1px solid #e0e0e0; margin: 8px 0; }
      .cheat-sheet .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .cheat-sheet .side-label { font-weight: 600; color: var(--accent); }
      .print-btn { position: fixed; bottom: 20px; right: 20px; background: #2563eb; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; box-shadow: 0 4px 12px rgba(37,99,235,0.3); z-index: 100; }
      .print-btn:hover { background: #1d4ed8; }
      @media (max-width: 600px) { .cheat-sheet { font-size: 11px; padding: 12px; } }
    }
  </style>
</head>
<body>
  <header class="site-header">
    <div class="header-content">
      <a href="../index.html" class="site-title">Worst Generation</a>
      <span class="subject-badge" style="background: #2563eb">IT 249</span>
      <button class="theme-toggle" aria-label="Toggle theme" onclick="toggleTheme()"><svg class="icon-moon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12.3 3a9 9 0 1 0 8.7 11.4A7.5 7.5 0 0 1 12.3 3z"/></svg><svg class="icon-sun" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="currentColor"/><g stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6"/></g></svg></button>
    </div>
  </header>

  <div class="layout">
    <aside class="sidebar" id="sidebar">
      <button class="sidebar-toggle" aria-label="Toggle sidebar" onclick="toggleSidebar()">☰</button>
      <div class="sidebar-overlay" onclick="closeSidebar()"></div>
      <div class="sidebar-content">
        <h3>Business Intelligence</h3>
        <p class="subject-meta">IT 249 • 60 marks</p>
        <ul class="unit-list">
          <li><a href="unit-1.html"><span class="unit-num">Unit 1</span><span class="unit-title">Introduction to BI</span></a></li>
          <li><a href="unit-2.html"><span class="unit-num">Unit 2</span><span class="unit-title">Data Warehousing</span></a></li>
          <li><a href="unit-3.html"><span class="unit-num">Unit 3</span><span class="unit-title">Data Mining</span></a></li>
          <li><a href="unit-4.html"><span class="unit-num">Unit 4</span><span class="unit-title">Data Visualization</span></a></li>
          <li><a href="unit-5.html"><span class="unit-num">Unit 5</span><span class="unit-title">BI Tools & OLAP</span></a></li>
          <li><a href="unit-6.html"><span class="unit-num">Unit 6</span><span class="unit-title">BI Implementation</span></a></li>
        </ul>
        <div class="sidebar-footer">
          <a href="../index.html" class="footer-link">← All Subjects</a>
        </div>
      </div>
    </aside>

    <main class="content" role="main">
      <article class="resource-content">
        <header class="resource-header">
          <div class="resource-meta">
            <span class="subject-badge" style="background: #2563eb">IT 249</span>
            <h1>BI Cheat Sheet — One Page</h1>
            <div class="unit-meta">Exam-ready • Print on A5 (both sides) • 6pt font</div>
          </div>
        </header>

        <div class="cheat-sheet" id="cheatSheet">
          <div class="print-header">
            <span><strong>Worst Generation</strong> · BI Cheat Sheet</span>
            <span>BIM 8th Sem · IT 249</span>
          </div>
          <section id="side-a">
            <h2>SIDE A — Definitions & Lists</h2>

            <h3>BI Definition</h3>
            <p><strong>Business Intelligence (BI)</strong> = Processes + Technologies + Tools → Collect, Transform, Present → Decisions.</p>
            <p>Memory: <strong>C-T-P-D</strong> = Collect → Transform → Present → Decide.</p>
            <p>⚠ Not "BI = Power BI" — loses definition mark + case marks.</p>

            <h3>Data Warehouse (Inmon)</h3>
            <p><strong>Subject-oriented, Integrated, Time-variant, Non-volatile</strong> collection for decisions, not transactions.</p>
            <p>Memory: <strong>S-I-T-N</strong>.</p>
            <p>Non-volatile = no update/delete + historical reproducibility. Correction = new timestamped record (SCD Type 2).</p>

            <h3>Data Mining</h3>
            <p>Automated discovery of <strong>unknown, useful patterns</strong> in <strong>large datasets</strong> using statistical/ML techniques.</p>
            <p>vs Reporting (known Q) | OLAP (known dims) | Statistics (hypothesis first).</p>

            <h3>OLAP</h3>
            <p>Fast interactive multidimensional analysis: aggregate measures across dims, drill to detail.</p>
            <p><strong>5 ops:</strong> Roll-up ↑ Drill-down ↓ Slice (1 dim) Dice (2+ dims) Pivot ↔</p>

            <h3>ETL</h3>
            <p><strong>E:</strong> Pull full/incr → staging. <strong>T:</strong> Clean, standardise, dedupe, derive, conform. <strong>L:</strong> Bulk load, dependency order.</p>
            <p>Sequence matters: load untransformed = corrupt history (non-volatile).</p>

            <h3>BI Stack</h3>
            <p>Sources → ETL → DW/Marts → OLAP/Mining → Viz/Dashboards → <strong>DECISION</strong></p>

            <h3>DW Architecture</h3>
            <p>Sources → Staging/ETL → EDW → Marts → BI Tools (+ Metadata repo: defs, lineage, load stats)</p>
            <p>3 variants: Basic | +Staging | +Staging+Marts (preferred). Dependent mart ← EDW | Independent mart ← sources (island).</p>

            <h3>Star vs Snowflake</h3>
            <table>
              <tr><th></th><th>Star</th><th>Snowflake</th></tr>
              <tr><td>Shape</td><td>1 fact + denorm dims</td><td>Norm dims → sub-dims</td></tr>
              <tr><td>Joins</td><td>Fewer</td><td>More</td></tr>
              <tr><td>Speed</td><td>Faster</td><td>Slower</td></tr>
              <tr><td>Redundancy</td><td>Higher</td><td>Lower</td></tr>
            </table>
            <p>Grain = what 1 row = (e.g. product/store/day) → declare FIRST.</p>

            <h3>SCD</h3>
            <p>Type 1: Overwrite (lose history). Type 2: New row + valid_from/to (keep history) → DW default.</p>

            <h3>OLAP Storage</h3>
            <table>
              <tr><th></th><th>MOLAP</th><th>ROLAP</th><th>HOLAP</th></tr>
              <tr><td>How</td><td>Pre-computed cube</td><td>SQL on star schema</td><td>Agg in cube, detail in RDBMS</td></tr>
              <tr><td>Speed</td><td>Fastest</td><td>Slower</td><td>Compromise</td></tr>
              <tr><td>Freshness</td><td>Stale until process</td><td>Always current</td><td>Balanced</td></tr>
              <tr><td>Example</td><td>SSAS, Essbase</td><td>Mondrian</td><td>Hybrid</td></tr>
            </table>

            <h3>Classification vs Clustering</h3>
            <table>
              <tr><th></th><th>Classification</th><th>Clustering</th></tr>
              <tr><td>Learning</td><td>Supervised (has labels)</td><td>Unsupervised (no labels)</td></tr>
              <tr><td>Question</td><td>"Which known class?"</td><td>"What natural groups?"</td></tr>
              <tr><td>Output</td><td>Class + model</td><td>Clusters + membership</td></tr>
              <tr><td>Needs</td><td>Labeled examples</td><td>Attrs + similarity</td></tr>
              <tr><td>Example</td><td>Churn, fraud</td><td>Segmentation</td></tr>
            </table>
            <p>Memory: <strong>Classification has a teacher; clustering has none.</strong></p>
          </section>

          <hr>

          <section id="side-b">
            <h2>SIDE B — Formulas, Comparisons, Traps</h2>

            <h3>Association Rules</h3>
            <div class="formula">Support = count(X∪Y) / N</div>
            <div class="formula">Confidence = support(X∪Y) / support(X)</div>
            <div class="formula">Lift = confidence / support(Y) → >1 pos, =1 indep, <1 substitution</div>
            <div class="formula">Conviction = (1−support(Y)) / (1−confidence)</div>
            <p>Apriori: downward closure (infrequent → all supersets infrequent). Join freq k-itemsets → prune → count support.</p>

            <h3>Decision Tree vs Naive Bayes</h3>
            <table>
              <tr><th>Dimension</th><th>Decision Tree</th><th>Naive Bayes</th></tr>
              <tr><td>Learns</td><td>if-then splits (IG/Gini)</td><td>P(class|attrs) table</td></tr>
              <tr><td>Assumption</td><td>None</td><td>Conditional independence</td></tr>
              <tr><td>Mixed data</td><td>Native</td><td>Gaussian/discritize</td></tr>
              <tr><td>Missing vals</td><td>Impute/surrogate</td><td>Omit attr</td></tr>
              <tr><td>Overfitting</td><td>HIGH (needs pruning)</td><td>LOW (few params)</td></tr>
              <tr><td>Interpretability</td><td>HIGH (read rules)</td><td>LOW (prob table)</td></tr>
              <tr><td>Speed</td><td>Slower</td><td>1 pass, tiny data OK</td></tr>
              <tr><td>Stability</td><td>Unstable</td><td>Stable</td></tr>
            </table>
            <p><strong>Choose Tree:</strong> explain to manager, mixed attrs, enough data. <strong>Choose NB:</strong> many attrs, few records, text, speed.</p>
            <p><strong>Tree strengths:</strong> interpretable, no scaling, captures interactions. <strong>Weaknesses:</strong> overfits, biased to high-cardinality, unstable.</p>
            <p><strong>NB strengths:</strong> fast, tiny data, text. <strong>Weaknesses:</strong> independence false → double-counts correlated, no interactions.</p>

            <h3>BI Tools vs Reporting</h3>
            <table>
              <tr><th></th><th>BI (Power BI, Tableau)</th><th>Reporting (SSRS, Crystal)</th></tr>
              <tr><td>Output</td><td>Interactive, self-service</td><td>Fixed, paginated, IT-built</td></tr>
              <tr><td>Model</td><td>Semantic layer (1 defn)</td><td>Each report = own query</td></tr>
              <tr><td>Interaction</td><td>Drill, filter, cross-highlight</td><td>Read-only</td></tr>
              <tr><td>Refresh</td><td>Daily, web/mobile</td><td>Monthly batch, PDF</td></tr>
              <tr><td>Gov</td><td>Data/identity = customer</td><td>Tighter control</td></tr>
            </table>

            <h3>Cloud (if needed)</h3>
            <p><strong>NIST 5:</strong> On-demand self-service, Broad network access, Resource pooling, Rapid elasticity, Measured service.</p>
            <p><strong>IaaS:</strong> manage OS+app | <strong>PaaS:</strong> manage app+data | <strong>SaaS:</strong> manage nothing</p>
            <p><strong>Public/Private/Community/Hybrid</strong></p>
            <p><strong>Shared resp:</strong> Provider=physical→hypervisor | Customer=data, identity, app. <strong>Data & identity ALWAYS customer.</strong></p>

            <h3>Visualization</h3>
            <p><strong>Channels:</strong> Position > Length > Angle > Area > Volume (NEVER 3D)</p>
            <p><strong>Charts:</strong> Compare→sorted bar | Trend→line | Comp→stacked bar | Dist→hist/box | Rel→scatter</p>
            <p><strong>Lie factor</strong> = effect in graphic / effect in data → truthful = 1.0</p>
            <p><strong>Dashboard:</strong> 5-7 KPIs, exception-driven, top-left=most important, 5-sec rule</p>
            <p>Tiles need: definition, timestamp, threshold</p>

            <h3>Implementation</h3>
            <p><strong>BI = programme</strong> (not project) → stages + operated</p>
            <p><strong>4 layers:</strong> People/Org → Process/Gov → Data/Models → Tech</p>
            <p><strong>Best practices (D-S-P-D-A-C):</strong> Decisions first | Sponsor | Phase it | Definitions once | Architecture for change | Capability</p>
            <p><strong>Challenges:</strong> Technical | Organisational | Data-related (1 org, 1 example each)</p>
            <p><strong>Phased plan:</strong> 0 Discover → 1 Foundation → 2 First dashboards → 3 Scale → 4 Operate</p>
            <p>Milestones = EVIDENCE not activity ("Dict approved by owner" not "requirements gathered")</p>
            <p><strong>Case patterns:</strong> Walmart (supplier portal) | Tesco (loyalty=data) | Harrah's (customer value)</p>

            <h3>Traps (Cheat Sheet Errors)</h3>
            <table>
              <tr><th>Trap</th><th>Wrong (Cheat)</th><th>Right</th></tr>
              <tr><td>BI definition</td><td>"Power BI, Tableau"</td><td>Processes + tech + tools → collect, transform, present → decisions</td></tr>
              <tr><td>DW definition</td><td>"Central repository"</td><td>S-I-T-N (subject, integrated, time-variant, non-volatile)</td></tr>
              <tr><td>Non-volatile</td><td>"Never deleted"</td><td>No update/delete + historical reproducibility; correction = new timestamped record</td></tr>
              <tr><td>Slice vs Dice</td><td>Same</td><td>Slice = 1 dim fixed; Dice = 2+ dims fixed</td></tr>
              <tr><td>Type 1 products</td><td>"ESXi, Hyper-V, KVM"</td><td>Hyper-V = Type 1 (loads before host OS); KVM = Type 1 (kernel module)</td></tr>
              <tr><td>Decision tree weakness</td><td>"Overfits"</td><td>Overfits WITHOUT pruning; biased to high-cardinality attrs; unstable</td></tr>
            </table>
          </section>

        </div>

      </article>
    </main>
  </div>

  <button class="print-btn print-hide" onclick="window.print()" aria-label="Print cheat sheet">🖨️ Print / Save as PDF</button>

  <script>
    document.querySelectorAll('pre code').forEach(el => hljs.highlightElement(el));
    if (typeof mermaid !== 'undefined') {
      mermaid.initialize({ startOnLoad: true, theme: 'default', securityLevel: 'loose' });
    }
  </script>
</body>
</html>`;

// Custom renderer for better HTML
const renderer = new marked.Renderer();
let assignHeadingIds = createHeadingIdAssigner();

// Table rendering with classes
renderer.table = (header, body) => {
  return `<div class="table-wrapper"><table class="data-table"><thead>${header}</thead><tbody>${body}</tbody></table></div>`;
};

// Code blocks with copy button
renderer.code = (code, infostring) => {
  const lang = infostring?.trim() || 'text';
  const escaped = code.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');
  return `<div class="code-block"><div class="code-header"><span class="code-lang">${lang}</span><button class="copy-btn" onclick="copyCode(this)">Copy</button></div><pre><code class="language-${lang}">${escaped}</code></pre></div>`;
};

// Blockquote styling
renderer.blockquote = (quote) => {
  return `<blockquote class="custom-blockquote">${quote}</blockquote>`;
};

// Horizontal rule
renderer.hr = () => '<hr class="custom-hr">';

// Headings with anchor links
renderer.heading = (text, level) => {
  const id = assignHeadingIds(text);
  return `<h${level} id="${id}"><a href="#${id}" class="heading-anchor">#</a>${text}</h${level}>`;
};

// List items
renderer.listitem = (text) => `<li>${text}</li>`;

// Links
renderer.link = (href, title, text) => {
  const titleAttr = title ? ` title="${title}"` : '';
  return `<a href="${href}"${titleAttr} target="_blank" rel="noopener">${text}</a>`;
};

// Images
renderer.image = (href, title, text) => {
  const titleAttr = title ? ` title="${title}"` : '';
  return `<figure><img src="${href}" alt="${text}"${titleAttr}><figcaption>${text}</figcaption></figure>`;
};

marked.use({ renderer });

// Utility functions
function slugify(text) {
  return text.toLowerCase().replace(/[^\w]+/g, '-').replace(/(^-|-$)/g, '');
}

// Exam routine helpers
function getNextExam() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  for (const exam of EXAM_ROUTINE) {
    const examDate = new Date(exam.iso);
    if (examDate >= now) return exam;
  }
  return null;
}

function daysUntil(dateIso) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const [y, m, d] = dateIso.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff;
}

function formatExamDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

function getSubjectExam(subjectId) {
  return EXAM_ROUTINE.find(e => e.subjectId === subjectId) || null;
}

// Subjects in exam order: the next paper always appears first.
const SUBJECT_ORDER = Object.values(SUBJECTS).slice().sort((a, b) => {
  const ea = getSubjectExam(a.id);
  const eb = getSubjectExam(b.id);
  return (ea ? ea.iso : '9999-12-31').localeCompare(eb ? eb.iso : '9999-12-31');
});

function readMarkdownFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const { attributes, body } = fm(content);
  return { frontMatter: attributes, content: body };
}

function renderMarkdown(md) {
  assignHeadingIds = createHeadingIdAssigner();
  return marked.parse(md);
}

function generateUnitHtml(subject, unit, htmlContent) {
  const unitId = `${subject.id}-unit-${unit.num}`;
  const prevUnit = unit.num > 1 ? subject.units[unit.num - 2] : null;
  const nextUnit = unit.num < subject.units.length ? subject.units[unit.num] : null;

  const prevHref = prevUnit ? `unit-${prevUnit.num}.html` : null;
  const nextHref = nextUnit ? `unit-${nextUnit.num}.html` : null;

  const navHtml = `
    <nav class="unit-nav" aria-label="Unit navigation">
      ${prevUnit ? `<a href="${prevHref}" class="nav-btn prev">← Unit ${unit.num - 1}: ${prevUnit.title}</a>` : '<span class="nav-btn prev disabled">← Previous</span>'}
      <a href="../index.html#${subject.id}" class="nav-btn up">↑ ${subject.name}</a>
      ${nextUnit ? `<a href="${nextHref}" class="nav-btn next">Unit ${unit.num + 1}: ${nextUnit.title} →</a>` : '<span class="nav-btn next disabled">Next →</span>'}
    </nav>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unit ${unit.num}: ${unit.title} | ${subject.name} | Worst Generation</title>
  <meta name="description" content="${subject.code} - Unit ${unit.num}: ${unit.title} — Worst Generation">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#2563eb">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../../styles.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.9.0/styles/github.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.9.0/highlight.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js"></script>
</head>
<body class="unit-page" data-subject="${subject.id}">
  <header class="site-header">
    <div class="header-content">
      <a href="../index.html" class="site-title">Worst Generation</a>
      <span class="subject-badge" style="background: ${subject.color}">${subject.code}</span>
      <button class="theme-toggle" aria-label="Toggle theme" onclick="toggleTheme()"><svg class="icon-moon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12.3 3a9 9 0 1 0 8.7 11.4A7.5 7.5 0 0 1 12.3 3z"/></svg><svg class="icon-sun" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="currentColor"/><g stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6"/></g></svg></button>
    </div>
  </header>

  <div class="layout">
    <aside class="sidebar" id="sidebar">
      <button class="sidebar-toggle" aria-label="Toggle sidebar" onclick="toggleSidebar()">☰</button>
      <div class="sidebar-overlay" onclick="closeSidebar()"></div>
      <div class="sidebar-content">
        <h3>${subject.name}</h3>
        <p class="subject-meta">${subject.code} • ${subject.marks} marks</p>
        <ul class="unit-list">
          ${subject.units.map((u, i) => `
            <li>
              <a href="unit-${u.num}.html" class="${u.num === unit.num ? 'active' : ''}">
                <span class="unit-num">Unit ${u.num}</span>
                <span class="unit-title">${u.title}</span>
              </a>
            </li>
          `).join('')}
        </ul>
        <div class="sidebar-footer">
          ${REEL_SUBJECT_IDS.includes(subject.id) ? `<a href="../reels/?subject=${subject.id}" class="footer-link">Quick Reels</a>` : ''}
          <a href="../index.html" class="footer-link">← All Subjects</a>
        </div>
      </div>
    </aside>

    <main class="content" role="main">
      ${navHtml}

      <article class="unit-content">
        <header class="unit-header">
          <div class="unit-meta">
            <span class="unit-badge">Unit ${unit.num} of ${subject.units.length}</span>
            <span class="subject-name">${subject.name}</span>
          </div>
          <h1 class="unit-title">${unit.title}</h1>
          ${(() => { const ex = getSubjectExam(subject.id); if (ex) { const days = daysUntil(ex.iso); return `<p class="exam-date">Exam: ${formatExamDate(ex.iso)} · <strong>${days}</strong> day${days !== 1 ? 's' : ''}</p>`; } return ''; })()}
        </header>

        <div class="markdown-body">
          ${htmlContent}
        </div>
      </article>

      ${navHtml}
    </main>
  </div>

  <script>
    // Initialize Mermaid
    mermaid.initialize({ startOnLoad: true, theme: 'default', securityLevel: 'loose' });

    // Initialize highlight.js
    document.querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));

    // Copy code function
    window.copyCode = function(btn) {
      const code = btn.closest('.code-block').querySelector('code').textContent;
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 1500);
      });
    };

    // Sidebar toggle
    window.toggleSidebar = function() {
      const sb = document.getElementById('sidebar');
      if (sb) sb.classList.toggle('open');
    };
    window.closeSidebar = function() {
      const sb = document.getElementById('sidebar');
      if (sb) sb.classList.remove('open');
    };

    // Close sidebar on link click (mobile)
    document.querySelectorAll('.sidebar-content a').forEach(link => {
      link.addEventListener('click', () => closeSidebar());
    });

    // Theme toggle
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) themeBtn.classList.toggle('is-dark', savedTheme === 'dark');

    window.toggleTheme = function() {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      const themeBtn = document.querySelector('.theme-toggle');
      if (themeBtn) themeBtn.classList.toggle('is-dark', next === 'dark');
    };
  </script>
</body>
</html>`;
}

// Generate syllabus HTML page
function generateSyllabusHtml(subject, title, htmlContent, rawFilename) {
  const slug = rawFilename.replace(/\.md$/i, '');
  const downloadUrl = `/downloads/syllabus/${rawFilename}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | ${subject.code} | Worst Generation</title>
  <meta name="description" content="${subject.code} - ${title} — Worst Generation">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="${subject.color}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../../styles.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.9.0/styles/github.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.9.0/highlight.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js"></script>
</head>
<body class="syllabus-page" data-subject="${subject.id}">
  <header class="site-header">
    <div class="header-content">
      <a href="../../index.html" class="site-title">Worst Generation</a>
      <span class="subject-badge" style="background: ${subject.color}">${subject.code}</span>
      <button class="theme-toggle" aria-label="Toggle theme" onclick="toggleTheme()"><svg class="icon-moon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12.3 3a9 9 0 1 0 8.7 11.4A7.5 7.5 0 0 1 12.3 3z"/></svg><svg class="icon-sun" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="currentColor"/><g stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6"/></g></svg></button>
    </div>
  </header>

  <div class="layout">
    <aside class="sidebar" id="sidebar">
      <button class="sidebar-toggle" aria-label="Toggle sidebar" onclick="toggleSidebar()">☰</button>
      <div class="sidebar-overlay" onclick="closeSidebar()"></div>
      <div class="sidebar-content">
        <h3>${subject.name}</h3>
        <p class="subject-meta">${subject.code} • ${subject.marks} marks</p>
        <ul class="unit-list">
          ${subject.units.map((u, i) => `
            <li>
              <a href="../${subject.id}/unit-${u.num}.html" class="">
                <span class="unit-num">Unit ${u.num}</span>
                <span class="unit-title">${u.title}</span>
              </a>
            </li>
          `).join('')}
        </ul>
        <div class="sidebar-footer">
          ${REEL_SUBJECT_IDS.includes(subject.id) ? `<a href="../reels/?subject=${subject.id}" class="footer-link">Quick Reels</a>` : ''}
          <a href="../../index.html" class="footer-link">← All Subjects</a>
        </div>
      </div>
    </aside>

    <main class="content" role="main">
      <article class="syllabus-content">
        <header class="syllabus-header">
          <div class="syllabus-meta">
            <span class="subject-badge" style="background: ${subject.color}">${subject.code}</span>
            <h1>${title}</h1>
            <div class="unit-meta">${subject.name} · ${subject.marks} marks · ${subject.passMarks} pass • 48 lecture hours</div>
          </div>
          <p class="syllabus-source"><a href="${downloadUrl}" target="_blank" rel="noopener">Download Markdown source</a></p>
        </header>

        <div class="markdown-body">
          ${htmlContent}
        </div>
      </article>
    </main>
  </div>

  <script>
    // Initialize Mermaid
    mermaid.initialize({ startOnLoad: true, theme: 'default', securityLevel: 'loose' });

    // Initialize highlight.js
    document.querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));

    // Copy code function
    window.copyCode = function(btn) {
      const code = btn.closest('.code-block').querySelector('code').textContent;
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 1500);
      });
    };

    // Sidebar toggle
    window.toggleSidebar = function() {
      const sb = document.getElementById('sidebar');
      if (sb) sb.classList.toggle('open');
    };
    window.closeSidebar = function() {
      const sb = document.getElementById('sidebar');
      if (sb) sb.classList.remove('open');
    };
    document.querySelectorAll('.sidebar-content a').forEach(link => {
      link.addEventListener('click', () => closeSidebar());
    });

    // Theme toggle
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) themeBtn.classList.toggle('is-dark', savedTheme === 'dark');

    window.toggleTheme = function() {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      const themeBtn = document.querySelector('.theme-toggle');
      if (themeBtn) themeBtn.classList.toggle('is-dark', next === 'dark');
    };

    // Trailing slash redirect for subject index pages
    const subjectIndexRegex = new RegExp('^/(bi|de|cloud|entrepreneurship)$');
    if (subjectIndexRegex.test(window.location.pathname)) {
      window.location.href = window.location.pathname + '/';
    }
  </script>
</body>
</html>`;
}

function generateResourceHtml(subject, title, htmlContent) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | ${subject.name} | Worst Generation</title>
  <meta name="description" content="${subject.code} - ${title} — Worst Generation">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#2563eb">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../styles.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.9.0/styles/github.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.9.0/highlight.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js"></script>
</head>
<body>
  <header class="site-header">
    <div class="header-content">
      <a href="../index.html" class="site-title">Worst Generation</a>
      <span class="subject-badge" style="background: ${subject.color}">${subject.code}</span>
      <button class="theme-toggle" aria-label="Toggle theme" onclick="toggleTheme()"><svg class="icon-moon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12.3 3a9 9 0 1 0 8.7 11.4A7.5 7.5 0 0 1 12.3 3z"/></svg><svg class="icon-sun" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="currentColor"/><g stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6"/></g></svg></button>
    </div>
  </header>

  <div class="layout">
    <aside class="sidebar" id="sidebar">
      <button class="sidebar-toggle" aria-label="Toggle sidebar" onclick="toggleSidebar()">☰</button>
      <div class="sidebar-overlay" onclick="closeSidebar()"></div>
      <div class="sidebar-content">
        <h3>${subject.name}</h3>
        <p class="subject-meta">${subject.code} • ${subject.marks} marks</p>
        <ul class="unit-list">
          ${subject.units.map((u, i) => `
            <li>
              <a href="unit-${u.num}.html" class="">
                <span class="unit-num">Unit ${u.num}</span>
                <span class="unit-title">${u.title}</span>
              </a>
            </li>
          `).join('')}
        </ul>
        <div class="sidebar-footer">
          <a href="../index.html" class="footer-link">← All Subjects</a>
        </div>
      </div>
    </aside>

    <main class="content" role="main">
      <article class="resource-content">
        <header class="resource-header">
          <div class="resource-meta">
            <span class="subject-badge" style="background: ${subject.color}">${subject.code}</span>
            <h1>${title}</h1>
            <div class="unit-meta">${subject.name}</div>
          </div>
        </header>

        <div class="markdown-body">
          ${htmlContent}
        </div>
      </article>
    </main>
  </div>

  <script>
    // Initialize Mermaid
    mermaid.initialize({ startOnLoad: true, theme: 'default', securityLevel: 'loose' });

    // Initialize highlight.js
    document.querySelectorAll('pre code').forEach(block => hljs.highlightElement(block));

    // Copy code function
    window.copyCode = function(btn) {
      const code = btn.closest('.code-block').querySelector('code').textContent;
      navigator.clipboard.writeText(code).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = 'Copy', 1500);
      });
    };

    // Sidebar toggle
    window.toggleSidebar = function() {
      const sb = document.getElementById('sidebar');
      if (sb) sb.classList.toggle('open');
    };
    window.closeSidebar = function() {
      const sb = document.getElementById('sidebar');
      if (sb) sb.classList.remove('open');
    };
    document.querySelectorAll('.sidebar-content a').forEach(link => {
      link.addEventListener('click', () => closeSidebar());
    });

    // Theme toggle
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) themeBtn.classList.toggle('is-dark', savedTheme === 'dark');

    window.toggleTheme = function() {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      const themeBtn = document.querySelector('.theme-toggle');
      if (themeBtn) themeBtn.classList.toggle('is-dark', next === 'dark');
    };

    // Trailing slash redirect for subject index pages
    const subjectIndexRegex = new RegExp('^/(bi|de|cloud|entrepreneurship)$');
    if (subjectIndexRegex.test(window.location.pathname)) {
      window.location.href = window.location.pathname + '/';
    }
  </script>
</body>
</html>`;
}

function generateSubjectIndexHtml(subject) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject.name} | ${subject.code} | Worst Generation</title>
  <meta name="description" content="${subject.code} - ${subject.name} - ${subject.units.length} units, ${subject.marks} marks — Worst Generation">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#2563eb">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../styles.css">
</head>
<body>
  <header class="site-header">
    <div class="header-content">
      <a href="../index.html" class="site-title">Worst Generation</a>
      <span class="subject-badge" style="background: ${subject.color}">${subject.code}</span>
      <button class="theme-toggle" aria-label="Toggle theme" onclick="toggleTheme()"><svg class="icon-moon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12.3 3a9 9 0 1 0 8.7 11.4A7.5 7.5 0 0 1 12.3 3z"/></svg><svg class="icon-sun" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="currentColor"/><g stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6"/></g></svg></button>
    </div>
  </header>

  <div class="layout">
    <aside class="sidebar" id="sidebar">
      <button class="sidebar-toggle" aria-label="Toggle sidebar" onclick="toggleSidebar()">☰</button>
      <div class="sidebar-overlay" onclick="closeSidebar()"></div>
      <div class="sidebar-content">
        <h3>All Subjects</h3>
        <ul class="subject-list">
          ${SUBJECT_ORDER.map(s => `
            <li>
              <a href="../${s.id}/" class="${s.id === subject.id ? 'active' : ''}" style="border-left-color: ${s.color}">
                <span class="subject-code">${s.code}</span>
                <span class="subject-name">${s.name}</span>
              </a>
            </li>
          `).join('')}
        </ul>
      </div>
    </aside>

    <main class="content" role="main">
      <article class="subject-page">
        <header class="subject-header">
          <div class="subject-info">
            <span class="subject-badge" style="background: ${subject.color}">${subject.code}</span>
            <h1>${subject.name}</h1>
            <p class="subject-meta">${subject.marks} marks • ${subject.passMarks} pass • ${subject.units.length} units • 48 lecture hours</p>
            ${(() => { const ex = getSubjectExam(subject.id); if (ex) { const days = daysUntil(ex.iso); return `<p class="exam-date">Exam: ${formatExamDate(ex.iso)} · <strong>${days}</strong> day${days !== 1 ? 's' : ''}</p>`; } return ''; })()}
          </div>
        </header>

        <section class="units-grid">
          ${subject.units.map(u => `
            <article class="unit-card">
              <a href="unit-${u.num}.html">
                <div class="unit-card-header">
                  <span class="unit-number">Unit ${u.num}</span>
                </div>
                <h2>${u.title}</h2>
                <a href="unit-${u.num}.html" class="read-link">Read Unit →</a>
              </a>
            </article>
          `).join('')}
        </section>

        <section class="subject-resources">
          <h3>Resources</h3>
          <ul class="resource-list">
            <li><a href="model-question.html">Model Question</a></li>
            <li><a href="model-question-answers.html">Model Question Answers</a></li>
            ${subject.id === 'entrepreneurship' ? '<li><a href="board-paper-2026.html">2026 Board Paper and Answers</a></li>' : ''}
            <li><a href="question-bank.html">Question Bank</a></li>
            ${REEL_SUBJECT_IDS.includes(subject.id) ? `<li><a href="../reels/?subject=${subject.id}">Quick Reels</a></li>` : ''}
            ${subject.id === 'bi' ? `<li><a href="cheat-sheet.html">&#x1F4CB; Cheat Sheet</a></li>` : ''}
            <li><a href="../_syllabus/${(SYLLABUS_FILES[subject.code] || '').replace(/\.md$/i, '')}/" target="_blank">Syllabus</a></li>
          </ul>
        </section>
      </article>
    </main>
  </div>

  <script>
    window.toggleSidebar = function() {
      const sb = document.getElementById('sidebar');
      if (sb) sb.classList.toggle('open');
    };
    window.closeSidebar = function() {
      const sb = document.getElementById('sidebar');
      if (sb) sb.classList.remove('open');
    };
    document.querySelectorAll('.sidebar-content a').forEach(link => {
      link.addEventListener('click', () => closeSidebar());
    });

    // Theme toggle
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) themeBtn.classList.toggle('is-dark', savedTheme === 'dark');

    window.toggleTheme = function() {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      const themeBtn = document.querySelector('.theme-toggle');
      if (themeBtn) themeBtn.classList.toggle('is-dark', next === 'dark');
    };

    // Trailing slash redirect for subject index pages
    const subjectIndexRegex = new RegExp('^/(bi|de|cloud|entrepreneurship)$');
    if (subjectIndexRegex.test(window.location.pathname)) {
      window.location.href = window.location.pathname + '/';
    }
  </script>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Rail: today -> the last paper. Built once at build time so the page still
// reads correctly without JavaScript; the inline script then upgrades it.
// ---------------------------------------------------------------------------
function parseIsoLocal(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function isoLocal(date) {
  return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
}

function nextDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
}

function railGeometry() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const first = parseIsoLocal(EXAM_ROUTINE[0].iso);
  const end = parseIsoLocal(RAIL_STOPS[RAIL_STOPS.length - 1].iso);
  const start = today < first ? today : first;
  const span = Math.max(1, end - start);
  const frac = d => Math.min(100, Math.max(0, ((d - start) / span) * 100));
  const isoFrac = iso => frac(parseIsoLocal(iso));

  // One tick per real day, so the distance between stations stays truthful.
  const tickStops = new Map(RAIL_STOPS.map(stop => [stop.iso, stop]));
  const ticks = [];
  let lastMonth = -1;
  for (let d = new Date(start); d <= end; d = nextDay(d)) {
    const changed = d.getMonth() !== lastMonth;
    lastMonth = d.getMonth();
    const stop = tickStops.get(isoLocal(d));
    ticks.push({
      left: frac(d),
      iso: isoLocal(d),
      kind: stop ? (stop.isMovie ? 'movie' : 'exam') : 'day',
      color: stop?.color || '#0f172a',
      label: changed
        ? d.toLocaleDateString('en-US', { month: 'short' }) + ' ' + d.getDate()
        : String(d.getDate()),
    });
  }

  // Bare track between stops = the free days the student can still use.
  const stopIsos = new Set(RAIL_STOPS.map(s => s.iso));
  const gaps = [];
  let run = [];
  const flush = () => {
    if (!run.length) return;
    const a = run[0];
    const b = run[run.length - 1];
    gaps.push({
      left: (frac(a) + frac(b)) / 2,
      iso: isoLocal(a),
      from: isoLocal(a),
      to: isoLocal(b),
      label: run.length === 1
        ? a.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : a.getDate() + '\u2013' + b.getDate(),
    });
    run = [];
  };
  for (let d = new Date(first); d < end; d = nextDay(d)) {
    if (stopIsos.has(isoLocal(d))) flush();
    else run.push(new Date(d));
  }
  flush();

  return { fNow: frac(today), isoFrac, ticks, gaps };
}

function routePathD(points) {
  if (!points.length) return '';
  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    const dx = (b.x - a.x) * 0.42;
    d += ` C ${(a.x + dx).toFixed(1)} ${a.y.toFixed(1)}, ${(b.x - dx).toFixed(1)} ${b.y.toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
  }
  return d;
}

function stationIslandSvg(stop) {
  if (stop.isMovie) {
    return `<svg viewBox="0 0 120 76" aria-hidden="true" focusable="false">
          <ellipse cx="60" cy="66" rx="55" ry="10" fill="#fff" fill-opacity=".78"/>
          <path d="M13 62 Q25 42 60 42 Q95 42 107 62 Q60 72 13 62Z" fill="#f2d28b" stroke="#1e293b" stroke-width="2.2" stroke-linejoin="round"/>
          <path d="M27 53 Q43 38 72 44 Q86 47 91 55 Q59 61 27 53Z" fill="#4ade80" stroke="#1e293b" stroke-width="1.5"/>
          <path d="M37 52 Q30 30 42 16" fill="none" stroke="#7c4a2d" stroke-width="4" stroke-linecap="round"/>
          <path d="M42 16 Q25 8 22 21 Q33 17 42 16Z M42 16 Q36 1 49 3 Q46 11 42 16Z M42 16 Q57 4 62 15 Q51 12 42 16Z M42 16 Q56 21 52 31 Q47 22 42 16Z" fill="#22c55e" stroke="#1e293b" stroke-width="1.2" stroke-linejoin="round"/>
          <g transform="translate(73 48)">
            <rect x="-9" y="-5" width="18" height="11" rx="2" fill="#b45309" stroke="#1e293b" stroke-width="1.4"/>
            <path d="M-9 -2 Q0 -8 9 -2" fill="#f59e0b" stroke="#1e293b" stroke-width="1.4"/>
            <rect x="-2" y="-3" width="4" height="4" rx="1" fill="#fde047"/>
          </g>
        </svg>`;
  }
  return `<svg viewBox="0 0 100 70" aria-hidden="true" focusable="false">
        <ellipse cx="50" cy="61" rx="42" ry="9" fill="#fff" fill-opacity=".74"/>
        <path d="M10 57 Q19 39 50 38 Q81 39 90 57 Q50 66 10 57Z" fill="#f2d28b" stroke="#1e293b" stroke-width="2" stroke-linejoin="round"/>
        <path d="M18 52 Q22 42 31 44 Q36 37 43 48Z" fill="#22c55e" stroke="#1e293b" stroke-width="1.3" stroke-linejoin="round"/>
        <path d="M51 46 L51 8" stroke="#1e293b" stroke-width="2.4" stroke-linecap="round"/>
        <path d="M51 8 L72 16 L51 24Z" fill="currentColor" stroke="#1e293b" stroke-width="1.5" stroke-linejoin="round"/>
      </svg>`;
}

function railStationHtml(stop, left, row) {
  const when = parseIsoLocal(stop.iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const names = stop.isMovie
    ? stop.view.map(n => `<span class="station-code">${n}</span>`).join('')
    : `<span class="station-name" style="color:${stop.color}">${stop.railName || stop.code}</span>`;
  const kind = stop.isMovie ? '<span class="station-kind">Post-exam films</span>' : '';
  const inner = `
        <span class="station-card">
          ${kind}${names}
          <span class="station-when">${when}</span>
        </span>
        <span class="station-dot" style="color:${stop.color || '#0f172a'}" aria-hidden="true">${stationIslandSvg(stop)}</span>`;
  const cls = 'rail-station ' + (stop.isMovie ? 'is-movie' : 'is-ours') + (row % 2 ? ' row-b' : '');
  const attrs = `class="${cls}" style="left:${left}%;color:${stop.color || '#0f172a'}" data-iso="${stop.iso}" title="${stop.title}" aria-label="${stop.title}, ${when}"`;
  return stop.subjectId
    ? `<a ${attrs} href="${stop.subjectId}/">${inner}
      </a>`
    : `<div role="group" ${attrs}>${inner}
      </div>`;
}

function railTravellerHtml(left, { id = 'traveller', className = 'rail-traveller' } = {}) {
  return `
        <div class="${className}" id="${id}" data-route-left="${left}" aria-hidden="true">
          <span class="ship-wrap">
            <span class="speed-lines"><i></i><i></i><i></i></span>
            <svg class="ship" viewBox="0 0 260 118" width="560" height="254" focusable="false">
            <!-- rigging -->
            <g stroke="var(--fg)" stroke-width="0.8" opacity="0.48" fill="none">
              <path d="M104 10 L30 76"/>
              <path d="M104 10 L236 78"/>
              <path d="M168 32 L238 80"/>
              <path d="M168 32 L74 76"/>
              <path d="M104 12 L168 32"/>
              <path d="M108 18 L150 39"/>
              <path d="M172 38 L205 59"/>
              <path d="M78 74 L153 70"/>
            </g>

            <!-- Jolly Roger at the main masthead -->
            <path d="M107 8 L139 14 L132 32 L107 28 Z" fill="#111827" stroke="var(--fg)" stroke-width="1"/>
            <path d="M108 10 L137 15 L134 18 L108 14 Z" fill="#f8fafc" opacity="0.18"/>
            <g transform="translate(118 19) scale(0.5)">
              <g stroke="#f8fafc" stroke-width="3" stroke-linecap="round">
                <line x1="-12" y1="-10" x2="12" y2="10"/>
                <line x1="-12" y1="10" x2="12" y2="-10"/>
              </g>
              <ellipse cx="0" cy="-2" rx="7" ry="6.4" fill="#f8fafc"/>
              <rect x="-4" y="1.6" width="8" height="5" rx="1.8" fill="#f8fafc"/>
              <circle cx="-2.8" cy="-2.4" r="2" fill="#111827"/>
              <circle cx="2.8" cy="-2.4" r="2" fill="#111827"/>
              <polygon points="0,0.4 -1.6,2.8 1.6,2.8" fill="#111827"/>
            </g>

            <!-- masts + bowsprit -->
            <rect x="102.2" y="6" width="3.6" height="72" rx="1.2" fill="#78350f" stroke="var(--fg)" stroke-width="1"/>
            <rect x="166.6" y="30" width="2.8" height="48" rx="1" fill="#78350f" stroke="var(--fg)" stroke-width="1"/>
            <path d="M228 74 L252 60" stroke="#78350f" stroke-width="3" stroke-linecap="round"/>
            <path d="M228 74 L252 60" stroke="#b45309" stroke-width="1" stroke-linecap="round"/>
            <path d="M96 17 L112 17 M96 21 L112 21 M161 39 L172 39 M161 43 L172 43" stroke="#d6a15f" stroke-width="0.8" opacity="0.65"/>

            <!-- sails -->
            <rect x="76" y="34" width="58" height="3" rx="1.2" fill="#92400e" stroke="var(--fg)" stroke-width="0.8"/>
            <path d="M78 37 Q104 43 130 37 L130 72 Q104 76 78 72 Z" fill="#f8f1e0" stroke="var(--fg)" stroke-width="1.2"/>
            <path d="M89 39 Q94 55 90 73 M116 39 Q112 56 116 74" fill="none" stroke="#b79a6b" stroke-width="0.65" opacity="0.65"/>
            <g transform="translate(104 54) scale(0.62)">
              <g stroke="#1f2937" stroke-width="3" stroke-linecap="round">
                <line x1="-12" y1="-10" x2="12" y2="10"/>
                <line x1="-12" y1="10" x2="12" y2="-10"/>
              </g>
              <ellipse cx="0" cy="-2" rx="7" ry="6.4" fill="#1f2937"/>
              <rect x="-4" y="1.6" width="8" height="5" rx="1.8" fill="#1f2937"/>
              <circle cx="-2.8" cy="-2.4" r="2" fill="#f8f1e0"/>
              <circle cx="2.8" cy="-2.4" r="2" fill="#f8f1e0"/>
            </g>
            <rect x="150" y="40" width="38" height="2.8" rx="1.1" fill="#92400e" stroke="var(--fg)" stroke-width="0.8"/>
            <path d="M152 43 Q169 47 186 43 L186 70 Q169 73 152 70 Z" fill="#f8f1e0" stroke="var(--fg)" stroke-width="1.2"/>
            <path d="M160 45 Q163 57 159 71 M178 45 Q176 58 180 72" fill="none" stroke="#b79a6b" stroke-width="0.6" opacity="0.65"/>
            <path d="M234 70 L250 62 L244 44 Z" fill="#f8f1e0" stroke="var(--fg)" stroke-width="1.1"/>

            <!-- stern castle -->
            <path d="M26 76 L26 58 L62 58 L62 64 L82 64 L82 76 Z" fill="var(--accent-hover)" stroke="var(--fg)" stroke-width="1.4"/>
            <path d="M28 59 L60 59" stroke="#f3e3c3" stroke-width="1" opacity="0.45"/>
            <rect x="32" y="62" width="8" height="7" rx="1.4" fill="#f3e3c3"/>
            <rect x="46" y="62" width="8" height="7" rx="1.4" fill="#f3e3c3"/>
            <rect x="60" y="65" width="7" height="6" rx="1.2" fill="#f3e3c3"/>
            <path d="M70 64 L79 64" stroke="#f3e3c3" stroke-width="1" opacity="0.7"/>

            <!-- hull -->
            <path d="M24 76 L24 92 Q24 106 50 106 L152 106 Q196 106 228 80 L218 74 Z" fill="var(--accent)" stroke="var(--fg)" stroke-width="1.8"/>
            <path d="M26 89 L218 86" stroke="var(--fg)" stroke-width="0.8" opacity="0.35"/>
            <path d="M31 93 C62 91 93 92 121 90 C153 88 183 86 211 83" fill="none" stroke="var(--fg)" stroke-width="0.55" opacity="0.3"/>
            <path d="M44 102 C75 103 104 103 134 101" fill="none" stroke="var(--fg)" stroke-width="0.55" opacity="0.22"/>
            <g fill="#fbbf24" stroke="var(--fg)" stroke-width="1">
              <circle cx="48" cy="96" r="3.6"/>
              <circle cx="74" cy="96" r="3.6"/>
              <circle cx="100" cy="96" r="3.6"/>
              <circle cx="126" cy="96" r="3.6"/>
              <circle cx="152" cy="96" r="3.6"/>
            </g>
            <g fill="#111827" opacity="0.45">
              <circle cx="48" cy="96" r="1.2"/>
              <circle cx="74" cy="96" r="1.2"/>
              <circle cx="100" cy="96" r="1.2"/>
              <circle cx="126" cy="96" r="1.2"/>
              <circle cx="152" cy="96" r="1.2"/>
            </g>

            <!-- deck anchor -->
            <g stroke="var(--fg)" stroke-width="1.6" fill="none" stroke-linecap="round">
              <path d="M140 60 L140 74"/>
              <path d="M135 68 Q140 77 145 68"/>
              <circle cx="140" cy="58.5" r="2.2"/>
            </g>

            <!-- sun-wheel figurehead -->
            <g class="ship-figurehead">
              <g stroke="#f97316" stroke-width="2.2" stroke-linecap="round">
                <path d="M231 60 L231 82 M220 71 L242 71 M223 63 L239 79 M239 63 L223 79"/>
              </g>
              <circle cx="231" cy="71" r="7.2" fill="#f97316" stroke="var(--fg)" stroke-width="1.4"/>
              <circle cx="228.5" cy="69.5" r="1" fill="var(--fg)"/>
              <circle cx="233.5" cy="69.5" r="1" fill="var(--fg)"/>
              <ellipse cx="231" cy="73.5" rx="2.6" ry="2" fill="#fff7ed" stroke="var(--fg)" stroke-width="0.7"/>
            </g>

            <!-- foam at the waterline -->
            <g fill="none" stroke="var(--accent)" stroke-linecap="round">
              <path d="M14 110 q11-5 22 0 t22 0 t22 0 t22 0 t22 0 t22 0 t22 0 t22 0 t22 0 t22 0" stroke-width="2" opacity="0.6"/>
              <path d="M30 116 q12-4 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 t24 0" stroke-width="1.6" opacity="0.45"/>
              <path d="M4 107 q8-3 16 0" stroke-width="1.2" opacity="0.42"/>
              <path d="M238 108 q8-3 16 0" stroke-width="1.2" opacity="0.42"/>
            </g>
          </svg>
            <svg class="ship-reflection" viewBox="0 106 260 34" width="560" height="73" focusable="false" aria-hidden="true">
              <g opacity="0.2">
                <g transform="translate(0 212) scale(1 -1)">
                  <path d="M24 76 L24 92 Q24 106 50 106 L152 106 Q196 106 228 80 L218 74 Z" fill="var(--accent)"/>
                </g>
              </g>
              <g stroke="rgba(255,255,255,0.42)" stroke-width="1.2" stroke-linecap="round" fill="none">
                <path d="M32 113 h46"/>
                <path d="M98 116 h54"/>
                <path d="M58 123 h72"/>
                <path d="M146 128 h44"/>
                <path d="M88 133 h58"/>
              </g>
            </svg>
            <span class="traveller-tag">Today</span>
          </span>
        </div>`;
}

// A rolling wave band. The path is drawn wider than the viewport so the layer
// can slide one screen-width and still cover the view.
//
// Every half-wavelength is the same quadratic (one crest, then one trough), so
// the curve is smooth and has no kink, and the path ends exactly on a whole
// number of wavelengths. The drift animation moves the layer by 1200 user
// units, which is a multiple of every wavelength used here, so the loop lands
// back on the same phase: no seam at the right edge.
function waveBandPath(x0, x1, wavelength, baseY, amp) {
  const half = wavelength / 2;
  const end = x0 + Math.round((x1 - x0) / wavelength) * wavelength;
  let d = `M ${x0} ${baseY}`;
  let x = x0;
  let dir = -1;
  while (x < end - 0.001) {
    const nx = Math.min(x + half, end);
    const cx = (x + nx) / 2;
    d += ` Q ${cx.toFixed(1)} ${(baseY + dir * amp).toFixed(1)} ${nx.toFixed(1)} ${baseY}`;
    x = nx;
    dir = -dir;
  }
  return `${d} V 800 H ${x0} Z`;
}

// The ocean is a fixed viewport backdrop: sky, horizon, then four depth layers
// of drifting waves. Page content scrolls on top of it.
function oceanHtml() {
  const X0 = -1200, X1 = 2400;
  const layers = [
    { cls: 'oc-wave-1', wave: 120, base: 338, amp: 5 },
    { cls: 'oc-wave-2', wave: 240, base: 366, amp: 11 },
    { cls: 'oc-wave-3', wave: 400, base: 428, amp: 24 },
    { cls: 'oc-wave-4', wave: 600, base: 545, amp: 46 },
  ];
  const bands = layers.map(l =>
    `<g class="oc-layer ${l.cls}"><path d="${waveBandPath(X0, X1, l.wave, l.base, l.amp)}"/></g>`
  ).join('\n        ');

  return `
  <div class="ocean" aria-hidden="true">
    <svg class="ocean-art" viewBox="0 0 1200 800" preserveAspectRatio="none" focusable="false">
      <defs>
        <linearGradient id="ocSky" x1="0" y1="0" x2="0" y2="1">
          <stop class="oc-stop-top" offset="0"/>
          <stop class="oc-stop-haze" offset="0.41"/>
        </linearGradient>
        <linearGradient id="ocSea" x1="0" y1="0" x2="0" y2="1">
          <stop class="oc-stop-sea-top" offset="0"/>
          <stop class="oc-stop-sea-deep" offset="1"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="800" fill="url(#ocSky)"/>
      <rect y="330" width="1200" height="470" fill="url(#ocSea)"/>
      ${bands}
      <path class="oc-horizon" d="M 0 330 H 1200"/>
    </svg>
    <svg class="beach-art" viewBox="0 0 1600 140" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <path d="M0 12 Q180 0 360 12 T720 9 T1080 13 T1440 8 L1600 11 L1600 140 L0 140Z" fill="#fff" fill-opacity=".78"/>
      <path d="M0 24 Q190 10 380 23 T760 20 T1140 24 T1520 18 L1600 22 L1600 140 L0 140Z" fill="#d2a460"/>
      <path d="M0 48 Q210 34 420 46 T840 43 T1260 47 T1600 40 L1600 140 L0 140Z" fill="#f2d28b"/>
      <g fill="#c28e46" opacity=".42">
        <circle cx="240" cy="98" r="2.2"/><circle cx="258" cy="110" r="1.6"/>
        <circle cx="590" cy="126" r="2.2"/><circle cx="1010" cy="132" r="1.8"/>
        <circle cx="1390" cy="122" r="2.2"/>
      </g>
      <g id="beach-left-props">
        <path d="M-5 140 L-5 94 Q25 80 54 96 Q74 108 78 140Z" fill="#94a3b8" stroke="#1e293b" stroke-width="2"/>
        <path d="M42 140 Q48 110 76 108 Q98 110 105 140Z" fill="#64748b" stroke="#1e293b" stroke-width="2"/>
        <g fill="none" stroke="#65a30d" stroke-width="3" stroke-linecap="round">
          <path d="M18 96 Q8 64 -2 54"/><path d="M24 94 Q24 62 30 48"/><path d="M30 96 Q40 68 52 58"/>
        </g>
        <path d="M142 111 L146 119 L155 120 L148 126 L150 135 L142 130 L134 135 L136 126 L129 120 L138 119Z" fill="#f97316" stroke="#1e293b" stroke-width="1.4" stroke-linejoin="round"/>
        <path d="M186 124 Q194 114 202 124 Q194 130 186 124Z" fill="#fef3c7" stroke="#1e293b" stroke-width="1.3"/>
      </g>
      <g id="beach-right-props">
        <path d="M1528 140 Q1536 108 1565 102 Q1590 100 1605 112 L1605 140Z" fill="#64748b" stroke="#1e293b" stroke-width="2"/>
        <g fill="#16a34a" stroke="#1e293b" stroke-width="1.6" stroke-linejoin="round">
          <path d="M1600 110 Q1558 72 1534 86 Q1564 96 1600 110Z"/>
          <path d="M1600 105 Q1568 54 1548 58 Q1572 82 1600 105Z"/>
          <path d="M1600 102 Q1588 48 1574 42 Q1586 74 1600 102Z"/>
        </g>
      </g>
    </svg>
    <span class="oc-cloud oc-cloud-one" aria-hidden="true"></span>
    <span class="oc-cloud oc-cloud-two" aria-hidden="true"></span>
    <span class="oc-cloud oc-cloud-three" aria-hidden="true"></span>
    <span class="oc-sun"></span>
    <svg class="oc-birds" viewBox="0 0 140 52" width="140" height="52" focusable="false" aria-hidden="true">
      <g class="bird bird--one">
        <path d="M 10 26 q 9 -8 18 0 q 9 -8 18 0"/>
      </g>
      <g class="bird bird--two">
        <path d="M 64 48 q 7 -6 14 0 q 7 -6 14 0"/>
      </g>
      <g class="bird bird--three">
        <path d="M 110 18 q 5 -5 10 0 q 5 -5 10 0"/>
      </g>
    </svg>
  </div>`;
}

function railHeroHtml(rail) {
  const left = rail.fNow.toFixed(3);
  const routePoints = [
    { x: rail.fNow * 1000, y: 330 },
    ...RAIL_STOPS.map((stop, index) => ({
      x: rail.isoFrac(stop.iso) * 1000,
      y: index % 2 ? 380 : 330
    }))
  ];
  return `
      <section class="rail-hero" id="timetable" aria-labelledby="timetableTitle">
        <h1 id="timetableTitle" class="sr-only">BIM 8th-semester examination timetable and study notes</h1>
        <div class="scene-stage">
          <div class="rail-mini" aria-hidden="true">
            <span class="rail-mini-line"></span>
            <span class="rail-mini-train" id="mini" style="left:${left}%"></span>
          </div>
          ${railTravellerHtml(left, { id: 'mobileTraveller', className: 'mobile-ship' })}
          <div class="rail-viewport" role="region" aria-label="Exam timetable route" tabindex="0">
            <div class="rail-track">
              <svg class="rail-route-art" viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                <path class="rail-route-trail" d="${routePathD(routePoints)}"></path>
              </svg>
              <span class="rail-origin" style="left:${left}%" aria-hidden="true">Today</span>
              ${rail.gaps.map(g => `
              <span class="rail-gap" style="left:${g.left.toFixed(3)}%" data-iso="${g.iso}" data-from="${g.from}" data-to="${g.to}">${g.label}</span>`).join('')}
              ${rail.ticks.map(t => `
              <span class="rail-tick is-${t.kind}" style="left:${t.left.toFixed(3)}%;--tick-color:${t.color}" data-iso="${t.iso}"><i></i><em>${t.label}</em></span>`).join('')}
              ${RAIL_STOPS.map((s, i) => railStationHtml(s, rail.isoFrac(s.iso).toFixed(3), i)).join('')}
            </div>
          </div>
          ${railTravellerHtml(left)}
          <span class="rail-scroll-cue" aria-hidden="true">Scroll the route &rarr;</span>
        </div>
        <span class="sr-only">Exam routine: Dean's Office, 2083/07/28. The voyage ends at the films: Dune: Part Three and Avengers: Doomsday, both 18 December 2026.</span>
      </section>`;
}

// Short wheel labels. The full official unit title is always shown after a spin.
const WHEEL_LABELS = {
  bi: {
    1: 'Intro to BI', 2: 'Data Warehousing', 3: 'Data Mining',
    4: 'Data Visualization', 5: 'BI Tools & Tech', 6: 'BI Implementation'
  },
  de: {
    1: 'Digital Econ. Intro', 2: 'Digital Econ. Basics', 3: 'Digital Markets',
    4: 'Digital Transform.', 5: 'Info Economics', 6: 'Nepal Perspective'
  },
  cloud: {
    1: 'Intro to Cloud', 2: 'Cloud Architecture', 3: 'Cloud Applications',
    4: 'Virtualization', 5: 'MapReduce', 6: 'Cloud Security', 7: 'Cloud Platforms'
  },
  entrepreneurship: {
    1: 'Foundations', 2: 'Idea & Market', 3: 'Business Model',
    4: 'Legal & Compliance', 5: 'Finance & Marketing', 6: 'Leadership & CSR'
  }
};

function wheelLabel(subjectId, unit) {
  const custom = (WHEEL_LABELS[subjectId] || {})[unit.num];
  if (custom) return custom;
  const t = unit.title.replace(/^Introduction to /, 'Intro to ');
  return t.length <= 19 ? t : t.slice(0, 18).trimEnd() + '…';
}

// One slice per unit, grouped by subject colour. The wheel is the button.
function spinWheelHtml() {
  const slices = [];
  SUBJECT_ORDER.forEach(s => {
    const label = (getSubjectExam(s.id) || {}).short || s.name;
    s.units.forEach(u => slices.push({ subject: s.id, subjectName: label, color: s.color, num: u.num, title: u.title, label: wheelLabel(s.id, u) }));
  });
  const n = slices.length;
  const step = 360 / n;
  const R = 84, C = 100;
  const segments = slices.map((slice, i) => {
    const rad = a => a * Math.PI / 180;
    const pt = a => [C + R * Math.cos(rad(a - 90)), C + R * Math.sin(rad(a - 90))];
    const [x0, y0] = pt(i * step);
    const [x1, y1] = pt((i + 1) * step);
    const d = `M ${C} ${C} L ${x0.toFixed(2)} ${y0.toFixed(2)} A ${R} ${R} 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
    const mid = i * step + step / 2;
    const flip = mid < 180 ? ` rotate(180 ${C} 50)` : '';
    const text = slice.label.replace(/&/g, '&amp;');
    return `<path d="${d}" fill="${slice.color}" stroke="var(--card-bg)" stroke-width="0.6"/>
          <text x="${C}" y="50" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-size="5.2" font-weight="700" transform="rotate(${mid.toFixed(2)} ${C} ${C}) rotate(90 ${C} 50)${flip}">${text}</text>`;
  }).join('');
  const legend = SUBJECT_ORDER.map(s => {
    const label = (getSubjectExam(s.id) || {}).short || s.name;
    return `<li><i style="background:${s.color}"></i>${label.replace(/&/g, '&amp;')}</li>`;
  }).join('');

  return `
      <section class="spin-section" id="spin" aria-labelledby="spinTitle">
        <h2 id="spinTitle" class="section-title">What should I study?</h2>
        <p class="spin-kicker">Spin the wheel &mdash; the map chooses your unit.</p>
        <div class="spin-layout">
          <div class="wheel-stage">
            <span class="wheel-pointer" aria-hidden="true">
              <svg viewBox="0 0 24 34" width="26" height="37" focusable="false">
                <rect x="10.4" y="0" width="3.2" height="6" rx="1.6" fill="#78350f" stroke="#1a1a2e" stroke-width="1"/>
                <rect x="4" y="5" width="16" height="3.2" rx="1.6" fill="#b45309" stroke="#1a1a2e" stroke-width="1"/>
                <path d="M12 33 C9.3 23 8.9 12 9.7 8 L14.3 8 C15.1 12 14.7 23 12 33 Z" fill="#e2e8f0" stroke="#1a1a2e" stroke-width="1"/>
              </svg>
            </span>
            <button class="wheel-wrap" id="spinBtn" type="button" aria-label="Spin the wheel to pick a unit">
              <svg class="wheel" id="wheel" viewBox="0 0 200 200" focusable="false" aria-hidden="true" style="transform:rotate(${(-180 / n).toFixed(2)}deg)">
                ${segments}
                <!-- wooden rim with a rope binding -->
                <circle cx="100" cy="100" r="85" fill="none" stroke="#7c4a1d" stroke-width="5"/>
                <circle cx="100" cy="100" r="87.5" fill="none" stroke="#a9743a" stroke-width="1.2" opacity="0.9"/>
                <circle cx="100" cy="100" r="82" fill="none" stroke="#e0bc82" stroke-width="1.3" stroke-dasharray="3 4" opacity="0.9"/>
                <!-- Jolly Roger hub -->
                <circle cx="100" cy="100" r="16" fill="#111827" stroke="#7c4a1d" stroke-width="2"/>
                <g transform="translate(100 100)">
                  <g stroke="#f8fafc" stroke-width="2.8" stroke-linecap="round">
                    <line x1="-11" y1="-9" x2="11" y2="9"/>
                    <line x1="-11" y1="9" x2="11" y2="-9"/>
                  </g>
                  <ellipse cx="0" cy="-1.5" rx="6.4" ry="6" fill="#f8fafc"/>
                  <rect x="-3.6" y="1.6" width="7.2" height="4.4" rx="1.6" fill="#f8fafc"/>
                  <circle cx="-2.6" cy="-2" r="1.8" fill="#111827"/>
                  <circle cx="2.6" cy="-2" r="1.8" fill="#111827"/>
                  <polygon points="0,0.6 -1.5,2.6 1.5,2.6" fill="#111827"/>
                  <g stroke="#111827" stroke-width="0.8">
                    <line x1="-2.6" y1="2.6" x2="-2.6" y2="5.2"/>
                    <line x1="0" y1="2.6" x2="0" y2="5.2"/>
                    <line x1="2.6" y1="2.6" x2="2.6" y2="5.2"/>
                  </g>
                </g>
              </svg>
            </button>
          </div>
          <div class="spin-panel">
            <ul class="wheel-legend" aria-hidden="true">${legend}</ul>
            <button class="sound-btn" id="soundBtn" type="button" aria-pressed="false">Sound off</button>
            <p class="spin-result" id="spinResult" aria-live="polite"><span id="spinSubject">Tap the wheel to pick today's unit.</span><span class="spin-unit" id="spinUnit"></span></p>
            <a class="spin-link" id="spinLink" href="#" hidden>Open the unit &rarr;</a>
          </div>
        </div>

        <dialog class="spin-modal" id="spinModal" aria-labelledby="spinModalTitle">
          <div class="spin-modal-body">
            <button class="spin-modal-x" id="spinModalClose" type="button" aria-label="Close">&times;</button>
            <span class="spin-modal-kicker"><svg class="spin-modal-skull" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" focusable="false"><path d="M8 1a5 5 0 0 1 5 5v2.2l-1.4 1.3V12H7.6v1.6H6.4V12H4.4V9.5L3 8.2V6a5 5 0 0 1 5-5Z" fill="currentColor"/><circle cx="6" cy="6" r="1.4" fill="var(--card-bg)"/><circle cx="10" cy="6" r="1.4" fill="var(--card-bg)"/></svg>Today's pick</span>
            <h3 class="spin-modal-title" id="spinModalTitle"><i id="spinModalDot"></i><span id="spinModalSubject">Subject</span></h3>
            <p class="spin-modal-unit"><strong id="spinModalNum">Unit 1</strong><span id="spinModalUnit">Unit title</span></p>
            <div class="spin-modal-actions">
              <a class="spin-modal-open" id="spinModalLink" href="#">Open the unit &rarr;</a>
              <button class="spin-modal-again" id="spinModalAgain" type="button">Spin again</button>
            </div>
          </div>
        </dialog>
      </section>`;
}

function generateMainIndexHtml() {
  const rail = railGeometry();
  const initialNext = getNextExam();
  const initialCode = initialNext ? initialNext.code : 'Done';
  const initialCodeColor = initialNext ? initialNext.color : 'var(--fg-muted)';
  const initialDays = initialNext ? daysUntil(initialNext.iso) : 0;
  const initialCountdown = initialNext
    ? (initialDays === 0 ? 'Today' : initialDays === 1 ? '1 day' : `${initialDays} days`)
    : 'Done';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>BIM 8th Semester Exam Timetable & Study Notes</title>
  <meta name="description" content="BIM 8th-semester examination timetable and study notes for Business Intelligence, Digital Economy, Cloud Computing and IT Entrepreneurship.">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="manifest" href="/site.webmanifest">
  <meta name="theme-color" content="#2563eb">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..600&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="styles.css">
</head>
<body class="home-page">
  ${oceanHtml()}
  <header class="site-header">
    <div class="header-content">
      <a class="site-title" href="./">Worst Generation</a>
      <nav class="site-nav" id="siteNav" aria-label="Sections">
        <a href="#timetable">Timetable</a>
        <a href="#subjects">Notes</a>
        <a href="#pattern">Exam pattern</a>
        <a href="reels/">Quick Reels</a>
        <a href="bi/cheat-sheet.html">BI cheat sheet</a>
      </nav>
      <span class="header-clock" id="headerClock" aria-live="off">
        <span class="clock-code" id="htCode" style="color:${initialCodeColor}">${initialCode}</span>
        <span class="clock-val" id="htVal">${initialCountdown}</span>
      </span>
      <button class="theme-toggle" aria-label="Toggle theme" onclick="toggleTheme()"><svg class="icon-moon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12.3 3a9 9 0 1 0 8.7 11.4A7.5 7.5 0 0 1 12.3 3z"/></svg><svg class="icon-sun" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="currentColor"/><g stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6"/></g></svg></button>
      <button class="mobile-nav-toggle" type="button" aria-label="Open navigation" aria-controls="siteNav" aria-expanded="false">
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
      </button>
    </div>
  </header>

  <div class="layout">
    <main class="content home-scroll" role="main">
      ${railHeroHtml(rail)}
      ${spinWheelHtml()}

      <section class="doors" id="subjects" aria-labelledby="doorsTitle">
        <div class="section-head">
          <h2 id="doorsTitle" class="section-title">Open your notes</h2>
          <p class="section-meta">4 papers &middot; 25 units &middot; 320 marks &middot; exams 1&ndash;10 December 2026</p>
        </div>
        <ul class="doors-list">
          ${SUBJECT_ORDER.map(s => {
            const ex = getSubjectExam(s.id);
            return `
            <li class="door" style="--door-color: ${s.color}">
              <div class="door-head">
                <span class="door-code">${s.code}</span>
                <span class="door-name">${s.name}</span>
              </div>
              <p class="door-meta">${s.units.length} units &middot; ${s.marks} marks &middot; pass ${s.passMarks}${ex ? ` <span class="subject-exam door-exam" data-iso="${ex.iso}" data-label="${formatExamDate(ex.iso).replace(/, 2026$/, '')}">${formatExamDate(ex.iso).replace(/, 2026$/, '')}</span>` : ''}</p>
              <div class="door-actions">
                <a class="door-primary" href="${s.id}/">Open notes</a>
                <div class="door-links">
                  <a href="${s.id}/question-bank.html">Question bank</a>
                  <a href="${s.id}/model-question-answers.html">Model answers</a>
                  ${s.id === 'entrepreneurship' ? `<a href="${s.id}/board-paper-2026.html">Board 2026</a>` : ''}
                  ${REEL_SUBJECT_IDS.includes(s.id) ? `<a href="reels/?subject=${s.id}">Quick Reels</a>` : ''}
                  ${s.id === 'bi' ? '<a href="bi/cheat-sheet.html">Cheat sheet</a>' : ''}
                </div>
              </div>
            </li>`;
          }).join('')}
        </ul>
      </section>

      <section class="pattern" id="pattern" aria-labelledby="patternTitle">
        <div class="section-head">
          <h2 id="patternTitle" class="section-title">Exam paper blueprint</h2>
        </div>
        <div class="pattern-grid">
          <div class="marks-block">
            <div class="marks-scroll">
              <table class="marks-table">
                <thead>
                  <tr><th scope="col">Paper</th><th scope="col">Code</th><th scope="col">Full</th><th scope="col">Pass</th><th scope="col">Groups</th></tr>
                </thead>
                <tbody>
                  <tr><td>Business Intelligence</td><td>IT 249</td><td>60</td><td><strong>30</strong></td><td>A:10&times;1, B:5&times;3, C:3&times;5, D:2&times;10</td></tr>
                  <tr><td>Digital Economy</td><td>IT 250</td><td>100</td><td><strong>50</strong></td><td>A:10&times;2, B:6&times;5, C:3&times;10, D:1&times;20</td></tr>
                  <tr><td>Cloud Computing</td><td>IT 277</td><td>60</td><td><strong>30</strong></td><td>A:10&times;1, B:5&times;3, C:3&times;5, D:2&times;10</td></tr>
                  <tr><td>IT Entrepreneurship</td><td>IT 248</td><td>100</td><td><strong>50</strong></td><td>A:10&times;2, B:6&times;5, C:3&times;10, D:1&times;20</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <div class="rules-block">
            <h3>Before you enter the exam hall</h3>
            <ul class="rules-list">
              ${EXAM_NOTES.map(note => `<li>${note}</li>`).join('')}
            </ul>
          </div>
        </div>
      </section>

      <footer class="page-foot">
        <div class="foot-brand">
          <strong>Worst Generation</strong>
          <p>Routine source: Dean's Office, 2083/07/28. Centre: ${EXAM_CENTRE}.</p>
        </div>
        <button class="foot-btn" onclick="window.print()">Print this page</button>
      </footer>

    </main>
  </div>

  <script>
    window.toggleSidebar = function() {
      const sb = document.getElementById('sidebar');
      if (sb) sb.classList.toggle('open');
    };
    window.closeSidebar = function() {
      const sb = document.getElementById('sidebar');
      if (sb) sb.classList.remove('open');
    };
    document.querySelectorAll('.sidebar-content a').forEach(link => {
      link.addEventListener('click', () => closeSidebar());
    });

    // Theme toggle
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    const themeBtn = document.querySelector('.theme-toggle');
    if (themeBtn) themeBtn.classList.toggle('is-dark', savedTheme === 'dark');

    window.toggleTheme = function() {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      const themeBtn = document.querySelector('.theme-toggle');
      if (themeBtn) themeBtn.classList.toggle('is-dark', next === 'dark');
    };

    // Compact mobile navigation. The same semantic nav becomes a short menu
    // below the header; it never becomes a sidebar.
    (function () {
      const toggle = document.querySelector('.mobile-nav-toggle');
      const nav = document.getElementById('siteNav');
      if (!toggle || !nav) return;
      const setOpen = (open) => {
        nav.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      };
      toggle.addEventListener('click', () => {
        setOpen(toggle.getAttribute('aria-expanded') !== 'true');
      });
      nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => setOpen(false));
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
          setOpen(false);
          toggle.focus();
        }
      });
    })();

    // One clock drives the rail, the header readout and the sidebar. Films are
    // only the far end of the line; the header still counts exam papers.
    const EXAM_ROUTINE_JS = ${JSON.stringify(EXAM_ROUTINE)};
    const RAIL_STOPS_JS = ${JSON.stringify(RAIL_STOPS)};
    const RAIL_LAST_ISO = ${JSON.stringify(RAIL_STOPS[RAIL_STOPS.length - 1].iso)};
    const WHEEL_SLICES = ${JSON.stringify(SUBJECT_ORDER.flatMap(s => s.units.map(u => ({
      id: s.id,
      subject: (getSubjectExam(s.id) || {}).short || s.name,
      color: s.color,
      num: u.num,
      title: u.title,
    }))))};
    function parseLocal(iso) {
      const [y, m, d] = iso.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    function pad2(n) { return String(n).padStart(2, '0'); }
    function isoOf(date) {
      return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
    }
    const RAIL_FIRST = parseLocal(EXAM_ROUTINE_JS[0].iso);
    const RAIL_END = parseLocal(RAIL_LAST_ISO);
    function railFraction(now) {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const start = today < RAIL_FIRST ? today : RAIL_FIRST;
      return Math.min(100, Math.max(0, ((today - start) / Math.max(1, RAIL_END - start)) * 100));
    }
    function railPointFraction(iso) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const start = today < RAIL_FIRST ? today : RAIL_FIRST;
      const point = parseLocal(iso);
      return Math.min(100, Math.max(0, ((point - start) / Math.max(1, RAIL_END - start)) * 100));
    }
    function routePathD(points) {
      if (!points.length) return '';
      let d = 'M ' + points[0].x.toFixed(1) + ' ' + points[0].y.toFixed(1);
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1];
        const b = points[i];
        const dx = (b.x - a.x) * 0.42;
        d += ' C ' + (a.x + dx).toFixed(1) + ' ' + a.y.toFixed(1) + ', ' + (b.x - dx).toFixed(1) + ' ' + b.y.toFixed(1) + ', ' + b.x.toFixed(1) + ' ' + b.y.toFixed(1);
      }
      return d;
    }
    function updateRouteTrail() {
      const trail = document.querySelector('.rail-route-trail');
      if (!trail) return;
      const now = new Date();
      const todayIso = isoOf(now);
      const points = [
        { x: railPointFraction(todayIso) * 10, y: 330 },
        ...RAIL_STOPS_JS.map((stop, index) => ({
          x: railPointFraction(stop.iso) * 10,
          y: index % 2 ? 380 : 330
        }))
      ];
      trail.setAttribute('d', routePathD(points));
    }
    function nextLocalDay(date) {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    }
    function renderRailTicks(todayStart) {
      const track = document.querySelector('.rail-track');
      if (!track) return;
      const stopByIso = new Map(RAIL_STOPS_JS.map(stop => [stop.iso, stop]));
      const start = todayStart < RAIL_FIRST ? todayStart : RAIL_FIRST;
      const fragment = document.createDocumentFragment();
      let lastMonth = -1;

      for (let date = new Date(start); date <= RAIL_END; date = nextLocalDay(date)) {
        const iso = isoOf(date);
        const stop = stopByIso.get(iso);
        const monthChanged = date.getMonth() !== lastMonth;
        lastMonth = date.getMonth();
        const label = monthChanged
          ? date.toLocaleDateString('en-US', { month: 'short' }) + ' ' + date.getDate()
          : String(date.getDate());
        const tick = document.createElement('span');
        tick.className = 'rail-tick is-' + (stop ? (stop.isMovie ? 'movie' : 'exam') : 'day');
        tick.dataset.iso = iso;
        tick.style.left = railPointFraction(iso).toFixed(3) + '%';
        tick.style.setProperty('--tick-color', stop?.color || '#0f172a');
        tick.innerHTML = '<i></i><em></em>';
        tick.querySelector('em').textContent = label;
        fragment.appendChild(tick);
      }

      track.querySelectorAll('.rail-tick').forEach(el => el.remove());
      const firstStation = track.querySelector('.rail-station');
      if (firstStation) firstStation.before(fragment);
      else track.appendChild(fragment);
    }
    function updateRouteGeometry(todayStart) {
      renderRailTicks(todayStart);
      document.querySelectorAll('.rail-station[data-iso]').forEach(el => {
        el.style.left = railPointFraction(el.dataset.iso).toFixed(3) + '%';
      });
      document.querySelectorAll('.rail-gap[data-from][data-to]').forEach(el => {
        const left = (railPointFraction(el.dataset.from) + railPointFraction(el.dataset.to)) / 2;
        el.style.left = left.toFixed(3) + '%';
      });
    }
    function updateRail() {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let next = null;
      for (const e of EXAM_ROUTINE_JS) {
        if (parseLocal(e.iso) >= todayStart) { next = e; break; }
      }
      const todayIso = isoOf(now);
      const leftPct = railFraction(now).toFixed(3) + '%';

      updateRouteGeometry(todayStart);
      document.querySelectorAll('.rail-station[data-iso]').forEach(el => {
        el.classList.toggle('is-next', !!next && el.dataset.iso === next.iso);
        el.classList.toggle('is-today', el.dataset.iso === todayIso);
        el.classList.toggle('is-past', el.dataset.iso !== todayIso && parseLocal(el.dataset.iso) < todayStart);
      });
      document.querySelectorAll('.rail-gap[data-iso]').forEach(el => {
        el.classList.toggle('is-past', parseLocal(el.dataset.iso) < todayStart);
      });
      document.querySelectorAll('.rail-tick[data-iso]').forEach(el => {
        el.classList.toggle('is-today', el.dataset.iso === todayIso);
      });

      // Subject-day counts stay locked to the same calendar clock as the header.
      document.querySelectorAll('.subject-exam[data-iso]').forEach(el => {
        const target = parseLocal(el.dataset.iso);
        const remaining = Math.round((target - todayStart) / 86400000);
        const state = isoOf(target) === todayIso ? 'today' : remaining < 0 ? 'done' : remaining + (remaining === 1 ? ' day' : ' days');
        el.textContent = el.dataset.label + ' \u00b7 ' + state;
      });

      const days = next ? Math.round((parseLocal(next.iso) - todayStart) / 86400000) : 0;
      const clockText = !next ? 'Done' : days === 0 ? 'Today' : days === 1 ? '1 day' : days + ' days';

      const mini = document.getElementById('mini');
      if (mini) mini.style.left = leftPct;
      ['traveller', 'mobileTraveller'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.dataset.routeLeft = leftPct;
      });
      const origin = document.querySelector('.rail-origin');
      if (origin) origin.style.left = leftPct;
      updateRouteTrail();
      const htCode = document.getElementById('htCode');
      const htVal = document.getElementById('htVal');
      if (htCode) {
        htCode.textContent = next ? next.code : 'Done';
        htCode.style.color = next && next.color ? next.color : 'var(--fg-muted)';
      }
      if (htVal) htVal.textContent = clockText;

      const railViewport = document.querySelector('.rail-viewport');
      if (railViewport) {
        const scrollable = railViewport.scrollWidth > railViewport.clientWidth + 2;
        railViewport.classList.toggle('is-scrollable', scrollable);
        const scene = railViewport.closest('.scene-stage');
        if (scene) scene.classList.toggle('route-overflow', scrollable);
      }
      positionRouteShips();
    }

    // The desktop ship lives above the horizontally scrolling route so it can
    // stay visible while vertical panels pass over it. Recompute its anchor
    // from the live track geometry whenever the route scrolls or resizes.
    function positionRouteShips() {
      const scene = document.querySelector('.scene-stage');
      const track = document.querySelector('.rail-track');
      const ship = document.getElementById('traveller');
      const mobileShip = document.getElementById('mobileTraveller');
      if (!scene || !track || !ship) return;
      const fraction = Math.min(100, Math.max(0, parseFloat(ship.dataset.routeLeft || '0'))) / 100;
      const sceneRect = scene.getBoundingClientRect();
      const trackRect = track.getBoundingClientRect();
      const waterline = parseFloat(getComputedStyle(track).getPropertyValue('--rail-waterline')) || 300;
      const anchorX = trackRect.left + trackRect.width * fraction - sceneRect.left;
      ship.style.left = anchorX.toFixed(2) + 'px';
      ship.style.top = (trackRect.top - sceneRect.top + waterline).toFixed(2) + 'px';
      if (mobileShip) {
        mobileShip.style.left = anchorX.toFixed(2) + 'px';
        mobileShip.style.top = (trackRect.top - sceneRect.top + waterline).toFixed(2) + 'px';
      }
    }

    updateRail();
    setInterval(updateRail, 60000);
    window.addEventListener('resize', updateRail);
    const routeViewport = document.querySelector('.rail-viewport');
    if (routeViewport) routeViewport.addEventListener('scroll', positionRouteShips, { passive: true });

    // Native scroll snap handles touch and trackpad gestures. Keyboard focus
    // also centres the selected stop so the next link is always in context.
    (function () {
      const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
      document.querySelectorAll('.rail-station[href]').forEach(station => {
        station.addEventListener('focus', () => {
          station.scrollIntoView({
            behavior: calm.matches ? 'auto' : 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        });
      });
    })();

    // Scroll-linked ship anchor inside the dedicated homepage scroller. The
    // route scrolls away normally while the ship counters the hero's movement,
    // allowing the next study panel to pass over it like the fixed ocean.
    (function () {
      const root = document.documentElement;
      const scroller = document.querySelector('.home-scroll');
      if (!scroller) return;
      const anchorGap = 10;
      scroller.style.scrollBehavior = 'auto';
      let queued = false;

      function paint() {
        queued = false;
        root.style.setProperty('--ship-stick-y', scroller.scrollTop.toFixed(1) + 'px');
      }
      function schedule() {
        if (!queued) { queued = true; requestAnimationFrame(paint); }
      }
      scroller.addEventListener('scroll', schedule, { passive: true });
      window.addEventListener('resize', schedule);

      // Land anchors inside the homepage scroller, below the non-scrolling
      // header, without allowing the browser's root page to move.
      function landOn(el) {
        if (!el) return;
        const want = anchorGap;
        for (let i = 0; i < 6; i++) {
          paint();
          const scrollerTop = scroller.getBoundingClientRect().top;
          const y = el.getBoundingClientRect().top - scrollerTop;
          if (Math.abs(y - want) < 2) break;
          scroller.scrollTo({ top: scroller.scrollTop + y - want, behavior: 'instant' });
        }
        paint();
      }
      function targetOf(hash) {
        if (!hash || hash === '#') return null;
        try { return document.querySelector(hash); } catch (e) { return null; }
      }
      document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
          const target = targetOf(link.getAttribute('href'));
          if (!target) return;
          e.preventDefault();
          landOn(target);
          history.replaceState(null, '', link.getAttribute('href'));
        });
      });

      paint();
      if (location.hash) {
        requestAnimationFrame(() => landOn(targetOf(location.hash)));
      }
    })();

    // Study picker: one spin chooses a subject, then a unit inside it.
    (function () {
      const wheel = document.getElementById('wheel');
      const spinBtn = document.getElementById('spinBtn');
      const soundBtn = document.getElementById('soundBtn');
      if (!wheel || !spinBtn) return;

      const subjectEl = document.getElementById('spinSubject');
      const unitEl = document.getElementById('spinUnit');
      const link = document.getElementById('spinLink');
      const modal = document.getElementById('spinModal');
      const modalSubject = document.getElementById('spinModalSubject');
      const modalDot = document.getElementById('spinModalDot');
      const modalNum = document.getElementById('spinModalNum');
      const modalUnit = document.getElementById('spinModalUnit');
      const modalLink = document.getElementById('spinModalLink');
      const modalAgain = document.getElementById('spinModalAgain');
      const modalClose = document.getElementById('spinModalClose');
      let rotation = -180 / WHEEL_SLICES.length;
      let spinning = false;
      let pending = 0;
      let audio = null;
      let soundOn = localStorage.getItem('wheelSound') === 'on';

      if (modalClose) modalClose.addEventListener('click', () => modal.close());
      if (modalAgain) modalAgain.addEventListener('click', () => {
        modal.close();
        spinBtn.click();
      });
      modal.addEventListener('click', e => {
        if (e.target === modal) modal.close();
      });

      function syncSound() {
        soundBtn.textContent = soundOn ? 'Sound on' : 'Sound off';
        soundBtn.setAttribute('aria-pressed', soundOn ? 'true' : 'false');
      }
      syncSound();

      function tone(freq, duration, delay, type) {
        if (!soundOn) return;
        try {
          audio = audio || new (window.AudioContext || window.webkitAudioContext)();
          const osc = audio.createOscillator();
          const gain = audio.createGain();
          osc.type = type || 'sine';
          osc.frequency.value = freq;
          osc.connect(gain);
          gain.connect(audio.destination);
          const t = audio.currentTime + delay;
          gain.gain.setValueAtTime(0.0001, t);
          gain.gain.exponentialRampToValueAtTime(0.08, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
          osc.start(t);
          osc.stop(t + duration + 0.02);
        } catch (e) { /* audio is a nice-to-have */ }
      }
      function spinSound() {
        // Ratchet clicks of a spinning wheel: quick, then winding down.
        for (let i = 0; i < 16; i++) {
          const f = 520 - Math.min(i, 8) * 18 + Math.max(0, i - 8) * 26;
          tone(f, 0.045, i * 0.08, 'triangle');
        }
      }
      function landSound() {
        // Cannon thud, then a ship's bell.
        tone(72, 0.45, 0, 'sine');
        tone(784, 0.18, 0.04, 'sine');
        tone(1175, 0.24, 0.11, 'sine');
        tone(1568, 0.30, 0.18, 'sine');
      }

      soundBtn.addEventListener('click', function () {
        soundOn = !soundOn;
        localStorage.setItem('wheelSound', soundOn ? 'on' : 'off');
        syncSound();
        if (soundOn) tone(660, 0.08, 0, 'sine');
      });

      function settle(index) {
        const slice = WHEEL_SLICES[index];
        const unitUrl = slice.id + '/unit-' + slice.num + '.html';
        subjectEl.textContent = slice.subject;
        unitEl.textContent = 'Unit ' + slice.num + ' · ' + slice.title;
        link.href = unitUrl;
        link.hidden = false;
        landSound();
        spinning = false;
        spinBtn.disabled = false;

        modalSubject.textContent = slice.subject;
        modalSubject.style.color = slice.color;
        modalDot.style.background = slice.color;
        modalNum.textContent = 'Unit ' + slice.num;
        modalUnit.textContent = slice.title;
        modalLink.href = unitUrl;
        if (!modal.open) {
          if (typeof modal.showModal === 'function') modal.showModal();
          else modal.setAttribute('open', '');
        }
      }

      spinBtn.addEventListener('click', function () {
        if (spinning) return;
        spinning = true;
        spinBtn.disabled = true;
        link.hidden = true;
        pending = Math.floor(Math.random() * WHEEL_SLICES.length);
        const step = 360 / WHEEL_SLICES.length;
        const target = pending * step + step / 2;
        const delta = ((360 - target - rotation) % 360 + 360) % 360;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        rotation += reduced ? delta : 5 * 360 + delta;
        wheel.style.transform = 'rotate(' + rotation + 'deg)';
        spinSound();
        if (reduced) settle(pending);
      });

      wheel.addEventListener('transitionend', function (e) {
        if (e.propertyName === 'transform' && spinning) settle(pending);
      });
    })();

  </script>
</body>
</html>`;
}

// Static hosts do not all apply the clean-URL rewrites from vercel.json.
// Generate a route alias for each rewritten page so routes such as
// /bi/unit-1 also work with Python's http.server.
function resolveRouteRelativeUrls(pageHtml, canonicalPublicPath) {
  const canonicalUrl = new URL(canonicalPublicPath, 'https://study-site.local');
  const urlAttribute = /(<(?:a|link|script|img|source|iframe|video|audio|embed|object)\b[^>]*?\b(?:href|src)\s*=\s*)(["'])([^"']*)\2/gi;

  return pageHtml.replace(urlAttribute, (match, prefix, quote, value) => {
    if (!value || /^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(value)) return match;

    try {
      const resolved = new URL(value, canonicalUrl);
      return `${prefix}${quote}${resolved.pathname}${resolved.search}${resolved.hash}${quote}`;
    } catch {
      return match;
    }
  });
}

function writeCleanRouteAlias(subjectDistDir, subjectId, pageFilename, pageHtml) {
  const routeName = path.basename(pageFilename, '.html');
  const routeDir = path.join(subjectDistDir, routeName);
  const canonicalPublicPath = `/${subjectId}/${pageFilename}`;
  const routeHtml = resolveRouteRelativeUrls(pageHtml, canonicalPublicPath);

  fs.mkdirSync(routeDir, { recursive: true });
  fs.writeFileSync(path.join(routeDir, 'index.html'), routeHtml);
}

function validateSyllabusSources() {
  const syllabusDir = path.join(SRC_DIR, '_syllabus');
  if (!fs.existsSync(syllabusDir)) {
    throw new Error(`Syllabus directory is missing: ${syllabusDir}`);
  }

  const availableFiles = new Set(fs.readdirSync(syllabusDir));
  const invalidMappings = [];

  for (const subject of Object.values(SUBJECTS)) {
    const filename = SYLLABUS_FILES[subject.code];
    if (!filename || path.basename(filename) !== filename || !availableFiles.has(filename)) {
      invalidMappings.push(`${subject.code} -> ${filename || '(missing mapping)'}`);
    }
  }

  if (invalidMappings.length) {
    throw new Error(
      `Syllabus source mismatch (filename case is significant on Vercel): ${invalidMappings.join(', ')}`
    );
  }
}

// Main build function
async function build() {
  console.log('🔨 Building study site...');
  validateSyllabusSources();
  
  // Clean dist
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // Copy CSS
  fs.copyFileSync(path.join(__dirname, 'styles.css'), path.join(DIST_DIR, 'styles.css'));
  ['favicon.svg', 'site.webmanifest'].forEach(file => {
    fs.copyFileSync(path.join(__dirname, file), path.join(DIST_DIR, file));
  });

  // Generate main index
  const mainIndex = generateMainIndexHtml();
  fs.writeFileSync(path.join(DIST_DIR, 'index.html'), mainIndex);
  console.log('✅ Generated index.html');

  // Process each subject
  for (const [subjectId, subject] of Object.entries(SUBJECTS)) {
    const subjectDistDir = path.join(DIST_DIR, subjectId);
    fs.mkdirSync(subjectDistDir, { recursive: true });

    // Generate subject index
    const subjectIndex = generateSubjectIndexHtml(subject);
    fs.writeFileSync(path.join(subjectDistDir, 'index.html'), subjectIndex);

    // Process each unit
    for (const unit of subject.units) {
      const mdPath = path.join(SRC_DIR, subject.folder, unit.file);
      if (!fs.existsSync(mdPath)) {
        console.warn(`⚠️  Missing: ${mdPath}`);
        continue;
      }

      const { content } = readMarkdownFile(mdPath);
      const displayContent = subjectId === 'bi' && unit.num === 1 ? repairMojibake(content) : content;
      const htmlContent = renderMarkdown(displayContent);
      const unitHtml = generateUnitHtml(subject, unit, htmlContent);
      
      // Use a simple filename
      const unitFilename = `unit-${unit.num}.html`;
      fs.writeFileSync(path.join(subjectDistDir, unitFilename), unitHtml);
      writeCleanRouteAlias(subjectDistDir, subjectId, unitFilename, unitHtml);
      console.log(`  ✅ ${subjectId}/unit-${unit.num}.html`);
    }

    // Render resource markdown files to HTML
    const resourceFiles = [
      { src: 'model-question.md', dest: 'model-question.html', title: 'Model Question' },
      { src: 'model-question-answers.md', dest: 'model-question-answers.html', title: 'Model Question Answers' },
      { src: 'board-paper-2026.md', dest: 'board-paper-2026.html', title: '2026 Board Paper and Answers' },
      { src: 'question-bank.md', dest: 'question-bank.html', title: 'Question Bank' }
    ];
    
    for (const resource of resourceFiles) {
      const srcPath = path.join(SRC_DIR, subject.folder, resource.src);
      if (fs.existsSync(srcPath)) {
        const { content } = readMarkdownFile(srcPath);
        const htmlContent = renderMarkdown(content);
        const resourceHtml = generateResourceHtml(subject, resource.title, htmlContent);
        fs.writeFileSync(path.join(subjectDistDir, resource.dest), resourceHtml);
        writeCleanRouteAlias(subjectDistDir, subjectId, resource.dest, resourceHtml);
        console.log(`  ✅ ${subjectId}/${resource.dest}`);
      }
    }

    // Generate BI cheat sheet for BI subject
    if (subjectId === 'bi') {
      fs.writeFileSync(path.join(subjectDistDir, 'cheat-sheet.html'), CHEAT_SHEET_HTML);
      console.log(`  ✅ ${subjectId}/cheat-sheet.html`);
    }

    console.log(`✅ Subject: ${subject.name} (${subject.units.length} units)`);
  }

  // Quick Reels serves every subject from one /reels/ route. The index stays
  // tiny; each subject's transcript payload loads on demand from content/.
  const reelsSourceDir = path.join(SRC_DIR, 'reels');
  const reelsDistDir = path.join(DIST_DIR, 'reels');
  const reelsContentDir = path.join(reelsDistDir, 'content');
  fs.mkdirSync(reelsContentDir, { recursive: true });

  const narrationProfile = narrationProfileFromEnv();
  const cloudNarrationEnabled = Boolean(String(process.env.GOOGLE_CLOUD_TTS_API_KEY || '').trim());
  const reelsBuiltAt = new Date().toISOString();

  const reelSubjectConfigs = [
    { subject: SUBJECTS.bi, units: SUBJECTS.bi.units, questionManifest: BI_QUESTION_MANIFEST, expectedUnits: 6 },
    { subject: SUBJECTS.entrepreneurship, units: SUBJECTS.entrepreneurship.units, questionManifest: ENTREPRENEURSHIP_QUESTION_MANIFEST, expectedUnits: 6 },
    { subject: SUBJECTS.cloud, units: SUBJECTS.cloud.units, questionManifest: CLOUD_QUESTION_MANIFEST, expectedUnits: 7 },
    { subject: SUBJECTS.de, units: SUBJECTS.de.units, questionManifest: DIGITAL_ECONOMY_QUESTION_MANIFEST, expectedUnits: 6 }
  ];

  function mergeReelManifests(manifests, label) {
    const base = manifests[0];
    const segments = {};

    for (const manifest of manifests) {
      for (const [segmentId, segment] of Object.entries(manifest.segments || {})) {
        const existing = segments[segmentId];
        if (existing && (existing.text !== segment.text || existing.version !== segment.version)) {
          throw new Error(`Quick Reels ${label} segment collision with different content: ${segmentId}`);
        }
        segments[segmentId] = existing
          ? {
              ...existing,
              prime: Boolean(existing.prime || segment.prime),
              static: Boolean(existing.static || segment.static)
            }
          : { ...segment };
      }
    }

    const allSegments = Object.values(segments);
    return {
      ...base,
      segments,
      segmentCount: allSegments.length,
      totalChars: allSegments.reduce((sum, segment) => sum + Number(segment.chars || String(segment.text || '').length), 0),
      cloudEnabled: manifests.some(manifest => manifest.cloudEnabled),
      staticAssets: manifests.every(manifest => manifest.staticAssets),
      primedAssets: allSegments.filter(segment => segment.static).length,
      generatedAt: reelsBuiltAt
    };
  }

  function buildSubjectReelPayload({ subject, units, questionManifest, expectedUnits }) {
    const payload = extractReelContent({
      subject,
      units,
      rootDir: SRC_DIR,
      questionManifest
    });
    payload.questionManifest = questionManifest;
    payload.entries.forEach(entry => {
      entry.subjectId = subject.id;
    });

    const sectionNames = collectSectionHeadingNames(units, SRC_DIR, subject.folder);
    const primeCount = Math.max(1, Math.min(30, Number(process.env.GOOGLE_TTS_PRIME_ENTRIES) || 12));
    const primeIds = payload.entries
      .filter(entry => entry.parts.some(part => part.type === 'text' && String(part.text || '').trim()))
      .slice(0, primeCount)
      .map(entry => entry.id);

    const narration = buildNarrationManifest(payload.entries, {
      profile: narrationProfile,
      sectionNames,
      primeEntryIds: primeIds,
      cloudEnabled: cloudNarrationEnabled
    });
    payload.narration = narration.manifest;
    payload.entries.forEach(entry => {
      entry.narration = narration.entryNarration[entry.id];
    });

    const aiTranscript = buildAiTranscriptManifest(payload.entries, {
      profile: DEFAULT_AI_TRANSCRIPT_PROFILE,
      primeEntries: 0
    });
    payload.aiTranscript = aiTranscript.manifest;
    payload.entries.forEach(entry => {
      entry.aiTranscript = aiTranscript.entryNarration[entry.id];
    });

    if (!payload.entries.length || !payload.audit.mappedQuestions) {
      throw new Error(`Quick Reels extraction produced no usable content for ${subject.name}.`);
    }

    const auditTotal = payload.audit.includedHeadings
      + payload.audit.excludedHeadings.length
      + payload.audit.containerHeadings
      + payload.audit.duplicateHeadings;
    const diff = Math.abs(auditTotal - payload.audit.sourceHeadings);
    const maxDiff = subject.id === 'entrepreneurship' ? 5 : 0;
    if (diff > maxDiff) {
      throw new Error(`Quick Reels heading audit does not reconcile for ${subject.name} (${auditTotal}/${payload.audit.sourceHeadings}, diff=${diff}, maxAllowed=${maxDiff}).`);
    }

    if (payload.audit.mappedQuestions !== questionManifest.length || payload.units.length !== expectedUnits) {
      console.log(`  ⚠️  ${subject.name}: mappedQuestions=${payload.audit.mappedQuestions}, manifest=${questionManifest.length}, units=${payload.units.length}, expected=${expectedUnits}`);
      if (subject.id !== 'entrepreneurship') {
        throw new Error(`Quick Reels coverage changed unexpectedly for ${subject.name}; reconcile the source audit before shipping.`);
      }
    }

    if (payload.entries.some(entry => entry.kind === 'question' && !entry.parts.some(part => part.section === 'answer'))) {
      throw new Error(`Quick Reels ${subject.name} contains a mapped question without answer content.`);
    }

    if (/[âÂÃð]/.test(JSON.stringify(payload))) {
      throw new Error(`Quick Reels ${subject.name} contains unresolved mojibake.`);
    }

    for (const entry of payload.entries) {
      const unitHtmlPath = path.join(DIST_DIR, subject.id, `unit-${entry.unit}.html`);
      const unitHtml = fs.readFileSync(unitHtmlPath, 'utf8');
      if (!unitHtml.includes(`id="${entry.sourceAnchor}"`)) {
        throw new Error(`Quick Reels source anchor is missing from the built unit page: ${entry.sourceUrl}`);
      }
    }

    return payload;
  }

  const reelsMusic = [
    {
      title: 'Easy Lemon (60 second)',
      file: 'assets/music/easy-lemon-60-second.mp3',
      artist: 'Kevin MacLeod',
      licence: 'CC BY 4.0',
      source: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Easy%20Lemon%2060%20second.mp3'
    },
    {
      title: 'Somewhere Sunny',
      file: 'assets/music/somewhere-sunny.mp3',
      artist: 'Kevin MacLeod',
      licence: 'CC BY 4.0',
      source: 'https://incompetech.com/music/royalty-free/mp3-royaltyfree/Somewhere%20Sunny.mp3'
    }
  ];

  const reelsMusicSource = path.join(reelsSourceDir, 'assets', 'music');
  for (const file of ['easy-lemon-60-second.mp3', 'somewhere-sunny.mp3']) {
    const musicPath = path.join(reelsMusicSource, file);
    if (!fs.existsSync(musicPath) || fs.statSync(musicPath).size < 1000) {
      throw new Error(`Quick Reels music asset is missing or empty: ${file}`);
    }
  }

  const builtReelPayloads = reelSubjectConfigs.map(config => {
    const payload = buildSubjectReelPayload(config);
    payload.music = reelsMusic;
    // The browser never reads payload.narration or entry.narration: every card
    // is narrated from its Groq transcript. They stay on the in-memory payload
    // for the merged server manifest, but are stripped from the JSON shipped to
    // the client (roughly a quarter of each subject file).
    const browserPayload = {
      ...payload,
      entries: payload.entries.map(entry => {
        const { narration, ...rest } = entry;
        return rest;
      })
    };
    delete browserPayload.narration;
    fs.writeFileSync(path.join(reelsContentDir, `${config.subject.id}.json`), JSON.stringify(browserPayload));
    console.log(`✅ reels/content/${config.subject.id}.json (${payload.entries.length} sections, ${payload.audit.mappedQuestions} mapped questions)`);
    return payload;
  });
  const reelsPayloadById = new Map(builtReelPayloads.map(payload => [payload.subject.id, payload]));

  const reelsIndex = {
    version: 2,
    generatedAt: reelsBuiltAt,
    defaultSubject: SUBJECTS.bi.id,
    subjects: reelSubjectConfigs.map(({ subject }) => {
      const payload = reelsPayloadById.get(subject.id);
      return {
        id: subject.id,
        code: subject.code,
        name: subject.name,
        color: subject.color,
        notesUrl: `/${subject.id}/`,
        payloadUrl: `content/${subject.id}.json`,
        entryCount: payload.entries.length,
        questionCount: payload.audit.mappedQuestions,
        units: subject.units.map(unit => ({
          num: unit.num,
          title: unit.title,
          sourceUrl: `/${subject.id}/unit-${unit.num}.html`
        }))
      };
    })
  };
  fs.writeFileSync(path.join(reelsDistDir, 'content.json'), JSON.stringify(reelsIndex));

  const mergedNarrationManifest = mergeReelManifests(
    builtReelPayloads.map(payload => payload.narration),
    'narration'
  );
  const mergedAiTranscriptManifest = mergeReelManifests(
    builtReelPayloads.map(payload => payload.aiTranscript),
    'AI transcript'
  );
  fs.writeFileSync(path.join(reelsDistDir, 'narration-manifest.json'), JSON.stringify({
    version: 1,
    generatedAt: reelsBuiltAt,
    subjects: reelsIndex.subjects.map(subject => subject.id),
    narration: mergedNarrationManifest,
    aiTranscript: mergedAiTranscriptManifest
  }));

  ['reels.html', 'reels.css', 'reels.js'].forEach(file => {
    fs.copyFileSync(path.join(reelsSourceDir, file), path.join(reelsDistDir, file === 'reels.html' ? 'index.html' : file));
  });

  const reelsMusicDist = path.join(reelsDistDir, 'assets', 'music');
  fs.mkdirSync(reelsMusicDist, { recursive: true });
  fs.readdirSync(reelsMusicSource)
    .filter(file => file.endsWith('.mp3') || file === 'CREDITS.md')
    .forEach(file => fs.copyFileSync(path.join(reelsMusicSource, file), path.join(reelsMusicDist, file)));

  console.log(`✅ reels/ (${reelsIndex.subjects.length} subjects, one route)`);

  // Copy syllabus files
  const syllabusDir = path.join(SRC_DIR, '_syllabus');
  const destSyllabusDir = path.join(DIST_DIR, '_syllabus');
  if (fs.existsSync(syllabusDir)) {
    fs.mkdirSync(destSyllabusDir, { recursive: true });
    const syllabusFiles = fs.readdirSync(syllabusDir).filter(f => f.endsWith('.md'));
    for (const file of syllabusFiles) {
      fs.copyFileSync(path.join(syllabusDir, file), path.join(destSyllabusDir, file));
      console.log(`  ✅ _syllabus/${file}`);
    }

    // Generate syllabus HTML pages
    const syllabusSlugs = {};
    for (const [code, filename] of Object.entries(SYLLABUS_FILES)) {
      const subjectObj = Object.values(SUBJECTS).find(s => s.code === code);
      if (!subjectObj) continue;
      const slug = filename.replace(/\.md$/i, '');
      syllabusSlugs[filename] = { slug, subject: subjectObj };
    }

    // Ensure downloads dir
    const downloadsSyllabusDir = path.join(DIST_DIR, 'downloads', 'syllabus');
    fs.mkdirSync(downloadsSyllabusDir, { recursive: true });

    for (const file of syllabusFiles) {
      const info = syllabusSlugs[file];
      if (!info) continue;
      const { slug, subject } = info;
      const rawPath = path.join(syllabusDir, file);
      const { content: mdContent } = readMarkdownFile(rawPath);
      const htmlContent = renderMarkdown(mdContent);
      // Extract title from first h1
      const titleMatch = mdContent.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1].trim() : slug;
      const syllabusHtml = generateSyllabusHtml(subject, title, htmlContent, file);
      const slugDir = path.join(destSyllabusDir, slug);
      fs.mkdirSync(slugDir, { recursive: true });
      fs.writeFileSync(path.join(slugDir, 'index.html'), syllabusHtml);
      console.log(`  ✅ _syllabus/${slug}/index.html`);

      // Copy raw markdown to downloads
      fs.copyFileSync(rawPath, path.join(downloadsSyllabusDir, file));
      console.log(`  ✅ downloads/syllabus/${file}`);
    }
  }

  console.log('\n🎉 Build complete! Output in dist/');
  console.log('Run "npm run serve" to preview.');
}

build().catch(error => {
  console.error(error);
  process.exitCode = 1;
});