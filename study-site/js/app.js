/**
 * Main Application Entry Point
 * Initializes the study site and handles page rendering
 */

import router from './router.js';
import { STUDY_DATA } from './data.js';
import { renderHome } from './pages/home.js';
import { renderSubject } from './pages/subject.js';
import { renderUnit } from './pages/unit.js';
import { renderSyllabus } from './pages/syllabus.js';
import { renderQuestions } from './pages/questions.js';
import { initSearchDialog, openSearchDialog } from './components/search.js';
import { initDiagramViewer } from './components/diagram.js';
import { initTheme } from './utils/theme.js';

// ============================================================================
// App State
// ============================================================================
const appState = {
  currentSubject: null,
  currentUnit: null,
  searchIndex: null,
  theme: 'light'
};

// ============================================================================
// Initialize App
// ============================================================================
async function initApp() {
  console.log('[App] Initializing BIM Study Site...');

  // Initialize theme
  initTheme();

  // Build search index
  buildSearchIndex();

  // Register routes
  registerRoutes();

  // Initialize components
  initDiagramViewer();
  initSearchDialog();
  initProgressDialog();
  initMobileSidebar();

  // Subscribe to route changes
  router.subscribe((route, params) => {
    console.log('[App] Route changed:', route.pattern, params);
    handleRouteChange(route, params);
  });

  // Initial route
  console.log('[App] Calling initial handleHashChange');
  router.handleHashChange();

  console.log('[App] App initialized successfully');
}

// ============================================================================
// Route Registration
// ============================================================================
function registerRoutes() {
  console.log('[App] Registering routes...');
  router.addRoute('/', () => {
    console.log('[App] Home route handler called');
    renderHome();
  });
  router.addRoute('/subject/:subjectId', (params) => renderSubject(params.subjectId));
  router.addRoute('/subject/:subjectId/:tab', (params) => renderSubject(params.subjectId, params.tab));
  router.addRoute('/unit/:subjectId/:unitId', (params) => renderUnit(params.subjectId, parseInt(params.unitId)));
  router.addRoute('/syllabus/:subjectId', (params) => renderSyllabus(params.subjectId));
  router.addRoute('/questions/:subjectId', (params) => renderQuestions(params.subjectId));
  router.addRoute('/search', () => openSearchDialog());
  console.log('[App] Routes registered:', Array.from(router.routes.keys()));
}

// ============================================================================
// Route Change Handler
// ============================================================================
function handleRouteChange(route, params) {
  // Update active nav
  updateActiveNav(params);

  // Scroll to top
  window.scrollTo(0, 0);

  // Close mobile sidebar
  closeMobileSidebar();
}

// ============================================================================
// Navigation Helpers
// ============================================================================
function updateActiveNav(params) {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => link.classList.remove('active'));

  // Determine active based on current route
  const hash = window.location.hash.slice(1) || '/';
  if (hash === '/' || hash === '') {
    document.querySelector('[data-page="home"]')?.classList.add('active');
  } else if (hash.startsWith('/subject')) {
    document.querySelector('[data-page="subjects"]')?.classList.add('active');
  } else if (hash.startsWith('/search')) {
    document.querySelector('[data-page="search"]')?.classList.add('active');
  }
}

function getSubject(subjectId) {
  return STUDY_DATA.subjects[subjectId];
}

function getUnit(subjectId, unitId) {
  if (subjectId === 'bi' && unitId === 1) {
    return STUDY_DATA.biUnit1;
  }
  return null;
}

