const STORAGE_KEY = 'quickReels.state.v1';
const SUPPORTED_STATE_VERSION = 1;
const DEFAULT_STATE = {
  version: SUPPORTED_STATE_VERSION,
  seen: [],
  done: [],
  saved: [],
  lastPosition: null,
  positions: {},
  voice: 'random',
  speechRate: 1,
  shuffleSeed: 541385059,
  order: 'ordered',
  unit: 'all',
  savedOnly: false,
  musicVolume: 0.28,
  muted: false
};

const MUSIC_TRACKS = [
  {
    title: 'Easy Lemon (60 second)',
    src: 'assets/music/easy-lemon-60-second.mp3',
    credit: 'Kevin MacLeod (incompetech.com), CC BY 4.0'
  },
  {
    title: 'Somewhere Sunny',
    src: 'assets/music/somewhere-sunny.mp3',
    credit: 'Kevin MacLeod (incompetech.com), CC BY 4.0'
  }
];

const elements = {
  audioStatus: document.querySelector('#audioStatus'),
  cardTrack: document.querySelector('#cardTrack'),
  cardViewport: document.querySelector('#cardViewport'),
  cardAnnouncement: document.querySelector('#cardAnnouncement'),
  doneCount: document.querySelector('#doneCount'),
  muteButton: document.querySelector('#muteButton'),
  muteButtonLabel: document.querySelector('#muteButtonLabel'),
  musicPlayer: document.querySelector('#musicPlayer'),
  musicVolume: document.querySelector('#musicVolume'),
  musicVolumeValue: document.querySelector('#musicVolumeValue'),
  newOrderButton: document.querySelector('#newOrderButton'),
  progressNote: document.querySelector('#progressNote'),
  railProgressFill: document.querySelector('#railProgressFill'),
  railClose: document.querySelector('#railClose'),
  railScrim: document.querySelector('#railScrim'),
  railToggle: document.querySelector('#railToggle'),
  reelStage: document.querySelector('#reelStage'),
  reelsRail: document.querySelector('#reelsRail'),
  savedCount: document.querySelector('#savedCount'),
  savedFilterButton: document.querySelector('#savedFilterButton'),
  savedFilterCount: document.querySelector('#savedFilterCount'),
  seedValue: document.querySelector('#seedValue'),
  seenCount: document.querySelector('#seenCount'),
  speechRate: document.querySelector('#speechRate'),
  speechRateValue: document.querySelector('#speechRateValue'),
  stageCaption: document.querySelector('#stageCaption'),
  stageLoading: document.querySelector('#stageLoading'),
  stateAnnouncement: document.querySelector('#stateAnnouncement'),
  themeToggle: document.querySelector('#themeToggle'),
  unitFilters: document.querySelector('#unitFilters'),
  voiceSelect: document.querySelector('#voiceSelect')
};

let storageAvailable = true;
let state = loadState();
let payload = null;
let cards = [];
let currentIndex = 0;
let hasUserGesture = false;
let speechGeneration = 0;
let speechPaused = false;
let speechSession = null;
let speechGapTimer = 0;
let musicGeneration = 0;
let musicFadeFrame = 0;
let resizeTimer = 0;
let measurementCard = null;
let currentRestore = null;
let cardPointerStart = null;

