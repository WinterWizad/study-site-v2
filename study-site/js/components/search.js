/**
 * Search Component
 * Handles global search across all study materials
 */

export function initSearchDialog() {
  const dialog = document.getElementById('search-dialog');
  const input = document.getElementById('search-input');
  const results = document.getElementById('search-results');

  if (!dialog || !input || !results) return;

  let debounceTimer = null;
  let selectedIndex = -1;

  // Open search with keyboard shortcut (Ctrl/Cmd + K)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      dialog.show();
      setTimeout(() => input.focus(), 100);
    }
    if (e.key === 'Escape' && dialog.open) {
      dialog.hide();
    }
  });

  input.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      performSearch(e.target.value);
      selectedIndex = -1;
    }, 150);
  });

  input.addEventListener('keydown', (e) => {
    const items = results.querySelectorAll('.search-result-item');
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      updateSelection(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      updateSelection(items);
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      items[selectedIndex]?.click();
    } else if (e.key === 'Escape') {
      dialog.hide();
    }
  });

  function updateSelection(items) {
    items.forEach((item, index) => {
      item.classList.toggle('selected', index === selectedIndex);
    });
    if (selectedIndex >= 0) {
      items[selectedIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  function performSearch(query) {
    if (!query.trim() || query.length < 2) {
      results.innerHTML = `
        <div class="search-empty">
          <wa-icon name="search" style="font-size: 2rem; color: var(--color-text-muted); margin-bottom: 8px;"></wa-icon>
          <p>Type at least 2 characters to search...</p>
        </div>
      `;
      return;
    }

    const terms = query.toLowerCase().split(' ').filter(t => t.length > 1);
    const matches = window.STUDY_APP.appState.searchIndex
      .filter(item => {
        const searchText = (item.title + ' ' + item.content).toLowerCase();
        return terms.every(term => searchText.includes(term));
      })
      .slice(0, 20);

    if (matches.length === 0) {
      results.innerHTML = `
        <div class="search-empty">
          <wa-icon name="search-x" style="font-size: 2rem; color: var(--color-text-muted); margin-bottom: 8px;"></wa-icon>
          <p>No results found for "${escapeHtml(query)}"</p>
        </div>
      `;
      return;
    }

    results.innerHTML = matches.map((item, index) => `
      <button class="search-result-item ${index === 0 ? 'selected' : ''}" 
              data-url="${item.url}" 
              data-index="${index}"
              type="button">
        <wa-icon name="${getResultIcon(item.type)}" class="search-result-icon" style="color: ${getSubjectColor(item.subject)};"></wa-icon>
        <div class="search-result-content">
          <div class="search-result-title">${highlightMatch(item.title, query)}</div>
          <div class="search-result-meta">
            <span class="search-result-type" style="background: ${getSubjectColor(item.subject)}20; color: ${getSubjectColor(item.subject)};">${formatType(item.type)}</span>
            ${item.subject ? `<span>Subject: ${item.subject.toUpperCase()}</span>` : ''}
            ${item.unit ? `<span>Unit ${item.unit}</span>` : ''}
          </div>
        </div>
      </button>
    `).join('');

    // Add click handlers
    results.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        const url = item.dataset.url;
        dialog.hide();
        window.location.href = url;
      });
    });

    selectedIndex = 0;
  }

  function getResultIcon(type) {
    const icons = {
      section: 'file-text',
      skeleton: 'clipboard-check',
      trap: 'exclamation-triangle',
      'syllabus-unit': 'book',
      question: 'question-circle',
      definition: 'type',
      concept: 'lightbulb'
    };
    return icons[type] || 'file';
  }

  function getSubjectColor(subject) {
    const colors = {
      bi: '#2563eb',
      de: '#16a34a',
      cc: '#f59e0b',
      iem: '#dc2626'
    };
    return colors[subject] || '#64748b';
  }

  function formatType(type) {
    const labels = {
      section: 'Section',
      skeleton: 'Answer Skeleton',
      trap: 'Trap',
      'syllabus-unit': 'Syllabus Unit',
      question: 'Question',
      definition: 'Definition',
      concept: 'Concept'
    };
    return labels[type] || type;
  }

  function highlightMatch(text, query) {
    const terms = query.toLowerCase().split(' ').filter(t => t.length > 1);
    let result = text;
    terms.forEach(term => {
      const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
      result = result.replace(regex, '<mark>$1</mark>');
    });
    return result;
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

export function openSearchDialog() {
  const dialog = document.getElementById('search-dialog');
  const input = document.getElementById('search-input');
  if (dialog && input) {
    dialog.show();
    setTimeout(() => input.focus(), 100);
  }
}