// ============================================================================
// Search Index
// ============================================================================
function buildSearchIndex() {
  const index = [];

  // Index BI Unit 1
  const unit1 = STUDY_DATA.biUnit1;
  if (unit1) {
    unit1.sections.forEach(section => {
      index.push({
        type: 'section',
        subject: 'bi',
        unit: 1,
        id: section.id,
        title: section.title,
        content: stripHtml(section.content || ''),
        url: router.generateUrl('/unit/bi/1', { anchor: section.id })
      });
    });

    // Index skeletons
    unit1.skeletons.forEach(skeleton => {
      index.push({
        type: 'skeleton',
        subject: 'bi',
        unit: 1,
        id: skeleton.q,
        title: `${skeleton.q}: ${skeleton.question}`,
        content: skeleton.answer,
        url: router.generateUrl('/unit/bi/1', { anchor: `skeleton-${skeleton.q}` })
      });
    });

    // Index traps
    unit1.traps.forEach((trap, i) => {
      index.push({
        type: 'trap',
        subject: 'bi',
        unit: 1,
        id: `trap-${i}`,
        title: `Trap: ${trap.name}`,
        content: `${trap.reason} Fix: ${trap.fix}`,
        url: router.generateUrl('/unit/bi/1', { anchor: 'traps' })
      });
    });
  }

  // Index syllabus units
  STUDY_DATA.biSyllabus.units.forEach(unit => {
    index.push({
      type: 'syllabus-unit',
      subject: 'bi',
      unit: unit.id,
      title: `Unit ${unit.id}: ${unit.title}`,
      content: unit.bullets.join(' '),
      url: router.generateUrl('/unit/bi/' + unit.id)
    });
  });

  // Index model questions
  Object.entries(STUDY_DATA.biModelQuestion.groups).forEach(([groupName, group]) => {
    group.questions.forEach(q => {
      index.push({
        type: 'question',
        subject: 'bi',
        group: groupName,
        id: q.num,
        title: `Q${q.num}: ${q.text}`,
        content: q.text,
        url: router.generateUrl('/questions/bi', { group: groupName, q: q.num })
      });
    });
  });

  appState.searchIndex = index;
  console.log(`Search index built with ${index.length} entries`);
}

// ============================================================================
// Utility Functions
// ============================================================================
function stripHtml(html) {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

// ============================================================================
// Progress Dialog
// ============================================================================
function initProgressDialog() {
  const dialog = document.getElementById('progress-dialog');
  const content = document.getElementById('progress-content');

  if (!dialog || !content) return;

  // Delegate click on progress buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-progress]');
    if (btn) {
      e.preventDefault();
      const subjectId = btn.dataset.subject;
      showProgress(subjectId);
    }
  });

  function showProgress(subjectId) {
    const subject = getSubject(subjectId);
    if (!subject) return;

    const units = subject.units || [];
    const completed = units.filter(u => u.status === 'complete').length;
    const total = units.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    content.innerHTML = `
      <div class="progress-header">
        <h3>${subject.name} Progress</h3>
        <div class="progress-summary">
          <wa-progress value="${percentage}" max="100" size="large"></wa-progress>
          <span>${completed}/${total} units complete (${percentage}%)</span>
        </div>
      </div>
      <div class="progress-units">
        ${units.map(unit => `
          <div class="progress-unit">
            <div class="progress-unit-info">
              <span class="progress-unit-title">Unit ${unit.id}: ${unit.title}</span>
              <span class="progress-unit-meta">${unit.hours}h • ${unit.marks2026} marks • ${unit.difficulty}</span>
            </div>
            <wa-badge variant="${unit.status === 'complete' ? 'success' : 'neutral'}" pill>
              ${unit.status === 'complete' ? 'Done' : 'Pending'}
            </wa-badge>
          </div>
        `).join('')}
      </div>
    `;
    dialog.show();
  }
}

// ============================================================================
// Mobile Sidebar
// ============================================================================
function initMobileSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const toggle = document.querySelector('.sidebar-toggle');
  const overlay = document.querySelector('.sidebar-overlay');

  if (!sidebar || !toggle) return;

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('open');
  });

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  }

  // Close on link click
  sidebar.addEventListener('click', (e) => {
    if (e.target.closest('.sidebar-link')) {
      sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
    }
  });
}

function closeMobileSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
}

// ============================================================================
// Utility Functions
// ============================================================================
export function navigateToSubject(subjectId) {
  router.navigate(`/subject/${subjectId}`);
}

export function navigateToUnit(subjectId, unitId) {
  router.navigate(`/unit/${subjectId}/${unitId}`);
}

export function navigateToSyllabus(subjectId) {
  router.navigate(`/syllabus/${subjectId}`);
}

export function navigateToQuestions(subjectId) {
  router.navigate(`/questions/${subjectId}`);
}

export function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showCopyFeedback('Copied!');
  }).catch(() => {
    showCopyFeedback('Failed to copy');
  });
}

function showCopyFeedback(message) {
  let feedback = document.querySelector('.copy-feedback');
  if (!feedback) {
    feedback = document.createElement('div');
    feedback.className = 'copy-feedback';
    document.body.appendChild(feedback);
  }
  feedback.textContent = message;
  feedback.classList.add('show');
  setTimeout(() => feedback.classList.remove('show'), 2000);
}

// ============================================================================
// Start App
// ============================================================================
document.addEventListener('DOMContentLoaded', initApp);

// Export for debugging
window.STUDY_APP = {
  router,
  appState,
  navigateToSubject,
  navigateToUnit,
  navigateToSyllabus,
  navigateToQuestions,
  copyToClipboard
};