function escapeHtml(value) {
  const amp = String.fromCharCode(38);
  return String(value ?? '')
    .replace(/&/g, amp + 'amp;')
    .replace(/</g, amp + 'lt;')
    .replace(/>/g, amp + 'gt;')
    .replace(/"/g, amp + 'quot;')
    .replace(/'/g, amp + '#039;');
}

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

function normalizeAtomAnchor(value) {
  if (!value || typeof value !== 'object') return null;
  const type = value.type === 'table' || value.type === 'diagram' ? value.type : value.type === 'text' ? 'text' : '';
  if (!type) return null;

  if (type === 'text') {
    const partIndex = Number(value.partIndex);
    const hash = typeof value.hash === 'string' ? value.hash : '';
    if (!Number.isInteger(partIndex) || !hash) return null;
    return { type, partIndex, hash };
  }

  const partIndex = Number(value.partIndex);
  const start = Number(value.start);
  const end = Number(value.end);
  if (!Number.isInteger(partIndex) || !Number.isInteger(start) || !Number.isInteger(end) || end < start) return null;
  return { type, partIndex, start, end };
}

function normalizePosition(value) {
  if (!value || typeof value !== 'object') return null;
  const key = typeof value.key === 'string' ? value.key : '';
  const entryId = typeof value.entryId === 'string' ? value.entryId : '';
  if (!key || !entryId) return null;
  return {
    key,
    entryId,
    atomKey: typeof value.atomKey === 'string' ? value.atomKey : '',
    atomKeys: Array.isArray(value.atomKeys) ? value.atomKeys.filter(item => typeof item === 'string') : [],
    atomAnchor: normalizeAtomAnchor(value.atomAnchor),
    atomAnchors: Array.isArray(value.atomAnchors)
      ? value.atomAnchors.map(normalizeAtomAnchor).filter(Boolean)
      : [],
    feedKey: typeof value.feedKey === 'string' ? value.feedKey : '',
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : ''
  };
}

function loadState() {
  let stored = null;
  try {
    stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    stored = null;
    storageAvailable = false;
  }

  if (stored && typeof stored === 'object' && Number(stored.version) !== SUPPORTED_STATE_VERSION) {
    stored = null;
  }

  const merged = { ...DEFAULT_STATE, ...(stored && typeof stored === 'object' ? stored : {}) };
  merged.version = SUPPORTED_STATE_VERSION;
  merged.seen = Array.isArray(merged.seen) ? merged.seen.filter(value => typeof value === 'string') : [];
  merged.done = Array.isArray(merged.done) ? merged.done.filter(value => typeof value === 'string') : [];
  merged.saved = Array.isArray(merged.saved) ? merged.saved.filter(value => typeof value === 'string') : [];
  merged.speechRate = clamp(Number(merged.speechRate) || 1, 0.75, 1.25);
  merged.musicVolume = clamp(Number(merged.musicVolume) || 0, 0, 1);
  merged.shuffleSeed = Number(merged.shuffleSeed) || DEFAULT_STATE.shuffleSeed;
  merged.order = merged.order === 'shuffled' ? 'shuffled' : 'ordered';
  merged.unit = typeof merged.unit === 'string' ? merged.unit : 'all';
  merged.savedOnly = Boolean(merged.savedOnly);
  merged.muted = Boolean(merged.muted);
  merged.lastPosition = normalizePosition(merged.lastPosition);
  merged.positions = merged.positions && typeof merged.positions === 'object' && !Array.isArray(merged.positions)
    ? Object.fromEntries(
      Object.entries(merged.positions)
        .map(([feedKey, position]) => [feedKey, normalizePosition(position)])
        .filter(([, position]) => Boolean(position))
    )
    : {};
  return merged;
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    storageAvailable = true;
    return true;
  } catch {
    storageAvailable = false;
    if (payload && elements.progressNote) {
      elements.progressNote.textContent = 'Progress cannot be saved in this browser.';
    }
    return false;
  }
}

function currentFeedKey() {
  const base = `${state.order}|${state.unit}|${state.savedOnly ? 'saved' : 'all'}`;
  return state.order === 'shuffled' ? `${base}|${state.shuffleSeed}` : base;
}

function parseFeedKey(feedKey = '') {
  const [order, unit, mode, seed] = String(feedKey).split('|');
  if (!['ordered', 'shuffled'].includes(order)) return null;
  if (unit !== 'all' && !/^\d+$/.test(unit)) return null;
  if (!['all', 'saved'].includes(mode)) return null;
  return {
    order,
    unit,
    savedOnly: mode === 'saved',
    seed: /^\d+$/.test(seed || '') ? Number(seed) : null
  };
}

function positionForFeed(feedKey = currentFeedKey()) {
  const stored = state.positions?.[feedKey];
  if (stored) return stored;

  // Migrate the early ordered-feed key, which incorrectly included the
  // shuffle seed. Ordered positions are now independent of every shuffle.
  if (state.order === 'ordered') {
    const legacy = Object.entries(state.positions || {})
      .filter(([candidateKey]) => candidateKey.startsWith(`${feedKey}|`))
      .sort((left, right) => String(right[1]?.updatedAt || '').localeCompare(String(left[1]?.updatedAt || '')))[0];
    if (legacy) {
      const [legacyKey, legacyPosition] = legacy;
      state.positions[feedKey] = legacyPosition;
      delete state.positions[legacyKey];
      saveState();
      return legacyPosition;
    }
  }

  if (state.lastPosition?.feedKey === feedKey) return state.lastPosition;
  return null;
}

function rememberPosition(card) {
  const position = {
    key: card.key,
    entryId: card.entry.id,
    atomKey: card.atoms[0]?.key || '',
    atomKeys: card.atoms.map(atom => atom.key),
    atomAnchor: card.atoms[0]?.anchor || null,
    atomAnchors: card.atoms.map(atom => atom.anchor).filter(Boolean),
    feedKey: currentFeedKey(),
    updatedAt: new Date().toISOString()
  };
  state.lastPosition = position;
  state.positions = state.positions && typeof state.positions === 'object' ? state.positions : {};
  state.positions[position.feedKey] = position;

  const entries = Object.entries(state.positions);
  if (entries.length > 40) {
    const overflow = entries.length - 40;
    const byAge = (left, right) => String(left[1]?.updatedAt || '').localeCompare(String(right[1]?.updatedAt || ''));
    const shuffled = entries.filter(([feedKey]) => feedKey.startsWith('shuffled|')).sort(byAge);
    const ordered = entries.filter(([feedKey]) => !feedKey.startsWith('shuffled|')).sort(byAge);
    const evictionCandidates = [...shuffled, ...ordered].slice(0, overflow);
    evictionCandidates.forEach(([feedKey]) => delete state.positions[feedKey]);
  }
}

function cleanPersistedEntryState() {
  const entries = payload?.entries || [];
  const entriesById = new Map(entries.map(entry => [entry.id, entry]));
  const validIds = new Set(entriesById.keys());
  const validUnits = new Set((payload?.units || []).map(unit => String(unit.num)));
  let changed = false;

  for (const name of ['seen', 'done', 'saved']) {
    const cleaned = [...new Set(state[name])].filter(id => validIds.has(id));
    if (cleaned.length !== state[name].length) changed = true;
    state[name] = cleaned;
  }

  if (state.unit !== 'all' && !validUnits.has(String(state.unit))) {
    state.unit = 'all';
    changed = true;
  }

  const saved = new Set(state.saved);
  const positionIsValid = position => {
    if (!position || !validIds.has(position.entryId)) return false;
    const entry = entriesById.get(position.entryId);
    const feed = parseFeedKey(position.feedKey || '');
    if (!feed) return false;
    if (feed.unit !== 'all' && String(entry.unit) !== feed.unit) return false;
    if (feed.savedOnly && !saved.has(entry.id)) return false;
    return true;
  };

  if (state.positions && typeof state.positions === 'object') {
    for (const [feedKey, position] of Object.entries(state.positions)) {
      if (!positionIsValid(position)) {
        delete state.positions[feedKey];
        changed = true;
      }
    }
  }

  if (state.lastPosition && !positionIsValid(state.lastPosition)) {
    state.lastPosition = null;
    changed = true;
  }

  if (changed) saveState();
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  try {
    localStorage.setItem('theme', theme);
  } catch {
    // The theme still works when persistent storage is unavailable.
  }
  elements.themeToggle?.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
}

function storedTheme() {
  try {
    return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

setTheme(storedTheme());

function markGesture() {
  hasUserGesture = true;
}

function syncRailAccessibility() {
  const open = elements.reelsRail.classList.contains('is-open');

  elements.reelsRail.inert = !open;
  elements.reelsRail.setAttribute('aria-hidden', String(!open));
  elements.railScrim.inert = !open;
  elements.railScrim.setAttribute('aria-hidden', String(!open));

  if (open) {
    elements.reelsRail.setAttribute('role', 'dialog');
    elements.reelsRail.setAttribute('aria-modal', 'true');
    elements.reelStage.inert = true;
    elements.reelStage.setAttribute('aria-hidden', 'true');
  } else {
    elements.reelsRail.removeAttribute('role');
    elements.reelsRail.removeAttribute('aria-modal');
    elements.reelStage.inert = false;
    elements.reelStage.removeAttribute('aria-hidden');
  }
}

function toggleRail(open) {
  const nextOpen = typeof open === 'boolean' ? open : !elements.reelsRail.classList.contains('is-open');
  const wasOpen = elements.reelsRail.classList.contains('is-open');

  elements.reelsRail.classList.toggle('is-open', nextOpen);
  elements.railScrim.classList.toggle('is-visible', nextOpen);
  elements.railToggle.setAttribute('aria-expanded', String(nextOpen));
  elements.railToggle.setAttribute('aria-label', nextOpen ? 'Close feed controls' : 'Open feed controls');
  syncRailAccessibility();

  if (nextOpen) {
    elements.reelsRail.querySelector('button, a, select, input')?.focus();
  } else if (wasOpen) {
    // Every close path returns to the trigger, including a scrim click that
    // moved focus to the scrim itself.
    elements.railToggle.focus({ preventScroll: true });
  }
}

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function seededCompare(seed, left, right) {
  const leftHash = hashString(`${seed}:${left}`);
  const rightHash = hashString(`${seed}:${right}`);
  if (leftHash === rightHash) return left.localeCompare(right);
  return leftHash - rightHash;
}

function stateSet(name) {
  return new Set(state[name]);
}

function cardContext(entry) {
  if (entry.kind === 'question') {
    const markText = entry.marks ? `${entry.marks} mark${entry.marks === '1' ? '' : 's'}` : 'case question';
    const paperLabel = entry.paper === 'model' ? 'Model' : entry.paper === 'board' ? 'Board' : 'Exam';
    return `${paperLabel} ${entry.code} · ${markText}`;
  }
  return entry.title;
}

function renderAtom(atom, entry) {
  const part = atom.part;
  if (!part) return '';

  if (part.type === 'text') return part.html;

  if (part.type === 'table') {
    const hasHeader = part.header?.some(cell => cell.text?.trim());
    const head = hasHeader
      ? `<thead><tr>${part.header.map(cell => `<th scope="col">${cell.html}</th>`).join('')}</tr></thead>`
      : '';
    const body = atom.rows?.length
      ? `<tbody>${atom.rows.map(row => `<tr>${row.map(cell => `<td>${cell.html}</td>`).join('')}</tr>`).join('')}</tbody>`
      : '';
    const label = `Table: ${entry.title}`;
    return `<div class="reel-table-wrap" tabindex="0" role="region" aria-label="${escapeHtml(label)}"><table class="reel-table"><caption class="reels-sr-only">${escapeHtml(label)}</caption>${head}${body}</table></div>`;
  }

  if (part.type === 'diagram') {
    const code = escapeHtml((atom.lines || []).join('\n'));
    const label = `Diagram: ${entry.title}`;
    return `<pre class="reel-diagram" tabindex="0" role="region" aria-label="${escapeHtml(label)}"><code>${code}</code></pre>`;
  }

  if (part.type === 'visual') return part.html;
  return '';
}

function renderAtoms(atoms, entry) {
  return atoms.map(atom => renderAtom(atom, entry)).join('');
}

function cardBodyHtml(entry, atoms, continuation = false) {
  if (entry.kind === 'question') {
    const questionClass = entry.questionText.length > 105 ? ' reel-card__question--long' : '';
    const hiddenClass = continuation ? ' reels-sr-only' : '';
    return `
      <h2 class="reel-card__question${questionClass}${hiddenClass}" tabindex="-1">${escapeHtml(entry.questionText)}</h2>
      ${continuation ? '<p class="reel-card__continued-label" tabindex="-1">Answer continued</p>' : '<p class="reel-card__answer-label" tabindex="-1">Answer</p>'}
      <div class="reel-parts">${renderAtoms(atoms, entry)}</div>
    `;
  }

  const titleClass = entry.title.length > 82 ? ' reel-card__title--long' : '';
  const hiddenClass = continuation ? ' reels-sr-only' : '';
  return `
    <h2 class="reel-card__title${titleClass}${hiddenClass}" tabindex="-1">${escapeHtml(entry.title)}</h2>
    ${continuation ? '<p class="reel-card__continued-label" tabindex="-1">Continued</p>' : ''}
    <div class="reel-parts">${renderAtoms(atoms, entry)}</div>
  `;
}

function cardHeaderHtml(entry) {
  const mode = entry.kind === 'question' ? 'Narrated question' : 'Narrated note';
  return `
    <header class="reel-card__header">
      <div class="reel-card__context">
        <span class="reel-card__unit">Unit ${entry.unit} · ${escapeHtml(entry.unitTitle)}</span>
        <span class="reel-card__section">${escapeHtml(cardContext(entry))}</span>
      </div>
      <span class="reels-sr-only" data-card-mode>${mode}</span>
    </header>
  `;
}

function cardActionsHtml(entry) {
  return `
    <div class="reel-card__actions" role="group" aria-label="Current card actions">
      <button class="reel-action-button" type="button" data-action="play" aria-label="Play narration" title="Listen (Space)" data-tooltip="Listen">
        <svg data-play-icon viewBox="0 0 24 24" width="21" height="21" aria-hidden="true"><path d="m9 7 8 5-8 5Z" fill="currentColor"/></svg>
        <span class="reels-sr-only" data-play-label>Play</span>
      </button>
      <a class="reel-action-link" href="${escapeHtml(entry.sourceUrl)}" aria-label="Open the exact source section" title="Open exact source">
        <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true"><path d="M14 5h5v5M19 5l-8 8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M17 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        <span class="reels-sr-only">Source</span>
      </a>
      <button class="reel-action-button" type="button" data-action="save" aria-pressed="false" aria-label="Save this section" title="Save (S)" data-tooltip="Save">
        <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true"><path class="reel-save-outline" d="M6.5 4.5h11v15l-5.5-3.6-5.5 3.6v-15Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path class="reel-save-fill" d="M6.5 4.5h11v15l-5.5-3.6-5.5 3.6v-15Z" fill="currentColor"/></svg>
        <span class="reels-sr-only" data-action-label>Save</span>
      </button>
      <button class="reel-action-button" type="button" data-action="done" aria-pressed="false" aria-label="Mark this section done" title="Mark done (D)" data-tooltip="Done">
        <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true"><circle class="reel-done-outline" cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.8"/><path class="reel-done-outline" d="m8.5 12 2.2 2.2 4.8-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle class="reel-done-fill" cx="12" cy="12" r="8" fill="currentColor"/><path class="reel-done-fill" d="m8.5 12 2.2 2.2 4.8-5" fill="none" stroke="var(--reels-sheet)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span class="reels-sr-only" data-action-label>Done</span>
      </button>
    </div>
    <nav class="reel-card__navigation" aria-label="Card navigation">
      <button class="reel-navigation-button" type="button" data-action="previous" aria-label="Previous card" title="Previous card (Up)">
        <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"><path d="m6 14 6-6 6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <button class="reel-navigation-button" type="button" data-action="next" aria-label="Next card" title="Next card (Down)">
        <svg viewBox="0 0 24 24" width="19" height="19" aria-hidden="true"><path d="m6 10 6 6 6-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </nav>
  `;
}

function cardFooterHtml(entry, index, total) {
  const percent = total > 1 ? ((index + 1) / total) * 100 : 100;
  return `
    <footer class="reel-card__footer">
      <div class="reel-card__source-row">
        <a class="reel-source-link" href="${escapeHtml(entry.sourceUrl)}">Open exact source</a>
        <span class="reel-state" data-card-state></span>
      </div>
      <p class="reel-card__scroll-cue" data-scroll-cue hidden>Scroll inside this card for more</p>
      <div class="reel-card__position">
        <span>${index + 1} / ${total}</span>
        <span class="reel-card__position-line" aria-hidden="true"><span style="width:${percent.toFixed(2)}%"></span></span>
        <span>${escapeHtml(entry.kind === 'question' ? `${entry.paper === 'model' ? 'Model' : entry.paper === 'board' ? 'Board' : 'Exam'} ${entry.code}` : `Unit ${entry.unit}`)}</span>
      </div>
    </footer>
  `;
}

function buildCardElement(entry, atoms, index, total, continuation = false) {
  const article = document.createElement('article');
  article.className = 'reel-card';
  article.dataset.entryId = entry.id;
  article.dataset.cardIndex = String(index);
  article.dataset.kind = entry.kind;
  article.dataset.unit = String(entry.unit);
  article.dataset.mode = atoms.some(atom => atom.part?.visual) ? 'visual' : 'text';
  article.innerHTML = `
    ${cardHeaderHtml(entry)}
    <div class="reel-card__body" tabindex="0" aria-label="Card content">${cardBodyHtml(entry, atoms, continuation)}</div>
    ${cardActionsHtml(entry)}
    ${cardFooterHtml(entry, index, total)}
  `;
  return article;
}

function ensureMeasurementCard() {
  if (measurementCard) return measurementCard;
  measurementCard = document.createElement('article');
  measurementCard.className = 'reel-card reel-measure';
  measurementCard.setAttribute('aria-hidden', 'true');
  document.body.appendChild(measurementCard);
  return measurementCard;
}

function measureFits(entry, atoms, continuation = false) {
  const viewport = elements.cardViewport;
  const card = ensureMeasurementCard();
  card.style.width = `${viewport.clientWidth}px`;
  card.style.height = `${viewport.clientHeight}px`;
  card.innerHTML = `
    ${cardHeaderHtml(entry)}
    <div class="reel-card__body" tabindex="0" aria-label="Card content">${cardBodyHtml(entry, atoms, continuation)}</div>
    ${cardActionsHtml(entry)}
    ${cardFooterHtml(entry, 0, 1)}
  `;
  const body = card.querySelector('.reel-card__body');
  return body.scrollHeight <= body.clientHeight + 2;
}

function atomText(atom) {
  if (atom.part?.type === 'table') {
    return (atom.rows || []).flat().map(cell => cell.text).filter(Boolean).join(' ');
  }
  if (atom.part?.type === 'diagram') return (atom.lines || []).join(' ');
  return atom.part?.text || '';
}

function splitTablePart(entry, part, partIndex, restoreAnchor = null) {
  const atoms = [];
  let rowOffset = 0;
  const restoreStart = restoreAnchor?.type === 'table' && restoreAnchor.partIndex === partIndex
    ? restoreAnchor.start
    : null;

  while (rowOffset < part.rows.length) {
    const remaining = part.rows.length - rowOffset;
    let low = 1;
    let high = remaining;
    if (restoreStart !== null && rowOffset < restoreStart) {
      high = Math.min(high, restoreStart - rowOffset);
    }
    let best = 1;

    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      const candidate = {
        key: `table:${partIndex}:rows:${rowOffset}-${rowOffset + middle - 1}`,
        part,
        rows: part.rows.slice(rowOffset, rowOffset + middle),
        anchor: {
          type: 'table',
          partIndex,
          start: rowOffset,
          end: rowOffset + middle - 1
        }
      };
      if (measureFits(entry, [candidate], false)) {
        best = middle;
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }

    const end = rowOffset + best - 1;
    atoms.push({
      key: `table:${partIndex}:rows:${rowOffset}-${end}`,
      part,
      rows: part.rows.slice(rowOffset, rowOffset + best),
      anchor: {
        type: 'table',
        partIndex,
        start: rowOffset,
        end
      }
    });
    rowOffset += best;
  }

  return atoms;
}

function splitDiagramPart(entry, part, partIndex, restoreAnchor = null) {
  const atoms = [];
  let lineOffset = 0;
  const restoreStart = restoreAnchor?.type === 'diagram' && restoreAnchor.partIndex === partIndex
    ? restoreAnchor.start
    : null;

  while (lineOffset < part.lines.length) {
    const remaining = part.lines.length - lineOffset;
    let low = 1;
    let high = remaining;
    if (restoreStart !== null && lineOffset < restoreStart) {
      high = Math.min(high, restoreStart - lineOffset);
    }
    let best = 1;

    while (low <= high) {
      const middle = Math.floor((low + high) / 2);
      const candidate = {
        key: `diagram:${partIndex}:lines:${lineOffset}-${lineOffset + middle - 1}`,
        part,
        lines: part.lines.slice(lineOffset, lineOffset + middle),
        anchor: {
          type: 'diagram',
          partIndex,
          start: lineOffset,
          end: lineOffset + middle - 1
        }
      };
      if (measureFits(entry, [candidate], false)) {
        best = middle;
        low = middle + 1;
      } else {
        high = middle - 1;
      }
    }

    const end = lineOffset + best - 1;
    atoms.push({
      key: `diagram:${partIndex}:lines:${lineOffset}-${end}`,
      part,
      lines: part.lines.slice(lineOffset, lineOffset + best),
      anchor: {
        type: 'diagram',
        partIndex,
        start: lineOffset,
        end
      }
    });
    lineOffset += best;
  }

  return atoms;
}

function partToAtoms(entry, part, partIndex, restoreAnchor = null) {
  if (part.type === 'table') return splitTablePart(entry, part, partIndex, restoreAnchor);
  if (part.type === 'diagram') return splitDiagramPart(entry, part, partIndex, restoreAnchor);
  const hash = hashString(part.text || part.html || String(partIndex));
  return [{
    key: `text:${partIndex}:${hash}`,
    part,
    anchor: {
      type: 'text',
      partIndex,
      hash
    }
  }];
}

function paginateEntry(entry, restore = null) {
  const restoreAnchor = restore?.atomAnchor || anchorFromAtomKey(restore?.atomKey || '');
  const atoms = entry.parts.flatMap((part, index) => partToAtoms(entry, part, index, restoreAnchor));
  const groups = [];
  let group = [];

  const finishGroup = () => {
    if (!group.length) return;
    groups.push(group);
    group = [];
  };

  for (const atom of atoms) {
    if (atom.part?.visual) {
      finishGroup();
      groups.push([atom]);
      continue;
    }

    const candidate = [...group, atom];
    const continuation = groups.length > 0;
    if (group.length && !measureFits(entry, candidate, continuation)) {
      finishGroup();
      group = [atom];
    } else {
      group = candidate;
    }
  }
  finishGroup();

  return groups.length ? groups : [[]];
}

function anchorFromAtomKey(key = '') {
  const table = key.match(/^table:(\d+):rows:(\d+)-(\d+)$/);
  if (table) {
    return {
      type: 'table',
      partIndex: Number(table[1]),
      start: Number(table[2]),
      end: Number(table[3])
    };
  }
  const diagram = key.match(/^diagram:(\d+):lines:(\d+)-(\d+)$/);
  if (diagram) {
    return {
      type: 'diagram',
      partIndex: Number(diagram[1]),
      start: Number(diagram[2]),
      end: Number(diagram[3])
    };
  }
  const text = key.match(/^text:(\d+):(.+)$/);
  if (text) {
    return {
      type: 'text',
      partIndex: Number(text[1]),
      hash: text[2]
    };
  }
  return null;
}

function anchorOverlap(candidate, saved) {
  if (!candidate || !saved || candidate.type !== saved.type || candidate.partIndex !== saved.partIndex) return 0;
  if (candidate.type === 'text') return candidate.hash === saved.hash ? 1 : 0;
  return Math.max(0, Math.min(candidate.end, saved.end) - Math.max(candidate.start, saved.start) + 1);
}

function restoreAnchorScore(atom, savedAnchor) {
  const overlap = anchorOverlap(atom.anchor, savedAnchor);
  if (!overlap) return 0;
  if (atom.anchor.type === 'text') return overlap * 1000;
  if (atom.anchor.start === savedAnchor.start && atom.anchor.end === savedAnchor.end) return overlap * 1000;
  if (atom.anchor.start === savedAnchor.start) return overlap * 100;
  return overlap;
}

function filteredEntries() {
  let entries = payload.entries.slice();
  if (state.unit !== 'all') entries = entries.filter(entry => String(entry.unit) === String(state.unit));
  if (state.savedOnly) {
    const saved = stateSet('saved');
    entries = entries.filter(entry => saved.has(entry.id));
  }
  if (state.order === 'shuffled') {
    entries.sort((left, right) => seededCompare(state.shuffleSeed, left.id, right.id));
  }
  return entries;
}

function updateScrollCues() {
  cards.forEach(card => {
    const body = card.element?.querySelector('.reel-card__body');
    const cue = card.element?.querySelector('[data-scroll-cue]');
    if (!body || !cue) return;
    const scrollable = body.scrollHeight > body.clientHeight + 2;
    cue.hidden = !scrollable;
    card.element.classList.toggle('is-scrollable', scrollable);
  });
}

function captureRebuildFocus() {
  const active = document.activeElement;
  if (!(active instanceof HTMLElement)) return null;

  const card = active.closest('.reel-card:not(.reel-measure)');
  if (card) {
    return {
      scope: 'card',
      action: active.dataset?.action || '',
      cardKey: card.dataset.cardKey || ''
    };
  }

  const unitButton = active.closest('#unitFilters [data-unit]');
  if (unitButton) {
    return {
      scope: 'unit',
      unit: unitButton.dataset.unit || ''
    };
  }

  if (active.closest('#stageLoading')) {
    return { scope: 'stage' };
  }

  return null;
}

function restoreRebuildFocus(context) {
  if (!context) return;
  const activeCard = cards[currentIndex]?.element;

  if (context.scope === 'card' && activeCard) {
    const target = context.action
      ? activeCard.querySelector(`[data-action="${context.action}"]`)
      : activeCard.querySelector('h2:not(.reels-sr-only), .reel-card__continued-label, .reel-card__answer-label');
    (target instanceof HTMLElement ? target : activeCard).focus({ preventScroll: true });
    return;
  }

  if (context.scope === 'unit') {
    const target = elements.unitFilters.querySelector(`[data-unit="${CSS.escape(context.unit)}"]`);
    if (target instanceof HTMLElement) target.focus({ preventScroll: true });
    return;
  }

  if (context.scope === 'stage') {
    const target = activeCard?.querySelector('h2:not(.reels-sr-only), .reel-card__continued-label, .reel-card__answer-label')
      || elements.stageLoading.querySelector('button');
    if (target instanceof HTMLElement) target.focus({ preventScroll: true });
  }
}

function buildFeed({ restore = null, speak = false, markSeen = true, persistPosition = true } = {}) {
  const focusContext = captureRebuildFocus();
  stopCurrentAudio();
  const entries = filteredEntries();
  const grouped = entries.map(entry => ({ entry, groups: paginateEntry(entry, restore) }));
  const total = grouped.reduce((sum, item) => sum + item.groups.length, 0);

  cards = [];
  grouped.forEach(({ entry, groups }) => {
    groups.forEach((atoms, entryIndex) => {
      const key = `${entry.id}::${entryIndex}`;
      cards.push({
        key,
        entry,
        entryIndex,
        atoms,
        continuation: entryIndex > 0,
        narratorVoice: null
      });
    });
  });

  elements.cardTrack.replaceChildren();
  cards.forEach((card, index) => {
    const element = buildCardElement(card.entry, card.atoms, index, total, card.continuation);
    element.dataset.cardKey = card.key;
    if (element.dataset.mode === 'visual') {
      element.querySelector('[data-card-mode]').textContent = 'Visual + music';
    }
    card.element = element;
    elements.cardTrack.appendChild(element);
  });
  updateScrollCues();

  let nextIndex = 0;
  if (restore) {
    const savedAnchors = [
      restore.atomAnchor,
      ...(restore.atomAnchors || []),
      anchorFromAtomKey(restore.atomKey),
      ...(restore.atomKeys || []).map(anchorFromAtomKey)
    ].filter(Boolean);

    let bestAtomIndex = -1;
    let bestAtomScore = 0;
    cards.forEach((card, index) => {
      if (card.entry.id !== restore.entryId) return;
      const score = Math.max(
        0,
        ...card.atoms.flatMap(atom => savedAnchors.map(saved => restoreAnchorScore(atom, saved)))
      );
      if (score > bestAtomScore) {
        bestAtomScore = score;
        bestAtomIndex = index;
      }
    });

    const exact = cards.findIndex(card => card.key === restore.key);
    const sameEntry = cards.findIndex(card => card.entry.id === restore.entryId);
    nextIndex = bestAtomIndex >= 0
      ? bestAtomIndex
      : exact >= 0
        ? exact
        : sameEntry >= 0
          ? sameEntry
          : 0;
  }

  currentIndex = clamp(nextIndex, 0, Math.max(0, cards.length - 1));
  updateCurrentCard({ speak, markSeen, persistPosition });
  updateUnitFilters();
  updateProgressUi();

  if (!cards.length) {
    showEmptyFeed();
  } else {
    elements.stageLoading.hidden = true;
  }

  restoreRebuildFocus(focusContext);
}

function showEmptyFeed() {
  elements.stageLoading.hidden = false;
  elements.stageLoading.className = 'stage-error';
  elements.stageLoading.innerHTML = `
    <p>${state.savedOnly ? 'No saved sections yet.' : 'No cards match this unit.'}</p>
    <button type="button" data-empty-action="reset">${state.savedOnly ? 'Show the full feed' : 'Show all units'}</button>
  `;
  elements.stageLoading.querySelector('button')?.addEventListener('click', () => {
    if (state.savedOnly) state.savedOnly = false;
    else state.unit = 'all';
    saveState();
    buildFeed({ restore: restorePosition(), speak: hasUserGesture, markSeen: false, persistPosition: true });
  });
}

function updateUnitFilters() {
  const focusedUnit = document.activeElement instanceof HTMLElement
    ? document.activeElement.closest('#unitFilters [data-unit]')?.dataset.unit || ''
    : '';
  const unitCounts = new Map();
  payload.entries.forEach(entry => unitCounts.set(entry.unit, (unitCounts.get(entry.unit) || 0) + 1));

  const unitData = [{ num: 'all', title: 'All units' }, ...payload.units];
  elements.unitFilters.replaceChildren();
  unitData.forEach(unit => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'unit-filter-button';
    button.dataset.unit = String(unit.num);
    button.classList.toggle('is-active', String(state.unit) === String(unit.num));
    button.setAttribute('aria-current', String(state.unit) === String(unit.num) ? 'true' : 'false');
    const count = unit.num === 'all' ? payload.entries.length : (unitCounts.get(Number(unit.num)) || 0);
    button.innerHTML = `
      <span class="unit-number">${unit.num === 'all' ? 'All' : `U${unit.num}`}</span>
      <span class="unit-name">${escapeHtml(unit.title)}</span>
      <span class="unit-total">${count}</span>
    `;
    elements.unitFilters.appendChild(button);
  });

  document.querySelectorAll('[data-order]').forEach(button => {
    const active = button.dataset.order === state.order;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  elements.newOrderButton.hidden = state.order !== 'shuffled';
  elements.seedValue.textContent = String(state.shuffleSeed);
  elements.savedFilterButton.setAttribute('aria-pressed', String(state.savedOnly));
  elements.savedFilterCount.textContent = String(state.saved.length);

  if (focusedUnit) {
    elements.unitFilters.querySelector(`[data-unit="${CSS.escape(focusedUnit)}"]`)?.focus({ preventScroll: true });
  }
}

function updateProgressUi() {
  const seen = stateSet('seen');
  const done = stateSet('done');
  const saved = stateSet('saved');
  const totalEntries = payload?.entries.length || 0;

  elements.seenCount.textContent = String(seen.size);
  elements.doneCount.textContent = String(done.size);
  elements.savedCount.textContent = String(saved.size);
  elements.savedFilterCount.textContent = String(saved.size);

  const percent = totalEntries ? (done.size / totalEntries) * 100 : 0;
  elements.railProgressFill.style.width = `${percent.toFixed(2)}%`;
  elements.progressNote.textContent = !storageAvailable
    ? 'Progress cannot be saved in this browser.'
    : state.lastPosition
      ? 'Your last card is saved on this device.'
      : 'Your place is saved on this device.';
}

function updateCardState(card) {
  if (!card?.element) return;
  const seen = stateSet('seen').has(card.entry.id);
  const done = stateSet('done').has(card.entry.id);
  const saved = stateSet('saved').has(card.entry.id);
  const stateText = [done ? 'Done' : '', saved ? 'Saved' : '', !done && !saved && seen ? 'Seen' : ''].filter(Boolean).join(' · ');

  card.element.querySelector('[data-card-state]').textContent = stateText || 'New';
  const doneButton = card.element.querySelector('[data-action="done"]');
  const saveButton = card.element.querySelector('[data-action="save"]');
  doneButton.setAttribute('aria-pressed', String(done));
  doneButton.setAttribute('aria-label', done ? 'Mark this section not done' : 'Mark this section done');
  doneButton.title = done ? 'Undo done (D)' : 'Mark done (D)';
  doneButton.querySelector('[data-action-label]').textContent = done ? 'Done' : 'Not done';
  saveButton.setAttribute('aria-pressed', String(saved));
  saveButton.setAttribute('aria-label', saved ? 'Remove this section from Saved' : 'Save this section');
  saveButton.title = saved ? 'Remove from saved (S)' : 'Save (S)';
  saveButton.querySelector('[data-action-label]').textContent = saved ? 'Saved' : 'Save';
}

function updateAllCardStates() {
  cards.forEach(updateCardState);
}

function updateCurrentCard({ speak = false, markSeen = true, persistPosition = true } = {}) {
  if (!cards.length) return;
  currentIndex = clamp(currentIndex, 0, cards.length - 1);
  const card = cards[currentIndex];
  let stateChanged = false;

  elements.cardTrack.style.transform = `translate3d(0, ${-currentIndex * 100}%, 0)`;
  cards.forEach((item, index) => {
    const active = index === currentIndex;
    item.element.setAttribute('aria-hidden', String(!active));
    item.element.inert = !active;
    item.element.querySelector('[data-action="previous"]').disabled = index === 0;
    item.element.querySelector('[data-action="next"]').disabled = index === cards.length - 1;
  });

  if (markSeen) {
    const seen = stateSet('seen');
    if (!seen.has(card.entry.id)) stateChanged = true;
    seen.add(card.entry.id);
    state.seen = [...seen];
  }

  if (persistPosition) {
    rememberPosition(card);
    stateChanged = true;
  }

  if (stateChanged) saveState();
  updateCardState(card);
  updateProgressUi();
  updatePlayControls();

  if (elements.cardAnnouncement) {
    const label = card.entry.kind === 'question' ? card.entry.questionText : card.entry.title;
    elements.cardAnnouncement.textContent = `${label}. Card ${currentIndex + 1} of ${cards.length}.`;
  }

  if (speak && hasUserGesture && !state.muted) playCurrentAudio();
}

function goTo(index, { speak = true } = {}) {
  if (!cards.length) return;
  const previousCard = cards[currentIndex];
  const moveFocus = Boolean(previousCard?.element?.contains(document.activeElement));
  stopCurrentAudio();
  currentIndex = clamp(index, 0, cards.length - 1);
  updateCurrentCard({ speak });
  if (moveFocus) {
    const target = cards[currentIndex]?.element?.querySelector(
      'h2:not(.reels-sr-only), .reel-card__continued-label, .reel-card__answer-label'
    );
    target?.focus({ preventScroll: true });
  }
}

function toggleState(name, entryId) {
  const values = stateSet(name);
  const removing = values.has(entryId);
  if (removing) values.delete(entryId);
  else values.add(entryId);
  state[name] = [...values];
  saveState();

  if (name === 'saved') {
    if (elements.stateAnnouncement) elements.stateAnnouncement.textContent = removing ? 'Removed from Saved.' : 'Saved.';
  } else if (name === 'done') {
    if (elements.stateAnnouncement) elements.stateAnnouncement.textContent = removing ? 'Marked not done.' : 'Marked done.';
  }

  if (name === 'saved' && removing && state.savedOnly) {
    buildFeed({ restore: null, speak: false, markSeen: false, persistPosition: true });
    return;
  }

  updateAllCardStates();
  updateProgressUi();
}

function availableVoices() {
  if (!('speechSynthesis' in window)) return [];
  return window.speechSynthesis.getVoices() || [];
}

function refreshVoiceOptions() {
  const selected = state.voice;
  const voices = availableVoices();
  elements.voiceSelect.replaceChildren();

  const randomOption = document.createElement('option');
  randomOption.value = 'random';
  randomOption.textContent = 'Random voice per card';
  elements.voiceSelect.appendChild(randomOption);

  const systemOption = document.createElement('option');
  systemOption.value = 'system';
  systemOption.textContent = 'System default';
  elements.voiceSelect.appendChild(systemOption);

  voices
    .slice()
    .sort((left, right) => `${left.lang} ${left.name}`.localeCompare(`${right.lang} ${right.name}`))
    .forEach(voice => {
      const option = document.createElement('option');
      option.value = voice.voiceURI;
      option.textContent = `${voice.name} (${voice.lang})`;
      elements.voiceSelect.appendChild(option);
    });

  const selectedOption = Array.from(elements.voiceSelect.options).find(option => option.value === selected);
  if (!selectedOption && selected !== 'random' && selected !== 'system') {
    const pendingOption = document.createElement('option');
    pendingOption.value = selected;
    pendingOption.textContent = voices.length
      ? 'Saved voice unavailable (system fallback)'
      : 'Saved voice waiting for browser (system fallback)';
    elements.voiceSelect.appendChild(pendingOption);
  }
  elements.voiceSelect.value = selected;
}

function chooseNarrator(card) {
  if (card.narratorVoice) return card.narratorVoice;
  const voices = availableVoices();
  const english = voices.filter(voice => /^en/i.test(voice.lang));
  const pool = english.length ? english : voices;

  if (state.voice === 'random') {
    if (!pool.length) return null;
    const index = Math.floor(Math.random() * pool.length);
    card.narratorVoice = pool[index];
  } else if (state.voice === 'system') {
    card.narratorVoice = null;
  } else {
    card.narratorVoice = voices.find(voice => voice.voiceURI === state.voice) || null;
  }
  return card.narratorVoice;
}

function speechSupported() {
  return 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
}

function stopSpeech() {
  speechGeneration += 1;
  if (speechGapTimer) {
    window.clearTimeout(speechGapTimer);
    speechGapTimer = 0;
  }
  speechSession = null;
  speechPaused = false;
  if (speechSupported()) window.speechSynthesis.cancel();
  updatePlayControls();
}

function speakSegments(segments, voice, generation) {
  if (!speechSupported() || !segments.length) return;

  const synthesis = window.speechSynthesis;
  const session = {
    generation,
    segments,
    voice,
    segmentIndex: 0,
    rate: state.speechRate,
    waiting: false,
    paused: false,
    gapRemaining: 0,
    gapStartedAt: 0,
    finished: false
  };
  speechSession = session;

  const clearGapTimer = () => {
    if (!speechGapTimer) return;
    window.clearTimeout(speechGapTimer);
    speechGapTimer = 0;
  };

  const scheduleGap = delay => {
    clearGapTimer();
    session.waiting = true;
    session.gapRemaining = Math.max(0, delay);
    session.gapStartedAt = performance.now();
    speechGapTimer = window.setTimeout(() => {
      speechGapTimer = 0;
      if (generation !== speechGeneration || session.paused || session.finished) return;
      session.waiting = false;
      session.gapRemaining = 0;
      speakNext();
    }, session.gapRemaining);
  };

  session.pauseGap = () => {
    if (!session.waiting) return;
    clearGapTimer();
    const elapsed = performance.now() - session.gapStartedAt;
    session.gapRemaining = Math.max(0, session.gapRemaining - elapsed);
    session.paused = true;
  };

  session.resumeGap = () => {
    if (!session.waiting) return;
    const remaining = session.gapRemaining;
    session.paused = false;
    scheduleGap(remaining);
  };

  function speakNext() {
    if (generation !== speechGeneration || state.muted || session.paused || session.finished) return;
    if (session.segmentIndex >= session.segments.length) {
      session.finished = true;
      if (speechSession === session) speechSession = null;
      speechPaused = false;
      updatePlayControls();
      elements.audioStatus.textContent = 'Narration finished. The transcript stays visible.';
      return;
    }

    const utterance = new SpeechSynthesisUtterance(session.segments[session.segmentIndex]);
    if (session.voice) utterance.voice = session.voice;
    utterance.rate = session.rate;
    utterance.pitch = 1;
    utterance.volume = 1;
    utterance.onend = () => {
      if (generation !== speechGeneration || session.finished) return;
      const completed = session.segmentIndex;
      session.segmentIndex += 1;
      if (completed === 0) scheduleGap(450);
      else speakNext();
    };
    utterance.onerror = () => {
      if (generation !== speechGeneration) return;
      session.finished = true;
      if (speechSession === session) speechSession = null;
      speechPaused = false;
      updatePlayControls();
      elements.audioStatus.textContent = 'Speech could not start. The transcript is still available.';
    };

    try {
      synthesis.speak(utterance);
    } catch {
      utterance.onerror?.();
      return;
    }
    updatePlayControls();
  }

  speakNext();
}

function speakCurrentCard() {
  if (!speechSupported()) {
    elements.audioStatus.textContent = 'Speech is unavailable in this browser. Read the transcript below.';
    updatePlayControls();
    return;
  }

  const card = cards[currentIndex];
  if (!card) return;

  // A new narration must own the speech queue. This prevents a late onend
  // callback from an earlier card from starting an old segment beside the new
  // one, especially when the user presses Play again after a short pause.
  stopSpeech();
  const voice = chooseNarrator(card);
  const answerText = card.atoms.map(atomText).filter(Boolean).join(' ');
  const segments = card.entry.kind === 'question'
    ? [card.entry.questionText, answerText].filter(Boolean)
    : [card.entry.speechTitle, answerText].filter(Boolean);

  speechPaused = false;
  elements.audioStatus.textContent = voice
    ? `Reading with ${voice.name}.`
    : 'Reading with the system voice.';
  speakSegments(segments, voice, speechGeneration);
}

function fadeMusic(target, duration = 240) {
  const audio = elements.musicPlayer;
  if (musicFadeFrame) cancelAnimationFrame(musicFadeFrame);
  const start = audio.volume;
  const startedAt = performance.now();

  const step = now => {
    const progress = clamp((now - startedAt) / duration, 0, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    audio.volume = start + (target - start) * eased;
    if (progress < 1) musicFadeFrame = requestAnimationFrame(step);
  };
  musicFadeFrame = requestAnimationFrame(step);
}

function stopMusic() {
  if (musicFadeFrame) cancelAnimationFrame(musicFadeFrame);
  musicFadeFrame = 0;
  const audio = elements.musicPlayer;
  const generation = ++musicGeneration;
  fadeMusic(0, 140);
  window.setTimeout(() => {
    if (generation === musicGeneration) audio.pause();
  }, 150);
}

function playMusicForCard(card) {
  musicGeneration += 1;
  const track = MUSIC_TRACKS[card.entryIndex % MUSIC_TRACKS.length];
  const audio = elements.musicPlayer;
  const expectedUrl = new URL(track.src, window.location.href).href;

  if (audio.src !== expectedUrl) audio.src = track.src;
  audio.loop = true;
  audio.volume = 0;
  elements.audioStatus.textContent = `Visual card · ${track.title}`;

  const playPromise = audio.play();
  if (playPromise?.catch) {
    playPromise.catch(() => {
      elements.audioStatus.textContent = 'Music could not start. The visual and its text remain available.';
    });
  }
  fadeMusic(state.musicVolume);
  updatePlayControls();
}

function playCurrentAudio() {
  if (state.muted) return;
  const card = cards[currentIndex];
  if (!card) return;

  if (card.element.dataset.mode === 'visual') {
    stopSpeech();
    playMusicForCard(card);
  } else {
    stopMusic();
    speakCurrentCard();
  }
}

function stopCurrentAudio() {
  stopSpeech();
  stopMusic();
}

function updatePlayControls() {
  const card = cards[currentIndex];
  if (!card) return;
  const button = card.element.querySelector('[data-action="play"]');
  const label = button.querySelector('[data-play-label]');
  const icon = button.querySelector('[data-play-icon]');

  const visual = card.element.dataset.mode === 'visual';
  const synthesisActive = speechSupported() && (window.speechSynthesis.speaking || window.speechSynthesis.pending);
  const sessionActive = Boolean(speechSession && !speechSession.finished);
  const active = visual
    ? !elements.musicPlayer.paused
    : synthesisActive || sessionActive;
  const paused = visual ? false : Boolean(speechSession?.paused || (speechSupported() && window.speechSynthesis.paused));

  const audioName = visual ? 'music' : 'narration';
  button.setAttribute('aria-label', active ? (paused ? `Resume ${audioName}` : `Pause ${audioName}`) : `Play ${audioName}`);
  label.textContent = active ? (paused ? 'Resume' : 'Pause') : 'Play';
  icon.innerHTML = active && !paused
    ? '<path d="M8 7h3v10H8zM13 7h3v10h-3z" fill="currentColor"/>'
    : '<path d="m9 7 8 5-8 5Z" fill="currentColor"/>';
}

function togglePlayback() {
  markGesture();
  const card = cards[currentIndex];
  if (!card) return;

  if (card.element.dataset.mode === 'visual') {
    if (elements.musicPlayer.paused) playCurrentAudio();
    else {
      elements.musicPlayer.pause();
      elements.audioStatus.textContent = 'Music paused.';
    }
    updatePlayControls();
    return;
  }

  if (!speechSupported()) {
    speakCurrentCard();
    return;
  }

  const synthesis = window.speechSynthesis;
  if (speechSession?.paused) {
    if (speechSession.waiting) speechSession.resumeGap();
    else synthesis.resume();
    speechSession.paused = false;
    speechPaused = false;
    elements.audioStatus.textContent = 'Narration resumed.';
  } else if (synthesis.paused) {
    synthesis.resume();
    speechPaused = false;
    elements.audioStatus.textContent = 'Narration resumed.';
  } else if (speechSession?.waiting) {
    speechSession.pauseGap();
    speechPaused = true;
    elements.audioStatus.textContent = 'Narration paused before the answer.';
  } else if (synthesis.speaking || synthesis.pending) {
    synthesis.pause();
    if (speechSession) speechSession.paused = true;
    speechPaused = true;
    elements.audioStatus.textContent = 'Narration paused.';
  } else {
    speakCurrentCard();
  }
  updatePlayControls();
}

function toggleMute() {
  markGesture();
  state.muted = !state.muted;
  if (state.muted) stopCurrentAudio();
  saveState();
  elements.muteButton.setAttribute('aria-pressed', String(state.muted));
  elements.muteButtonLabel.textContent = state.muted ? 'Unmute audio' : 'Mute audio';
  elements.audioStatus.textContent = state.muted ? 'Audio is muted.' : 'Audio is on.';
  if (!state.muted && hasUserGesture) playCurrentAudio();
}

function applyAudioSettings() {
  state.speechRate = clamp(Number(elements.speechRate.value) || 1, 0.75, 1.25);
  state.musicVolume = clamp(Number(elements.musicVolume.value) || 0, 0, 1);
  elements.speechRateValue.textContent = `${state.speechRate.toFixed(2).replace(/0$/, '')}×`;
  elements.musicVolumeValue.textContent = `${Math.round(state.musicVolume * 100)}%`;
  elements.musicPlayer.volume = state.musicVolume;
  saveState();
}

function restorePosition(feedKey = currentFeedKey()) {
  const position = positionForFeed(feedKey);
  if (!position) return null;
  return {
    key: position.key,
    entryId: position.entryId,
    atomKey: position.atomKey || '',
    atomKeys: Array.isArray(position.atomKeys) ? position.atomKeys : [],
    atomAnchor: position.atomAnchor || null,
    atomAnchors: Array.isArray(position.atomAnchors) ? position.atomAnchors : []
  };
}

function bindVoiceChangeEvents() {
  if (!('speechSynthesis' in window)) return;
  const synthesis = window.speechSynthesis;
  synthesis.addEventListener?.('voiceschanged', refreshVoiceOptions);

  // Older WebView implementations expose only the property callback.
  const previousHandler = synthesis.onvoiceschanged;
  synthesis.onvoiceschanged = event => {
    if (typeof previousHandler === 'function') previousHandler.call(synthesis, event);
    refreshVoiceOptions();
  };
}

function isBlankCardTap(event) {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return false;

  const body = target.closest('.reel-card__body');
  if (!body) return false;

  const contentTarget = target.closest(
    'a, button, input, select, textarea, summary, [role="button"], p, h1, h2, h3, h4, h5, h6, li, pre, table, blockquote, code, svg, img'
  );
  if (contentTarget) return false;
  if (window.getSelection?.()?.toString()) return false;

  const rect = body.getBoundingClientRect();
  if (event.clientX > rect.right - 14) return false;

  if (cardPointerStart) {
    const distance = Math.hypot(event.clientX - cardPointerStart.x, event.clientY - cardPointerStart.y);
    if (distance > 8 || body.scrollTop !== cardPointerStart.scrollTop) return false;
  }

  return true;
}

function bindControls() {
  bindVoiceChangeEvents();
  elements.railToggle.addEventListener('click', () => {
    markGesture();
    toggleRail();
  });
  elements.railClose.addEventListener('click', () => toggleRail(false));
  elements.railScrim.addEventListener('click', () => toggleRail(false));
  elements.themeToggle.addEventListener('click', () => {
    markGesture();
    setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  });

  document.querySelectorAll('[data-order]').forEach(button => {
    button.addEventListener('click', () => {
      markGesture();
      state.order = button.dataset.order;
      saveState();
      buildFeed({ restore: restorePosition(), speak: hasUserGesture, markSeen: false, persistPosition: true });
    });
  });

  elements.newOrderButton.addEventListener('click', () => {
    markGesture();
    state.shuffleSeed = (state.shuffleSeed * 1664525 + 1013904223) >>> 0;
    saveState();
    buildFeed({ restore: restorePosition(), speak: hasUserGesture, markSeen: false, persistPosition: true });
  });

  elements.savedFilterButton.addEventListener('click', () => {
    markGesture();
    state.savedOnly = !state.savedOnly;
    saveState();
    buildFeed({ restore: restorePosition(), speak: hasUserGesture, markSeen: false, persistPosition: true });
  });

  elements.unitFilters.addEventListener('click', event => {
    const button = event.target.closest('[data-unit]');
    if (!button) return;
    markGesture();
    state.unit = button.dataset.unit;
    state.savedOnly = false;
    saveState();
    buildFeed({ restore: restorePosition(), speak: hasUserGesture, markSeen: false, persistPosition: true });
  });

  elements.cardTrack.addEventListener('pointerdown', event => {
    const body = event.target instanceof Element ? event.target.closest('.reel-card__body') : null;
    cardPointerStart = body
      ? { x: event.clientX, y: event.clientY, scrollTop: body.scrollTop }
      : null;
  });

  elements.cardTrack.addEventListener('pointercancel', () => {
    cardPointerStart = null;
  });

  elements.cardTrack.addEventListener('click', event => {
    const button = event.target instanceof Element ? event.target.closest('[data-action]') : null;
    if (button) {
      markGesture();
      const action = button.dataset.action;
      const card = cards[currentIndex];

      if (action === 'previous') goTo(currentIndex - 1);
      if (action === 'next') goTo(currentIndex + 1);
      if (action === 'play') togglePlayback();
      if (action === 'done') toggleState('done', card.entry.id);
      if (action === 'save') toggleState('saved', card.entry.id);
      cardPointerStart = null;
      return;
    }

    if (isBlankCardTap(event)) {
      markGesture();
      togglePlayback();
    }
    cardPointerStart = null;
  });

  elements.voiceSelect.addEventListener('change', () => {
    markGesture();
    state.voice = elements.voiceSelect.value;
    cards.forEach(card => { card.narratorVoice = null; });
    saveState();
  });

  elements.speechRate.addEventListener('input', () => {
    markGesture();
    applyAudioSettings();
  });
  elements.musicVolume.addEventListener('input', () => {
    markGesture();
    applyAudioSettings();
  });
  elements.muteButton.addEventListener('click', toggleMute);

  document.addEventListener('keydown', event => {
    const target = event.target;
    const isTextEntry = target instanceof HTMLElement && (
      target.isContentEditable
      || target.closest('input, select, textarea, [contenteditable]:not([contenteditable="false"])')
    );
    const isInteractive = target instanceof HTMLElement && target.closest('button, a, summary, [role="button"]');
    const railOpen = elements.reelsRail.classList.contains('is-open');

    // Preserve browser and operating-system shortcuts. The app-level M/S/D
    // keys are intentionally unmodified only.
    if (event.ctrlKey || event.metaKey || event.altKey) return;

    if (event.key === 'Tab' && railOpen) {
      const focusable = [...elements.reelsRail.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'
      )].filter(element => element.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (first && last) {
        if (!elements.reelsRail.contains(document.activeElement)) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
        } else if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
      return;
    }

    if (event.key === 'Escape' && railOpen) {
      event.preventDefault();
      toggleRail(false);
      return;
    }

    if (railOpen || isTextEntry || isInteractive) return;

    const key = event.key.toLowerCase();
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const scrollBody = target instanceof HTMLElement ? target.closest('.reel-card__body') : null;
      if (scrollBody && scrollBody.scrollHeight > scrollBody.clientHeight + 2) {
        const canScroll = event.key === 'ArrowDown'
          ? scrollBody.scrollTop + scrollBody.clientHeight < scrollBody.scrollHeight - 2
          : scrollBody.scrollTop > 2;
        if (canScroll) return;
      }
      event.preventDefault();
      markGesture();
      goTo(currentIndex + (event.key === 'ArrowDown' ? 1 : -1));
      return;
    }

    if (event.code === 'Space') {
      event.preventDefault();
      markGesture();
      togglePlayback();
      return;
    }

    if (event.repeat) return;
    if (key === 'm') {
      event.preventDefault();
      toggleMute();
    } else if (key === 's' && cards[currentIndex]) {
      event.preventDefault();
      toggleState('saved', cards[currentIndex].entry.id);
    } else if (key === 'd' && cards[currentIndex]) {
      event.preventDefault();
      toggleState('done', cards[currentIndex].entry.id);
    }
  });

  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      if (!payload || !cards.length) return;
      const active = cards[currentIndex];
      currentRestore = {
        key: active?.key || '',
        entryId: active?.entry.id || '',
        atomKey: active?.atoms[0]?.key || '',
        atomKeys: active?.atoms.map(atom => atom.key) || [],
        atomAnchor: active?.atoms[0]?.anchor || null,
        atomAnchors: active?.atoms.map(atom => atom.anchor).filter(Boolean) || []
      };
      buildFeed({ restore: currentRestore, speak: false, markSeen: false, persistPosition: true });
    }, 180);
  });

  window.matchMedia('(max-width: 900px)').addEventListener?.('change', syncRailAccessibility);
  syncRailAccessibility();
}

