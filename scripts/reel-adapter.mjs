import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const CACHE_DIR = path.join(ROOT, '.cache', 'reels-ai');
const PROMPT_VERSION = 'v3';

// Model chain: primary -> fallbacks (as specified in checkpoint)
const MODEL_CHAIN = [
  { id: 'qwen/qwen3.8-27b', maxTokens: 900, temperature: 0.7, reasoning_effort: 'none' },
  { id: 'openai/gpt-oss-20b', maxTokens: 1400, temperature: 0.7, reasoning_effort: 'low' },
  { id: 'openai/gpt-oss-120b', maxTokens: 1400, temperature: 0.7, reasoning_effort: 'low' },
];

const BASE = 'https://api.groq.com/openai/v1';
const KEY = process.env.GROQ_API_KEY || '';

function cacheKey(note, modelId) {
  const h = crypto.createHash('sha256');
  h.update(PROMPT_VERSION);
  h.update('\0');
  h.update(modelId);
  h.update('\0');
  h.update(note.trim());
  return h.digest('hex').slice(0, 32);
}

function cachePath(key) {
  return path.join(CACHE_DIR, `${key}.json`);
}

// Load prompts from the copied canonical location
function loadPrompts() {
  const systemPath = path.join(ROOT, 'scripts', 'reel-prompts', 'reel-writer.system.v3.txt');
  const userPath = path.join(ROOT, 'scripts', 'reel-prompts', 'reel-writer.user.txt');
  return {
    system: fs.readFileSync(systemPath, 'utf8').trim(),
    userTpl: fs.readFileSync(userPath, 'utf8').trim(),
  };
}

async function groqChat(model, messages, opts = {}) {
  if (!KEY) throw new Error('NO_KEY');
  const body = {
    model,
    messages,
    max_tokens: opts.maxTokens ?? 900,
    temperature: opts.temperature ?? 0.7,
    ...(opts.reasoning_effort ? { reasoning_effort: opts.reasoning_effort } : {}),
  };
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(`${BASE}/chat/completions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    if (res.ok) return JSON.parse(text);
    if (res.status === 429 && attempt < 2) {
      const wait = Number(res.headers.get('retry-after') || 5) * 1000 + attempt * 1500;
      await new Promise(r => setTimeout(r, wait));
      continue;
    }
    const err = new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
    err.status = res.status;
    throw err;
  }
  throw new Error('Max retries exceeded');
}

// Deterministic validation (ported from tools/reel/judge.mjs)
const EMOJI = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{1F1E6}-\u{1F1FF}]/u;
const PREAMBLE = /^\s*(sure|here(?:'s| is)|okay|alright|welcome|I'll|i will|as we all know|below is|below are)\b/i;
function stripCues(t) { return t.replace(/\[[A-Z]+\]/g, ' ').replace(/\s+/g, ' ').trim(); }
function norm(s) { return s.replace(/\*\*/g, '').replace(/[*_`]/g, '').replace(/\s+/g, ' ').trim().toLowerCase(); }
function words(t) { return stripCues(t).split(/\s+/).filter(Boolean).length; }

