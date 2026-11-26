const STORAGE_KEY = 'quickReels.state.v1';
const SUPPORTED_STATE_VERSION = 1;
const LEGACY_SUBJECT_ID = 'bi';
const DEFAULT_STATE = {
  version: SUPPORTED_STATE_VERSION,
  seen: [],
  done: [],
  saved: [],
  lastPosition: null,
  positions: {},
  voice: 'google',
  narratorVersion: 2,
  speechRate: 1,
  shuffleSeed: 541385059,
  order: 'ordered',
  unit: 'all',
  subject: 'bi',
  savedOnly: false,
  musicVolume: 0.28,
  muted: false,
  aiNarrationEnabled: true,
  lastNarrationFallback: null
};

const MAX_CLOUD_PREFETCH_SEGMENTS = 18;
const CLOUD_PREFETCH_CONCURRENCY = 3;

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

// Progressive subtitle state for AI narration
let subtitleUnits = [];
let subtitleCurrentIndex = -1;
let subtitleTimer = null;
let subtitleFallbackTimer = null;
let subtitleAudioPlayer = null;

const elements = {
  audioStatus: document.querySelector('#audioStatus'),
  cardTrack: document.querySelector('#cardTrack'),
  cardViewport: document.querySelector('#cardViewport'),
  cardAnnouncement: document.querySelector('#cardAnnouncement'),
  doneCount: document.querySelector('#doneCount'),
  muteButton: document.querySelector('#muteButton'),
  muteButtonLabel: document.querySelector('#muteButtonLabel'),
  narratorStatus: document.querySelector('#narratorStatus'),
  narrationPlayer: document.querySelector('#narrationPlayer'),
  musicPlayer: document.querySelector('#musicPlayer'),
  musicVolume: document.querySelector('#musicVolume'),
  musicVolumeValue: document.querySelector('#musicVolumeValue'),
  newOrderButton: document.querySelector('#newOrderButton'),
  progressNote: document.querySelector('#progressNote'),
  railProgressFill: document.querySelector('#railProgressFill'),
  hubToggle: document.querySelector('#hubToggle'),
  hubMenu: document.querySelector('#hubMenu'),
  hubClose: document.querySelector('#hubClose'),
  hubMenuItems: document.querySelectorAll('.hub-menu__item'),
  hubSummaryFeed: document.querySelector('#hubSummaryFeed'),
  hubSummaryProgress: document.querySelector('#hubSummaryProgress'),
  hubSummaryAudio: document.querySelector('#hubSummaryAudio'),
  hubResetFilters: document.querySelector('#hubResetFilters'),
  feedModal: document.querySelector('#feedModal'),
  feedClose: document.querySelector('#feedClose'),
  feedApply: document.querySelector('#feedApply'),
  progressModal: document.querySelector('#progressModal'),
  progressClose: document.querySelector('#progressClose'),
  audioModal: document.querySelector('#audioModal'),
  audioClose: document.querySelector('#audioClose'),
  resetProgress: document.querySelector('#resetProgress'),
  resetConfirm: document.querySelector('#resetConfirm'),
  resetConfirmCancel: document.querySelector('#resetConfirmCancel'),
  resetConfirmAccept: document.querySelector('#resetConfirmAccept'),
  savedCount: document.querySelector('#savedCount'),
  savedFilterButton: document.querySelector('#savedFilterButton'),
  savedFilterCount: document.querySelector('#savedFilterCount'),
  seedValue: document.querySelector('#seedValue'),
  seenCount: document.querySelector('#seenCount'),
  speechRate: document.querySelector('#speechRate'),
  speechRateValue: document.querySelector('#speechRateValue'),
  stageLoading: document.querySelector('#stageLoading'),
  stageLoadingText: document.querySelector('#stageLoadingText'),
  stageCaption: document.querySelector('#stageCaption'),
  stateAnnouncement: document.querySelector('#stateAnnouncement'),
  themeToggle: document.querySelector('#themeToggle'),
  topbarContext: document.querySelector('#topbarContext'),
  topbarSubject: document.querySelector('#topbarSubject'),
  unitFilters: document.querySelector('#unitFilters'),
  subjectFilters: document.querySelector('#subjectFilters'),
  hubSubjects: document.querySelector('#hubSubjects'),
  hubNotesLink: document.querySelector('#hubNotesLink'),
  voiceSelect: document.querySelector('#voiceSelect'),
  reelStage: document.querySelector('#reelStage'),
  narrationToggle: document.querySelector('#aiNarrationToggle'),
  transcriptPanel: document.querySelector('#transcriptPanel'),
  transcriptContent: document.querySelector('#transcriptContent'),
  transcriptEmpty: document.querySelector('#transcriptEmpty'),
  transcriptClose: document.querySelector('#transcriptClose'),
  hubSummaryAiNarration: document.querySelector('#hubSummaryAiNarration')
};

let storageAvailable = true;
let state = loadState();
let payload = null;
let catalog = null;
const payloadCache = new Map();
let cards = [];
let currentIndex = 0;
let hasUserGesture = false;
let narrationIntent = false;
let speechGeneration = 0;
let speechPaused = false;
let speechSession = null;
let speechGapTimer = 0;
let cloudGeneration = 0;
let cloudSession = null;
let cloudPreloadPromises = new Map();
let cloudAudioBlobs = new Map();
let cloudObjectUrls = [];
let cloudPrefetchQueue = [];
let cloudPrefetchActive = 0;
let cloudPrefetchControllers = new Map();
let cloudPrefetchPromises = new Map();
let musicGeneration = 0;
let musicFadeFrame = 0;

// AI narration runtime state
let aiGeneration = 0;
let aiSession = null;
let aiPrefetchPromises = new Map();
let aiPrefetchQueue = [];
let aiPrefetchActive = 0;
let aiPrefetchControllers = new Map();
const MAX_AI_PREFETCH_SEGMENTS = 18;
const AI_PREFETCH_CONCURRENCY = 3;
let resizeTimer = 0;
let measurementCard = null;
let currentRestore = null;
let cardPointerStart = null;
let hubReturnFocus = null;
let submodalReturnFocus = null;
let activeModal = null;
let activeSubmodal = null;

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

function migrateFeedKey(feedKey, fallbackSubject = LEGACY_SUBJECT_ID) {
  const parts = String(feedKey || '').split('|');
  if (!['ordered', 'shuffled'].includes(parts[0])) return String(feedKey || '');
  const unit = parts[1] || '';
  if (unit === 'all' || /^\d+$/.test(unit)) {
    return [parts[0], fallbackSubject, ...parts.slice(1)].join('|');
  }
  return parts.join('|');
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

  if (Number(merged.narratorVersion || 1) < 2) {
    if (merged.voice === 'random') merged.voice = 'google';
    merged.narratorVersion = 2;
  } else {
    merged.narratorVersion = 2;
  }
  if (merged.voice === 'kokoro') merged.voice = DEFAULT_STATE.voice;

  merged.seen = Array.isArray(merged.seen) ? merged.seen.filter(value => typeof value === 'string') : [];
  merged.done = Array.isArray(merged.done) ? merged.done.filter(value => typeof value === 'string') : [];
  merged.saved = Array.isArray(merged.saved) ? merged.saved.filter(value => typeof value === 'string') : [];
  merged.speechRate = clamp(Number(merged.speechRate) || 1, 0.75, 1.25);
  merged.musicVolume = clamp(Number(merged.musicVolume) || 0, 0, 1);
  merged.shuffleSeed = Number(merged.shuffleSeed) || DEFAULT_STATE.shuffleSeed;
  merged.order = merged.order === 'shuffled' ? 'shuffled' : 'ordered';
  merged.unit = typeof merged.unit === 'string' ? merged.unit : 'all';
  merged.subject = typeof merged.subject === 'string' && merged.subject.trim()
    ? merged.subject
    : LEGACY_SUBJECT_ID;
  merged.savedOnly = Boolean(merged.savedOnly);
  merged.muted = Boolean(merged.muted);
  merged.aiNarrationEnabled = Boolean(merged.aiNarrationEnabled);
  merged.lastNarrationFallback = merged.lastNarrationFallback && typeof merged.lastNarrationFallback === 'object'
    ? { provider: String(merged.lastNarrationFallback.provider || ''), reason: String(merged.lastNarrationFallback.reason || ''), at: String(merged.lastNarrationFallback.at || '') }
    : null;
  merged.lastPosition = normalizePosition(merged.lastPosition);
  if (merged.lastPosition) {
    merged.lastPosition.feedKey = migrateFeedKey(merged.lastPosition.feedKey, LEGACY_SUBJECT_ID);
  }

  const migratedPositions = new Map();
  if (merged.positions && typeof merged.positions === 'object' && !Array.isArray(merged.positions)) {
    for (const [rawKey, storedPosition] of Object.entries(merged.positions)) {
      const position = normalizePosition(storedPosition);
      if (!position) continue;
      const feedKey = migrateFeedKey(rawKey, LEGACY_SUBJECT_ID);
      position.feedKey = feedKey;
      const existing = migratedPositions.get(feedKey);
      if (!existing || String(position.updatedAt || '').localeCompare(String(existing.updatedAt || '')) > 0) {
        migratedPositions.set(feedKey, position);
      }
    }
  }
  merged.positions = Object.fromEntries(migratedPositions);
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
  const base = `${state.order}|${state.subject}|${state.unit}|${state.savedOnly ? 'saved' : 'all'}`;
  return state.order === 'shuffled' ? `${base}|${state.shuffleSeed}` : base;
}

function parseFeedKey(feedKey = '') {
  const parts = migrateFeedKey(feedKey).split('|');
  const [order, subject, unit, mode, seed] = parts;
  if (!['ordered', 'shuffled'].includes(order)) return null;
  if (!subject) return null;
  if (unit !== 'all' && !/^\d+$/.test(unit)) return null;
  if (!['all', 'saved'].includes(mode)) return null;
  return {
    order,
    subject,
    unit,
    savedOnly: mode === 'saved',
    seed: /^\d+$/.test(seed || '') ? Number(seed) : null
  };
}

