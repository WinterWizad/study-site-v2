/**
 * Home Page - Subject Dashboard
 */

import { STUDY_DATA } from '../data.js';
import { router } from '../router.js';

export function renderHome() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <aside class="sidebar" id="sidebar">
      <button class="sidebar-toggle" aria-label="Toggle sidebar">
        <wa-icon name="chevron-left"></wa-icon>
      </button>
      <div class="sidebar-overlay" id="sidebarOverlay"></div>
      
      <div class="sidebar-section">
        <h4 class="sidebar-title">Subjects</h4>
        <ul class="sidebar-list" id="sidebarSubjects">
          ${Object.entries(STUDY_DATA.subjects).map(([id, subject]) => `
            <li class="sidebar-item">
              <a href="${router.generateUrl('/subject/' + id)}" class="sidebar-link" data-subject="${id}">
                <wa-icon name="${subject.icon}"></wa-icon>
                <span>${subject.name}</span>
                <wa-badge variant="neutral" pill>${subject.marks} marks</wa-badge>
              </a>
            </li>
          `).join('')}
        </ul>
      </div>

      <div class="sidebar-section">
        <h4 class="sidebar-title">Quick Links</h4>
        <ul class="sidebar-list">
          <li class="sidebar-item">
            <a href="#search" class="sidebar-link">
              <wa-icon name="search"></wa-icon>
              <span>Search All</span>
            </a>
          </li>
          <li class="sidebar-item">
            <button class="sidebar-link" data-progress="bi">
              <wa-icon name="chart-line"></wa-icon>
              <span>My Progress</span>
            </button>
          </li>
        </ul>
      </div>
    </aside>

    <main class="main-content">
      <header class="page-hero">
        <div class="page-hero-icon bi">
          <wa-icon name="mortarboard-fill"></wa-icon>
        </div>
        <h1 class="page-hero-title">BIM 8th Semester Exam Prep</h1>
        <p class="page-hero-subtitle">
          Complete study materials for TU/FOM BIM 8th Semester (2026 batch). 
          Four theory papers, ~2 weeks until 15 Bhadra. Organized by subject, unit, and question type.
        </p>
      </header>

      <section class="content-section">
        <h2 class="section-title">Your Subjects</h2>
        <div class="subjects-grid" id="subjectsGrid">
          ${Object.entries(STUDY_DATA.subjects).map(([id, subject]) => renderSubjectCard(id, subject)).join('')}
        </div>
      </section>

      <section class="content-section">
        <h2 class="section-title">Exam Overview</h2>
        <div class="subjects-grid">
          <wa-card class="info-card">
            <div class="card-header">
              <h3 class="card-title">60-Mark Papers</h3>
            </div>
            <div class="card-body">
              <p><strong>Business Intelligence (IT 249)</strong> & <strong>Cloud Computing (IT 277)</strong></p>
              <p>Group A: 10×1=10 | Group B: 5×3=15 | Group C: 3×5=15 | Group D: 2×10=20</p>
              <p>Pass: 30/60</p>
            </div>
          </wa-card>
          <wa-card class="info-card">
            <div class="card-header">
              <h3 class="card-title">100-Mark Papers</h3>
            </div>
            <div class="card-body">
              <p><strong>Digital Economy (IT 250)</strong> & <strong>IT Entrepreneurship (IT 248)</strong></p>
              <p>Group A: 10×2=20 | Group B: 6×5=30 | Group C: 3×10=30 | Group D: 1×20=20</p>
              <p>Pass: 50/100</p>
            </div>
          </wa-card>
          <wa-card class="info-card">
            <div class="card-header">
              <h3 class="card-title">Key Dates</h3>
            </div>
            <div class="card-body">
              <p><strong>Exam:</strong> 15 Bhadra 2083 (approx. Aug 31, 2026)</p>
              <p><strong>Prep Time:</strong> ~2 weeks</p>
              <p><strong>Daily Budget:</strong> 3-4 hours</p>
            </div>
          </wa-card>
        </div>
      </section>

      <section class="content-section">
        <h2 class="section-title">Study Strategy</h2>
        <div class="alert-box alert-info">
          <div class="alert-box-title"><wa-icon name="lightbulb"></wa-icon> Recommended Study Order</div>
          <ol style="margin: 0; padding-left: 1.5rem; line-height: 2;">
            <li><strong>Business Intelligence</strong> - Start here. Units 6 (Implementation, 25 marks) and 2 (Warehousing, 11 marks) are the highest yield.</li>
            <li><strong>Digital Economy</strong> - 100 marks. Unit 2 (29 marks) and Unit 6 (29 marks, owns the case) are critical.</li>
            <li><strong>Cloud Computing</strong> - Unit 6 Security (25 marks) and Unit 4 Virtualization (17 marks) = 70% of paper.</li>
            <li><strong>IT Entrepreneurship</strong> - Unit 2 (29 marks) and Unit 6 (29 marks) = 58% of paper. Units 3 & 4 are easy memorization.</li>
          </ol>
        </div>
      </section>

      <section class="content-section">
        <h2 class="section-title">Resources</h2>
        <div class="subjects-grid">
          <wa-card>
            <div class="card-header">
              <h3 class="card-title">Official Sources</h3>
            </div>
            <div class="card-body">
              <ul style="line-height: 2;">
                <li><a href="https://fomecd.edu.np/syllabuses/BIM%208th%20Semester%20Syllabus%202025.pdf" target="_blank">TU/FOM Official Syllabus PDF</a></li>
                <li><a href="https://fomecd.edu.np/noticeattachments/Model%20Question%20for%20BITM%201st%20and%20BBA%20BIM%20and%20BBB%208th%20Semester%20Final.pdf" target="_blank">TU/FOM Model Questions 2026</a></li>
                <li>2026 Board Papers (when available)</li>
              </ul>
            </div>
          </wa-card>
          <wa-card>
            <div class="card-header">
              <h3 class="card-title">Suggested Readings (BI)</h3>
            </div>
            <div class="card-body">
              <ul style="line-height: 2; font-size: 0.875rem;">
                <li>Sherman - <em>Business Intelligence Guidebook</em></li>
                <li>Provost & Fawcett - <em>Data Science for Business</em></li>
                <li>Kimball & Ross - <em>The Data Warehouse Toolkit</em></li>
                <li>Han, Kamber & Pei - <em>Data Mining</em></li>
                <li>Tufte - <em>The Visual Display of Quantitative Information</em></li>
              </ul>
            </div>
          </wa-card>
        </div>
      </section>
    </main>
  `;

  // Initialize sidebar links
  initializeSidebar();
}

function initializeSidebar() {
  const sidebarLinks = document.querySelectorAll('.sidebar-link[data-subject]');
  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const subjectId = link.dataset.subject;
      window.location.href = link.href;
    });
  });
}

function renderSubjectCard(id, subject) {
  const units = subject.units || [];
  const completed = units.filter(u => u.status === 'complete').length;
  const total = units.length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return `
    <wa-card class="subject-card ${id}">
      <div class="subject-card-header">
        <div>
          <div class="subject-card-title">${subject.name}</div>
          <div class="subject-card-code">${subject.code}</div>
        </div>
        <div class="subject-card-icon ${id}">
          <wa-icon name="${subject.icon}"></wa-icon>
        </div>
      </div>

      <div class="subject-card-stats">
        <div class="stat">
          <div class="stat-label">Lecture Hours</div>
          <div class="stat-value">${subject.hours}h</div>
        </div>
        <div class="stat">
          <div class="stat-label">Full Marks</div>
          <div class="stat-value">${subject.marks}</div>
        </div>
        <div class="stat">
          <div class="stat-label">Pass Marks</div>
          <div class="stat-value">${subject.passMarks}</div>
        </div>
      </div>

      <div class="subject-card-progress">
        <div class="progress-label">
          <span>Unit Progress</span>
          <span>${completed}/${total} units</span>
        </div>
        <wa-progress value="${percentage}" max="100" class="progress-fill ${id}"></wa-progress>
      </div>

      <div class="subject-card-actions">
        <wa-button appearance="primary" href="${router.generateUrl('/subject/' + id)}">
          <wa-icon name="book-open" slot="start"></wa-icon>
          Open Subject
        </wa-button>
        <wa-button appearance="outline" href="${router.generateUrl('/syllabus/' + subject.id)}">
          <wa-icon name="clipboard-list" slot="start"></wa-icon>
          Syllabus
        </wa-button>
      </div>
    </wa-card>
  `;
}