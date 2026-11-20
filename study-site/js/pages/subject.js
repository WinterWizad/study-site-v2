/**
 * Subject Detail Page
 */

import { STUDY_DATA } from '../data.js';
import { router } from '../router.js';

export function renderSubject(subjectId, activeTab = 'overview') {
  const subject = STUDY_DATA.subjects[subjectId];
  if (!subject) {
    window.location.href = router.generateUrl('/');
    return;
  }

  const app = document.getElementById('app');
  if (!app) return;

  const units = subject.units || [];
  const completed = units.filter(u => u.status === 'complete').length;
  const total = units.length;

  app.innerHTML = `
    <aside class="sidebar" id="sidebar">
      <button class="sidebar-toggle" aria-label="Toggle sidebar">
        <wa-icon name="chevron-left"></wa-icon>
      </button>
      <div class="sidebar-overlay" id="sidebarOverlay"></div>

      <div class="sidebar-section">
        <h4 class="sidebar-title">${subject.name}</h4>
        <ul class="sidebar-list" id="sidebarUnits">
          ${units.map(unit => `
            <li class="sidebar-item">
              <a href="${router.generateUrl('/unit/' + subjectId + '/' + unit.id)}" 
                 class="sidebar-link ${unit.status === 'complete' ? 'completed' : ''}"
                 data-unit="${unit.id}">
                <wa-icon name="circle${unit.status === 'complete' ? '-check' : ''}"></wa-icon>
                <span>Unit ${unit.id}: ${unit.title}</span>
                <wa-badge variant="${unit.status === 'complete' ? 'success' : 'neutral'}" pill size="small">
                  ${unit.marks2026} marks
                </wa-badge>
              </a>
            </li>
          `).join('')}
        </ul>
      </div>

      <div class="sidebar-section">
        <h4 class="sidebar-title">Quick Actions</h4>
        <ul class="sidebar-list">
          <li class="sidebar-item">
            <a href="${router.generateUrl('/syllabus/' + subjectId)}" class="sidebar-link">
              <wa-icon name="clipboard-list"></wa-icon>
              <span>Full Syllabus</span>
            </a>
          </li>
          <li class="sidebar-item">
            <a href="${router.generateUrl('/questions/' + subjectId)}" class="sidebar-link">
              <wa-icon name="question-circle"></wa-icon>
              <span>Question Bank</span>
            </a>
          </li>
          <li class="sidebar-item">
            <button class="sidebar-link" data-progress="${subjectId}">
              <wa-icon name="chart-line"></wa-icon>
              <span>View Progress</span>
            </button>
          </li>
          <li class="sidebar-item">
            <a href="#home" class="sidebar-link">
              <wa-icon name="house"></wa-icon>
              <span>All Subjects</span>
            </a>
          </li>
        </ul>
      </div>
    </aside>

    <main class="main-content">
      <header class="content-header">
        <div class="flex justify-between items-start gap-md mb-md">
          <div>
            <h1 class="content-title">${subject.name}</h1>
            <div class="content-meta">
              <span class="meta-item">
                <wa-icon name="code" class="meta-badge subject-${subject.id}"></wa-icon>
                ${subject.code}
              </span>
              <span class="meta-item">
                <wa-icon name="clock"></wa-icon>
                ${subject.hours} lecture hours
              </span>
              <span class="meta-item">
                <wa-icon name="award"></wa-icon>
                ${subject.marks} marks / ${subject.passMarks} pass
              </span>
              <span class="meta-item">
                <wa-icon name="book"></wa-icon>
                ${subject.credits} credits
              </span>
            </div>
          </div>
          <div class="flex gap-sm">
            <wa-button appearance="outline" href="${router.generateUrl('/syllabus/' + subjectId)}">
              <wa-icon name="clipboard-list" slot="start"></wa-icon>
              Syllabus
            </wa-button>
            <wa-button appearance="primary" href="${router.generateUrl('/unit/' + subjectId + '/1')}">
              <wa-icon name="play-circle" slot="start"></wa-icon>
              Start Studying
            </wa-button>
          </div>
        </div>
      </header>

      <div class="tabs-container">
        <div class="tab-list" role="tablist">
          <button class="tab-button ${activeTab === 'overview' ? 'active' : ''}" 
                  data-tab="overview" role="tab" aria-selected="${activeTab === 'overview'}">
            Overview
          </button>
          <button class="tab-button ${activeTab === 'units' ? 'active' : ''}" 
                  data-tab="units" role="tab" aria-selected="${activeTab === 'units'}">
            Units (${total})
          </button>
          <button class="tab-button ${activeTab === 'syllabus' ? 'active' : ''}" 
                  data-tab="syllabus" role="tab" aria-selected="${activeTab === 'syllabus'}">
            Syllabus
          </button>
          <button class="tab-button ${activeTab === 'questions' ? 'active' : ''}" 
                  data-tab="questions" role="tab" aria-selected="${activeTab === 'questions'}">
            Questions
          </button>
          ${subject.modelQuestionSource ? `
          <button class="tab-button ${activeTab === 'model' ? 'active' : ''}" 
                  data-tab="model" role="tab" aria-selected="${activeTab === 'model'}">
            Model Q
          </button>
          ` : ''}
        </div>

        <div class="tab-panels">
          <div class="tab-panel ${activeTab === 'overview' ? 'active' : ''}" role="tabpanel" id="tab-overview">
            ${renderOverviewTab(subject)}
          </div>
          <div class="tab-panel ${activeTab === 'units' ? 'active' : ''}" role="tabpanel" id="tab-units">
            ${renderUnitsTab(subject, units)}
          </div>
          <div class="tab-panel ${activeTab === 'syllabus' ? 'active' : ''}" role="tabpanel" id="tab-syllabus">
            ${renderSyllabusTab(subject)}
          </div>
          <div class="tab-panel ${activeTab === 'questions' ? 'active' : ''}" role="tabpanel" id="tab-questions">
            ${renderQuestionsTab(subject)}
          </div>
          ${subject.modelQuestionSource ? `
          <div class="tab-panel ${activeTab === 'model' ? 'active' : ''}" role="tabpanel" id="tab-model">
            ${renderModelQuestionTab(subject)}
          </div>
          ` : ''}
        </div>
      </div>
    </main>
  `;

  // Initialize tabs
  initializeTabs();
}