function validate(transcript, fixture) {
  const w = words(transcript);
  const checks = [];
  const add = (name, ok, detail = '') => checks.push({ name, ok: !!ok, detail });
  add('word-band', w >= fixture.expectedWords[0] && w <= fixture.expectedWords[1], `${w}`);
  add('no-preamble', !PREAMBLE.test(transcript), '');
  add('no-markdown', !/\*\*|^\s*[-*]\s/m.test(transcript) && !/^#{1,6}\s/m.test(transcript), '');
  add('no-emoji', !EMOJI.test(transcript), '');
  add('has-hook', /\[HOOK\]/i.test(transcript), '');
  add('has-pauses', (transcript.match(/\[PAUSE\]/gi) || []).length >= 2, '');
  add('no-exam-tip', !/exam\s*tip/i.test(transcript), '');
  if (fixture.verbatim) add('verbatim-exact', norm(transcript).includes(norm(fixture.verbatim)), '');
  const missing = fixture.mustInclude.filter(m => !norm(transcript).includes(norm(m)));
  add('term-coverage', missing.length === 0, missing.length ? `missing: ${missing.join(', ')}` : '');
  const hard = checks.filter(c => !c.ok && c.name !== 'word-band');
  return { ok: hard.length === 0, checks, words: w, hardFail: hard.map(c => c.name) };
}

function extractVerbatim(note) {
  const match = /^>\s*(.+)$/m.exec(note);
  return match
    ? match[1].replace(/\*\*/g, '').replace(/[*_`]/g, '').trim()
    : null;
}

function parseFixtureFromNote(note, id) {
  const verbatim = extractVerbatim(note);
  // Extract capitalized terms as must-include candidates (acronyms, named concepts)
  const terms = new Set();
  const words = note.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || [];
  for (const w of words) if (w.length > 3) terms.add(w);
  // Also pick up ALL-CAPS acronyms
  const acronyms = note.match(/\b[A-Z]{2,}\b/g) || [];
  for (const a of acronyms) if (a.length >= 2 && a.length <= 6) terms.add(a);
  return {
    id,
    expectedWords: [140, 320],
    mustInclude: [...terms].slice(0, 20), // cap to avoid over-constraining
    verbatim,
    note,
  };
}

export async function generateReel(note, entryId) {
  const { system, userTpl } = loadPrompts();
  const user = userTpl.replace('{note}', note);
  const messages = [
    { role: 'system', content: system },
    { role: 'user', content: user },
  ];

  // Try cache first (across all models — key includes model)
  for (const model of MODEL_CHAIN) {
    const key = cacheKey(note, model.id);
    const cp = cachePath(key);
    if (fs.existsSync(cp)) {
      const cached = JSON.parse(fs.readFileSync(cp, 'utf8'));
      const fixture = parseFixtureFromNote(note, entryId);
      const val = validate(cached.transcript, fixture);
      if (val.ok) return { transcript: cached.transcript, model: model.id, cached: true, validation: val };
    }
  }

  if (!KEY) {
    return { skipped: true, reason: 'GROQ_API_KEY not set', entryId };
  }

  const fixture = parseFixtureFromNote(note, entryId);

  // Try each model in chain
  for (const model of MODEL_CHAIN) {
    try {
      const json = await groqChat(model.id, messages, {
        maxTokens: model.maxTokens,
        temperature: model.temperature,
        reasoning_effort: model.reasoning_effort,
      });
      const transcript = json.choices?.[0]?.message?.content ?? '';
      const val = validate(transcript, fixture);
      if (!val.ok) continue; // try next model

      // Cache on success
      fs.mkdirSync(CACHE_DIR, { recursive: true });
      fs.writeFileSync(cachePath(cacheKey(note, model.id)), JSON.stringify({ transcript, model: model.id, usage: json.usage }, null, 2));
      return { transcript, model: model.id, cached: false, validation: val };
    } catch (err) {
      if (err.message === 'NO_KEY') throw err;
      if (err.status === 429) continue; // try next model
      console.warn(`Model ${model.id} failed: ${err.message}`);
    }
  }
  return { skipped: true, reason: 'All models failed or validation rejected', entryId };
}

export async function generateReels(entries) {
  const results = [];
  for (const { note, entryId } of entries) {
    const r = await generateReel(note, entryId);
    results.push({ entryId, ...r });
    // Polite pacing (build-time only)
    await new Promise(res => setTimeout(res, 500));
  }
  return results;
}

// cleanForTTS - exact function from checkpoint
export function cleanForTTS(text) {
  return text
    .replace(/\[(HOOK|PAUSE|EMPHASIS)\]/g, '')
    .replace(/\*\*|\*|_|`/g, '')
    .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Protected token validation - reject if essential numbers/dates/formulas lost
export function validateProtectedTokens(originalNote, cleanTranscript) {
  // Extract protected patterns from original
  const protectedPatterns = [
    /\b\d+(?:\.\d+)?\s*%\b/g,           // percentages
    /\b(?:NPR|INR|USD|Rs\.?)\s*[\d,.]+/gi, // money
    /\b(?:19|20)\d{2}\b/g,              // years
    /[=+*/<>≤≥]/g,                      // formulas/operators
    /\b(?:API|BI|CDC|CRM|DAX|DQ|DW|EDW|ERP|ETL|KPI|ML|MPP|ODS|OLAP|OLTP|PII|POS|RFM|SCD|SQL)\b/g, // acronyms
  ];
  const missing = [];
  for (const pattern of protectedPatterns) {
    const matches = originalNote.match(pattern) || [];
    for (const m of matches) {
      if (!cleanTranscript.includes(m)) missing.push(m);
    }
  }
  return { ok: missing.length === 0, missing };
}