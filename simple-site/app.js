// Simple static site for BIM 8th Semester study materials
// Loads markdown files from subject folders, renders with marked.js

const SUBJECTS = window.SUBJECTS || {};
const BASE_PATH = '..';

const state = {
  currentSubject: null,
  currentUnit: null,
  searchIndex: [],
  theme: localStorage.getItem('theme') || 'light'
};

// DOM elements
const sidebar = document.getElementById('sidebar');
const sidebarNav = document.getElementById('sidebarNav');
const content = document.getElementById('content');
const searchInput = document.getElementById('searchInput');
const themeToggle = document.getElementById('themeToggle');
const subjectCards = document.getElementById('subjectCards');

// Initialize
document.addEventListener('DOMContentLoaded', init);

function init() {
  applyTheme(state.theme);
  buildSidebar();
  buildSubjectCards();
  buildSearchIndex();
  handleHashChange();
  window.addEventListener('hashchange', handleHashChange);
  searchInput.addEventListener('input', handleSearch);
  themeToggle.addEventListener('click', toggleTheme);

  // Mobile sidebar toggle (click outside to close)
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 768 && sidebar.classList.contains('open')) {
      if (!sidebar.contains(e.target) && e.target !== searchInput) {
        closeSidebar();
      }
    }
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  state.theme = theme;
  localStorage.setItem('theme', theme);
}

function toggleTheme() {
  applyTheme(state.theme === 'dark' ? 'light' : 'dark');
}

function buildSidebar() {
  sidebarNav.innerHTML = '';
  for (const [subjectId, subject] of Object.entries(SUBJECTS)) {
    const group = document.createElement('div');
    group.className = 'subject-group';

    const title = document.createElement('div');
    title.className = 'subject-title';
    title.textContent = `${subject.code} — ${subject.name}`;
    group.appendChild(title);

    subject.units.forEach((unit, idx) => {
      const link = document.createElement('a');
      link.className = 'unit-link';
      link.href = `#${subjectId}/unit-${idx + 1}`;
      link.dataset.subject = subjectId;
      link.dataset.unit = idx + 1;
      link.textContent = `Unit ${idx + 1}: ${unit.title}`;
      link.addEventListener('click', (e) => {
        e.preventDefault();
        navigate(subjectId, idx + 1);
        if (window.innerWidth <= 768) closeSidebar();
      });
      group.appendChild(link);
    });

    sidebarNav.appendChild(group);
  }
}

function buildSubjectCards() {
  subjectCards.innerHTML = '';
  for (const [subjectId, subject] of Object.entries(SUBJECTS)) {
    const card = document.createElement('div');
    card.className = 'subject-card';
    card.innerHTML = `
      <h3>${subject.name}</h3>
      <div class="meta">${subject.code} • ${subject.units.length} units • ${subject.marks} marks</div>
    `;
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      navigate(subjectId, 1);
    });
    subjectCards.appendChild(card);
  }
}

function buildSearchIndex() {
  state.searchIndex = [];
  for (const [subjectId, subject] of Object.entries(SUBJECTS)) {
    subject.units.forEach((unit, idx) => {
      state.searchIndex.push({
        subjectId,
        unitNum: idx + 1,
        title: unit.title,
        subjectName: subject.name,
        subjectCode: subject.code
      });
    });
  }
}

function handleSearch(e) {
  const query = e.target.value.toLowerCase().trim();
  const links = sidebarNav.querySelectorAll('.unit-link');

  if (!query) {
    links.forEach(l => l.style.display = '');
    return;
  }

  links.forEach(link => {
    const text = link.textContent.toLowerCase();
    link.style.display = text.includes(query) ? '' : 'none';
  });
}

function handleHashChange() {
  const hash = window.location.hash.slice(1);
  if (!hash) {
    showWelcome();
    return;
  }

  const [subjectId, unitPart] = hash.split('/');
  const unitNum = parseInt(unitPart?.replace('unit-', ''), 10);

  if (SUBJECTS[subjectId] && unitNum && unitNum <= SUBJECTS[subjectId].units.length) {
    navigate(subjectId, unitNum, false);
  } else {
    showWelcome();
  }
}

function navigate(subjectId, unitNum, pushState = true) {
  if (pushState) {
    window.location.hash = `${subjectId}/unit-${unitNum}`;
  }
  state.currentSubject = subjectId;
  state.currentUnit = unitNum;
  updateActiveLink(subjectId, unitNum);
  loadAndRender(subjectId, unitNum);
}

function updateActiveLink(subjectId, unitNum) {
  document.querySelectorAll('.unit-link').forEach(link => {
    const isActive = link.dataset.subject === subjectId && parseInt(link.dataset.unit) === unitNum;
    link.classList.toggle('active', isActive);
  });
}

function showWelcome() {
  state.currentSubject = null;
  state.currentUnit = null;
  document.querySelectorAll('.unit-link').forEach(l => l.classList.remove('active'));
  content.innerHTML = `
    <div class="welcome">
      <h2>Welcome</h2>
      <p>Select a subject and unit from the sidebar to start studying.</p>
      <div class="subject-cards" id="subjectCards"></div>
    </div>
  `;
  buildSubjectCards();
}

async function loadAndRender(subjectId, unitNum) {
  const subject = SUBJECTS[subjectId];
  const unit = subject.units[unitNum - 1];

  content.innerHTML = `<div class="loading">Loading ${unit.title}...</div>`;

  try {
    // Build the path to the markdown file
    const folder = subject.folder;
    const filename = unit.file;
    const url = `${BASE_PATH}/${folder}/${filename}`;

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to load: ${response.status}`);

    const markdown = await response.text();
    const html = marked.parse(markdown, { async: false });

    content.innerHTML = `
      <article>
        <header>
          <span class="subject-badge">${subject.code}</span>
          <h1>${unit.title}</h1>
          <div class="unit-meta">Unit ${unitNum} of ${subject.units.length} • ${subject.name}</div>
        </header>
        ${html}
      </article>
    `;

    // Highlight code blocks
    document.querySelectorAll('pre code').forEach(block => {
      hljs.highlightElement(block);
    });

    // Add copy buttons to code blocks
    addCopyButtons();

  } catch (err) {
    content.innerHTML = `
      <article>
        <div class="alert alert-danger">
          <strong>Error loading content:</strong> ${err.message}
          <p>Expected path: <code>${BASE_PATH}/${subject.folder}/${unit.file}</code></p>
        </div>
      </article>
    `;
    console.error(err);
  }
}

function addCopyButtons() {
  document.querySelectorAll('pre').forEach(pre => {
    if (pre.querySelector('.copy-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.style.cssText = `
      position: absolute; top: 0.5rem; right: 0.5rem;
      padding: 0.25rem 0.5rem; font-size: 0.75rem;
      background: var(--card-bg); border: 1px solid var(--border);
      border-radius: 4px; cursor: pointer; opacity: 0;
      transition: opacity 0.2s;
    `;
    pre.style.position = 'relative';
    pre.appendChild(btn);
    pre.addEventListener('mouseenter', () => btn.style.opacity = '1');
    pre.addEventListener('mouseleave', () => btn.style.opacity = '0');
    btn.addEventListener('click', async () => {
      const code = pre.querySelector('code').textContent;
      await navigator.clipboard.writeText(code);
      btn.textContent = 'Copied!';
      setTimeout(() => btn.textContent = 'Copy', 1500);
    });
  });
}

function closeSidebar() {
  sidebar.classList.remove('open');
  const overlay = document.querySelector('.sidebar-overlay');
  if (overlay) overlay.classList.remove('open');
}

// Configure marked
marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  mangle: false
});