/**
 * Unit Detail Page
 */

import { STUDY_DATA } from '../data.js';
import { router } from '../router.js';

export function renderUnit(subjectId, unitId) {
  const subject = STUDY_DATA.subjects[subjectId];
  if (!subject) {
    window.location.href = router.generateUrl('/');
    return;
  }

  // Get unit data
  let unitData = null;
  if (subjectId === 'bi' && unitId === 1) {
    unitData = STUDY_DATA.biUnit1;
  }

  if (!unitData) {
    window.location.href = router.generateUrl('/subject/' + subjectId);
    return;
  }

  const app = document.getElementById('app');
  if (!app) return;

  const units = subject.units || [];
  const currentUnitIndex = units.findIndex(u => u.id === unitId);
  const prevUnit = currentUnitIndex > 0 ? units[currentUnitIndex - 1] : null;
  const nextUnit = currentUnitIndex < units.length - 1 ? units[currentUnitIndex + 1] : null;

  app.innerHTML = `
    <aside class="sidebar" id="sidebar">
      <button class="sidebar-toggle" aria-label="Toggle sidebar">
        <wa-icon name="chevron-left"></wa-icon>
      </button>
      <div class="sidebar-overlay" id="sidebarOverlay"></div>

      <div class="sidebar-section">
        <h4 class="sidebar-title">${subject.name} - Unit ${unitId}</h4>
        <ul class="sidebar-list" id="sidebarSections">
          <li class="sidebar-item">
            <a href="#overview" class="sidebar-link active" data-section="overview">
              <wa-icon name="info-circle"></wa-icon>
              <span>Overview</span>
            </a>
          </li>
          ${unitData.sections.map((section, i) => `
            <li class="sidebar-item">
              <a href="#${section.id}" class="sidebar-link" data-section="${section.id}">
                <wa-icon name="file-text"></wa-icon>
                <span>${section.title}</span>
              </a>
            </li>
          `).join('')}
          <li class="sidebar-item">
            <a href="#skeletons" class="sidebar-link" data-section="skeletons">
              <wa-icon name="clipboard-check"></wa-icon>
              <span>Answer Skeletons</span>
            </a>
          </li>
          <li class="sidebar-item">
            <a href="#traps" class="sidebar-link" data-section="traps">
              <wa-icon name="exclamation-triangle"></wa-icon>
              <span>Traps</span>
            </a>
          </li>
          <li class="sidebar-item">
            <a href="#self-test" class="sidebar-link" data-section="self-test">
              <wa-icon name="question-circle"></wa-icon>
              <span>Self Test</span>
            </a>
          </li>
          <li class="sidebar-item">
            <a href="#checklist" class="sidebar-link" data-section="checklist">
              <wa-icon name="stopwatch"></wa-icon>
              <span>60-Second Check</span>
            </a>
          </li>
        </ul>
      </div>

      <div class="sidebar-section">
        <h4 class="sidebar-title">Navigation</h4>
        <ul class="sidebar-list">
          <li class="sidebar-item">
            <a href="${router.generateUrl('/subject/' + subjectId)}" class="sidebar-link">
              <wa-icon name="arrow-left"></wa-icon>
              <span>Back to Subject</span>
            </a>
          </li>
          ${subject.units && subject.units.length > 1 ? `
          <li class="sidebar-item">
            <a href="${router.generateUrl('/unit/' + subjectId + '/' + (unitId > 1 ? unitId - 1 : subject.units[subject.units.length - 1].id))}" class="sidebar-link">
              <wa-icon name="chevron-left"></wa-icon>
              <span>Previous Unit</span>
            </a>
          </li>
          <li class="sidebar-item">
            <a href="${router.generateUrl('/unit/' + subjectId + '/' + (unitId < subject.units.length ? unitId + 1 : 1))}" class="sidebar-link">
              <wa-icon name="chevron-right"></wa-icon>
              <span>Next Unit</span>
            </a>
          </li>
          ` : ''}
          <li class="sidebar-item">
            <a href="${router.generateUrl('/questions/' + subjectId)}?unit=${unitId}" class="sidebar-link">
              <wa-icon name="question-circle"></wa-icon>
              <span>Unit Questions</span>
            </a>
          </li>
        </ul>
      </div>

      <div class="sidebar-section">
        <h4 class="sidebar-title">Actions</h4>
        <ul class="sidebar-list">
          <li class="sidebar-item">
            <button class="sidebar-link" onclick="window.print()">
              <wa-icon name="printer"></wa-icon>
              <span>Print / Save as PDF</span>
            </button>
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
      <header class="content-header">
        <div class="flex justify-between items-start gap-md mb-md flex-wrap">
          <div>
            <div class="flex items-center gap-sm mb-sm">
              <span class="meta-badge subject-bi">Unit ${unitId}</span>
              <h1 class="content-title" style="margin: 0;">${unitData.title}</h1>
            </div>
            <div class="content-meta">
              <span class="meta-item"><wa-icon name="clock"></wa-icon> ${unitData.hours} lecture hours</span>
              <span class="meta-item"><wa-icon name="award"></wa-icon> ${unitData.marks2026} marks (2026)</span>
              <span class="meta-item"><wa-icon name="signal"></wa-icon> ${unitData.difficulty}</span>
              <span class="meta-item"><wa-icon name="trending-up"></wa-icon> ${unitData.examYield}</span>
            </div>
          </div>
          <div class="flex gap-sm">
            <wa-button appearance="primary" onclick="window.print()">
              <wa-icon name="printer" slot="start"></wa-icon>
              Print / PDF
            </wa-button>
            <wa-button appearance="outline" href="${router.generateUrl('/subject/' + subjectId)}">
              <wa-icon name="arrow-left" slot="start"></wa-icon>
              Back
            </wa-button>
          </div>
        </div>
      </header>

      <div class="content-body" id="unitContent">
        ${renderOverviewSection(unitData)}
        ${unitData.sections.map(section => renderSection(section)).join('')}
        ${renderSkeletonsSection(unitData)}
        ${renderTrapsSection(unitData)}
        ${renderSelfTestSection(unitData)}
        ${renderChecklistSection(unitData)}
      </div>
    </main>
  `;

  // Initialize section navigation
  initializeSectionNav();
}