function renderOverviewTab(subject) {
  return `
    <div class="content-body">
      <p class="content-text">${subject.description}</p>

      <h3 class="subsection-title">Exam Pattern</h3>
      <div class="alert-box alert-info">
        <div class="alert-box-title"><wa-icon name="clipboard-check"></wa-icon> ${subject.examPattern}</div>
      </div>

      <h3 class="subsection-title">Key Facts</h3>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr><th>Property</th><th>Value</th></tr>
          </thead>
          <tbody>
            <tr><td>Nature</td><td>${subject.nature}</td></tr>
            <tr><td>Curriculum</td><td>${subject.curriculum}</td></tr>
            <tr><td>Syllabus Source</th><td>${subject.syllabusSource || 'TU/FOM'}</td></tr>
            <tr><td>Model Question</th><td>${subject.modelQuestionSource || 'Not available'}</td></tr>
            <tr><td>Total Lecture Hours</th><td>${subject.hours}</td></tr>
          </tbody>
        </table>
      </div>

      ${subject.readings && subject.readings.length > 0 ? `
      <h3 class="subsection-title">Suggested Readings</h3>
      <ul style="line-height: 2;">
        ${subject.readings.map(r => `<li>${r}</li>`).join('')}
      </ul>
      ` : ''}

      ${subject.units ? `
      <h3 class="subsection-title">Unit Breakdown</h3>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr><th>Unit</th><th>Title</th><th>Hours</th><th>2026 Marks</th><th>Difficulty</th><th>Weight</th></tr>
          </thead>
          <tbody>
            ${subject.units.map(u => `
              <tr>
                <td>${u.id}</td>
                <td>${u.title}</td>
                <td>${u.hours}</td>
                <td>${u.marks2026}</td>
                <td>${u.difficulty}</td>
                <td>${getWeightLabel(u.marks2026)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
      ` : ''}
    </div>
  `;
}

function renderUnitsTab(subject, units) {
  return `
    <div class="content-body">
      <div class="subjects-grid" style="grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));">
        ${units.map(unit => `
          <wa-card class="unit-card ${unit.status === 'complete' ? 'completed' : ''}">
            <div class="subject-card-header">
              <div>
                <div class="subject-card-title">Unit ${unit.id}: ${unit.title}</div>
                <div class="subject-card-code">${unit.hours} lecture hours</div>
              </div>
              <div class="subject-card-code">${unit.difficulty}</div>
            </div>

            <div class="subject-card-stats">
              <div class="stat">
                <div class="stat-label">2026 Marks</div>
                <div class="stat-value">${unit.marks2026}</div>
              </div>
              <div class="stat">
                <div class="stat-label">Syllabus Bullets</div>
                <div class="stat-value">${subject.syllabusBullets?.filter(b => b.includes(unit.title.split(' ')[0])).length || '—'}</div>
              </div>
            </div>

            <div class="subject-card-progress">
              <div class="progress-label">
                <span>Status</span>
                <span>${unit.status === 'complete' ? 'Complete' : 'Not Started'}</span>
              </div>
              <wa-progress value="${unit.status === 'complete' ? 100 : 0}" max="100" class="progress-fill ${subject.id}"></wa-progress>
            </div>

            <div class="subject-card-actions">
              <wa-button appearance="primary" href="${router.generateUrl('/unit/' + subject.id + '/' + unit.id)}">
                <wa-icon name="${unit.status === 'complete' ? 'check-circle' : 'play-circle'}" slot="start"></wa-icon>
                ${unit.status === 'complete' ? 'Review' : 'Start'}
              </wa-button>
              <wa-button appearance="outline" href="${router.generateUrl('/questions/' + subject.id)}?unit=${unit.id}">
                <wa-icon name="question-circle" slot="start"></wa-icon>
                Questions
              </wa-button>
            </div>
          </wa-card>
        `).join('')}
      </div>
    </div>
  `;
}

function renderSyllabusTab(subject) {
  if (!subject.units) return '<p>Syllabus not available</p>';

  return `
    <div class="content-body">
      <div class="alert-box alert-info">
        <div class="alert-box-title"><wa-icon name="info-circle"></wa-icon> Official Syllabus</div>
        <p>Source: ${subject.syllabusSource || 'TU/FOM BIM 8th Semester Syllabus 2025'}</p>
      </div>

      ${subject.units.map(unit => `
        <div class="content-section">
          <h3 class="subsection-title">Unit ${unit.id}: ${unit.title} <span class="meta-badge subject-${subject.id}">${unit.hours} LHs</span></h3>
          <ul style="line-height: 2; margin-left: 1.5rem;">
            ${unit.bullets.map(b => `<li>${b}</li>`).join('')}
          </ul>
          <div class="flex gap-sm mt-md">
            <wa-badge variant="neutral" pill>${unit.hours} hours</wa-badge>
            <wa-badge variant="${getWeightVariant(unit.marks2026)}" pill>${unit.marks2026} marks (2026)</wa-badge>
            <wa-badge variant="neutral" pill>${unit.difficulty}</wa-badge>
          </div>
        </div>
      `).join('')}

      <div class="content-section">
        <h3 class="subsection-title">Suggested Readings</h3>
        <ul style="line-height: 2;">
          ${subject.readings?.map(r => `<li>${r}</li>`).join('') || 'No readings specified'}
        </ul>
      </div>

      <h3 class="subsection-title">Exam Pattern</h3>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr><th>Group</th><th>Format</th><th>Marks</th></tr>
          </thead>
          <tbody>
            <tr><td>Group A</td><td>10 × 1 (attempt all)</td><td>10</td></tr>
            <tr><td>Group B</td><td>any 5 of 6 × 3</td><td>15</td></tr>
            <tr><td>Group C</td><td>any 3 of 4 × 5</td><td>15</td></tr>
            <tr><td>Group D</td><td>2 × 10 (compulsory)</td><td>20</td></tr>
            <tr style="font-weight: bold;"><td>Total</td><td></td><td>60</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderQuestionsTab(subject) {
  // Show question bank summary
  return `
    <div class="content-body">
      <div class="alert-box alert-info">
        <div class="alert-box-title"><wa-icon name="question-circle"></wa-icon> Question Bank</div>
        <p>Access the full question bank with model questions, board papers, and answer skeletons.</p>
      </div>

      <div class="flex gap-md mb-md">
        <wa-button appearance="primary" href="${router.generateUrl('/questions/' + subject.id)}">
          <wa-icon name="arrow-right" slot="end"></wa-icon>
          Open Full Question Bank
        </wa-button>
        <wa-button appearance="outline" href="${router.generateUrl('/syllabus/' + subject.id)}">
          <wa-icon name="clipboard-list" slot="start"></wa-icon>
          View Syllabus First
        </wa-button>
      </div>

      <h3 class="subsection-title">Available Resources</h3>
      <ul style="line-height: 2;">
        <li><strong>Model Question 2026</strong> - Official TU/FOM paper (if available)</li>
        <li><strong>2026 Board Paper</strong> - Actual exam paper (when available)</li>
        <li><strong>Unit-wise Breakdown</strong> - Questions mapped to each unit</li>
        <li><strong>Answer Skeletons</strong> - Structured answers with word counts</li>
      </ul>
    </div>
  `;
}

function renderModelQuestionTab(subject) {
  return `
    <div class="content-body">
      <div class="alert-box alert-warning">
        <div class="alert-box-title"><wa-icon name="exclamation-triangle"></wa-icon> Model Question</div>
        <p>This is the official TU/FOM model question. It is <strong>not</strong> a prediction — it's the Dean's Office statement of the paper's shape.</p>
      </div>
      <p>Full model question available in the <a href="${router.generateUrl('/questions/' + subject.id)}">Questions</a> tab.</p>
    </div>
  `;
}

function getWeightLabel(marks) {
  if (marks >= 20) return 'Highest';
  if (marks >= 15) return 'High';
  if (marks >= 10) return 'Medium';
  return 'Low';
}

function getWeightVariant(marks) {
  if (marks >= 20) return 'danger';
  if (marks >= 15) return 'warning';
  if (marks >= 10) return 'primary';
  return 'neutral';
}

function initializeTabs() {
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const tab = button.dataset.tab;

      // Update buttons
      tabButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });
      button.classList.add('active');
      button.setAttribute('aria-selected', 'true');

      // Update panels
      tabPanels.forEach(panel => {
        panel.classList.remove('active');
      });
      const activePanel = document.getElementById(`tab-${button.dataset.tab}`);
      if (activePanel) {
        activePanel.classList.add('active');
      }
    });
  });
}