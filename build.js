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
  { iso: '2026-12-01', bs: 'Mangsir 15, 2083', day: 'Tuesday', code: 'IT 248', title: 'IT Entrepreneurship & Management (NC)', subjectId: 'entrepreneurship', isOurs: true },
  { iso: '2026-12-03', bs: 'Mangsir 17, 2083', day: 'Thursday', code: 'IT 250', title: 'Digital Economy (NC)', subjectId: 'de', isOurs: true },
  { iso: '2026-12-06', bs: 'Mangsir 20, 2083', day: 'Sunday', code: 'IT 249', title: 'Business Intelligence (NC)', subjectId: 'bi', isOurs: true },
  { iso: '2026-12-08', bs: 'Mangsir 22, 2083', day: 'Tuesday', code: 'IT 275 / IT 276', title: '.NET Technologies (NC) / Database Administration (NC)', subjectId: null, isOurs: false },
  { iso: '2026-12-10', bs: 'Mangsir 24, 2083', day: 'Thursday', code: 'IT 277', title: 'Cloud Computing (NC)', subjectId: 'cloud', isOurs: true },
];

const EXAM_CENTRE = 'Kirtipur';
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
      <button class="theme-toggle" aria-label="Toggle theme" onclick="toggleTheme()">☀️</button>
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

  <script src="../app.js"></script>
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
      <a href="../../index.html" class="site-title">BIM 8th Semester</a>
      <span class="subject-badge" style="background: ${subject.color}">${subject.code}</span>
      <button class="theme-toggle" aria-label="Toggle theme" onclick="toggleTheme()">🌙</button>
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
          <a href="../../index.html" class="footer-link">← All Subjects</a>
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
    if (themeBtn) themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

    window.toggleTheme = function() {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      const themeBtn = document.querySelector('.theme-toggle');
      if (themeBtn) themeBtn.textContent = next === 'dark' ? '☀️' : '🌙';
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
      <button class="theme-toggle" aria-label="Toggle theme" onclick="toggleTheme()">🌙</button>
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
    if (themeBtn) themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

    window.toggleTheme = function() {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      const themeBtn = document.querySelector('.theme-toggle');
      if (themeBtn) themeBtn.textContent = next === 'dark' ? '☀️' : '🌙';
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
      <button class="theme-toggle" aria-label="Toggle theme" onclick="toggleTheme()">🌙</button>
    </div>
  </header>

  <div class="layout">
    <aside class="sidebar" id="sidebar">
      <button class="sidebar-toggle" aria-label="Toggle sidebar" onclick="toggleSidebar()">☰</button>
      <div class="sidebar-overlay" onclick="closeSidebar()"></div>
      <div class="sidebar-content">
        <h3>All Subjects</h3>
        <ul class="subject-list">
          ${Object.values(SUBJECTS).map(s => `
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
            <li><a href="../_syllabus/${subject.code.toLowerCase().replace(' ', '-')}-${subject.name.toLowerCase().replace(/\s+/g, '-')}.md" target="_blank">Syllabus</a></li>
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
    if (themeBtn) themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

    window.toggleTheme = function() {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      const themeBtn = document.querySelector('.theme-toggle');
      if (themeBtn) themeBtn.textContent = next === 'dark' ? '☀️' : '🌙';
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

function generateMainIndexHtml() {
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
      <h1 class="site-title">BIM 8th Semester</h1>
      <div class="exam-info" id="examCountdown">
        <span class="countdown-text">Loading…</span>
      </div>
      <button class="theme-toggle" aria-label="Toggle theme" onclick="toggleTheme()">🌙</button>
    </div>
  </header>

  <div class="layout">
    <aside class="sidebar" id="sidebar">
      <button class="sidebar-toggle" aria-label="Toggle sidebar" onclick="toggleSidebar()">☰</button>
      <div class="sidebar-overlay" onclick="closeSidebar()"></div>
      <div class="sidebar-content">
        <h3>Subjects</h3>
        <ul class="subject-list">
          ${Object.values(SUBJECTS).map(s => `
            <li>
              <a href="${s.id}/" style="border-left-color: ${s.color}">
                <span class="subject-code">${s.code}</span>
                <span class="subject-name">${s.name}</span>
              </a>
            </li>
          `).join('')}
        </ul>
        <div class="sidebar-footer">
          <div class="progress-summary">
            <span>4 Subjects</span>
            <span>25 Units</span>
            <span>320 Marks Total</span>
          </div>
        </div>
      </div>
    </aside>

    <main class="content" role="main">
      <section class="hero">
        <h2>Study Materials</h2>
        <p>Complete, exam-ready notes for all four subjects. Each unit includes exam analysis, structured content, diagrams, and model question answers.</p>
      </section>

      <section class="exam-routine">
        <h3>Exam Routine <span class="routine-badge">2083 / 2026</span></h3>
        <div class="routine-table-wrapper">
          <table class="routine-table">
            <thead>
              <tr>
                <th>Date (AD)</th>
                <th>Date (BS)</th>
                <th>Day</th>
                <th>Code</th>
                <th>Subject</th>
              </tr>
            </thead>
            <tbody>
              ${EXAM_ROUTINE.map(exam => `
                <tr class="${exam.isOurs ? 'ours' : 'other'}">
                  <td>${formatExamDate(exam.iso)}</td>
                  <td>${exam.bs}</td>
                  <td>${exam.day}</td>
                  <td><code>${exam.code}</code></td>
                  <td>${exam.isOurs && exam.subjectId ? `<a href="${exam.subjectId}/" style="color: ${SUBJECTS[exam.subjectId].color}; font-weight: 600;">${exam.title}</a>` : exam.title}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="routine-notes">
          ${EXAM_NOTES.map(note => `<p>• ${note}</p>`).join('')}
        </div>
      </section>

      <section class="subjects-grid">
        ${Object.values(SUBJECTS).map(s => `
          <article class="subject-card" style="--subject-color: ${s.color}">
            <a href="${s.id}/">
              <header class="card-header">
                <span class="subject-badge">${s.code}</span>
                <h3>${s.name}</h3>
              </header>
              <div class="card-stats">
                <span class="stat"><strong>${s.marks}</strong> marks</span>
                <span class="stat"><strong>${s.units.length}</strong> units</span>
                <span class="stat"><strong>${s.passMarks}</strong> pass</span>
              </div>
              <ul class="unit-preview">
                ${s.units.slice(0, 3).map(u => `<li>Unit ${u.num}: ${u.title}</li>`).join('')}
                ${s.units.length > 3 ? `<li>+${s.units.length - 3} more units</li>` : ''}
              </ul>
              <a href="${s.id}/" class="card-link">Open Subject →</a>
            </a>
          </article>
        `).join('')}
      </section>

      <section class="exam-pattern">
        <h3>Exam Pattern Overview</h3>
        <div class="pattern-table-wrapper">
          <table class="pattern-table">
            <thead>
              <tr><th>Subject</th><th>Code</th><th>Full Marks</th><th>Pass Marks</th><th>Groups</th></tr>
            </thead>
            <tbody>
              <tr><td>Business Intelligence</td><td>IT 249</td><td>60</td><td>30</td><td>A:10×1, B:5×3, C:3×5, D:2×10</tr>
              <tr><td>Digital Economy</td><td>IT 250</td><td>100</td><td>50</td><td>A:10×2, B:6×5, C:3×10, D:1×20</tr>
              <tr><td>Cloud Computing</td><td>IT 277</td><td>60</td><td>30</td><td>A:10×1, B:5×3, C:3×5, D:2×10</tr>
              <tr><td>IT Entrepreneurship</td><td>IT 248</td><td>100</td><td>50</td><td>A:10×2, B:6×5, C:3×10, D:1×20</tr>
            </tbody>
          </table>
        </div>
      </section>
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
    if (themeBtn) themeBtn.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

    window.toggleTheme = function() {
      const html = document.documentElement;
      const current = html.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
      const themeBtn = document.querySelector('.theme-toggle');
      if (themeBtn) themeBtn.textContent = next === 'dark' ? '☀️' : '🌙';
    };

    // Exam countdown
    const EXAM_ROUTINE_JS = ${JSON.stringify(EXAM_ROUTINE)};
    function parseLocal(iso) {
      const [y, m, d] = iso.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    function fmtDate(iso) {
      const [y, m, d] = iso.split('-').map(Number);
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
    function updateCountdown() {
      const now = new Date(); now.setHours(0,0,0,0);
      let next = null;
      for (const e of EXAM_ROUTINE_JS) {
        const d = parseLocal(e.iso);
        if (d >= now) { next = e; break; }
      }
      const el = document.getElementById('examCountdown');
      if (!el) return;
      if (!next) {
        el.innerHTML = '<span class="countdown-text">All papers complete</span>';
        return;
      }
      const days = Math.ceil((parseLocal(next.iso) - now) / 86400000);
      const subjectLink = next.subjectId ? '<a href="' + next.subjectId + '/">' + next.title + '</a>' : next.title;
      el.innerHTML = '<span class="countdown-text">Next: ' + subjectLink + ' — ' + fmtDate(next.iso) + ' · <strong>' + days + '</strong> day' + (days !== 1 ? 's' : '') + '</span>';
    }
    updateCountdown();
    setInterval(updateCountdown, 3600000);

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