async function loadFeed() {
  elements.stageLoading.hidden = false;
  elements.stageLoading.className = 'stage-loading';
  elements.stageLoading.setAttribute('role', 'status');
  elements.stageLoading.setAttribute('aria-live', 'polite');
  elements.stageLoading.innerHTML = '<p>Loading the BI revision feed…</p>';

  try {
    const response = await fetch('content.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Feed request failed with ${response.status}`);
    payload = await response.json();
    if (!payload?.entries?.length) throw new Error('The feed contains no entries');
    cleanPersistedEntryState();

    elements.speechRate.value = String(state.speechRate);
    elements.musicVolume.value = String(state.musicVolume);
    elements.muteButton.setAttribute('aria-pressed', String(state.muted));
    elements.muteButtonLabel.textContent = state.muted ? 'Unmute audio' : 'Mute audio';
    applyAudioSettings();
    refreshVoiceOptions();
    bindControls();

    let fontsReady = false;
    if (document.fonts?.load) {
      const readyPromise = Promise.all([
        document.fonts.load('600 28px Newsreader'),
        document.fonts.load('400 16px Newsreader')
      ])
        .then(() => document.fonts.ready)
        .then(() => {
          fontsReady = true;
        })
        .catch(() => {});
      await Promise.race([
        readyPromise,
        new Promise(resolve => window.setTimeout(resolve, 2500))
      ]);
    }

    const storedPosition = restorePosition();
    buildFeed({
      restore: storedPosition,
      speak: false,
      markSeen: !storedPosition,
      persistPosition: true
    });

    if (document.fonts?.ready && !fontsReady) {
      document.fonts.ready.then(() => {
        if (!payload || !cards.length) return;
        buildFeed({ restore: restorePosition(), speak: false, markSeen: false, persistPosition: false });
      });
    }

    elements.stageCaption.textContent = `${payload.subject.code} · ${payload.subject.name} · exact note text`;
  } catch (error) {
    elements.stageLoading.className = 'stage-error';
    elements.stageLoading.setAttribute('role', 'alert');
    elements.stageLoading.setAttribute('aria-live', 'assertive');
    elements.stageLoading.innerHTML = `
      <p>The revision feed could not load. Check the local site server and try again.</p>
      <button type="button" data-retry>Try again</button>
    `;
    elements.stageLoading.querySelector('[data-retry]')?.addEventListener('click', loadFeed);
    console.error(error);
  }
}

syncRailAccessibility();
loadFeed();
