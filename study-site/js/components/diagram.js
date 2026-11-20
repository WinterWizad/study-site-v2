/**
 * Diagram Viewer Component
 * Handles zoomable diagram viewing with SVG support
 */

import { STUDY_DATA } from '../data.js';

let currentZoom = 1;
let currentDiagram = null;

export function initDiagramViewer() {
  const dialog = document.getElementById('diagram-dialog');
  const container = document.getElementById('diagram-container');

  if (!dialog || !container) return;

  // Delegate click on diagram zoom buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.diagram-zoom-btn, [data-diagram]');
    if (btn) {
      e.preventDefault();
      const diagramId = btn.dataset.diagram || btn.dataset.diagramId;
      if (diagramId) {
        openDiagram(diagramId);
      }
    }
  });

  // Keyboard navigation in dialog
  dialog.addEventListener('keydown', (e) => {
    if (!dialog.open) return;

    if (e.key === 'Escape') {
      dialog.hide();
    } else if (e.key === '+' || e.key === '=') {
      e.preventDefault();
      zoomIn();
    } else if (e.key === '-') {
      e.preventDefault();
      zoomOut();
    } else if (e.key === '0') {
      e.preventDefault();
      resetZoom();
    }
  });

  // Mouse wheel zoom
  container.addEventListener('wheel', (e) => {
    if (!dialog.open) return;
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      if (e.deltaY < 0) zoomIn();
      else zoomOut();
    }
  }, { passive: false });

  function openDiagram(diagramId) {
    const diagram = findDiagram(diagramId);
    if (!diagram) return;

    currentDiagram = diagram;
    currentZoom = 1;

    container.innerHTML = `
      <div class="diagram-viewer">
        ${diagram.svg || `<img src="${diagram.url}" alt="${escapeHtml(diagram.title)}">`}
      </div>
      <div class="diagram-controls">
        <wa-button class="diagram-control-btn" appearance="outline" size="small" onclick="zoomOut()">
          <wa-icon name="dash"></wa-icon>
        </wa-button>
        <span class="diagram-zoom-level" id="zoomLevel">100%</span>
        <wa-button class="diagram-control-btn" appearance="outline" size="small" onclick="zoomIn()">
          <wa-icon name="plus"></wa-icon>
        </wa-button>
        <wa-button class="diagram-control-btn" appearance="outline" size="small" onclick="resetZoom()">
          <wa-icon name="arrow-counterclockwise"></wa-icon>
        </wa-button>
      </div>
    `;

    dialog.show();
    updateZoomDisplay();
  }

  function findDiagram(id) {
    // Check BI Unit 1 diagrams
    if (STUDY_DATA.biUnit1?.diagrams) {
      const found = STUDY_DATA.biUnit1.diagrams.find(d => d.id === id);
      if (found) return found;
    }

    // Check syllabus diagrams
    if (STUDY_DATA.biSyllabus?.diagrams) {
      const found = STUDY_DATA.biSyllabus.diagrams.find(d => d.id === id);
      if (found) return found;
    }

    return null;
  }

  function zoomIn() {
    currentZoom = Math.min(currentZoom * 1.2, 5);
    applyZoom();
  }

  function zoomOut() {
    currentZoom = Math.max(currentZoom / 1.2, 0.2);
    applyZoom();
  }

  function resetZoom() {
    currentZoom = 1;
    applyZoom();
  }

  function applyZoom() {
    const viewer = document.querySelector('.diagram-viewer svg, .diagram-viewer img');
    if (viewer) {
      viewer.style.transform = `scale(${currentZoom})`;
      viewer.style.transformOrigin = 'center center';
    }
    updateZoomDisplay();
  }

  function updateZoomDisplay() {
    const zoomLevel = document.getElementById('zoomLevel');
    if (zoomLevel) {
      zoomLevel.textContent = Math.round(currentZoom * 100) + '%';
    }
  }

  // Close handler
  dialog.addEventListener('hide', () => {
    currentDiagram = null;
    currentZoom = 1;
  });

  // Expose functions globally for inline handlers
  window.zoomIn = zoomIn;
  window.zoomOut = zoomOut;
  window.resetZoom = resetZoom;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export { initDiagramViewer };