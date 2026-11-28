import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createNarrationHandler, reserveNarrationQuota } from './api/narration.mjs';
import { BI_QUESTION_MANIFEST } from './reels/bi-question-manifest.mjs';
import {
  collectSectionHeadingNames,
  extractReelContent
} from './reels/content.mjs';
import { synthesizeGoogleSpeech } from './reels/google-tts.mjs';
import {
  hasMp3Signature,
  isValidNarrationAsset,
  writeNarrationAsset
} from './scripts/narration-assets.mjs';
import {
  DEFAULT_NARRATION_PROFILE,
  buildNarrationManifest,
  collectEntrySegmentIds,
  hashString,
  narrationAssetName,
  normalizeSpeech
} from './reels/speech.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
let passed = 0;
let failed = 0;

function check(name, condition, detail = '') {
  if (condition) {
    passed += 1;
    console.log(`PASS  ${name}`);
  } else {
    failed += 1;
    console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

function equal(name, actual, expected) {
  check(name, actual === expected, `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
}

function responseRecorder() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    writeHead(status, headers = {}) {
      this.statusCode = status;
      this.headers = { ...this.headers, ...headers };
      return this;
    },
    end(body = null) {
      this.body = body;
      return this;
    }
  };
}

function request(url, { method = 'GET', headers = {} } = {}) {
  return { method, url, headers };
}

const nepalNarration = normalizeSpeech(
  '🇳🇵 (NP) Nepal anchor (use in a 3- or 5-marker, and in a case): A Nepali commercial bank\'s BI scope runs from branch-level daily deposit and loan reports (descriptive, functional) to NPL early-warning dashboards and customer churn scoring (predictive, enterprise).'
);

equal(
  'Flag, country shorthand, and exam-use annotations are not narrated',
  nepalNarration,
  "Nepal anchor: A Nepali commercial bank's B I scope runs from branch-level daily deposit and loan reports (descriptive, functional) to NPL early-warning dashboards and customer churn scoring (predictive, enterprise)."
);
check('Meaningful parentheses remain in narration', nepalNarration.includes('(descriptive, functional)') && nepalNarration.includes('(predictive, enterprise)'), nepalNarration);
check('Flag symbols are absent from narration', !/[\u{1F1E6}-\u{1F1FF}]/u.test(nepalNarration), nepalNarration);
equal(
  'Dates inside semantic parentheses remain in narration',
  normalizeSpeech('The cohort began in 2024 (recorded in 2026).'),
  'The cohort began in 2024 (recorded in 2026).'
);
equal(
  'Percentages and currency inside semantic parentheses remain in narration',
  normalizeSpeech('Margin improved (31%, NPR 2,000).'),
  'Margin improved (31%, NPR 2,000).'
);
equal(
  'Formula annotations inside parentheses remain in narration',
  normalizeSpeech('Lift = 1.5 (lift > 1).'),
  'Lift equals 1.5 (lift is greater than 1).'
);
equal(
  'Instructional marker annotations are not narrated',
  normalizeSpeech('Use this definition (use in a 3- or 5-marker, and in a case).'),
  'Use this definition.'
);

equal(
  'Dotted heading labels are removed',
  normalizeSpeech('2.4.1 Fact vs Dimension Tables', { kind: 'heading' }),
  'Fact vs Dimension Tables'
);
equal(
  'Embedded dotted heading labels are removed',
  normalizeSpeech('2.4.1 Fact vs Dimension Tables', { kind: 'text' }),
  'Fact vs Dimension Tables'
);
equal(
  'Table sequence columns are removed',
  normalizeSpeech('2 Executive sponsorship and business ownership', { kind: 'table-cell' }),
  'Executive sponsorship and business ownership'
);
check(
  'Meaningful table quantities are not mistaken for sequence columns',
  normalizeSpeech('3 marks remain available', { kind: 'table-cell' }).startsWith('3 marks'),
  normalizeSpeech('3 marks remain available', { kind: 'table-cell' })
);
equal(
  'Section references use the section name instead of a numeric label',
  normalizeSpeech('See §4.5 for the chart rules', { sectionNames: { '4.5': 'Visualization Rules' } }),
  'See the Visualization Rules section for the chart rules'
);

const arrowNarration = normalizeSpeech('Raw, messy, multi-source → clean, consistent');
equal('Arrows use domain-specific wording', arrowNarration, 'Raw, messy, multi-source data becomes clean and consistent');
check(
  'Association arrows explain the relationship',
  normalizeSpeech('An association rule is an implication X → Y.').includes('X is associated with Y'),
  normalizeSpeech('An association rule is an implication X → Y.')
);
check(
  'Pipeline arrows describe the flow rather than saying only “then”',
  normalizeSpeech('Core banking (OLTP) → nightly ETL → staging → EDW with 10 years history in star schema (fact: deposits/withdrawals; dims: branch, product, date, customer segment) → dependent marts for branch & product reporting → dashboards')
    .includes('Data flows from core banking through nightly E T L'),
  normalizeSpeech('Core banking (OLTP) → nightly ETL → staging → EDW with 10 years history in star schema (fact: deposits/withdrawals; dims: branch, product, date, customer segment) → dependent marts for branch & product reporting → dashboards')
);

const meaningfulNumbers = normalizeSpeech('ETL moves 31% of NPR 2,000 in 2026; CRM, RFM, MPP, PII, OLAP, and EDW remain identifiers.');
check('Percentages remain in narration', meaningfulNumbers.includes('31%'), meaningfulNumbers);
check('Money remains in narration', meaningfulNumbers.includes('NPR 2,000'), meaningfulNumbers);
check('Years remain in narration', meaningfulNumbers.includes('2026'), meaningfulNumbers);
for (const acronym of ['ETL', 'CRM', 'RFM', 'MPP', 'PII', 'OLAP', 'EDW']) {
  const spoken = acronym.split('').join('\\s+');
  check(`${acronym} remains identifiable in narration`, new RegExp(`\\b${spoken}\\b`).test(meaningfulNumbers), meaningfulNumbers);
}

const sampleEntries = [{
  id: 'sample-entry',
  kind: 'question',
  questionText: '1.1 What is the ETL process?',
  speechTitle: '1.1 What is the ETL process?',
  parts: [
    { type: 'text', text: 'ETL means Extract, Transform, Load.' },
    { type: 'table', header: [{ text: 'Stage' }], rows: [[{ text: 'Extract' }], [{ text: '' }]] },
    { type: 'diagram', lines: ['Source → Warehouse', ''] }
  ]
}];
const sampleBuild = buildNarrationManifest(sampleEntries, {
  cloudEnabled: true,
  primeEntries: 1,
  profile: DEFAULT_NARRATION_PROFILE
});
const sampleIds = collectEntrySegmentIds(sampleBuild.entryNarration['sample-entry']);
check('Manifest entries reference known narration segments', sampleIds.length === 5 && sampleIds.every(id => sampleBuild.manifest.segments[id]), JSON.stringify(sampleBuild.entryNarration));
check('The segment collector omits empty row and line placeholders', !sampleIds.includes(null) && !sampleIds.includes(undefined), JSON.stringify(sampleIds));
check('Narration segment IDs are stable text hashes', sampleIds.every(id => id === `seg-${hashString(sampleBuild.manifest.segments[id].text)}`), JSON.stringify(sampleIds));
check('Manifest version and profile are explicit', sampleBuild.manifest.version === 2 && sampleBuild.manifest.profile.voice === DEFAULT_NARRATION_PROFILE.voice && sampleBuild.manifest.profile.modelVersion === DEFAULT_NARRATION_PROFILE.modelVersion, JSON.stringify(sampleBuild.manifest.profile));
check('Primed entries are marked for deployment-time generation', sampleBuild.manifest.segments[sampleBuild.entryNarration['sample-entry'].title].prime === true);
const changedProfileBuild = buildNarrationManifest(sampleEntries, {
  profile: { ...DEFAULT_NARRATION_PROFILE, voice: 'en-US-Chirp3-HD-Charon' }
});
check(
  'Changing the voice invalidates cached narration versions',
  changedProfileBuild.manifest.segments[changedProfileBuild.entryNarration['sample-entry'].title].version !== sampleBuild.manifest.segments[sampleBuild.entryNarration['sample-entry'].title].version
);
const changedModelBuild = buildNarrationManifest(sampleEntries, {
  profile: { ...DEFAULT_NARRATION_PROFILE, modelVersion: 'chirp-3-hd-v2' }
});
check(
  'Changing the model version invalidates cached narration versions',
  changedModelBuild.manifest.segments[changedModelBuild.entryNarration['sample-entry'].title].version !== sampleBuild.manifest.segments[sampleBuild.entryNarration['sample-entry'].title].version
);
equal(
  'Static narration filenames include both segment and version',
  narrationAssetName(sampleBuild.manifest.segments[sampleBuild.entryNarration['sample-entry'].title]),
  `${sampleBuild.entryNarration['sample-entry'].title}-${sampleBuild.manifest.segments[sampleBuild.entryNarration['sample-entry'].title].version}.mp3`
);

const subject = {
  id: 'bi',
  code: 'IT 249',
  name: 'Business Intelligence',
  folder: '01-business-intelligence',
  color: '#2563eb'
};
const units = [
  { num: 1, title: 'Unit 1', file: 'unit-1-introduction-to-bi.md' },
  { num: 2, title: 'Unit 2', file: 'unit-2-data-warehousing.md' },
  { num: 3, title: 'Unit 3', file: 'unit-3-data-mining.md' },
  { num: 4, title: 'Unit 4', file: 'unit-4-data-visualization.md' },
  { num: 5, title: 'Unit 5', file: 'unit-5-bi-tools-and-technologies.md' },
  { num: 6, title: 'Unit 6', file: 'unit-6-bi-implementation.md' }
];
const sourcePayload = extractReelContent({
  subject,
  units,
  rootDir: __dirname,
  questionManifest: BI_QUESTION_MANIFEST
});
const sectionNames = collectSectionHeadingNames(units, __dirname, subject.folder);
const corpusBuild = buildNarrationManifest(sourcePayload.entries, {
  cloudEnabled: true,
  primeEntries: 3,
  profile: DEFAULT_NARRATION_PROFILE,
  sectionNames
});
const corpusSegments = Object.values(corpusBuild.manifest.segments);
const corpusTexts = corpusSegments.map(segment => segment.text);
check('The full corpus builds a narration manifest', corpusSegments.length > 1000, String(corpusSegments.length));
check('No arrow glyph reaches the narration manifest', corpusTexts.every(text => !/[→←⇒⇔↔]/u.test(text)));
check('No section-sign label reaches the narration manifest', corpusTexts.every(text => !/§\s*\d/.test(text)));
check('No dotted heading label starts a narration segment', corpusTexts.every(text => !/^\s*\d{1,2}(?:\.\d+)+\s/.test(text)));
check('No flag reaches the narration manifest', corpusTexts.every(text => !/[\u{1F1E6}-\u{1F1FF}]/u.test(text)));
check('Exam-use annotations do not reach the narration manifest', corpusTexts.every(text => !/\(use in a .*marker/i.test(text)));
check('Country shorthand does not reach the narration manifest', corpusTexts.every(text => !/\(NP\)/i.test(text)));
check('Narration keeps meaningful percentages', corpusTexts.filter(text => /\d+(?:\.\d+)?%/.test(text)).length >= 15);
check('Narration keeps meaningful currency', corpusTexts.some(text => /NPR\s*[\d,.]+/i.test(text)));
check('Narration keeps the Nepal anchor content', corpusTexts.some(text => text.startsWith('Nepal anchor: A Nepali commercial bank\'s B I scope runs')));

const apiManifest = {
  profile: DEFAULT_NARRATION_PROFILE,
  segments: {
    'seg-api0001': {
      id: 'seg-api0001',
      text: 'Narration API test segment.',
      chars: 27,
      version: 'v0000001',
      static: false
    }
  }
};
const googleAudio = Buffer.from('fake-mp3-audio');
let durableQuotaError = null;
try {
  await reserveNarrationQuota({
    env: { VERCEL: '1' },
    fetchImpl: async () => { throw new Error('Upstash should not be called.'); },
    chars: 10
  });
} catch (error) {
  durableQuotaError = error;
}
check(
  'Serverless narration fails closed without durable quota storage',
  durableQuotaError?.code === 'quota_store_unavailable',
  JSON.stringify(durableQuotaError)
);
let upstashFailureError = null;
try {
  await reserveNarrationQuota({
    env: {
      UPSTASH_REDIS_REST_URL: 'https://quota.invalid',
      UPSTASH_REDIS_REST_TOKEN: 'test-token'
    },
    fetchImpl: async () => { throw new Error('Network unavailable.'); },
    chars: 10
  });
} catch (error) {
  upstashFailureError = error;
}
check(
  'An unavailable durable quota store reports a typed error',
  upstashFailureError?.code === 'quota_store_unavailable',
  JSON.stringify(upstashFailureError)
);
let googleCalls = 0;
const apiFetch = async (url, options = {}) => {
  googleCalls += 1;
  check('Google requests use the API-key header', options.headers?.['x-goog-api-key'] === 'test-key', JSON.stringify(options.headers));
  const requestBody = JSON.parse(options.body || '{}');
  check(
    'Google requests use the selected Chirp voice and plain-text input',
    requestBody.voice?.name === DEFAULT_NARRATION_PROFILE.voice
      && requestBody.voice?.languageCode === DEFAULT_NARRATION_PROFILE.languageCode
      && requestBody.input?.text === 'Narration API test segment.'
      && !requestBody.input?.ssml,
    JSON.stringify(requestBody)
  );
  check(
    'Google requests do not send an unsupported model field',
    !Object.hasOwn(requestBody, 'model') && !Object.hasOwn(requestBody.voice || {}, 'modelName'),
    JSON.stringify(requestBody)
  );
  return new Response(JSON.stringify({ audioContent: googleAudio.toString('base64') }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
const apiHandler = createNarrationHandler({
  manifest: apiManifest,
  env: { GOOGLE_CLOUD_TTS_API_KEY: 'test-key' },
  fetchImpl: apiFetch,
  reserveQuota: async ({ chars }) => ({ daily: chars, monthly: chars, requests: 1 })
});

const methodResponse = responseRecorder();
await apiHandler(request('http://localhost/api/narration', { method: 'POST' }), methodResponse);
check('Narration API rejects unsupported methods', methodResponse.statusCode === 405 && methodResponse.headers.Allow === 'GET, HEAD', JSON.stringify(methodResponse));

const unknownResponse = responseRecorder();
await apiHandler(request('http://localhost/api/narration?segment=seg-unknown&v=v0000001'), unknownResponse);
check('Narration API rejects unknown segment IDs', unknownResponse.statusCode === 404, JSON.stringify(unknownResponse));

const wrongVersionResponse = responseRecorder();
await apiHandler(request('http://localhost/api/narration?segment=seg-api0001&v=wrong'), wrongVersionResponse);
check('Narration API rejects stale segment versions', wrongVersionResponse.statusCode === 404, JSON.stringify(wrongVersionResponse));

const arbitraryTextResponse = responseRecorder();
await apiHandler(request('http://localhost/api/narration?text=arbitrary%20client%20text'), arbitraryTextResponse);
check('Narration API never accepts arbitrary client text', arbitraryTextResponse.statusCode === 400, JSON.stringify(arbitraryTextResponse));

const validResponse = responseRecorder();
await apiHandler(request('http://localhost/api/narration?segment=seg-api0001&v=v0000001'), validResponse);
check(
  'Narration API serves known versioned segments as immutable audio',
  validResponse.statusCode === 200
    && validResponse.headers['Content-Type'] === 'audio/mpeg'
    && /immutable/.test(validResponse.headers['Cache-Control'] || '')
    && Buffer.isBuffer(validResponse.body)
    && validResponse.body.equals(googleAudio),
  JSON.stringify({ status: validResponse.statusCode, headers: validResponse.headers, body: validResponse.body?.toString?.() })
);
check('Narration API synthesized only the requested segment', googleCalls === 1, String(googleCalls));

const cachedResponse = responseRecorder();
await apiHandler(request('http://localhost/api/narration?segment=seg-api0001&v=v0000001', {
  headers: { 'if-none-match': '"seg-api0001-v0000001"' }
}), cachedResponse);
check(
  'A matching narration ETag returns 304 without synthesis',
  cachedResponse.statusCode === 304 && cachedResponse.body === null && googleCalls === 1,
  JSON.stringify({ response: cachedResponse, calls: googleCalls })
);

const headResponse = responseRecorder();
await apiHandler(request('http://localhost/api/narration?segment=seg-api0001&v=v0000001', { method: 'HEAD' }), headResponse);
check('Narration API supports metadata-only HEAD requests', headResponse.statusCode === 200 && headResponse.body === null && googleCalls === 1, JSON.stringify(headResponse));

const exhaustedHandler = createNarrationHandler({
  manifest: apiManifest,
  env: { GOOGLE_CLOUD_TTS_API_KEY: 'test-key' },
  fetchImpl: apiFetch,
  reserveQuota: async () => {
    const error = new Error('Monthly budget exhausted.');
    error.code = 'quota_exhausted';
    throw error;
  }
});
const exhaustedResponse = responseRecorder();
await exhaustedHandler(request('http://localhost/api/narration?segment=seg-api0001&v=v0000001'), exhaustedResponse);
check(
  'Narration API returns 429 when the character quota is exhausted',
  exhaustedResponse.statusCode === 429 && JSON.parse(exhaustedResponse.body || '{}').error === 'quota_exhausted',
  JSON.stringify(exhaustedResponse)
);

const rateLimitedHandler = createNarrationHandler({
  manifest: apiManifest,
  env: { GOOGLE_CLOUD_TTS_API_KEY: 'test-key' },
  fetchImpl: apiFetch,
  reserveQuota: async () => {
    const error = new Error('Too many requests.');
    error.code = 'rate_limited';
    throw error;
  }
});
const rateLimitedResponse = responseRecorder();
await rateLimitedHandler(request('http://localhost/api/narration?segment=seg-api0001&v=v0000001'), rateLimitedResponse);
check(
  'Narration API returns 429 and Retry-After when rate limited',
  rateLimitedResponse.statusCode === 429
    && JSON.parse(rateLimitedResponse.body || '{}').error === 'rate_limited'
    && rateLimitedResponse.headers['Retry-After'] === '60',
  JSON.stringify(rateLimitedResponse)
);

const unavailableQuotaHandler = createNarrationHandler({
  manifest: apiManifest,
  env: { GOOGLE_CLOUD_TTS_API_KEY: 'test-key' },
  fetchImpl: apiFetch,
  reserveQuota: async () => {
    const error = new Error('Durable quota storage is unavailable.');
    error.code = 'quota_store_unavailable';
    throw error;
  }
});
const unavailableQuotaResponse = responseRecorder();
await unavailableQuotaHandler(request('http://localhost/api/narration?segment=seg-api0001&v=v0000001'), unavailableQuotaResponse);
check(
  'Narration API returns a safe 503 when durable quota storage is unavailable',
  unavailableQuotaResponse.statusCode === 503
    && JSON.parse(unavailableQuotaResponse.body || '{}').error === 'quota_store_unavailable',
  JSON.stringify(unavailableQuotaResponse)
);

let concurrentGoogleCalls = 0;
const concurrentFetch = async () => {
  concurrentGoogleCalls += 1;
  await new Promise(resolve => setTimeout(resolve, 20));
  return new Response(JSON.stringify({ audioContent: googleAudio.toString('base64') }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
const concurrentHandler = createNarrationHandler({
  manifest: apiManifest,
  env: { GOOGLE_CLOUD_TTS_API_KEY: 'test-key' },
  fetchImpl: concurrentFetch,
  reserveQuota: async () => ({ daily: 1, monthly: 1, requests: 1 })
});
const concurrentResponses = [responseRecorder(), responseRecorder()];
await Promise.all(concurrentResponses.map(response => concurrentHandler(
  request('http://localhost/api/narration?segment=seg-api0001&v=v0000001'),
  response
)));
check(
  'Concurrent requests for one segment synthesize the audio once',
  concurrentGoogleCalls === 1
    && concurrentResponses.every(response => response.statusCode === 200),
  JSON.stringify({ calls: concurrentGoogleCalls, responses: concurrentResponses })
);

let retryCalls = 0;
const retryFetch = async (url, options) => {
  retryCalls += 1;
  if (retryCalls === 1) {
    return new Response(JSON.stringify({ error: { message: 'speakingRate is not supported for this voice' } }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  return new Response(JSON.stringify({ audioContent: googleAudio.toString('base64') }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
};
const retriedAudio = await synthesizeGoogleSpeech({
  text: 'A pace retry test.',
  profile: DEFAULT_NARRATION_PROFILE,
  env: { GOOGLE_CLOUD_TTS_API_KEY: 'test-key' },
  fetchImpl: retryFetch
});
check('Google pace rejection retries once without speakingRate', retryCalls === 2 && retriedAudio.equals(googleAudio), String(retryCalls));

{
  const validFrame = Buffer.concat([Buffer.from([0xff, 0xfb, 0x90, 0x00]), Buffer.alloc(140, 0x12)]);
  const validId3 = Buffer.concat([Buffer.from('ID3'), Buffer.alloc(140, 0x12)]);
  const invalidAudio = Buffer.from('fake-mp3-audio');
  check('Prime validation accepts an MP3 frame header', hasMp3Signature(validFrame), validFrame.toString('hex'));
  check('Prime validation accepts ID3 audio', hasMp3Signature(validId3), validId3.toString('hex'));
  check('Prime validation rejects non-audio bytes', !hasMp3Signature(invalidAudio), invalidAudio.toString());

  const tempRoot = path.join(__dirname, 'dist', '.narration-test');
  fs.rmSync(tempRoot, { recursive: true, force: true });
  fs.mkdirSync(tempRoot, { recursive: true });
  const validPath = path.join(tempRoot, 'valid.mp3');
  const invalidPath = path.join(tempRoot, 'invalid.mp3');
  fs.writeFileSync(validPath, validFrame);
  fs.writeFileSync(invalidPath, invalidAudio);
  check('Prime validation accepts a complete MP3 file', isValidNarrationAsset(validPath), validPath);
  check('Prime validation rejects a complete non-audio file', !isValidNarrationAsset(invalidPath), invalidPath);

  let rejectedWrite = null;
  try {
    writeNarrationAsset(invalidPath, invalidAudio);
  } catch (error) {
    rejectedWrite = error;
  }
  check('Priming refuses to preserve non-audio output', Boolean(rejectedWrite) && fs.existsSync(invalidPath) === false, JSON.stringify(rejectedWrite));
  writeNarrationAsset(invalidPath, validFrame);
  check('Priming writes valid audio atomically', isValidNarrationAsset(invalidPath) && !fs.existsSync(`${invalidPath}.` + process.pid + '.tmp'), invalidPath);
  fs.rmSync(tempRoot, { recursive: true, force: true });
}

// --- Built multi-subject manifests ---
import {
  buildAiTranscriptManifest,
  DEFAULT_AI_TRANSCRIPT_PROFILE,
  aiTranscriptAssetName,
  collectAiEntrySegmentIds
} from './reels/speech.mjs';
import { cleanForTTS } from './scripts/reel-adapter.mjs';

const reelsRoot = path.join(__dirname, 'dist', 'reels');
const reelsIndexPath = path.join(reelsRoot, 'content.json');
const mergedManifestPath = path.join(reelsRoot, 'narration-manifest.json');

if (fs.existsSync(reelsIndexPath) && fs.existsSync(mergedManifestPath)) {
  const reelsIndex = JSON.parse(fs.readFileSync(reelsIndexPath, 'utf8'));
  const mergedManifest = JSON.parse(fs.readFileSync(mergedManifestPath, 'utf8'));
  const subjectIds = reelsIndex.subjects.map(subject => subject.id);

  check('Subject index lists one payload per built subject', subjectIds.length >= 2 && subjectIds.every(id => typeof id === 'string'), JSON.stringify(subjectIds));
  check('Subject index exposes a default subject', subjectIds.includes(reelsIndex.defaultSubject), String(reelsIndex.defaultSubject));
  check('Merged narration manifest covers every subject', JSON.stringify(mergedManifest.subjects) === JSON.stringify(subjectIds), JSON.stringify(mergedManifest.subjects));
  check('Merged narration manifest is server-only complete', Boolean(mergedManifest.narration?.segments && mergedManifest.narration?.profile && mergedManifest.aiTranscript?.segments && mergedManifest.aiTranscript?.profile), Object.keys(mergedManifest).join(','));

  const sharedTextById = new Map();
  const collidingIds = [];

  for (const subject of reelsIndex.subjects) {
    const payloadPath = path.join(reelsRoot, subject.payloadUrl);
    const builtPayload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));
    const label = subject.id;

    check(`${label}: entry count matches the subject index`, builtPayload.entries.length === subject.entryCount, `${builtPayload.entries.length} vs ${subject.entryCount}`);
    check(`${label}: every entry is scoped to its subject`, builtPayload.entries.every(entry => entry.subjectId === subject.id), label);
    // The browser narrates from the Groq transcript only, so the server-side
    // narration manifest is deliberately not shipped in the subject payload.
    check(
      `${label}: browser payload omits the server narration manifest`,
      builtPayload.narration === undefined && builtPayload.entries.every(entry => entry.narration === undefined),
      `payload.narration=${typeof builtPayload.narration}, entry.narration=${builtPayload.entries.some(entry => entry.narration !== undefined)}`
    );

    for (const [segmentId, segment] of Object.entries(mergedManifest.narration.segments)) {
      if (sharedTextById.has(segmentId) && sharedTextById.get(segmentId) !== segment.text) collidingIds.push(segmentId);
      sharedTextById.set(segmentId, segment.text);
    }

    const aiManifest = mergedManifest.aiTranscript;
    check(`${label}: AI manifest uses the groq provider`, aiManifest.profile.provider === 'groq', JSON.stringify(aiManifest.profile));
    check(`${label}: AI manifest uses qwen primary model`, aiManifest.profile.modelVersion === 'qwen/qwen3.8-27b', aiManifest.profile.modelVersion);
    check(`${label}: AI manifest profileHash is set`, typeof aiManifest.profileHash === 'string' && aiManifest.profileHash.length > 0);
    check(`${label}: AI manifest version is 2`, aiManifest.version === 2, JSON.stringify(aiManifest.version));
    check(`${label}: every entry references an AI transcript segment`, builtPayload.entries.every(entry => {
      const aiEntry = entry.aiTranscript;
      return aiEntry && aiEntry.transcript && Boolean(aiManifest.segments[aiEntry.transcript]);
    }), `entries: ${builtPayload.entries.length}`);
    check(`${label}: AI segment IDs use aiseg- prefix`, Object.keys(aiManifest.segments).every(id => id.startsWith('aiseg-')), Object.keys(aiManifest.segments).slice(0, 3));
    check(`${label}: AI segment text is non-empty`, Object.values(aiManifest.segments).every(segment => segment.text && segment.text.trim().length > 0));
    check(`${label}: AI segment chars match text length`, Object.values(aiManifest.segments).every(segment => segment.chars === segment.text.length));
    check(`${label}: AI segment versions are set`, Object.values(aiManifest.segments).every(segment => segment.version && segment.version.length > 0));
    check(`${label}: AI asset name includes id and version`, {
      sample: aiTranscriptAssetName(Object.values(aiManifest.segments)[0] || {})
    }.sample.includes('.mp3') && Object.values(aiManifest.segments).some(s => aiTranscriptAssetName(s).startsWith('aiseg-')));
  }

  check('Merged narration manifest carries a profile hash', typeof mergedManifest.narration.profileHash === 'string' && mergedManifest.narration.profileHash.length > 0, mergedManifest.narration.profileHash);
  check('Merged narration manifest queues at least twelve primed segments', Object.values(mergedManifest.narration.segments).filter(segment => segment.prime).length >= 12, String(Object.values(mergedManifest.narration.segments).filter(segment => segment.prime).length));

  check('Shared narration segment IDs keep identical text across subjects', collidingIds.length === 0, JSON.stringify(collidingIds.slice(0, 5)));
  const deterministicIds = new Set(Object.keys(mergedManifest.narration.segments));
  const aiIds = new Set(Object.keys(mergedManifest.aiTranscript.segments));
  const overlap = [...aiIds].filter(id => deterministicIds.has(id));
  check('AI segment IDs do not collide with deterministic segment IDs', overlap.length === 0, JSON.stringify(overlap.slice(0, 5)));
} else {
  check('The built subject index and merged narration manifest exist', false, 'dist/reels/content.json or dist/reels/narration-manifest.json is missing; run npm run build');
}

// --- cleanForTTS tests ---
{
  check('cleanForTTS removes [HOOK] cues', cleanForTTS('[HOOK] Your data is drowning.') === 'Your data is drowning.');
  check('cleanForTTS removes [PAUSE] cues', cleanForTTS('First beat.[PAUSE] Second beat.') === 'First beat. Second beat.');
  check('cleanForTTS removes [EMPHASIS] cues', cleanForTTS('[EMPHASIS] Critical point here.') === 'Critical point here.');
  check('cleanForTTS strips markdown bold/italic', cleanForTTS('**bold** and *italic* and _underscore_') === 'bold and italic and underscore');
  check('cleanForTTS strips backticks', cleanForTTS('Use `code` here.') === 'Use code here.');
  check('cleanForTTS removes emoji', cleanForTTS('Hello 🎉 world 📊 test') === 'Hello world test');
  check('cleanForTTS collapses whitespace', cleanForTTS('Too    much    space   here') === 'Too much space here');
  check('cleanForTTS trims ends', cleanForTTS('  leading and trailing  ') === 'leading and trailing');
  check('cleanForTTS empty string', cleanForTTS('') === '');
}

console.log(`\nNarration checks: ${passed} passed, ${failed} failed.`);
if (failed) process.exitCode = 1;