function positionForFeed(feedKey = currentFeedKey()) {
  const stored = state.positions?.[feedKey];
  if (stored) return stored;

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
  // For carousel cards, use the current slide's atoms
  const currentAtoms = card.isMultiSlide ? card.groups[card.currentSlide] : card.groups[0];
  const position = {
    key: card.key,
    entryId: card.entry.id,
    atomKey: currentAtoms[0]?.key || '',
    atomKeys: currentAtoms.map(atom => atom.key),
    atomAnchor: currentAtoms[0]?.anchor || null,
    atomAnchors: currentAtoms.map(atom => atom.anchor).filter(Boolean),
    // Carousel-specific position
    carouselSlide: card.isMultiSlide ? card.currentSlide : 0,
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
  const subjectIds = new Set(catalog?.subjects?.map(subject => subject.id) || [state.subject]);
  const knownPrefixes = [...subjectIds].map(id => `${id}-`);
  let changed = false;

  if (!subjectIds.has(state.subject)) {
    state.subject = catalog?.defaultSubject || LEGACY_SUBJECT_ID;
    changed = true;
  }

  for (const name of ['seen', 'done', 'saved']) {
    const cleaned = [...new Set(state[name])].filter(id =>
      typeof id === 'string' && knownPrefixes.some(prefix => id.startsWith(prefix))
    );
    if (cleaned.length !== state[name].length) changed = true;
    state[name] = cleaned;
  }

  if (state.unit !== 'all' && !validUnits.has(String(state.unit))) {
    state.unit = 'all';
    changed = true;
  }

  const saved = new Set(state.saved);
  const positionIsValid = position => {
    if (!position) return false;
    const feed = parseFeedKey(position.feedKey || '');
    if (!feed || !subjectIds.has(feed.subject)) return false;
    if (feed.subject !== state.subject) return true;
    if (!validIds.has(position.entryId)) return false;
    const entry = entriesById.get(position.entryId);
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

function syncHubMenuAccessibility(open) {
  elements.hubMenu.inert = !open;
  elements.hubMenu.setAttribute('aria-hidden', String(!open));
  if (open) {
    elements.hubMenu.setAttribute('role', 'dialog');
    elements.hubMenu.setAttribute('aria-modal', 'true');
    elements.reelStage.inert = true;
    elements.reelStage.setAttribute('aria-hidden', 'true');
  } else {
    elements.hubMenu.removeAttribute('role');
    elements.hubMenu.removeAttribute('aria-modal');
    elements.reelStage.inert = false;
    elements.reelStage.removeAttribute('aria-hidden');
  }
}

function openHubMenu() {
  if (elements.hubMenu.open) return;
  hubReturnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : elements.hubToggle;
  elements.hubMenu.showModal();
  elements.hubToggle.setAttribute('aria-expanded', 'true');
  syncHubMenuAccessibility(true);
  elements.hubMenu.querySelector('.hub-menu__item')?.focus({ preventScroll: true });
}

function closeHubMenu() {
  if (!elements.hubMenu.open) return;
  elements.hubMenu.close();
  elements.hubToggle.setAttribute('aria-expanded', 'false');
  syncHubMenuAccessibility(false);
  if (hubReturnFocus?.isConnected) hubReturnFocus.focus({ preventScroll: true });
  hubReturnFocus = null;
}

function toggleHubMenu() {
  if (elements.hubMenu.open) closeHubMenu();
  else openHubMenu();
}

function openSubmodal(modal, returnFocus) {
  if (modal.open) return;
  const hubWasOpen = elements.hubMenu.open;
  const doOpen = () => {
    submodalReturnFocus = returnFocus || document.activeElement instanceof HTMLElement ? document.activeElement : elements.hubToggle;
    modal.showModal();
    activeModal = modal;
    if (elements.reelStage) {
      elements.reelStage.inert = true;
      elements.reelStage.setAttribute('aria-hidden', 'true');
    }
    modal.querySelector('button, a, select, input, [tabindex]:not([tabindex="-1"])')?.focus({ preventScroll: true });
    updateHubSummaries();
  };
  if (hubWasOpen) {
    let hubCloseFired = false;
    const onHubClose = () => {
      hubCloseFired = true;
      elements.hubMenu.removeEventListener('close', onHubClose);
      doOpen();
    };
    elements.hubMenu.addEventListener('close', onHubClose);
    closeHubMenu();
    // Fallback in case close event doesn't fire
    setTimeout(() => {
      if (!hubCloseFired) {
        elements.hubMenu.removeEventListener('close', onHubClose);
        doOpen();
      }
    }, 150);
  } else {
    doOpen();
  }
}

function closeSubmodal() {
  if (!activeModal || !activeModal.open) return;
  activeModal.close();
  if (elements.reelStage) {
    elements.reelStage.inert = false;
    elements.reelStage.removeAttribute('aria-hidden');
  }
  const toFocus = submodalReturnFocus?.isConnected ? submodalReturnFocus : elements.hubToggle;
  toFocus.focus({ preventScroll: true });
  submodalReturnFocus = null;
  activeModal = null;
  updateHubSummaries();
}

function toggleSubmodal(modal, returnFocus) {
  if (modal.open) closeSubmodal();
  else openSubmodal(modal, returnFocus);
}

function updateHubSummaries() {
  const activeSubject = catalog?.subjects?.find(subject => subject.id === state.subject);
  const subjectLabel = activeSubject?.name || state.subject;
  const unitLabel = state.unit === 'all' ? 'All units' : `Unit ${state.unit}`;
  const orderLabel = state.order === 'shuffled' ? 'Shuffled' : 'Unit order';
  elements.hubSummaryFeed.textContent = `${subjectLabel} · ${unitLabel} · ${orderLabel}`;

  const done = new Set(state.done).size;
  const saved = new Set(state.saved).size;
  elements.hubSummaryProgress.textContent = `${done} done · ${saved} saved`;

  let voiceLabel = state.voice;
  if (state.voice === 'google') voiceLabel = 'Google Chirp 3 HD';
  else if (state.voice === 'ai') voiceLabel = 'AI narration';
  else if (state.voice === 'piper-amy') voiceLabel = 'Piper (Amy)';
  else if (state.voice === 'piper-ljspeech') voiceLabel = 'Piper (LJSpeech)';
  else if (state.voice === 'piper-ryan') voiceLabel = 'Piper (Ryan)';
  else if (state.voice === 'random') voiceLabel = 'Random browser voice';
  else if (state.voice === 'system') voiceLabel = 'Browser system voice';
  elements.hubSummaryAudio.textContent = `${voiceLabel} · ${state.speechRate.toFixed(1).replace(/\.0$/, '')}×`;

  const aiLabel = state.aiNarrationEnabled ? 'On' : 'Off';
  elements.hubSummaryAiNarration.textContent = `${aiLabel} · reel transcript`;

  elements.hubResetFilters.hidden = state.unit === 'all' && state.order === 'ordered' && !state.savedOnly;
}

function activeSubjectConfig() {
  return catalog?.subjects?.find(subject => subject.id === state.subject) || null;
}

function renderSubjectFilters() {
  const containers = [elements.hubSubjects, elements.subjectFilters].filter(Boolean);
  containers.forEach(container => {
    container.replaceChildren();
    (catalog?.subjects || []).forEach(subject => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'subject-chip';
      button.dataset.subject = subject.id;
      button.textContent = subject.name;
      button.title = `${subject.code} · ${subject.entryCount} sections`;
      button.style.setProperty('--subject-color', subject.color || '#2563eb');
      container.appendChild(button);
    });
  });
  syncSubjectChipState();
}

function syncSubjectChipState() {
  document.querySelectorAll('.subject-chip[data-subject]').forEach(button => {
    const isActive = button.dataset.subject === state.subject;
    button.classList.toggle('is-active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
    button.removeAttribute('aria-busy');
  });
}

function updateSubjectUi() {
  const subject = activeSubjectConfig();
  if (!subject) return;

  document.title = `Quick Reels | ${subject.name} | Worst Generation`;
  if (elements.topbarSubject) elements.topbarSubject.textContent = subject.name;
  if (elements.topbarContext) elements.topbarContext.setAttribute('aria-label', `Quick Reels for ${subject.name}`);
  if (elements.stageLoadingText) elements.stageLoadingText.textContent = `Loading the ${subject.name} revision feed…`;
  if (elements.stageCaption) elements.stageCaption.textContent = `${subject.name} · exact note text`;
  if (elements.hubNotesLink) {
    elements.hubNotesLink.textContent = `${subject.name} notes`;
    elements.hubNotesLink.href = subject.notesUrl;
  }
  document.documentElement.style.setProperty('--reels-subject-color', subject.color || '#2563eb');
  syncSubjectChipState();
}

function updateSubjectUrl() {
  try {
    const url = new URL(window.location.href);
    if (state.subject === catalog?.defaultSubject) url.searchParams.delete('subject');
    else url.searchParams.set('subject', state.subject);
    const next = `${url.pathname}${url.search}${url.hash}`;
    const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    if (next !== current) window.history.replaceState(null, '', next);
  } catch {
  }
}

async function ensurePayload(subjectId) {
  if (payloadCache.has(subjectId)) {
    payload = payloadCache.get(subjectId);
    return payload;
  }
  const subject = catalog?.subjects?.find(candidate => candidate.id === subjectId);
  if (!subject) throw new Error(`Unknown Quick Reels subject: ${subjectId}`);
  const response = await fetch(subject.payloadUrl, { cache: 'no-store' });
  if (!response.ok) throw new Error(`Failed to load ${subject.payloadUrl}: ${response.status}`);
  const nextPayload = await response.json();
  payloadCache.set(subjectId, nextPayload);
  payload = nextPayload;
  return nextPayload;
}

async function selectSubject(subjectId) {
  if (!catalog?.subjects?.some(subject => subject.id === subjectId)) return false;
  if (subjectId === state.subject && payload) return false;

  const busyButtons = [...document.querySelectorAll(`.subject-chip[data-subject="${CSS.escape(subjectId)}"]`)];
  busyButtons.forEach(button => button.setAttribute('aria-busy', 'true'));
  try {
    await ensurePayload(subjectId);
  } catch (error) {
    busyButtons.forEach(button => button.removeAttribute('aria-busy'));
    console.error(error);
    return false;
  }

  state.subject = subjectId;
  state.unit = 'all';
  state.savedOnly = false;
  saveState();
  cleanPersistedEntryState();
  updateSubjectUi();
  updateSubjectUrl();
  buildFeed({ restore: restorePosition(), speak: hasUserGesture, markSeen: false, persistPosition: true });
  return true;
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
      <button class="reel-action-button" type="button" data-action="mute" aria-pressed="false" aria-label="Mute audio" title="Mute (M)" data-tooltip="Mute">
        <svg class="mute-on" viewBox="0 0 24 24" width="21" height="21" aria-hidden="true"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" fill="currentColor"/></svg>
        <svg class="mute-off" viewBox="0 0 24 24" width="21" height="21" aria-hidden="true"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" fill="currentColor"/></svg>
        <span class="reels-sr-only" data-mute-label>Mute</span>
      </button>
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

function buildCarouselCardElement(entry, allGroups, index, total) {
  // entry: the entry object
  // allGroups: array of atom arrays (each group = one slide)
  // index: index in the feed (for progress)
  // total: total number of entries in feed
  
  // Find the card to get currentSlide for this entry (must be before template literals)
  const carouselCard = cards.find(c => c.entry.id === entry.id);
  const initialSlide = carouselCard?.currentSlide || 0;
  const isMultiSlide = allGroups.length > 1;
  
  const article = document.createElement('article');
  article.className = 'reel-card';
  article.dataset.entryId = entry.id;
  article.dataset.cardIndex = String(index);
  article.dataset.kind = entry.kind;
  article.dataset.unit = String(entry.unit);
  article.dataset.mode = allGroups[0].some(atom => atom.part?.type === 'visual') ? 'visual' : 'text';
  
  // Build slides for carousel
  const slidesHtml = allGroups.map((atoms, slideIndex) => {
    const continuation = slideIndex > 0;
    const isActive = slideIndex === initialSlide;
    
    return `
      <div class="reel-carousel__slide${isActive ? ' reel-carousel__slide--active' : ''}" 
           data-slide-index="${slideIndex}" 
           role="group" 
           aria-roledescription="slide" 
           aria-label="${allGroups.length > 1 ? `Slide ${slideIndex + 1} of ${allGroups.length}` : 'Content'}"
           ${slideIndex !== initialSlide ? 'hidden' : ''}>
        <div class="reel-card__body" tabindex="0" aria-label="${continuation ? 'Answer continued' : 'Card content'}">${cardBodyHtml(entry, atoms, continuation)}</div>
      </div>
    `;
  }).join('');
  
  // Carousel navigation controls
  const carouselNavHtml = isMultiSlide ? `
    <nav class="reel-carousel__nav" aria-label="Carousel navigation">
      <div class="reel-carousel__dots" role="tablist" aria-label="Slide indicators">
        ${allGroups.map((_, i) => `
          <button class="reel-carousel__dot${i === initialSlide ? ' reel-carousel__dot--active' : ''}" 
                  type="button" 
                  role="tab" 
                  data-action="carousel-slide"
                  data-slide="${i}" 
                  aria-selected="${i === initialSlide}" 
                  aria-label="Go to slide ${i + 1}"></button>
        `).join('')}
      </div>
    </nav>
  ` : '';
  
  article.innerHTML = `
    ${cardHeaderHtml(entry)}
    <div class="reel-carousel__container" data-carousel="${isMultiSlide ? 'true' : 'false'}" data-total-slides="${allGroups.length}">
      <div class="reel-carousel__track" role="region" aria-roledescription="carousel" aria-label="${entry.questionText || entry.title}">
        ${slidesHtml}
      </div>
      ${carouselNavHtml}
    </div>
    ${cardActionsHtml(entry)}
    <div class="reel-playback-feedback" aria-hidden="true" data-playback-feedback>
      <svg data-feedback-icon viewBox="0 0 24 24" width="48" height="48" aria-hidden="true"></svg>
      <span data-feedback-label class="feedback-label"></span>
    </div>
    ${cardFooterHtml(entry, index, total)}
  `;
  
  // Store carousel state on the element
  article._carouselState = {
    currentSlide: initialSlide,
    totalSlides: allGroups.length,
    entryId: entry.id
  };
  
  return article;
}

// Backward compatibility - for visual cards and single-slide entries
function buildCardElement(entry, atoms, index, total, continuation = false) {
  const article = document.createElement('article');
  article.className = 'reel-card';
  article.dataset.entryId = entry.id;
  article.dataset.cardIndex = String(index);
  article.dataset.kind = entry.kind;
  article.dataset.unit = String(entry.unit);
  article.dataset.mode = atoms.some(atom => atom.part?.type === 'visual') ? 'visual' : 'text';
  article.innerHTML = `
    ${cardHeaderHtml(entry)}
    <div class="reel-card__body" tabindex="0" aria-label="Card content">${cardBodyHtml(entry, atoms, continuation)}</div>
    ${cardActionsHtml(entry)}
    <div class="reel-playback-feedback" aria-hidden="true" data-playback-feedback>
      <svg data-feedback-icon viewBox="0 0 24 24" width="48" height="48" aria-hidden="true"></svg>
      <span data-feedback-label class="feedback-label"></span>
    </div>
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

// Get current atoms for a card (handles both carousel and regular cards)
function getCardAtoms(card) {
  if (card.isMultiSlide && card.groups) {
    return card.groups[card.currentSlide] || [];
  }
  return card.atoms || card.groups?.[0] || [];
}

function filteredEntries() {
  let entries = payload.entries.filter(entry =>
    !entry.subjectId || entry.subjectId === state.subject
  );
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
  // Total entries (not total groups) for progress
  const total = grouped.length;

  cards = [];
  grouped.forEach(({ entry, groups }, index) => {
    const key = `${entry.id}::carousel`;
    const isMultiSlide = groups.length > 1;
    
    // Restore carousel slide position if available
    let restoredSlide = 0;
    if (restore && restore.entryId === entry.id && restore.carouselSlide !== undefined) {
      restoredSlide = clamp(restore.carouselSlide, 0, groups.length - 1);
    }
    
    cards.push({
      key,
      entry,
      entryIndex: index,
      groups, // All groups (slides) for this entry
      isMultiSlide,
      currentSlide: isMultiSlide ? restoredSlide : 0, // Track carousel position
      narratorVoice: null
    });
  });

  elements.cardTrack.replaceChildren();
  cards.forEach((card, index) => {
    // Use carousel card for multi-slide entries, regular card for single-slide
    const element = card.isMultiSlide 
      ? buildCarouselCardElement(card.entry, card.groups, index, total)
      : buildCardElement(card.entry, card.groups[0], index, total, false);
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
    ...getCardAtoms(card).flatMap(atom => savedAnchors.map(saved => restoreAnchorScore(atom, saved)))
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
  updateHubSummaries();

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
  updateHubSummaries();
  updatePlayControls();
  renderAiTranscript(card);

  if (elements.cardAnnouncement) {
    const label = card.entry.kind === 'question' ? card.entry.questionText : card.entry.title;
    elements.cardAnnouncement.textContent = `${label}. Card ${currentIndex + 1} of ${cards.length}.`;
  }

  if (speak && hasUserGesture && !state.muted) playCurrentAudio();
}

// Carousel navigation functions
function carouselGoToSlide(card, slideIndex, { speak = false } = {}) {
  if (!card.isMultiSlide) return;
  const totalSlides = card.groups.length;
  slideIndex = clamp(slideIndex, 0, totalSlides - 1);
  
  if (card.currentSlide === slideIndex) return;
  
  card.currentSlide = slideIndex;
  
  // Update slide visibility
  const track = card.element?.querySelector('.reel-carousel__track');
  if (track) {
    const slides = track.querySelectorAll('.reel-carousel__slide');
    slides.forEach((slide, i) => {
      const isActive = i === slideIndex;
      slide.hidden = !isActive;
      slide.classList.toggle('reel-carousel__slide--active', isActive);
      slide.setAttribute('aria-label', `Slide ${i + 1} of ${totalSlides}`);
    });
  }
  
  // Update dots
  const dots = card.element?.querySelectorAll('.reel-carousel__dot');
  dots?.forEach((dot, i) => {
    const isActive = i === slideIndex;
    dot.classList.toggle('reel-carousel__dot--active', isActive);
    dot.setAttribute('aria-selected', String(isActive));
  });
  
  // Persist carousel position
  rememberPosition(card);
  saveState();
  
  // Play narration for new slide if requested
  if (speak && hasUserGesture && !state.muted) {
    playCurrentAudio();
  }
  
  // Announce slide change
  if (elements.cardAnnouncement) {
    elements.cardAnnouncement.textContent = `Slide ${slideIndex + 1} of ${totalSlides}`;
  }
}

function goTo(index, { speak = true } = {}) {
  if (!cards.length) return;
  const previousCard = cards[currentIndex];
  const moveFocus = Boolean(previousCard?.element?.contains(document.activeElement));
  stopCurrentAudio();
  abortCloudPrefetches();
  abortAiPrefetches();
  currentIndex = clamp(index, 0, cards.length - 1);
  updateCurrentCard({ speak });
  prefetchNarrationAround(currentIndex, 2);
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
  updateHubSummaries();
}

function availableVoices() {
  if (!('speechSynthesis' in window)) return [];
  return window.speechSynthesis.getVoices() || [];
}

function refreshVoiceOptions() {
  const selected = state.voice;
  const voices = availableVoices();
  elements.voiceSelect.replaceChildren();

  const fixedOptions = [
    ['google', 'Google Chirp 3 HD (recommended)'],
    ['ai', 'AI narration (reel transcript)'],
    ['piper-amy', 'Amy (Piper) — warm, conversational'],
    ['piper-ljspeech', 'LJSpeech (Piper) — clear, articulate'],
    ['piper-ryan', 'Ryan (Piper) — steady, neutral'],
    ['random', 'Random browser voice per card'],
    ['system', 'Browser system voice']
  ];
  fixedOptions.forEach(([value, label]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = label;
    elements.voiceSelect.appendChild(option);
  });

  if (voices.length) {
    const group = document.createElement('optgroup');
    group.label = 'Browser voices';
    voices
      .slice()
      .sort((left, right) => `${left.lang} ${left.name}`.localeCompare(`${right.lang} ${right.name}`))
      .forEach(voice => {
        const option = document.createElement('option');
        option.value = voice.voiceURI;
        option.textContent = `${voice.name} (${voice.lang})`;
        group.appendChild(option);
      });
    elements.voiceSelect.appendChild(group);
  }

  const selectedOption = Array.from(elements.voiceSelect.options).find(option => option.value === selected);
  if (!selectedOption && !['google', 'random', 'system'].includes(selected)) {
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

function setNarratorStatus(message, { announce = false } = {}) {
  if (elements.narratorStatus) elements.narratorStatus.textContent = message;
  if (announce && elements.audioStatus) elements.audioStatus.textContent = message;
}

function refreshNarratorStatus() {
  if (state.voice === 'google') {
    setNarratorStatus(payload?.narration?.cloudEnabled
      ? 'Google Chirp 3 HD is configured. Narration loads ahead of the card.'
      : 'Google narration is not configured. Browser speech is the fallback.');
    return;
  }
  if (state.voice === 'ai') {
    setNarratorStatus(payload?.aiTranscript?.cloudEnabled
      ? 'AI narration is configured. Reel transcript loads ahead of the card.'
      : 'AI narration uses the build-time transcript with deterministic fallback.');
    return;
  }
  if (state.voice === 'piper-amy') {
    setNarratorStatus('Piper TTS (Amy) — warm, conversational female voice. Generated locally.');
    return;
  }
  if (state.voice === 'piper-ljspeech') {
    setNarratorStatus('Piper TTS (LJSpeech) — clear, articulate female voice. Generated locally.');
    return;
  }
  if (state.voice === 'piper-ryan') {
    setNarratorStatus('Piper TTS (Ryan) — steady, neutral male voice. Generated locally.');
    return;
  }
  if (state.voice === 'random') {
    setNarratorStatus('A random browser voice is selected for each card.');
    return;
  }
  if (state.voice === 'system') {
    setNarratorStatus('The browser system voice will read each card.');
    return;
  }
  setNarratorStatus('A saved browser voice will read each card.');
}

function narrationSegmentRecord(id) {
  return payload?.narration?.segments?.[id] || null;
}

function aiSegmentRecord(id) {
  return payload?.aiTranscript?.segments?.[id] || null;
}

function narrationSegmentsForCard(card) {
  const entryNarration = card?.entry?.narration;
  const segments = [];
  const addSegment = id => {
    if (!id) return;
    const segment = narrationSegmentRecord(id);
    if (segment?.text) segments.push({ id, text: segment.text });
  };

  if (!entryNarration) return segments;
  addSegment(entryNarration.title);

  getCardAtoms(card).forEach(atom => {
    const partIndex = Number(atom.anchor?.partIndex);
    const narrationPart = entryNarration.parts?.[partIndex];
    if (!narrationPart) return;

    if (atom.part?.type === 'table') {
      addSegment(narrationPart.header);
      const start = Number(atom.anchor?.start || 0);
      const end = Number(atom.anchor?.end ?? start);
      (narrationPart.rows || []).slice(start, end + 1).forEach(addSegment);
      return;
    }

    if (atom.part?.type === 'diagram') {
      const start = Number(atom.anchor?.start || 0);
      const end = Number(atom.anchor?.end ?? start);
      (narrationPart.lines || []).slice(start, end + 1).forEach(addSegment);
      return;
    }

    addSegment(narrationPart.text);
  });

  return segments;
}

function browserNarrationSegments(card) {
  const normalized = narrationSegmentsForCard(card);
  if (normalized.length) return normalized.map(segment => segment.text);
  const answerText = getCardAtoms(card).map(atomText).filter(Boolean).join(' ');
  return card.entry.kind === 'question'
    ? [card.entry.questionText, answerText].filter(Boolean)
    : [card.entry.speechTitle, answerText].filter(Boolean);
}

function aiNarrationSegmentsForCard(card) {
  const entryAiNarration = card?.entry?.aiTranscript;
  const segments = [];
  const addSegment = id => {
    if (!id) return;
    const segment = aiSegmentRecord(id);
    if (segment?.text) segments.push({ id, text: segment.text });
  };

  if (!entryAiNarration) return segments;
  addSegment(entryAiNarration.transcript);
  return segments;
}

function reelsBaseUrl() {
  return new URL('./', import.meta.url);
}

function cloudSegmentUrl(segment) {
  if (segment.static) {
    const fileName = `${segment.id}-${segment.version}.mp3`;
    return new URL(`audio/${fileName}`, reelsBaseUrl()).href;
  }
  const url = new URL('/api/narration', window.location.origin);
  url.searchParams.set('segment', segment.id);
  url.searchParams.set('v', segment.version);
  // Pass selected Piper voice as override
  if (state.voice?.startsWith('piper-')) {
    const piperVoice = state.voice.replace('piper-', '');
    url.searchParams.set('voice', piperVoice);
  }
  return url.href;
}

function trimAudioObjectUrls(blobMap, objectUrls, maximum = 72) {
  let attempts = objectUrls.length;
  while (objectUrls.length > maximum && attempts > 0) {
    attempts -= 1;
    const oldest = objectUrls.shift();
    if (!oldest) break;
    if (oldest.url === elements.narrationPlayer?.src) {
      objectUrls.push(oldest);
      continue;
    }
    if (blobMap.get(oldest.id) === oldest.url) blobMap.delete(oldest.id);
    URL.revokeObjectURL(oldest.url);
  }
}

function fetchCloudSegment(id, { signal } = {}) {
  if (cloudAudioBlobs.has(id)) return Promise.resolve(cloudAudioBlobs.get(id));
  if (cloudPreloadPromises.has(id)) return cloudPreloadPromises.get(id);

  const segment = narrationSegmentRecord(id);
  if (!segment) return Promise.reject(new Error(`Unknown narration segment: ${id}`));

  const promise = fetch(cloudSegmentUrl(segment), {
    cache: segment.static ? 'force-cache' : 'default',
    credentials: 'same-origin',
    signal
  })
    .then(response => {
      if (!response.ok) throw new Error(`Narration request failed with ${response.status}`);
      return response.blob();
    })
    .then(blob => {
      const url = URL.createObjectURL(blob);
      cloudAudioBlobs.set(id, url);
      cloudObjectUrls.push({ id, url });
      cloudPreloadPromises.delete(id);
      trimAudioObjectUrls(cloudAudioBlobs, cloudObjectUrls);
      return url;
    })
    .catch(error => {
      cloudPreloadPromises.delete(id);
      throw error;
    });

  cloudPreloadPromises.set(id, promise);
  return promise;
}

function drainCloudPrefetchQueue() {
  while (cloudPrefetchActive < CLOUD_PREFETCH_CONCURRENCY && cloudPrefetchQueue.length) {
    const task = cloudPrefetchQueue.shift();
    if (!task) break;
    if (task.controller.signal.aborted) {
      task.reject(new DOMException('Narration prefetch was aborted.', 'AbortError'));
      cloudPrefetchPromises.delete(task.id);
      continue;
    }

    cloudPrefetchActive += 1;
    fetchCloudSegment(task.id, { signal: task.controller.signal })
      .then(task.resolve, task.reject)
      .finally(() => {
        cloudPrefetchActive = Math.max(0, cloudPrefetchActive - 1);
        cloudPrefetchControllers.delete(task.id);
        cloudPrefetchPromises.delete(task.id);
        drainCloudPrefetchQueue();
      });
  }
}

function queueCloudSegment(id) {
  if (cloudAudioBlobs.has(id)) return Promise.resolve(cloudAudioBlobs.get(id));
  if (cloudPreloadPromises.has(id)) return cloudPreloadPromises.get(id);
  if (cloudPrefetchPromises.has(id)) return cloudPrefetchPromises.get(id);

  const controller = new AbortController();
  let resolveTask;
  let rejectTask;
  const promise = new Promise((resolve, reject) => {
    resolveTask = resolve;
    rejectTask = reject;
  });
  cloudPrefetchPromises.set(id, promise);
  cloudPrefetchControllers.set(id, controller);
  cloudPrefetchQueue.push({ id, controller, resolve: resolveTask, reject: rejectTask });
  drainCloudPrefetchQueue();
  return promise;
}

function abortCloudPrefetches() {
  cloudPrefetchControllers.forEach(controller => controller.abort());
  cloudPrefetchControllers.clear();
  cloudPrefetchPromises.clear();
  cloudPrefetchQueue.splice(0).forEach(task => {
    task.reject(new DOMException('Narration prefetch was aborted.', 'AbortError'));
  });
}

// --- AI narration audio blob storage ---
let aiAudioBlobs = new Map();
let aiObjectUrls = [];
let aiPreloadPromises = new Map();

function fetchAiSegment(id, { signal } = {}) {
  if (aiAudioBlobs.has(id)) return Promise.resolve(aiAudioBlobs.get(id));
  if (aiPreloadPromises.has(id)) return aiPreloadPromises.get(id);

  const segment = aiSegmentRecord(id);
  if (!segment) return Promise.reject(new Error(`Unknown AI narration segment: ${id}`));

  const promise = fetch(aiSegmentUrl(segment), {
    cache: segment.static ? 'force-cache' : 'default',
    credentials: 'same-origin',
    signal
  })
    .then(response => {
      if (!response.ok) throw new Error(`AI narration request failed with ${response.status}`);
      return response.blob();
    })
    .then(blob => {
      const url = URL.createObjectURL(blob);
      aiAudioBlobs.set(id, url);
      aiObjectUrls.push({ id, url });
      aiPreloadPromises.delete(id);
      trimAudioObjectUrls(aiAudioBlobs, aiObjectUrls);
      return url;
    })
    .catch(error => {
      aiPreloadPromises.delete(id);
      throw error;
    });

  aiPreloadPromises.set(id, promise);
  return promise;
}

function drainAiPrefetchQueue() {
  while (aiPrefetchActive < AI_PREFETCH_CONCURRENCY && aiPrefetchQueue.length) {
    const task = aiPrefetchQueue.shift();
    if (!task) break;
    if (task.controller.signal.aborted) {
      task.reject(new DOMException('AI narration prefetch was aborted.', 'AbortError'));
      aiPrefetchPromises.delete(task.id);
      continue;
    }

    aiPrefetchActive += 1;
    fetchAiSegment(task.id, { signal: task.controller.signal })
      .then(task.resolve, task.reject)
      .finally(() => {
        aiPrefetchActive = Math.max(0, aiPrefetchActive - 1);
        aiPrefetchControllers.delete(task.id);
        aiPrefetchPromises.delete(task.id);
        drainAiPrefetchQueue();
      });
  }
}

function queueAiPrefetch(id) {
  if (aiAudioBlobs.has(id)) return Promise.resolve(aiAudioBlobs.get(id));
  if (aiPreloadPromises.has(id)) return aiPreloadPromises.get(id);
  if (aiPrefetchPromises.has(id)) return aiPrefetchPromises.get(id);

  const controller = new AbortController();
  let resolveTask;
  let rejectTask;
  const promise = new Promise((resolve, reject) => {
    resolveTask = resolve;
    rejectTask = reject;
  });
  aiPrefetchPromises.set(id, promise);
  aiPrefetchControllers.set(id, controller);
  aiPrefetchQueue.push({ id, controller, resolve: resolveTask, reject: rejectTask });
  drainAiPrefetchQueue();
  return promise;
}

function abortAiPrefetches() {
  aiPrefetchControllers.forEach(controller => controller.abort());
  aiPrefetchControllers.clear();
  aiPrefetchPromises.clear();
  aiPrefetchQueue.splice(0).forEach(task => {
    task.reject(new DOMException('AI narration prefetch was aborted.', 'AbortError'));
  });
}

function prefetchNarrationAround(index, ahead = 2) {
  if (!cards.length) return;

  const windowCards = cards.slice(index, index + ahead + 1)
    .filter(card => card.element?.dataset.mode !== 'visual');
  const ids = new Set();
  windowCards.forEach(card => {
    narrationSegmentsForCard(card).forEach(segment => ids.add(segment.id));
    if (state.voice === 'ai') {
      aiNarrationSegmentsForCard(card).forEach(segment => ids.add(segment.id));
    }
  });

  const activeSegmentId = cloudSession?.segments?.[cloudSession.segmentIndex]?.id
    || aiSession?.segments?.[aiSession.segmentIndex]?.id;
  if (activeSegmentId) ids.delete(activeSegmentId);

  if (state.voice === 'google' && payload?.narration?.cloudEnabled) {
    [...ids].slice(0, MAX_CLOUD_PREFETCH_SEGMENTS).forEach(id => {
      const segment = narrationSegmentRecord(id);
      if (!segment?.static && !narrationIntent) return;
      queueCloudSegment(id).catch(() => {});
    });
    return;
  }


  if (state.voice === 'ai' && state.aiNarrationEnabled && payload?.aiTranscript?.cloudEnabled) {
    [...ids].slice(0, MAX_AI_PREFETCH_SEGMENTS).forEach(id => {
      const segment = aiSegmentRecord(id);
      if (!segment?.static && !narrationIntent) return;
      queueAiPrefetch(id).catch(() => {});
    });
  }
}

function stopCloudNarration() {
  cloudGeneration += 1;
  if (cloudSession?.gapTimer) {
    window.clearTimeout(cloudSession.gapTimer);
    cloudSession.gapTimer = 0;
  }
  cloudSession = null;
  const player = elements.narrationPlayer;
  player.pause();
  delete player.dataset.narrationSessionId;
  delete player.dataset.narrationSegmentId;
  player.removeAttribute('src');
  player.load();
}

function scheduleNarrationGap(session, delay) {
  if (!session || session.finished) return;
  if (session.gapTimer) window.clearTimeout(session.gapTimer);
  session.waiting = true;
  session.gapRemaining = Math.max(0, delay);
  session.gapStartedAt = performance.now();
  session.gapTimer = window.setTimeout(() => {
    session.gapTimer = 0;
    session.waiting = false;
    session.gapRemaining = 0;
    const activeGeneration = session.mode === 'cloud' ? cloudGeneration : aiGeneration;
    if (session.generation !== activeGeneration) return;
    if (session.paused || session.finished) return;
    if (session.mode === 'cloud') playCloudSegment(session);
    else playAiSegment(session);
  }, session.gapRemaining);
}

function pauseNarrationGap(session) {
  if (!session?.waiting) return;
  if (session.gapTimer) window.clearTimeout(session.gapTimer);
  session.gapTimer = 0;
  const elapsed = performance.now() - session.gapStartedAt;
  session.gapRemaining = Math.max(0, session.gapRemaining - elapsed);
  session.paused = true;
}

function resumeNarrationGap(session) {
  if (!session?.waiting) return;
  session.paused = false;
  scheduleNarrationGap(session, session.gapRemaining);
}

function finishNarrationSession(session) {
  if (!session) return;
  session.finished = true;
  session.waiting = false;
  if (session.mode === 'cloud' && cloudSession === session) cloudSession = null;
  if (session.mode === 'ai' && aiSession === session) aiSession = null;
  if (elements.narrationPlayer?.dataset?.narrationSessionId === session.id) {
    delete elements.narrationPlayer.dataset.narrationSessionId;
    delete elements.narrationPlayer.dataset.narrationSegmentId;
  }
  elements.audioStatus.textContent = 'Narration finished. The transcript stays visible.';
  updatePlayControls();
  if (session.mode === 'ai') stopSubtitleTracking(); // keep last sentence visible until card change
}

function isCurrentNarrationSession(session) {
  if (!session || session.finished || session.fallbackAttempted || session.paused) return false;
  if (session.mode === 'cloud') {
    return cloudSession === session && session.generation === cloudGeneration;
  }
  return false;
}

function fallbackToBrowserSpeech(session, reason = 'Cloud narration is unavailable. Using the browser voice.') {
  if (!isCurrentNarrationSession(session)) return;
  session.fallbackAttempted = true;
  const remaining = session.segments.slice(session.segmentIndex).map(segment => segment.text).filter(Boolean);
  const card = session.card;
  if (session.mode === 'cloud') stopCloudNarration();
  else if (session.mode === 'ai') stopAiNarration();
  stopSpeech();

  if (!remaining.length || !speechSupported()) {
    elements.audioStatus.textContent = 'Narration is unavailable. The transcript is still available.';
    updatePlayControls();
    return;
  }

  const voice = chooseNarrator(card);
  elements.audioStatus.textContent = reason;

  // Re-establish progressive subtitle for AI fallback (stopAiNarration cleared it via clearSubtitle).
  if (session.mode === 'ai' && state.aiNarrationEnabled && state.voice === 'ai') {
    renderAiTranscript(card); // populates subtitleUnits, shows sentence 0, unhides panel
    startSubtitleFallbackTimer();
  }

  speakSegments(remaining, voice, speechGeneration, session.rate);
}

async function playCloudSegment(session) {
  if (!session || session.finished || session.generation !== cloudGeneration) return;
  if (session.segmentIndex >= session.segments.length) {
    finishNarrationSession(session);
    return;
  }

  const segment = session.segments[session.segmentIndex];
  const record = narrationSegmentRecord(segment.id);
  if (!record) {
    fallbackToBrowserSpeech(session);
    return;
  }

  let source = cloudAudioBlobs.get(segment.id);
  const pendingPrefetch = source
    ? null
    : (cloudPreloadPromises.get(segment.id) || cloudPrefetchPromises.get(segment.id));
  if (pendingPrefetch) {
    session.loading = true;
    elements.audioStatus.textContent = 'Loading Google narration…';
    updatePlayControls();
    try {
      source = await pendingPrefetch;
    } catch {
      source = null;
    } finally {
      session.loading = false;
    }
  }
  if (!session || session.finished || session.generation !== cloudGeneration) return;
  if (session.paused) {
    updatePlayControls();
    return;
  }

  const player = createNarrationPlayer(session, segment.id);
  player.src = source || cloudSegmentUrl(record);
  player.defaultPlaybackRate = session.rate;
  player.playbackRate = session.rate;
  player.preload = 'auto';
  // Show appropriate narrator name
  const voiceLabel = (() => {
    if (state.voice === 'google') return 'Google Chirp 3 HD';
    if (state.voice === 'piper-amy') return 'Piper TTS (Amy)';
    if (state.voice === 'piper-ljspeech') return 'Piper TTS (LJSpeech)';
    if (state.voice === 'piper-ryan') return 'Piper TTS (Ryan)';
    return 'Narrator';
  })();
  elements.audioStatus.textContent = `Reading with ${voiceLabel}.`;
  session.started = true;
  session.paused = false;

  const playPromise = player.play();
  if (playPromise?.catch) {
    playPromise.catch(() => fallbackToBrowserSpeech(session));
  }
  updatePlayControls();
}

function aiSegmentUrl(segment) {
  const version = segment.version || '';
  if (segment.static && version) {
    const fileName = `${segment.id}-${version}.mp3`;
    return new URL(`audio/${fileName}`, reelsBaseUrl()).href;
  }
  const url = new URL('/api/narration', window.location.origin);
  url.searchParams.set('segment', segment.id);
  url.searchParams.set('v', version);
  return url.href;
}

function playAiSegment(session) {
  if (!session || session.finished || session.generation !== aiGeneration) return;
  if (session.segmentIndex >= session.segments.length) {
    finishNarrationSession(session);
    return;
  }

  const segment = session.segments[session.segmentIndex];
  session.loading = true;
  updatePlayControls();
  try {
    const source = aiSegmentUrl(segment);
    const player = createNarrationPlayer(session, segment.id);
    player.src = source;
    player.defaultPlaybackRate = session.rate;
    player.playbackRate = session.rate;
    elements.audioStatus.textContent = 'AI narration is playing.';
    if (session.paused) return;
    session.started = true;
    session.paused = false;

    // Set up progressive subtitle tracking
    stopSubtitleTracking();
    renderAiTranscript(session.card);
    subtitleAudioPlayer = player;
    player.addEventListener('timeupdate', handleSubtitleTimeUpdate, { passive: true });

    const playPromise = player.play();
    if (playPromise?.catch) {
      playPromise.catch(() => {
        // Stop progress tracking; fallbackToBrowserSpeech re-establishes subtitles
        fallbackToBrowserSpeech(session, 'AI narration could not play. Using deterministic narration.');
      });
    }
  } catch (error) {
    // Stop progress tracking; fallbackToBrowserSpeech re-establishes subtitles
    fallbackToBrowserSpeech(session, `AI narration could not narrate this card. Using deterministic narration. ${error.message}`);
  }
  updatePlayControls();
}

function playAiNarration(card) {
  const segments = aiNarrationSegmentsForCard(card);
  if (!segments.length) {
    speakCurrentCard();
    return;
  }

  stopSpeech();
  stopCloudNarration();
  const session = {
    id: `ai-${aiGeneration + 1}`,
    mode: 'ai',
    generation: ++aiGeneration,
    card,
    segments,
    segmentIndex: 0,
    rate: clamp(Number(state.speechRate) || 1, 0.75, 1.25),
    started: false,
    waiting: false,
    paused: false,
    loading: false,
    gapRemaining: 0,
    gapStartedAt: 0,
    gapTimer: 0,
    finished: false,
    fallbackAttempted: false
  };
  aiSession = session;
  setNarratorStatus('AI narration is ready.', { announce: true });
  elements.audioStatus.textContent = 'Preparing AI narration…';
  playAiSegment(session);
}

function playCloudNarration(card) {
  if (!payload?.narration?.cloudEnabled) {
    speakCurrentCard();
    return;
  }

  const segments = narrationSegmentsForCard(card);
  if (!segments.length) {
    speakCurrentCard();
    return;
  }

  stopSpeech();
  stopAiNarration();
  stopCloudNarration();
  const session = {
    id: `cloud-${cloudGeneration + 1}`,
    mode: 'cloud',
    generation: ++cloudGeneration,
    card,
    segments,
    segmentIndex: 0,
    rate: clamp(Number(state.speechRate) || 1, 0.75, 1.25),
    started: false,
    waiting: false,
    paused: false,
    loading: false,
    gapRemaining: 0,
    gapStartedAt: 0,
    gapTimer: 0,
    finished: false,
    fallbackAttempted: false
  };
  cloudSession = session;
  playCloudSegment(session);
}

function stopAiNarration() {
  aiGeneration += 1;
  if (aiSession?.gapTimer) {
    window.clearTimeout(aiSession.gapTimer);
    aiSession.gapTimer = 0;
  }
  aiSession = null;
  const player = elements.narrationPlayer;
  player.pause();
  delete player.dataset.narrationSessionId;
  delete player.dataset.narrationSegmentId;
  player.removeAttribute('src');
  player.load();
  clearSubtitle();
}

function activeNarrationSession(sessionId = '', segmentId = '') {
  const player = elements.narrationPlayer;
  const activeId = sessionId || player?.dataset?.narrationSessionId || '';
  if (!activeId) return null;
  if (segmentId && player?.dataset?.narrationSegmentId !== segmentId) return null;

  if (cloudSession?.id === activeId) return cloudSession;
  if (aiSession?.id === activeId) return aiSession;
  return null;
}

function createNarrationPlayer(session, segmentId) {
  const previous = elements.narrationPlayer;
  delete previous.dataset.narrationSessionId;
  delete previous.dataset.narrationSegmentId;
  previous.pause();
  previous.removeAttribute('src');
  previous.load();

  const player = previous.cloneNode(false);
  player.id = 'narrationPlayer';
  player.preload = 'auto';
  player.dataset.narrationSessionId = session.id;
  player.dataset.narrationSegmentId = segmentId;
  player.addEventListener('ended', () => {
    if (elements.narrationPlayer !== player) return;
    handleNarrationEnded(session.id, segmentId);
  });
  player.addEventListener('error', () => {
    if (elements.narrationPlayer !== player) return;
    handleNarrationError(session.id, segmentId);
  });

  previous.replaceWith(player);
  elements.narrationPlayer = player;
  return player;
}

function handleNarrationEnded(sessionId, segmentId) {
  const session = activeNarrationSession(sessionId, segmentId);
  if (!session || session.finished || session.paused) return;
  const completedIndex = session.segmentIndex;
  session.segmentIndex += 1;
  if (completedIndex === 0) {
    scheduleNarrationGap(session, 450);
  } else if (session.mode === 'cloud') {
    playCloudSegment(session);
  } else if (session.mode === 'ai') {
    playAiSegment(session);
  }
}

function handleNarrationError(sessionId, segmentId) {
  const session = activeNarrationSession(sessionId, segmentId);
  if (!session || session.finished) return;
  const reason = session.mode === 'ai'
    ? 'AI narration could not play. Using the browser voice.'
    : 'Google narration could not play. Using the browser voice.';
  if (session.mode === 'ai') {
    stopSubtitleTracking();
  }
  fallbackToBrowserSpeech(session, reason);
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

function speakSegments(segments, voice, generation, rate = state.speechRate, onBoundary) {
  if (!speechSupported() || !segments.length) return;

  const synthesis = window.speechSynthesis;
  const session = {
    generation,
    segments,
    voice,
    segmentIndex: 0,
    rate: clamp(Number(rate) || 1, 0.75, 1.25),
    started: false,
    waiting: false,
    paused: false,
    loading: false,
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
    utterance.onboundary = ev => {
      if (!onBoundary || generation !== speechGeneration || session.finished) return;
      onBoundary({ charIndex: ev.charIndex || 0, segmentIndex: session.segmentIndex, totalSegments: session.segments.length });
    };
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

  stopSpeech();
  const voice = chooseNarrator(card);
  const segments = browserNarrationSegments(card);

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
    stopCloudNarration();
    stopAiNarration();
    playMusicForCard(card);
  } else {
    stopMusic();
    narrationIntent = true;
    if (state.voice === 'google') {
      playCloudNarration(card);
    } else if (state.voice === 'ai') {
      stopCloudNarration();
      if (state.aiNarrationEnabled) playAiNarration(card);
      else speakCurrentCard();
    } else if (state.voice?.startsWith('piper-')) {
      // Piper TTS uses the cloud narration endpoint with voice override
      playCloudNarration(card);
    } else {
      stopCloudNarration();
      stopAiNarration();
      speakCurrentCard();
    }
    prefetchNarrationAround(currentIndex, 2);
  }
}

function stopCurrentAudio() {
  stopSpeech();
  stopCloudNarration();
  stopAiNarration();
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
  const narrationSession = cloudSession || aiSession;
  const providerActive = Boolean(narrationSession && !narrationSession.finished);
  const active = visual
    ? !elements.musicPlayer.paused
    : synthesisActive || sessionActive || providerActive;
  const paused = visual
    ? false
    : Boolean(
      speechSession?.paused
      || (cloudSession && !cloudSession.finished && cloudSession.paused)
      || (aiSession && !aiSession.finished && aiSession.paused)
    );

  // Derive loading state
  const loading = visual
    ? false
    : (cloudSession?.loading === true)
      || (aiSession?.loading === true);

  const actionWord = visual ? 'music' : 'narration';
  const ariaLabel = loading
    ? `Loading ${actionWord}`
    : active ? (paused ? `Resume ${actionWord}` : `Pause ${actionWord}`) : `Play ${actionWord}`;
  button.setAttribute('aria-label', ariaLabel);
  button.setAttribute('aria-busy', String(loading));
  button.dataset.loading = String(loading);
  button.setAttribute('data-tooltip', loading ? 'Loading' : 'Listen');
  label.textContent = loading ? 'Loading' : (active ? 'Pause' : 'Play');
  icon.innerHTML = active
    ? '<path d="M9 7h3v10H9zM13 7h3v10h-3z" fill="currentColor"/>'
    : '<path d="m9 7 8 5-8 5Z" fill="currentColor"/>';
}

const CAPTION_MAX_CHARS = 180;

function isCaptionProseLine(line) {
  const trimmed = String(line || '').trim();
  if (!trimmed || trimmed.includes('|')) return false;
  // Transcript scaffolding such as TITLE:, TABLE:, ANSWER: is spoken by the
  // narrator but duplicates the card or reads as metadata. Keep it in the
  // audio timeline, but never paint it in the caption dock.
  if (/^[A-Z][A-Z \t]{2,}:(\s|$)/.test(trimmed)) return false;
  return true;
}

function splitCaptionSentences(lineText) {
  const str = String(lineText || '');
  if (!str.trim()) return [];
  const regex = /(?<=[.!?])\s+(?=[A-Z0-9"‘“(])/g;
  const parts = [];
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(str)) !== null) {
    const sentence = str.slice(lastIndex, match.index).trim();
    if (sentence) parts.push(sentence);
    lastIndex = match.index + match[0].length;
  }
  const tail = str.slice(lastIndex).trim();
  if (tail) parts.push(tail);
  return parts;
}

function splitLongCaption(text) {
  if (text.length <= CAPTION_MAX_CHARS) return [text];

  // Long enumerations are semantically lists even though they end in one full
  // stop. Break them at their numbered clauses so one caption stays readable.
  const clauses = text.split(/;\s+(?=\(?\d+\)?\s|[A-Z])/);
  if (clauses.length > 1) {
    return clauses.map((clause, index) => `${clause.trim()}${index < clauses.length - 1 ? ';' : ''}`);
  }
  const leadIn = text.split(/:\s+(?=\()/);
  if (leadIn.length > 1) {
    return leadIn.map((part, index) => `${part.trim()}${index < leadIn.length - 1 ? ':' : ''}`);
  }
  return [text];
}

function splitTranscriptIntoUnits(text) {
  if (!text) return [];
  const units = [];
  String(text).split(/\r?\n+/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const display = isCaptionProseLine(trimmed);
    splitCaptionSentences(trimmed).forEach(sentence => {
      splitLongCaption(sentence).forEach(piece => {
        if (piece) units.push({ text: piece, display });
      });
    });
  });
  return units;
}

function firstDisplayableCaptionIndex() {
  return subtitleUnits.findIndex(unit => unit.display);
}

function setCaptionDockVisible(visible) {
  if (!elements.transcriptPanel) return;
  elements.transcriptPanel.hidden = !visible;
  const stage = elements.transcriptPanel.closest('.reels-stage');
  if (stage) stage.dataset.captions = visible ? 'on' : 'off';
}

function renderAiTranscript(card) {
  if (!elements.transcriptPanel || !elements.transcriptContent || !elements.transcriptEmpty) return;

  if (!state.aiNarrationEnabled || state.voice !== 'ai') {
    setCaptionDockVisible(false);
    elements.transcriptContent.innerHTML = '';
    elements.transcriptEmpty.hidden = true;
    subtitleUnits = [];
    subtitleCurrentIndex = -1;
    return;
  }

  const entryAiNarration = card?.entry?.aiTranscript;
  if (!entryAiNarration) {
    setCaptionDockVisible(false);
    elements.transcriptContent.innerHTML = '';
    elements.transcriptEmpty.hidden = true;
    subtitleUnits = [];
    subtitleCurrentIndex = -1;
    return;
  }

  const segments = aiNarrationSegmentsForCard(card);
  if (!segments.length) {
    setCaptionDockVisible(false);
    elements.transcriptContent.innerHTML = '';
    elements.transcriptEmpty.hidden = true;
    subtitleUnits = [];
    subtitleCurrentIndex = -1;
    return;
  }

  // Split the transcript at line and sentence boundaries. Structural rows stay
  // in the timeline for audio sync, but never appear in the caption dock.
  const fullText = segments.map(segment => segment.text).join('\n');
  subtitleUnits = splitTranscriptIntoUnits(fullText);
  let firstVisible = firstDisplayableCaptionIndex();

  // A few visual cards have a transcript made only of scaffolding (e.g. just
  // "TITLE: Learn in Motion"). Show the card title as their single prose caption
  // rather than hiding the dock entirely.
  if (firstVisible < 0) {
    const fallback = String(card?.entry?.speechTitle || card?.entry?.title || '')
      .replace(/\s+/g, ' ')
      .trim();
    if (fallback) {
      subtitleUnits = [{ text: fallback, display: true }];
      firstVisible = 0;
    }
  }

  if (firstVisible < 0) {
    setCaptionDockVisible(false);
    elements.transcriptContent.innerHTML = '';
    elements.transcriptEmpty.hidden = true;
    subtitleCurrentIndex = -1;
    return;
  }

  subtitleCurrentIndex = firstVisible;
  showSubtitleSentence(firstVisible);

  elements.transcriptEmpty.hidden = true;
  setCaptionDockVisible(true);
}

function showSubtitleSentence(index) {
  if (!subtitleUnits.length || index < 0 || index >= subtitleUnits.length) return;
  subtitleCurrentIndex = index;

  const sentence = subtitleUnits[index];
  if (!sentence.display) return;

  const html = `<div class="transcript-segment subtitle-current" data-seg-idx="${index}">${escapeHtml(sentence.text)}</div>`;

  elements.transcriptContent.innerHTML = html;
  setCaptionDockVisible(true);
}

function stopSubtitleTracking() {
  if (subtitleTimer) {
    window.cancelAnimationFrame(subtitleTimer);
    subtitleTimer = null;
  }
  if (subtitleFallbackTimer) {
    window.clearTimeout(subtitleFallbackTimer);
    subtitleFallbackTimer = null;
  }
  if (subtitleAudioPlayer) {
    subtitleAudioPlayer.removeEventListener('timeupdate', handleSubtitleTimeUpdate);
    subtitleAudioPlayer = null;
  }
}

function showAllSubtitleSentences() {
  if (!subtitleUnits.length) return;
  // Audio is unavailable (e.g. production quota), so advance sentences on estimated timing
  // instead of leaving everything visible at once. Begin with the first spoken prose line.
  subtitleCurrentIndex = Math.max(firstDisplayableCaptionIndex(), 0);
  showSubtitleSentence(subtitleCurrentIndex);
  startSubtitleFallbackTimer();
}

function estimatedSentenceMs(sentence) {
  const words = sentence.text.trim().split(/\s+/).filter(Boolean).length;
  const rate = clamp(Number(state.speechRate) || 1, 0.75, 1.25);
  // ~2.5 words per second at rate 1.0, adjusted for playback rate; minimum 1.6s per sentence
  const ms = Math.max(1600, Math.round((words / 2.5 / rate) * 1000));
  return Math.min(ms, 12000);
}

function startSubtitleFallbackTimer() {
  stopSubtitleTracking(); // clear any audio tracking first
  advanceSubtitleFallback();
}

function advanceSubtitleFallback() {
  if (!subtitleUnits.length || subtitleCurrentIndex >= subtitleUnits.length - 1) return;
  const ms = estimatedSentenceMs(subtitleUnits[subtitleCurrentIndex]);
  subtitleFallbackTimer = window.setTimeout(() => {
    if (subtitleCurrentIndex >= subtitleUnits.length - 1) return;
    subtitleCurrentIndex += 1;
    showSubtitleSentence(subtitleCurrentIndex);
    advanceSubtitleFallback();
  }, ms);
}

function clearSubtitle() {
  subtitleUnits = [];
  subtitleCurrentIndex = -1;
  if (subtitleTimer) {
    window.cancelAnimationFrame(subtitleTimer);
    subtitleTimer = null;
  }
  if (subtitleFallbackTimer) {
    window.clearTimeout(subtitleFallbackTimer);
    subtitleFallbackTimer = null;
  }
  if (subtitleAudioPlayer) {
    subtitleAudioPlayer.removeEventListener('timeupdate', handleSubtitleTimeUpdate);
    subtitleAudioPlayer = null;
  }
  if (elements.transcriptContent) elements.transcriptContent.innerHTML = '';
  if (elements.transcriptEmpty) elements.transcriptEmpty.hidden = true;
  setCaptionDockVisible(false);
}

function handleSubtitleTimeUpdate() {
  const player = subtitleAudioPlayer;
  if (!player || !subtitleUnits.length || player.paused || player.ended) return;

  const duration = player.duration || 0;
  const currentTime = player.currentTime || 0;
  if (!duration) return;

  // Distribute audio duration across sentences proportional to character length
  const totalChars = subtitleUnits.reduce((sum, s) => sum + s.text.length, 0);
  if (totalChars <= 0) return;
  const elapsedChars = totalChars * (currentTime / duration);
  let cumChars = 0;
  let targetIndex = subtitleUnits.length - 1;
  for (let i = 0; i < subtitleUnits.length; i++) {
    cumChars += subtitleUnits[i].text.length;
    if (elapsedChars <= cumChars) {
      targetIndex = i;
      break;
    }
  }
  const clampedIndex = Math.min(Math.max(targetIndex, 0), subtitleUnits.length - 1);

  if (clampedIndex !== subtitleCurrentIndex) {
    showSubtitleSentence(clampedIndex);
  }
}

function syncMuteButtons() {
  document.querySelectorAll('[data-action="mute"], #muteButton').forEach(button => {
    button.setAttribute('aria-pressed', String(state.muted));
    button.setAttribute('aria-label', state.muted ? 'Unmute audio' : 'Mute audio');
    button.title = state.muted ? 'Unmute audio (M)' : 'Mute audio (M)';
    const label = button.querySelector('[data-mute-label], #muteButtonLabel');
    if (label) label.textContent = state.muted ? 'Unmute' : 'Mute';
    button.classList.toggle('is-muted', state.muted);
  });
}

function showPlaybackFeedback(icon, label = '') {
  const card = cards[currentIndex];
  if (!card) return;
  const overlay = card.element?.querySelector('[data-playback-feedback]');
  const iconNode = overlay?.querySelector('[data-feedback-icon]');
  const labelNode = overlay?.querySelector('[data-feedback-label]');
  if (!overlay || !iconNode) return;
  iconNode.innerHTML = icon;
  labelNode.textContent = label;
  overlay.classList.remove('is-visible');
  void overlay.offsetWidth;
  overlay.classList.add('is-visible');
  window.clearTimeout(overlay._timer);
  overlay._timer = window.setTimeout(() => overlay.classList.remove('is-visible'), 1000);
}

function togglePlayback() {
  markGesture();
  const card = cards[currentIndex];
  if (!card) return;

  if (card.element.dataset.mode === 'visual') {
    const wasPaused = elements.musicPlayer.paused;
    if (wasPaused) playMusicForCard(card);
    else stopMusic();
    showPlaybackFeedback(wasPaused
      ? '<path d="m9 7 8 5-8 5Z" fill="currentColor"/>'
      : '<path d="M9 7h3v10H9zM13 7h3v10h-3z" fill="currentColor"/>',
      wasPaused ? 'Resumed' : 'Paused');
  } else {
    const synthesis = window.speechSynthesis;
    const speechActive = speechSupported() && (synthesis.speaking || synthesis.pending);
    const session = speechSession;
    const speechGap = Boolean(session?.waiting && !session.paused);
    const cloud = cloudSession;
    const providerActive = Boolean(cloud && !cloud.finished);

    if (speechActive && !speechPaused) {
      synthesis.pause();
      if (session) session.paused = true;
      speechPaused = true;
      elements.audioStatus.textContent = 'Narration paused.';
      showPlaybackFeedback('<path d="M9 7h3v10H9zM13 7h3v10h-3z" fill="currentColor"/>', 'Paused');
    } else if (speechGap) {
      session.pauseGap();
      speechPaused = true;
      elements.audioStatus.textContent = 'Narration paused.';
      showPlaybackFeedback('<path d="M9 7h3v10H9zM13 7h3v10h-3z" fill="currentColor"/>', 'Paused');
    } else if (cloud && !cloud.finished && cloud.paused) {
      resumeNarrationGap(cloud);
      elements.audioStatus.textContent = 'Narration resumed.';
      showPlaybackFeedback('<path d="m9 7 8 5-8 5Z" fill="currentColor"/>', 'Resumed');
    } else if (providerActive) {
      if (cloud && !cloud.finished) pauseNarrationGap(cloud);
      elements.audioStatus.textContent = 'Narration paused.';
      showPlaybackFeedback('<path d="M9 7h3v10H9zM13 7h3v10h-3z" fill="currentColor"/>', 'Paused');
    } else if (session?.waiting && session.paused) {
      speechPaused = false;
      session.resumeGap();
      elements.audioStatus.textContent = 'Narration resumed.';
      showPlaybackFeedback('<path d="m9 7 8 5-8 5Z" fill="currentColor"/>', 'Resumed');
    } else if (speechActive && speechPaused) {
      synthesis.resume();
      speechPaused = false;
      if (session) session.paused = false;
      elements.audioStatus.textContent = 'Narration resumed.';
      showPlaybackFeedback('<path d="m9 7 8 5-8 5Z" fill="currentColor"/>', 'Resumed');
    } else {
      narrationIntent = true;
      playCurrentAudio();
      showPlaybackFeedback('<path d="m9 7 8 5-8 5Z" fill="currentColor"/>', 'Playing');
    }
  }
  updatePlayControls();
}

function toggleMute() {
  markGesture();
  state.muted = !state.muted;
  if (state.muted) stopCurrentAudio();
  saveState();
  syncMuteButtons();
  elements.audioStatus.textContent = state.muted ? 'Audio is muted.' : 'Audio is on.';
  if (!state.muted && hasUserGesture) playCurrentAudio();
  showPlaybackFeedback(state.muted
    ? '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" fill="currentColor"/>'
    : '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" fill="currentColor"/>',
    state.muted ? 'Muted' : 'Unmuted');
}

function applyAudioSettings() {
  state.speechRate = clamp(Number(elements.speechRate.value) || 1, 0.75, 1.25);
  state.musicVolume = clamp(Number(elements.musicVolume.value) || 0, 0, 1);
  elements.speechRateValue.textContent = `${state.speechRate.toFixed(2).replace(/0$/, '')}×`;
  elements.musicVolumeValue.textContent = `${Math.round(state.musicVolume * 100)}%`;
  elements.musicPlayer.volume = state.musicVolume;
  saveState();
  updateHubSummaries();
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

  const card = body.closest('.reel-card');
  const isVisual = card?.dataset.mode === 'visual';

  // If the click is directly on the body element (not a child), allow it
  if (target === body) return true;

  // For visual cards, be more permissive - only exclude actual interactive elements
  if (isVisual) {
    const interactiveTarget = target.closest(
      'a, button, input, select, textarea, summary, [role="button"]'
    );
    if (interactiveTarget) return false;
  } else {
    const contentTarget = target.closest(
      'a, button, input, select, textarea, summary, [role="button"], p, h1, h2, h3, h4, h5, h6, li, pre, table, blockquote, code'
    );
    if (contentTarget) return false;

    const visualTarget = target.closest('svg, img');
    if (visualTarget) return false;
  }

  if (window.getSelection?.()?.toString()) return false;

  const rect = body.getBoundingClientRect();
  // Allow clicks with clientX/clientY of 0 (programmatic clicks)
  if (event.clientX !== 0 || event.clientY !== 0) {
    if (event.clientX > rect.right - 14) return false;
  }

  if (cardPointerStart) {
    const distance = Math.hypot(event.clientX - cardPointerStart.x, event.clientY - cardPointerStart.y);
    if (distance > 8 || body.scrollTop !== cardPointerStart.scrollTop) return false;
  }

  return true;
}

function bindControls() {
  bindVoiceChangeEvents();

  elements.hubToggle.addEventListener('click', () => {
    markGesture();
    toggleHubMenu();
  });

  elements.hubClose.addEventListener('click', () => closeHubMenu());

  elements.hubMenu.addEventListener('click', event => {
    const item = event.target.closest('.hub-menu__item[data-hub-target]');
    if (!item) return;
    markGesture();
    const target = item.dataset.hubTarget;
    if (target === 'feed') toggleSubmodal(elements.feedModal, item);
    else if (target === 'progress') toggleSubmodal(elements.progressModal, item);
    else if (target === 'audio') toggleSubmodal(elements.audioModal, item);
    else if (target === 'reset') {
      elements.feedModal.close();
      state.order = 'ordered';
      state.unit = 'all';
      state.savedOnly = false;
      saveState();
      buildFeed({ restore: restorePosition(), speak: hasUserGesture, markSeen: false, persistPosition: true });
      updateHubSummaries();
    }
  });

  elements.hubMenu.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeHubMenu();
    }
  });

  elements.hubMenu.addEventListener('close', () => {
    if (elements.hubMenu.open) return;
    elements.hubToggle.setAttribute('aria-expanded', 'false');
    syncHubMenuAccessibility(false);
    if (hubReturnFocus?.isConnected) hubReturnFocus.focus({ preventScroll: true });
    hubReturnFocus = null;
  });

  elements.feedClose.addEventListener('click', () => closeSubmodal());
  elements.progressClose.addEventListener('click', () => closeSubmodal());
  elements.audioClose.addEventListener('click', () => closeSubmodal());

  [elements.feedModal, elements.progressModal, elements.audioModal].forEach(modal => {
    modal.addEventListener('close', () => {
      if (modal.open) return;
      if (modal === activeModal) {
        activeModal = null;
        const toFocus = submodalReturnFocus?.isConnected ? submodalReturnFocus : elements.hubToggle;
        toFocus.focus({ preventScroll: true });
        submodalReturnFocus = null;
      }
    });
  });

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

  elements.feedApply.addEventListener('click', () => {
    markGesture();
    closeSubmodal();
  });

  [elements.hubSubjects, elements.subjectFilters].filter(Boolean).forEach(container => {
    container.addEventListener('click', async event => {
      const button = event.target.closest('[data-subject]');
      if (!button) return;
      markGesture();
      await selectSubject(button.dataset.subject);
    });
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
      if (action === 'mute') toggleMute();
      if (action === 'done') toggleState('done', card.entry.id);
      if (action === 'save') toggleState('saved', card.entry.id);
      // Carousel dot navigation
      if (action === 'carousel-slide') {
        const slideIndex = Number(button.dataset.slide);
        if (!isNaN(slideIndex)) carouselGoToSlide(card, slideIndex);
        cardPointerStart = null;
        return;
      }
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
    const requestedNarrator = elements.voiceSelect.value;

    abortCloudPrefetches();
    abortAiPrefetches();
    state.voice = requestedNarrator;
    state.aiNarrationEnabled = requestedNarrator === 'ai';
    state.narratorVersion = 2;
    cards.forEach(card => { card.narratorVoice = null; });
    stopCurrentAudio();
    saveState();
    refreshNarratorStatus();
    prefetchNarrationAround(currentIndex, 2);
    updateHubSummaries();
    const currentCard = cards[currentIndex];
    if (currentCard) renderAiTranscript(currentCard);
  });

  elements.narrationToggle?.addEventListener('click', () => {
    markGesture();
    state.aiNarrationEnabled = !state.aiNarrationEnabled;
    saveState();
    updateHubSummaries();
    const currentCard = cards[currentIndex];
    if (currentCard) renderAiTranscript(currentCard);
    stopCurrentAudio();
    if (state.aiNarrationEnabled && state.voice === 'ai' && currentCard) {
      playAiNarration(currentCard);
    }
    elements.narrationToggle.setAttribute('aria-pressed', String(state.aiNarrationEnabled));
    elements.narrationToggle.querySelector('.hub-menu__summary').textContent = state.aiNarrationEnabled
      ? 'On · subtitle overlay'
      : 'Off · deterministic';
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

  elements.resetProgress.addEventListener('click', () => {
    markGesture();
    closeSubmodal();
    elements.resetConfirm.showModal();
  });

  elements.resetConfirmCancel.addEventListener('click', () => elements.resetConfirm.close());
  elements.resetConfirmAccept.addEventListener('click', () => {
    markGesture();
    state.seen = [];
    state.done = [];
    state.saved = [];
    state.lastPosition = null;
    state.positions = {};
    saveState();
    buildFeed({ restore: null, speak: false, markSeen: false, persistPosition: true });
    elements.resetConfirm.close();
  });

  document.addEventListener('keydown', event => {
    const target = event.target;
    const isTextEntry = target instanceof HTMLElement && (
      target.isContentEditable
      || target.closest('input, select, textarea, [contenteditable]:not([contenteditable="false"])')
    );
    const isInteractive = target instanceof HTMLElement && target.closest('button, a, summary, [role="button"]');
    const hubOpen = elements.hubMenu.open;
    const modalOpen = activeModal?.open ?? false;

    if (event.ctrlKey || event.metaKey || event.altKey) return;

    if (event.key === 'Tab' && (hubOpen || modalOpen)) {
      const container = modalOpen ? activeModal : elements.hubMenu;
      const focusable = [...container.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), summary, [tabindex]:not([tabindex="-1"])'
      )].filter(element => element.getClientRects().length > 0);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (first && last) {
        if (!container.contains(document.activeElement)) {
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

    if (event.key === 'Escape') {
      if (modalOpen) {
        event.preventDefault();
        closeSubmodal();
        return;
      }
      if (hubOpen) {
        event.preventDefault();
        closeHubMenu();
        return;
      }
    }

    if (hubOpen || modalOpen || isTextEntry || isInteractive) return;

    const key = event.key.toLowerCase();
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      // Left/Right replace the removed slide arrows; Up/Down still move cards.
      const activeCard = cards[currentIndex];
      if (!activeCard?.isMultiSlide) return;
      event.preventDefault();
      carouselGoToSlide(activeCard, activeCard.currentSlide + (event.key === 'ArrowRight' ? 1 : -1));
      return;
    }

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      const scrollBody = target instanceof HTMLElement ? target.closest('.reel-card__body') : null;
      if (scrollBody && scrollBody.scrollHeight > scrollBody.clientHeight + 2) {
        const canScroll = event.key === 'ArrowDown'
          ? scrollBody.scrollTop + scrollBody.clientHeight < scrollBody.scrollHeight - 2
          : scrollBody.scrollTop > 2;
        if (!canScroll) {
          event.preventDefault();
          goTo(currentIndex + (event.key === 'ArrowDown' ? 1 : -1), { speak: hasUserGesture });
        }
      } else {
        event.preventDefault();
        goTo(currentIndex + (event.key === 'ArrowDown' ? 1 : -1), { speak: hasUserGesture });
      }
      return;
    }

    if (key === ' ') {
      event.preventDefault();
      togglePlayback();
      return;
    }
    if (key === 's') {
      event.preventDefault();
      toggleState('saved', cards[currentIndex].entry.id);
      return;
    }
    if (key === 'd') {
      event.preventDefault();
      toggleState('done', cards[currentIndex].entry.id);
      return;
    }
    if (key === 'm') {
      event.preventDefault();
      toggleMute();
      return;
    }
  });

  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => {
      const viewport = elements.cardViewport;
      cards.forEach(card => {
        if (card.element) card.element.style.width = `${viewport.clientWidth}px`;
      });
      elements.cardTrack.style.transform = `translate3d(0, ${-currentIndex * 100}%, 0)`;
      updateScrollCues();
    }, 80);
  });
}

async function init() {
  // The hub is a modal dialog. Keep it inert and hidden from assistive tech
  // from first paint, including while the subject index and payload load.
  syncHubMenuAccessibility(false);
  try {
    const response = await fetch('content.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`Failed to load content.json: ${response.status}`);
    catalog = await response.json();
    if (!Array.isArray(catalog?.subjects) || !catalog.subjects.length) {
      throw new Error('The Quick Reels subject index is empty.');
    }

    const requestedSubject = new URLSearchParams(window.location.search).get('subject');
    const hasSubject = id => catalog.subjects.some(subject => subject.id === id);
    const initialSubject = hasSubject(requestedSubject)
      ? requestedSubject
      : hasSubject(state.subject)
        ? state.subject
        : (hasSubject(catalog.defaultSubject) ? catalog.defaultSubject : catalog.subjects[0].id);
    if (initialSubject !== state.subject) {
      state.subject = initialSubject;
      state.unit = 'all';
      state.savedOnly = false;
    }
    await ensurePayload(initialSubject);
  } catch (error) {
    elements.stageLoading.hidden = false;
    elements.stageLoading.className = 'stage-error';
    elements.stageLoading.setAttribute('role', 'alert');
    elements.stageLoading.setAttribute('aria-live', 'assertive');
    elements.stageLoading.innerHTML = `<p>Failed to load the feed. Please reload.</p>`;
    console.error(error);
    return;
  }

  cleanPersistedEntryState();
  saveState();
  renderSubjectFilters();
  updateSubjectUi();
  updateSubjectUrl();
  refreshVoiceOptions();
  refreshNarratorStatus();
  bindControls();

  elements.speechRate.value = String(state.speechRate);
  elements.musicVolume.value = String(state.musicVolume);
  elements.muteButton.setAttribute('aria-pressed', String(state.muted));
  elements.muteButtonLabel.textContent = state.muted ? 'Unmute audio' : 'Mute audio';

  const restore = restorePosition();
  try {
    buildFeed({ restore, speak: false, markSeen: false, persistPosition: true });
    updateHubSummaries();
  } catch (error) {
  elements.stageLoading.hidden = false;
  elements.stageLoading.className = 'stage-error';
  elements.stageLoading.setAttribute('role', 'alert');
  elements.stageLoading.setAttribute('aria-live', 'assertive');
  elements.stageLoading.innerHTML = `<p>Failed to build the feed. Please reload.</p>`;
  console.error(error);
  }
}

init();