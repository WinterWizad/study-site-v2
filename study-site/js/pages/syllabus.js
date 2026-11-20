/**
 * Syllabus Page
 */

import { STUDY_DATA } from '../data.js';
import { router } from '../router.js';

export function renderSyllabus(subjectId) {
  const subject = STUDY_DATA.subjects[subjectId];
  if (!subject) {
    window.location.href = '#home';
    return;
  }

  const syllabus = subjectId === 'bi' ? STUDY_DATA.biSyllabus : null;
  if (!syllabus) {
    window.location.href = router.generateUrl('/subject/' + subjectId);
    return;
  }

  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <aside class="sidebar" id="sidebar">
      <button class="sidebar-toggle" aria-label="Toggle sidebar">
        <wa-icon name="chevron-left"></wa-icon>
      </button>
      <div class="sidebar-overlay" id="sidebarOverlay"></div>

      <div class="sidebar-section">
        <h4 class="sidebar-title">${subject.name} Syllabus</h4>
        <ul class="sidebar-list" id="sidebarUnits">
          ${syllabus.units.map(unit => `
            <li class="sidebar-item">
              <a href="#unit-${unit.id}" class="sidebar-link" data-unit="${unit.id}">
                <wa-icon name="bookmark"></wa-icon>
                <span>Unit ${unit.id}: ${unit.title}</span>
                <wa-badge variant="neutral" pill size="small">${unit.hours}h</wa-badge>
              </a>
            </li>
          `).join('')}
          <li class="sidebar-item">
            <a href="#readings" class="sidebar-link" data-section="readings">
              <wa-icon name="book"></wa-icon>
              <span>Suggested Readings</span>
            </a>
          </li>
          <li class="sidebar-item">
            <a href="#pattern" class="sidebar-link" data-section="pattern">
              <wa-icon name="clipboard-list"></wa-icon>
              <span>Exam Pattern</span>
            </a>
          </li>
        </ul>
      </div>

      <div class="sidebar-section">
        <h4 class="sidebar-title">Quick Actions</h4>
        <ul class="sidebar-list">
          <li class="sidebar-item">
            <a href="${router.generateUrl('/subject/' + subjectId)}" class="sidebar-link">
              <wa-icon name="arrow-left"></wa-icon>
              <span>Back to Subject</span>
            </a>
          </li>
          <li class="sidebar-item">
            <a href="${router.generateUrl('/unit/' + subjectId + '/1')}" class="sidebar-link">
              <wa-icon name="play-circle"></wa-icon>
              <span>Start Unit 1</span>
            </a>
          </li>
          <li class="sidebar-item">
            <a href="${router.generateUrl('/questions/' + subjectId)}" class="sidebar-link">
              <wa-icon name="question-circle"></wa-icon>
              <span>Question Bank</span>
            </a>
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
        <div class="flex justify-between items-start gap-md mb-md flex-wrap">
          <div>
            <h1 class="content-title">${subject.name} - Full Syllabus</h1>
            <div class="content-meta">
              <span class="meta-item"><wa-icon name="code"></wa-icon> ${subject.code}</span>
              <span class="meta-item"><wa-icon name="clock"></wa-icon> ${syllabus.totalLectureHours} lecture hours</span>
              <span class="meta-item"><wa-icon name="award"></wa-icon> ${syllabus.fullMarks} marks / ${syllabus.passMarks} pass</span>
              <span class="meta-item"><wa-icon name="book"></wa-icon> ${subject.credits} credits</span>
            </div>
          </div>
          <div class="flex gap-sm">
            <wa-button appearance="primary" href="${router.generateUrl('/unit/' + subjectId + '/1')}">
              <wa-icon name="play-circle" slot="start"></wa-icon>
              Start Unit 1
            </wa-button>
            <wa-button appearance="outline" href="${router.generateUrl('/subject/' + subjectId)}">
              <wa-icon name="arrow-left" slot="start"></wa-icon>
              Back
            </wa-button>
          </div>
        </div>
      </header>

      <div class="content-body" id="syllabusContent">
        ${renderSyllabusHeader(syllabus)}
        ${renderUnits(syllabus)}
        ${renderReadings(syllabus)}
        ${renderExamPattern(syllabus)}
        ${renderHoursBreakdown(syllabus)}
      </div>
    </main>
  `;

  initializeSyllabusNav();
}

function renderSyllabusHeader(syllabus) {
  return `
    <section id="header" class="content-section">
      <h2 class="section-title">Course Information</h2>
      <div class="alert-box alert-info">
        <div class="alert-box-title"><wa-icon name="info-circle"></wa-icon> Official Syllabus</div>
        <p><strong>Source:</strong> ${syllabus.source}</p>
        <p><strong>PDF:</strong> <a href="${syllabus.pdfSource}" target="_blank" rel="noopener">${syllabus.pdfSource}</a></p>
        <p><strong>Verified:</strong> ${syllabus.verified ? 'Yes, against the Dean\'s Office PDF' : 'No'}</p>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead><tr><th>Field</th><th>Value</th></tr></thead>
          <tbody>
            <tr><td>Course Title</td><td>${syllabus.courseTitle}</td></tr>
            <tr><td>Course Code</td><td>${syllabus.courseCode}</td></tr>
            <tr><td>Semester</td><td>${syllabus.semester}</td></tr>
            <tr><td>Nature</td><td>${syllabus.nature}</td></tr>
            <tr><td>Full Marks</td><td>${syllabus.fullMarks}</td></tr>
            <tr><td>Pass Marks</td><td>${syllabus.passMarks}</td></tr>
            <tr><td>Credit Hours</td><td>${syllabus.creditHours} Cr.</td></tr>
            <tr><td>Curriculum</td><td>${syllabus.curriculum}</td></tr>
            <tr><td>Total Lecture Hours</td><td>${syllabus.totalLectureHours}</td></tr>
          </tbody>
        </table>
      </div>

      <h3 class="subsection-title">Course Objective</h3>
      <p class="content-text">${syllabus.courseObjective}</p>

      <h3 class="subsection-title">Course Description</h3>
      <p class="content-text">${syllabus.courseDescription}</p>
    </section>
  `;
}

function renderUnits(syllabus) {
  return `
    <section id="units" class="content-section">
      <h2 class="section-title">Unit Breakdown</h2>
      <p class="content-text">${syllabus.units.length} units, ${syllabus.totalLectureHours} total lecture hours.</p>

      ${syllabus.units.map(unit => `
        <div class="content-section" id="unit-${unit.id}">
          <h3 class="subsection-title">Unit ${unit.id}: ${unit.title} <span class="meta-badge subject-bi">${unit.hours} LHs</span></h3>
          <ul style="line-height: 2; margin-left: 1.5rem;">
            ${unit.bullets.map(b => `<li>${b}</li>`).join('')}
          </ul>
          <div class="flex gap-sm mt-md flex-wrap">
            <wa-badge variant="neutral" pill>${unit.hours} hours</wa-badge>
            <wa-badge variant="${getWeightVariant(unit.marks2026)}" pill>${unit.marks2026} marks (2026)</wa-badge>
            <wa-badge variant="neutral" pill>${unit.difficulty}</wa-badge>
            <wa-badge variant="${unit.status === 'complete' ? 'success' : 'neutral'}" pill>${unit.status}</wa-badge>
          </div>
          <div class="mt-md">
            <wa-button appearance="outline" size="small" href="#unit-${unit.id}" onclick="event.preventDefault(); document.getElementById('unit-${unit.id}').scrollIntoView({behavior:'smooth'})">
              <wa-icon name="book-open" slot="start"></wa-icon>
              Jump to this unit in sidebar
            </wa-button>
            <wa-button appearance="primary" size="small" href="#unit/${unit.id}">
              <wa-icon name="arrow-right" slot="end"></wa-icon>
              Study Unit ${unit.id}
            </wa-button>
          </div>
        </div>
      `).join('')}
    </section>
  `;
}

function renderReadings(syllabus) {
  if (!syllabus.suggestedReadings || syllabus.suggestedReadings.length === 0) return '';

  return `
    <section id="readings" class="content-section">
      <h2 class="section-title">Suggested Readings</h2>
      <div class="alert-box alert-info">
        <div class="alert-box-title"><wa-icon name="book"></wa_icon> Official Syllabus Readings</div>
        <p>These are the texts referenced in the official syllabus. Priority order for exam prep.</p>
      </div>
      <ul style="line-height: 2;">
        ${syllabus.suggestedReadings.map(r => `<li>${r}</li>`).join('')}
      </ul>
    </section>
  `;
}

function renderExamPattern(syllabus) {
  const pattern = syllabus.examPattern;
  if (!pattern) return '';

  return `
    <section id="pattern" class="content-section">
      <h2 class="section-title">Exam Pattern</h2>
      <p class="content-text">Paper: ${pattern.fullMarks} marks / ${pattern.passMarks} pass / ${pattern.time}</p>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr><th>Group</th><th>Format</th><th>Marks</th><th>Description</th></tr>
          </thead>
          <tbody>
            ${Object.entries(pattern.groups || {}).map(([key, group]) => `
              <tr>
                <td><strong>${group.name}</strong></td>
                <td>${group.format}</td>
                <td>${group.format.split('=')[1]?.trim() || ''}</td>
                <td>${group.questions ? group.questions.length + ' questions' : ''}</td>
              </tr>
            `).join('')}
            <tr style="font-weight: bold; background: var(--color-bg-tertiary);">
              <td>Total</td><td></td><td>${pattern.fullMarks}</td><td></td>
            </tr>
          </tbody>
        </table>
      </div>

      ${pattern.groups ? `
      <h3 class="subsection-title" style="margin-top: 24px;">Model Question Breakdown</h3>
      ${Object.entries(pattern.groups).map(([key, group]) => `
        <h4 style="margin: 16px 0 8px; color: var(--color-brand);">${group.name} (${group.format})</h4>
        <div class="table-container">
          <table class="data-table">
            <thead><tr><th>Q#</th><th>Question</th><th>Unit</th></tr></thead>
            <tbody>
              ${group.questions?.map(q => `
                <tr>
                  <td>${q.num}</td>
                  <td>${q.text}</td>
                  <td>${q.unit || q.units?.join(', ') || '—'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `).join('')} 
      ` : ''}
    </section>
  `;
}

function renderHoursBreakdown(syllabus) {
  if (!syllabus.hoursBreakdown) return '';

  return `
    <section id="hours-breakdown" class="content-section">
      <h2 class="section-title">Hours vs Marks Analysis</h2>
      <p class="content-text">Understanding where the marks come from helps prioritize study time.</p>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr><th>Unit</th><th>Title</th><th>Hours</th><th>Marks (2026)</th><th>Marks/Hour</th><th>Exam Weight</th></tr>
          </thead>
          <tbody>
            ${syllabus.hoursBreakdown.map(h => `
              <tr>
                <td>${h.unit}</td>
                <td>${h.title}</td>
                <td>${h.hours}</td>
                <td>${h.marks}</td>
                <td>${(h.marks / h.hours).toFixed(1)}</td>
                <td>${h.weight}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="alert-box alert-warning" style="margin-top: 16px;">
        <div class="alert-box-title"><wa-icon name="exclamation-triangle"></wa-icon> Key Insight</div>
        <p>Units 2, 3, 5, and 6 carry the most marks per hour. Unit 6 (Implementation) alone carries 25 marks in 8 hours — the highest yield in the paper. Unit 3 carries 0 marks in the model question but is insurance for board papers.</p>
      </div>
    </section>
  `;
}

function getWeightVariant(marks) {
  if (marks >= 20) return 'danger';
  if (marks >= 15) return 'warning';
  if (marks >= 10) return 'primary';
  return 'neutral';
}

function initializeSyllabusNav() {
  const sidebarLinks = document.querySelectorAll('.sidebar-link[data-unit], .sidebar-link[data-section]');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        document.querySelectorAll('.sidebar-link').forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    }, { rootMargin: '-100px 0px -66%', threshold: 0 });

  document.querySelectorAll('.content-section').forEach(section => {
    observer.observe(section);
  });
}

export { renderSyllabus };