function renderOverviewSection(unitData) {
  return `
    <section id="overview" class="content-section">
      <h2 class="section-title">Quick Overview</h2>

      <div class="alert-box alert-info">
        <div class="alert-box-title"><wa-icon name="lightbulb"></wa-icon> Why This Unit Matters</div>
        <p>${unitData.whyMatters}</p>
      </div>

      ${unitData.prerequisites ? `
      <div class="definition-box">
        <div class="definition-label">Prerequisite</div>
        <p>${unitData.prerequisites}</p>
      </div>
      ` : ''}

      ${unitData.syllabusBullets ? `
      <h3 class="subsection-title">Syllabus Bullets</h3>
      <ul style="line-height: 2; margin-left: 1.5rem;">
        ${unitData.syllabusBullets.map(b => `<li>${b}</li>`).join('')}
      </ul>
      ` : ''}

      ${unitData.memoryHook ? `
      <div class="definition-box" style="background: var(--color-warning-light); border-left-color: var(--color-warning);">
        <div class="definition-label" style="color: var(--color-warning);">Memory Hook</div>
        <p style="font-family: var(--font-mono); font-size: var(--text-lg);">${unitData.memoryHook}</p>
      </div>
      ` : ''}
    </section>
  `;
}

function renderSection(section) {
  let content = `
    <section id="${section.id}" class="content-section">
      <h2 class="section-title">${section.title}</h2>
  `;

  if (section.type === 'definition') {
    content += `
      <div class="definition-box">
        <p>${section.content}</p>
      </div>
    `;
    if (section.breakdown) {
      content += `
        <h3 class="subsection-title">Breakdown</h3>
        <div class="table-container">
          <table class="data-table">
            <thead><tr><th>Part</th><th>What it means</th><th>Why it's in the definition</th></tr></thead>
            <tbody>
              ${section.breakdown.map(b => `
                <tr>
                  <td><strong>${b.part}</strong></td>
                  <td>${b.meaning}</td>
                  <td>${b.why}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
  } else if (section.type === 'concept') {
    content += `<div class="content-text">${section.content}</div>`;

    if (section.analyticalLadder) {
      content += `
        <h3 class="subsection-title">Analytical Ladder (Scope)</h3>
        <div class="table-container">
          <table class="data-table">
            <thead><tr><th>Level</th><th>Name</th><th>Question Answered</th><th>BI Capability</th><th>Example</th></tr></thead>
            <tbody>
              ${section.analyticalLadder.map(l => `
                <tr>
                  <td>${l.level}</td>
                  <td><strong>${l.name}</strong></td>
                  <td>${l.question}</td>
                  <td>${l.capability}</td>
                  <td>${l.example}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    if (section.orgScope) {
      content += `
        <h3 class="subsection-title">Scope Across the Organisation</h3>
        <ul style="line-height: 2; margin-left: 1.5rem;">
          ${section.orgScope.map(s => `<li>${s}</li>`).join('')}
        </ul>
      `;
    }

    if (section.safeAnswer) {
      content += `
        <div class="definition-box" style="background: var(--color-success-light); border-left-color: var(--color-success);">
          <div class="definition-label" style="color: var(--color-success);">Safe Answer (A2)</div>
          <p>${section.safeAnswer}</p>
        </div>
      `;
    }

    if (section.nepalAnchor) {
      content += `
        <div class="alert-box alert-success">
          <div class="alert-box-title"><wa-icon name="flag"></wa-icon> Nepal Anchor</div>
          <p>${section.nepalAnchor}</p>
        </div>
      `;
    }

    if (section.trap) {
      content += `
        <div class="alert-box alert-error">
          <div class="alert-box-title"><wa-icon name="exclamation-triangle"></wa-icon> Trap</div>
          <p>${section.trap}</p>
        </div>
      `;
    }

    if (section.memoryHook) {
      content += `
        <div class="definition-box" style="background: var(--color-warning-light); border-left-color: var(--color-warning);">
          <div class="definition-label" style="color: var(--color-warning);">Memory Hook</div>
          <p style="font-family: var(--font-mono); font-size: var(--text-lg);">${section.memoryHook}</p>
        </div>
      `;
    }

    if (section.table === 'importance-table') {
      content += renderImportanceTable();
    }

    if (section.diagram) {
      content += renderDiagramEmbed(section.diagram);
    }

    if (section.handsOnWorkflow) {
      content += renderWorkflowTable(section.handsOnWorkflow);
    }

    if (section.toolCategories) {
      content += renderToolCategoriesTable(section.toolCategories);
    }

    if (section.stackDiagram) {
      content += renderDiagramEmbed(section.stackDiagram);
    }
  }

  content += `</section>`;
  return content;
}

function renderImportanceTable() {
  return `
    <h3 class="subsection-title">Five Importance Points (The 3-Marker)</h3>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr><th>#</th><th>Importance</th><th>One-line Justification</th><th>Example</th></tr>
        </thead>
        <tbody>
          <tr><td>1</td><td>Faster decisions</td><td>pre-aggregated, query-ready data removes the wait for a report</td><td>branch manager sees yesterday's position today</td></tr>
          <tr><td>2</td><td>Better-quality decisions</td><td>one governed version of the truth removes conflicting spreadsheets</td><td>finance and sales quote the same revenue figure</td></tr>
          <tr><td>3</td><td>Single source of truth</td><td>central warehouse + definitions (Unit 2)</td><td>"active customer" defined once</td></tr>
          <tr><td>4</td><td>Trend and pattern discovery</td><td>historical data reveals seasonality and anomalies</td><td>Dashain–Tihar demand spikes, visible in advance</td></tr>
          <tr><td>5</td><td>Competitive advantage / cost control</td><td>spot loss-making products and idle inventory early</td><td>discontinue a product line before the year-end loss</td></tr>
        </tbody>
      </table>
    </div>
    <div class="definition-box" style="background: var(--color-warning-light); border-left-color: var(--color-warning);">
      <div class="definition-label" style="color: var(--color-warning);">Memory Hook: F-B-S-T-C</div>
      <p><strong>Faster, Better, Single truth, Trends, Competitive edge.</strong> In the exam write any three with a justification line each — never three bare words.</p>
    </div>
    <div class="alert-box alert-info">
      <div class="alert-box-title">What BI Does Not Fix</div>
      <p>BI improves the <strong>evidence</strong>; it does not improve the <strong>decision-maker</strong>. Poor data quality, unclear ownership and unexploded recommendations (dashboards nobody acts on — the "BI shelfware" problem) all survive a perfect warehouse. Examiners like this sentence in 5-markers and in the case's ethics part.</p>
    </div>
  `;
}

function renderWorkflowTable(workflow) {
  return `
    <h3 class="subsection-title">The Hands-On Workflow (C-M-V-P-S)</h3>
    <div class="table-container">
      <table class="data-table">
        <thead><tr><th>Step</th><th>What Actually Happens</th><th>Why the Examiner Cares</th></tr></thead>
        <tbody>
          ${workflow.map(w => `
            <tr>
              <td>${w.step}</td>
              <td>${w.name}: ${w.description}</td>
              <td>${w.why}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    <div class="definition-box" style="background: var(--color-warning-light); border-left-color: var(--color-warning);">
      <div class="definition-label" style="color: var(--color-warning);">Memory Hook: C-M-V-P-S</div>
      <p><strong>Connect, Model, Visualise, Publish, Schedule.</strong> Five steps, and they map onto the five clauses of the definition.</p>
    </div>
  `;
}

function renderToolCategoriesTable(categories) {
  return `
    <h3 class="subsection-title">Tool Categories (Name the Category, Then an Example)</h3>
    <div class="table-container">
      <table class="data-table">
        <thead><tr><th>Category</th><th>What it is for</th><th>Examples</th><th>Exam Value</th></tr></thead>
        <tbody>
          ${categories.map(c => `
            <tr>
              <td><strong>${c.category}</strong></td>
              <td>${c.description}</td>
              <td>${c.tools.join(', ')}</td>
              <td>${c.examValue}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderToolComparisonTable(comparison) {
  return `
    <h3 class="subsection-title">Tableau vs Power BI</h3>
    <div class="table-container">
      <table class="data-table">
        <thead><tr><th></th><th>Microsoft Power BI</th><th>Tableau</th></tr></thead>
        <tbody>
          ${Object.entries(comparison).map(([key, value]) => `
            <tr>
              <td><strong>${key}</strong></td>
              <td>${value.powerbi || value}</td>
              <td>${value.tableau || ''}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderDiagramEmbed(diagramId) {
  const diagram = findDiagram(diagramId);
  if (!diagram) return '';

  return `
    <div class="diagram-container">
      ${diagram.svg || `<img src="${diagram.url}" alt="${diagram.title}">`}
      <div class="diagram-caption">${diagram.title}</div>
      <wa-button class="diagram-zoom-btn" appearance="outline" size="small" data-diagram="${diagramId}">
        <wa-icon name="arrows-angle-expand" slot="start"></wa-icon>
        Zoom
      </wa-button>
    </div>
  `;
}

function findDiagram(id) {
  if (STUDY_DATA.biUnit1?.diagrams) {
    return STUDY_DATA.biUnit1.diagrams.find(d => d.id === id);
  }
  return null;
}

function renderSkeletonsSection(unitData) {
  if (!unitData.skeletons || unitData.skeletons.length === 0) return '';

  return `
    <section id="skeletons" class="content-section">
      <h2 class="section-title">Answer Skeletons</h2>
      <p class="content-text">These are the exact answers to write in the exam. Word counts are measured from the saved file.</p>
      ${unitData.skeletons.map(s => `
        <div class="skeleton-box">
          <div class="skeleton-header">
            <span class="skeleton-question">${s.q} · "${s.question}"</span>
            <span class="skeleton-marks">${s.marks} mark${s.marks > 1 ? 's' : ''}</span>
          </div>
          <pre class="skeleton-answer">${escapeHtml(s.answer)}</pre>
          ${s.words ? `<div class="skeleton-header"><span>Word count: ${s.words}</span></div>` : ''}
          ${s.note ? `<div class="alert-box alert-warning" style="margin-top: 12px; padding: 8px 12px;"><p style="margin: 0;">${s.note}</p></div>` : ''}
          <div class="skeleton-actions">
            <wa-button appearance="outline" size="small" onclick="copyToClipboard(${JSON.stringify(s.answer)})">
              <wa-icon name="clipboard" slot="start"></wa-icon>
              Copy Answer
            </wa-button>
          </div>
        </div>
      `).join('')}
    </section>
  `;
}

function renderTrapsSection(unitData) {
  if (!unitData.traps || unitData.traps.length === 0) return '';

  return `
    <section id="traps" class="content-section">
      <h2 class="section-title">Traps</h2>
      <div class="table-container">
        <table class="traps-table">
          <thead>
            <tr><th>Trap</th><th>Why it costs marks</th><th>Fix</th></tr>
          </thead>
          <tbody>
            ${unitData.traps.map(t => `
              <tr>
                <td class="trap-name">${t.name}</td>
                <td class="trap-reason">${t.reason}</td>
                <td class="trap-fix">${t.fix}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function renderSelfTestSection(unitData) {
  if (!unitData.selfTest || unitData.selfTest.length === 0) return '';

  return `
    <section id="self-test" class="content-section">
      <h2 class="section-title">Self Test <span style="font-weight: normal; color: var(--color-text-muted);">(answers collapsed)</span></h2>
      ${unitData.selfTest.map((item, i) => `
        <details class="custom-disclosure self-test-item">
          <summary class="self-test-question">
            <span>${item.q}</span>
            <span class="self-test-marks">${item.marks}</span>
            <wa-icon name="chevron-down"></wa-icon>
          </summary>
          <div class="disclosure-content self-test-answer">
            ${item.answer || '<em>Answer not provided in source</em>'}
          </div>
        </details>
      `).join('')}
    </section>
  `;
}

function renderChecklistSection(unitData) {
  if (!unitData.sixtySecondCheck || unitData.sixtySecondCheck.length === 0) return '';

  return `
    <section id="checklist" class="content-section">
      <h2 class="section-title">Sixty-Second Check</h2>
      <p class="content-text">Close the file and, on a blank page:</p>
      <ul class="checklist">
        ${unitData.sixtySecondCheck.map(item => `<li>${item}</li>`).join('')}
      </ul>
    </section>
  `;
}

function initializeSectionNav() {
  const sidebarLinks = document.querySelectorAll('.sidebar-link[data-section]');
  const sections = document.querySelectorAll('.content-section');

  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      // Update active link
      document.querySelectorAll('.sidebar-link[data-section]').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Highlight active section on scroll
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        document.querySelectorAll('.sidebar-link[data-section]').forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    }, { rootMargin: '-100px 0px -66%', threshold: 0 });

  document.querySelectorAll('.content-section').forEach(section => {
    observer.observe(section);
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export { renderUnit };