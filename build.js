import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import fm from 'front-matter';
import { glob } from 'glob';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(__dirname, 'dist');

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
      <div class="exam-info">Exam: 15 Bhadra 2083 (~Aug 31, 2026) • ~2 weeks • 3-4 hrs/day</div>
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