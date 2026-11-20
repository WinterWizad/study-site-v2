import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import fm from 'front-matter';
import { glob } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = __dirname;
const DIST_DIR = path.join(__dirname, 'dist');

// Exam Routine — single source of truth (8th Semester NC only, from Dean's Office 2083/07/28)
const EXAM_ROUTINE = [
  { iso: '2026-12-01', bs: 'Mangsir 15, 2083', day: 'Tuesday', code: 'IT 248', short: 'Entrepreneur', color: '#dc2626', title: 'IT Entrepreneurship & Management (NC)', subjectId: 'entrepreneurship', isOurs: true },
  { iso: '2026-12-03', bs: 'Mangsir 17, 2083', day: 'Thursday', code: 'IT 250', short: 'Digital Economy', color: '#059669', title: 'Digital Economy (NC)', subjectId: 'de', isOurs: true },
  { iso: '2026-12-06', bs: 'Mangsir 20, 2083', day: 'Sunday', code: 'IT 249', short: 'Business Intel.', color: '#2563eb', title: 'Business Intelligence (NC)', subjectId: 'bi', isOurs: true },
  { iso: '2026-12-10', bs: 'Mangsir 24, 2083', day: 'Thursday', code: 'IT 277', short: 'Cloud Computing', color: '#7c3aed', title: 'Cloud Computing (NC)', subjectId: 'cloud', isOurs: true },
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
  'IT 248': 'it248-it-entrepreneurship-management.md',
  'IT 249': 'it249-business-intelligence.md',
  'IT 250': 'it250-digital-economy.md',
  'IT 277': 'it277-cloud-computing.md',
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
  <title>BI Cheat Sheet | Business Intelligence | BIM 8th Semester</title>
  <meta name="description" content="One-page BI cheat sheet for exam revision - printable PDF ready">
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
      @page { margin: 8mm !important; size: A5 !important; }
      body { background: white !important; }
    }
    
    @media screen {
      .cheat-sheet { max-width: 480px; margin: 0 auto; padding: 16px; font-size: 12px; line-height: 1.35; }
      .cheat-sheet h2 { font-size: 13px; margin: 12px 0 4px; color: #1e3a5f; border-bottom: 1px solid #2563eb; padding-bottom: 2px; }
      .cheat-sheet h3 { font-size: 12px; margin: 8px 0 3px; color: #2563eb; }
      .cheat-sheet p, .cheat-sheet li { margin: 2px 0; }
      .cheat-sheet table { width: 100%; border-collapse: collapse; margin: 4px 0; font-size: 11px; }
      .cheat-sheet th, .cheat-sheet td { border: 1px solid #ddd; padding: 3px 5px; text-align: left; }
      .cheat-sheet th { background: #f0f4f8; font-weight: 600; }
      .cheat-sheet code { background: #f0f4f8; padding: 1px 3px; border-radius: 3px; font-size: 11px; }
      .cheat-sheet .formula { background: #fffbe6; border: 1px solid #ffe58f; padding: 3px 6px; border-radius: 4px; font-family: monospace; margin: 3px 0; display: inline-block; }
      .cheat-sheet .diagram { font-family: monospace; font-size: 10px; line-height: 1.2; background: #fafafa; border: 1px solid #eee; padding: 6px; border-radius: 4px; overflow-x: auto; white-space: pre; }
      .cheat-sheet hr { border: none; border-top: 1px solid #e0e0e0; margin: 8px 0; }
      .cheat-sheet .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .cheat-sheet .side-label { font-weight: 600; color: #2563eb; }
      .print-btn { position: fixed; bottom: 20px; right: 20px; background: #2563eb; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; box-shadow: 0 4px 12px rgba(37,99,235,0.3); z-index: 100; }
      .print-btn:hover { background: #1d4ed8; }
      @media (max-width: 600px) { .cheat-sheet { font-size: 11px; padding: 12px; } }
    }
  </style>
</head>
<body>
  <header class="site-header">
    <div class="header-content">
      <a href="../index.html" class="site-title">BIM 8th Semester</a>
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
  const id = text.toLowerCase().replace(/[^\w]+/g, '-').replace(/(^-|-$)/g, '');
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
  <title>Unit ${unit.num}: ${unit.title} | ${subject.name} | BIM 8th Semester</title>
  <meta name="description" content="${subject.code} - Unit ${unit.num}: ${unit.title}">
  <link rel="stylesheet" href="../../styles.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.9.0/styles/github.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.9.0/highlight.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js"></script>
</head>
<body class="unit-page">
  <header class="site-header">
    <div class="header-content">
      <a href="../index.html" class="site-title">BIM 8th Semester</a>
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
      document.getElementById('sidebar').classList.toggle('open');
    };
    window.closeSidebar = function() {
      document.getElementById('sidebar').classList.remove('open');
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

function generateResourceHtml(subject, title, htmlContent) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | ${subject.name} | BIM 8th Semester</title>
  <meta name="description" content="${subject.code} - ${title}">
  <link rel="stylesheet" href="../styles.css">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.9.0/styles/github.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.9.0/highlight.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.min.js"></script>
</head>
<body>
  <header class="site-header">
    <div class="header-content">
      <a href="../index.html" class="site-title">BIM 8th Semester</a>
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
      document.getElementById('sidebar').classList.toggle('open');
    };
    window.closeSidebar = function() {
      document.getElementById('sidebar').classList.remove('open');
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
  <title>${subject.name} | ${subject.code} | BIM 8th Semester</title>
  <meta name="description" content="${subject.code} - ${subject.name} - ${subject.units.length} units, ${subject.marks} marks">
  <link rel="stylesheet" href="../styles.css">
</head>
<body>
  <header class="site-header">
    <div class="header-content">
      <a href="../index.html" class="site-title">BIM 8th Semester</a>
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
            <li><a href="question-bank.html">Question Bank</a></li>
            ${subject.id === 'bi' ? `<li><a href="cheat-sheet.html">&#x1F4CB; Cheat Sheet</a></li>` : ''}
            <li><a href="../_syllabus/${SYLLABUS_FILES[subject.code] || ''}" target="_blank">Syllabus</a></li>
          </ul>
        </section>
      </article>
    </main>
  </div>

  <script>
    window.toggleSidebar = function() {
      document.getElementById('sidebar').classList.toggle('open');
    };
    window.closeSidebar = function() {
      document.getElementById('sidebar').classList.remove('open');
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
  const ticks = [];
  let lastMonth = -1;
  for (let d = new Date(start); d <= end; d = nextDay(d)) {
    const changed = d.getMonth() !== lastMonth;
    lastMonth = d.getMonth();
    ticks.push({
      left: frac(d),
      iso: isoLocal(d),
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

function railStationHtml(stop, left, row) {
  const when = parseIsoLocal(stop.iso).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const names = stop.isMovie
    ? stop.view.map(n => `<span class="station-code">${n}</span>`).join('')
    : `<span class="station-code" style="color:${stop.color}">${stop.short || stop.code}</span>`;
  const kind = stop.isMovie ? '<span class="station-kind">films</span>' : '';
  const inner = `
        <span class="station-card">
          ${kind}${names}
          <span class="station-when">${when}</span>
        </span>
        <span class="station-dot"${stop.color ? ` style="border-color:${stop.color}"` : ''}></span>`;
  const cls = 'rail-station ' + (stop.isMovie ? 'is-movie' : 'is-ours') + (row % 2 ? ' row-b' : '');
  const attrs = `class="${cls}" style="left:${left}%" data-iso="${stop.iso}" title="${stop.title}"`;
  return stop.subjectId
    ? `<a ${attrs} href="${stop.subjectId}/">${inner}
      </a>`
    : `<div ${attrs}>${inner}
      </div>`;
}

function railTravellerHtml(left) {
  return `
        <div class="rail-traveller" id="traveller" style="left:${left}%" aria-hidden="true">
          <span class="speed-lines"><i></i><i></i><i></i></span>
          <svg class="train-flat" viewBox="0 0 96 40" width="144" height="60" focusable="false">
            <rect x="8" y="10" width="52" height="20" rx="3" fill="var(--accent)"/>
            <rect x="12" y="4" width="16" height="10" rx="2" fill="var(--accent)"/>
            <path d="M60 10h14l14 14v6H60z" fill="var(--accent)"/>
            <rect x="16" y="14" width="12" height="8" rx="1.5" fill="var(--accent-ink)" opacity="0.85"/>
            <rect x="34" y="14" width="12" height="8" rx="1.5" fill="var(--accent-ink)" opacity="0.85"/>
            <path d="M65 16h9l7 7H65z" fill="var(--accent-ink)" opacity="0.8"/>
            <circle cx="24" cy="31" r="5" fill="var(--fg)"/>
            <circle cx="44" cy="31" r="5" fill="var(--fg)"/>
            <circle cx="74" cy="31" r="5" fill="var(--fg)"/>
          </svg>
          <span class="traveller-tag">Today</span>
        </div>`;
}

function railHeroHtml(rail) {
  const left = rail.fNow.toFixed(3);
  return `
      <section class="rail-hero" id="timetable" aria-label="Exam timetable rail">
        <div class="rail-counter">
          <span class="counter-label">Next</span>
          <span class="counter-code" id="code">Entrepreneur</span>
          <span class="counter-time" aria-hidden="true"><b id="days">0</b>d <b id="hours">00</b>:<b id="mins">00</b>:<b id="secs">00</b></span>
          <span class="sr-only" id="sr"></span>
        </div>
        <div class="rail-mini" aria-hidden="true">
          <span class="rail-mini-line"></span>
          <span class="rail-mini-train" id="mini" style="left:${left}%"></span>
        </div>
        <div class="rail-viewport">
          <div class="rail-track">
            <div class="rail-line"></div>
            <span class="rail-origin">Today</span>
            ${rail.gaps.map(g => `
            <span class="rail-gap" style="left:${g.left.toFixed(3)}%" data-iso="${g.iso}">${g.label}</span>`).join('')}
            ${rail.ticks.map(t => `
            <span class="rail-tick" style="left:${t.left.toFixed(3)}%" data-iso="${t.iso}"><i></i><em>${t.label}</em></span>`).join('')}
            ${RAIL_STOPS.map((s, i) => railStationHtml(s, rail.isoFrac(s.iso).toFixed(3), i)).join('')}${railTravellerHtml(left)}
          </div>
        </div>
        <span class="sr-only">Exam routine: Dean's Office, 2083/07/28. Films: Dune: Part Three and Avengers: Doomsday, both 18 December 2026.</span>
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
        <div class="spin-layout">
          <div class="wheel-stage">
            <span class="wheel-pointer" aria-hidden="true"></span>
            <button class="wheel-wrap" id="spinBtn" type="button" aria-label="Spin the wheel to pick a unit">
              <svg class="wheel" id="wheel" viewBox="0 0 200 200" focusable="false" aria-hidden="true" style="transform:rotate(${(-180 / n).toFixed(2)}deg)">
                ${segments}
                <circle cx="100" cy="100" r="84" fill="none" stroke="var(--border)" stroke-width="2"/>
                <circle cx="100" cy="100" r="15" fill="var(--card-bg)" stroke="var(--border)" stroke-width="2"/>
                <circle cx="100" cy="100" r="4" fill="var(--accent)"/>
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
            <span class="spin-modal-kicker">Today's pick</span>
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BIM 8th Semester Study Materials</title>
  <meta name="description" content="Complete study materials for BIM 8th Semester: Business Intelligence, Digital Economy, Cloud Computing, IT Entrepreneurship">
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="site-header">
    <div class="header-content">
      <a class="site-title" href="./">BIM 8th Semester</a>
      <nav class="site-nav" aria-label="Sections">
        <a href="#timetable">Timetable</a>
        <a href="#subjects">Notes</a>
        <a href="#pattern">Pattern</a>
        <a href="bi/cheat-sheet.html">Cheat sheet</a>
      </nav>
      <span class="header-clock" id="headerClock" aria-live="off">
        <span class="clock-code" id="htCode" style="color:#dc2626">Entrepreneur</span>
        <span class="clock-val" id="htVal">--d --:--:--</span>
      </span>
      <button class="theme-toggle" aria-label="Toggle theme" onclick="toggleTheme()"><svg class="icon-moon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M12.3 3a9 9 0 1 0 8.7 11.4A7.5 7.5 0 0 1 12.3 3z"/></svg><svg class="icon-sun" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="currentColor"/><g stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6"/></g></svg></button>
    </div>
  </header>

  <div class="layout">
    <aside class="sidebar" id="sidebar">
      <button class="sidebar-toggle" aria-label="Toggle sidebar" onclick="toggleSidebar()">&#9776;</button>
      <div class="sidebar-overlay" onclick="closeSidebar()"></div>
      <div class="sidebar-content">
        <h3>This semester</h3>
        <ul class="subject-list">
          ${SUBJECT_ORDER.map(s => {
            const ex = getSubjectExam(s.id);
            return `
            <li>
              <a href="${s.id}/" style="border-left-color: ${s.color}">
                <span class="subject-code">${s.code}</span>
                <span class="subject-name">${s.name}</span>
                ${ex ? `<span class="subject-exam" data-iso="${ex.iso}" data-label="${formatExamDate(ex.iso).replace(/, 2026$/, '')}">${formatExamDate(ex.iso).replace(/, 2026$/, '')} &middot; ${daysUntil(ex.iso)} days</span>` : ''}
              </a>
            </li>`;
          }).join('')}
        </ul>
        <div class="sidebar-footer">
          <div class="progress-summary">
            <span>25 units</span>
            <span>320 marks</span>
          </div>
          <a class="footer-link" href="bi/cheat-sheet.html">BI cheat sheet</a>
        </div>
      </div>
    </aside>

    <main class="content" role="main">
      <section class="page-head">
        <h1>Examination timetable</h1>
        <p class="page-meta">BIM 8th semester &middot; Tribhuvan University &middot; exams 1&ndash;10 December 2026 &middot; films 18 December &middot; centre ${EXAM_CENTRE}</p>
      </section>

      ${railHeroHtml(rail)}
      ${spinWheelHtml()}

      <section class="doors" id="subjects" aria-labelledby="doorsTitle">
        <h2 id="doorsTitle" class="section-title">Open your notes</h2>
        <ul class="doors-list">
          ${SUBJECT_ORDER.map(s => {
            const ex = getSubjectExam(s.id);
            return `
            <li class="door">
              <div class="door-head">
                <span class="door-code" style="border-color: ${s.color}">${s.code}</span>
                <span class="door-name">${s.name}</span>
              </div>
              <p class="door-meta">${s.units.length} units &middot; ${s.marks} marks &middot; pass ${s.passMarks}${ex ? ` &middot; ${formatExamDate(ex.iso).replace(/, 2026$/, '')}` : ''}</p>
              <div class="door-links">
                <a href="${s.id}/">Notes</a>
                <a href="${s.id}/question-bank.html">Question bank</a>
                <a href="${s.id}/model-question-answers.html">Model answers</a>
                ${s.id === 'bi' ? '<a href="bi/cheat-sheet.html">Cheat sheet</a>' : ''}
              </div>
            </li>`;
          }).join('')}
        </ul>
      </section>

      <section class="pattern" id="pattern" aria-labelledby="patternTitle">
        <h2 id="patternTitle" class="section-title">What each paper is worth</h2>
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
            <h3>Hall rules</h3>
            <ul class="rules-list">
              ${EXAM_NOTES.map(note => `<li>${note}</li>`).join('')}
            </ul>
          </div>
        </div>
      </section>

      <footer class="page-foot">
        <p>Routine source: Dean's Office, 2083/07/28. Centre: ${EXAM_CENTRE}.</p>
        <button class="foot-btn" onclick="window.print()">Print this page</button>
      </footer>

    </main>
  </div>

  <script>
    window.toggleSidebar = function() {
      document.getElementById('sidebar').classList.toggle('open');
    };
    window.closeSidebar = function() {
      document.getElementById('sidebar').classList.remove('open');
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

    // One clock drives the rail, the header readout and the sidebar. Films are
    // only the far end of the line; the counter still counts exam papers.
    const EXAM_ROUTINE_JS = ${JSON.stringify(EXAM_ROUTINE)};
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
    let lastSrDay = -1;
    let lastSrCode = '';

    function updateRail() {
      const now = new Date();
      let next = null;
      for (const e of EXAM_ROUTINE_JS) {
        if (parseLocal(e.iso) > now) { next = e; break; }
      }
      const todayIso = isoOf(now);
      const leftPct = railFraction(now).toFixed(3) + '%';

      document.querySelectorAll('.rail-station[data-iso]').forEach(el => {
        el.classList.toggle('is-next', !!next && el.dataset.iso === next.iso);
        el.classList.toggle('is-today', el.dataset.iso === todayIso);
        el.classList.toggle('is-past', el.dataset.iso !== todayIso && parseLocal(el.dataset.iso) < now);
      });
      document.querySelectorAll('.rail-gap[data-iso]').forEach(el => {
        el.classList.toggle('is-past', parseLocal(el.dataset.iso) < now);
      });
      document.querySelectorAll('.rail-tick[data-iso]').forEach(el => {
        el.classList.toggle('is-today', el.dataset.iso === todayIso);
      });

      // Sidebar day counts stay locked to the same clock as the big counter.
      document.querySelectorAll('.subject-exam[data-iso]').forEach(el => {
        const target = parseLocal(el.dataset.iso);
        const remaining = Math.floor((target - now) / 86400000);
        const state = isoOf(target) === todayIso ? 'today' : remaining < 0 ? 'done' : remaining + (remaining === 1 ? ' day' : ' days');
        el.textContent = el.dataset.label + ' \u00b7 ' + state;
      });

      let days = 0, hours = 0, mins = 0, secs = 0;
      if (next) {
        const diff = parseLocal(next.iso) - now;
        days = Math.floor(diff / 86400000);
        hours = Math.floor((diff % 86400000) / 3600000);
        mins = Math.floor((diff % 3600000) / 60000);
        secs = Math.floor((diff % 60000) / 1000);
      }
      const clockText = next ? days + 'd ' + pad2(hours) + ':' + pad2(mins) + ':' + pad2(secs) : '';

      const setText = (name, value) => {
        const el = document.getElementById(name);
        if (el) el.textContent = value;
      };
      setText('code', next ? (next.short || next.code) : 'All papers done');
      setText('days', days);
      setText('hours', pad2(hours));
      setText('mins', pad2(mins));
      setText('secs', pad2(secs));
      ['traveller', 'mini'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.left = leftPct;
      });
      const sr = document.getElementById('sr');
      if (sr && (days !== lastSrDay || (next && next.code) !== lastSrCode)) {
        lastSrDay = days;
        lastSrCode = next ? next.code : '';
        sr.textContent = next
          ? 'Next paper ' + next.code + ', ' + next.title + ', on ' + parseLocal(next.iso).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) + ', in ' + days + (days === 1 ? ' day' : ' days')
          : 'All papers are finished';
      }

      const htCode = document.getElementById('htCode');
      const htVal = document.getElementById('htVal');
      if (htCode) {
        htCode.textContent = next ? (next.short || next.code) : 'Done';
        if (next && next.color) htCode.style.color = next.color;
      }
      if (htVal) htVal.textContent = clockText;
    }
    updateRail();
    setInterval(updateRail, 1000);

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
        for (let i = 0; i < 7; i++) tone(280 + i * 55, 0.07, i * 0.07, 'triangle');
      }
      function landSound() {
        tone(784, 0.16, 0, 'sine');
        tone(1175, 0.22, 0.07, 'sine');
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

// Main build function
async function build() {
  console.log('🔨 Building study site...');
  
  // Clean dist
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
  }
  fs.mkdirSync(DIST_DIR, { recursive: true });

  // Copy CSS
  fs.copyFileSync(path.join(__dirname, 'styles.css'), path.join(DIST_DIR, 'styles.css'));

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
      const htmlContent = renderMarkdown(content);
      const unitHtml = generateUnitHtml(subject, unit, htmlContent);
      
      // Use a simple filename
      const unitFilename = `unit-${unit.num}.html`;
      fs.writeFileSync(path.join(subjectDistDir, unitFilename), unitHtml);
      console.log(`  ✅ ${subjectId}/unit-${unit.num}.html`);
    }

    // Render resource markdown files to HTML
    const resourceFiles = [
      { src: 'model-question.md', dest: 'model-question.html', title: 'Model Question' },
      { src: 'model-question-answers.md', dest: 'model-question-answers.html', title: 'Model Question Answers' },
      { src: 'question-bank.md', dest: 'question-bank.html', title: 'Question Bank' }
    ];
    
    for (const resource of resourceFiles) {
      const srcPath = path.join(SRC_DIR, subject.folder, resource.src);
      if (fs.existsSync(srcPath)) {
        const { content } = readMarkdownFile(srcPath);
        const htmlContent = renderMarkdown(content);
        const resourceHtml = generateResourceHtml(subject, resource.title, htmlContent);
        fs.writeFileSync(path.join(DIST_DIR, subjectId, resource.dest), resourceHtml);
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
  }

  console.log('\n🎉 Build complete! Output in dist/');
  console.log('Run "npm run serve" to preview.');
}

build().catch(console.error);