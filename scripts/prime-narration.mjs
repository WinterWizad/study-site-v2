import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { reserveNarrationQuota } from '../api/narration.mjs';
import { synthesizeGoogleSpeech } from '../reels/google-tts.mjs';
import { isValidNarrationAsset, writeNarrationAsset } from './narration-assets.mjs';
import { narrationAssetName, aiTranscriptAssetName } from '../reels/speech.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const contentIndex = path.join(rootDir, 'dist', 'reels', 'content.json');
const mergedManifestPath = path.join(rootDir, 'dist', 'reels', 'narration-manifest.json');
const audioDir = path.join(rootDir, 'dist', 'reels', 'audio');
const args = new Set(process.argv.slice(2));
const primeAll = args.has('--all');
const requireCredentials = args.has('--require');

if (!fs.existsSync(contentIndex) || !fs.existsSync(mergedManifestPath)) {
  throw new Error('Build the Quick Reels site before priming narration.');
}

const index = JSON.parse(fs.readFileSync(contentIndex, 'utf8'));
const mergedManifestData = JSON.parse(fs.readFileSync(mergedManifestPath, 'utf8'));
const payloadById = new Map(index.subjects.map(subject => {
  const payloadPath = path.join(rootDir, 'dist', 'reels', subject.payloadUrl);
  return [subject.id, JSON.parse(fs.readFileSync(payloadPath, 'utf8'))];
}));
const manifest = mergedManifestData.narration;
if (!manifest?.segments || !manifest?.profile) {
  throw new Error('The built Quick Reels narration manifest is missing.');
}

if (!String(process.env.GOOGLE_CLOUD_TTS_API_KEY || '').trim()) {
  const message = 'GOOGLE_CLOUD_TTS_API_KEY is not set; narration priming was skipped.';
  if (requireCredentials) throw new Error(message);
  console.log(`⚠️  ${message}`);
  process.exit(0);
}

Object.values(manifest.segments).forEach(segment => {
  segment.static = false;
});

const segments = Object.values(manifest.segments)
  .filter(segment => primeAll || segment.prime)
  .sort((left, right) => left.id.localeCompare(right.id));

const maxChars = Math.max(1, Number(process.env.GOOGLE_TTS_MAX_PRIME_CHARS) || 900000);
const totalChars = segments.reduce((sum, segment) => sum + segment.chars, 0);
if (totalChars > maxChars) {
  throw new Error(`Narration priming needs ${totalChars} characters, above the ${maxChars}-character safety cap.`);
}

fs.mkdirSync(audioDir, { recursive: true });

let completed = 0;
let generated = 0;
let reused = 0;
let cursor = 0;
const concurrency = Math.max(1, Math.min(8, Number(process.env.GOOGLE_TTS_PRIME_CONCURRENCY) || 4));

async function primeSegment(segment) {
  const fileName = narrationAssetName(segment);
  const outputPath = path.join(audioDir, fileName);
  if (isValidNarrationAsset(outputPath)) {
    reused += 1;
    completed += 1;
    segment.static = true;
    return;
  }
  if (fs.existsSync(outputPath)) fs.rmSync(outputPath, { force: true });

  await reserveNarrationQuota({
    env: process.env,
    chars: segment.chars
  });

  const audio = await synthesizeGoogleSpeech({
    text: segment.text,
    profile: manifest.profile,
    env: process.env
  });

  writeNarrationAsset(outputPath, audio);
  segment.static = true;
  generated += 1;
  completed += 1;

  if (completed % 50 === 0 || completed === segments.length) {
    console.log(`  🔊 Primed ${completed}/${segments.length} narration segments.`);
  }
}

async function worker() {
  while (cursor < segments.length) {
    const index = cursor;
    cursor += 1;
    await primeSegment(segments[index]);
  }
}

console.log(`🔊 Priming ${segments.length} Google Chirp narration segments (${totalChars.toLocaleString('en-US')} characters).`);
await Promise.all(Array.from({ length: Math.min(concurrency, segments.length) }, () => worker()));

// Prime AI transcript segments per subject. Segment IDs are globally unique,
// but each subject payload keeps its own manifest metadata.
let aiGenerated = 0;
let aiReused = 0;
async function primeAiTranscript(payload, subjectId) {
  const aiTranscript = payload.aiTranscript;
  if (!aiTranscript?.segments || !Object.keys(aiTranscript.segments).length) return;

  Object.values(aiTranscript.segments).forEach(segment => {
    segment.static = false;
  });

  const aiSegments = Object.values(aiTranscript.segments)
    .filter(segment => primeAll || segment.prime)
    .sort((left, right) => left.id.localeCompare(right.id));

  const aiTotalChars = aiSegments.reduce((sum, segment) => sum + segment.chars, 0);
  if (aiTotalChars > 0) {
    console.log(`🎙️ Priming ${subjectId}: ${aiSegments.length} AI transcript segments (${aiTotalChars.toLocaleString('en-US')} characters).`);
    let aiCursor = 0;
    async function primeAiSegment(segment) {
      const fileName = aiTranscriptAssetName(segment);
      const outputPath = path.join(audioDir, fileName);
      if (isValidNarrationAsset(outputPath)) {
        aiReused += 1;
        aiCursor += 1;
        segment.static = true;
        return;
      }
      if (fs.existsSync(outputPath)) fs.rmSync(outputPath, { force: true });

      await reserveNarrationQuota({
        env: process.env,
        chars: segment.chars
      });

      const audio = await synthesizeGoogleSpeech({
        text: segment.text,
        profile: aiTranscript.profile,
        env: process.env
      });

      writeNarrationAsset(outputPath, audio);
      segment.static = true;
      aiGenerated += 1;
      aiCursor += 1;

      if (aiCursor % 50 === 0 || aiCursor === aiSegments.length) {
        console.log(`  🎙️ Primed ${subjectId}: ${aiCursor}/${aiSegments.length} AI transcript segments.`);
      }
    }
    async function aiWorker() {
      while (aiCursor < aiSegments.length) {
        const segmentIndex = aiCursor;
        aiCursor += 1;
        await primeAiSegment(aiSegments[segmentIndex]);
      }
    }
    await Promise.all(Array.from({ length: Math.min(concurrency, aiSegments.length) }, () => aiWorker()));
  }

  aiTranscript.cloudEnabled = true;
  aiTranscript.primedAssets = Object.values(aiTranscript.segments).filter(segment => segment.static).length;
  aiTranscript.staticAssets = aiTranscript.primedAssets === Object.keys(aiTranscript.segments).length;
}
for (const [subjectId, payload] of payloadById) {
  await primeAiTranscript(payload, subjectId);
}

manifest.cloudEnabled = true;
manifest.primedAssets = Object.values(manifest.segments).filter(segment => segment.static).length;
manifest.staticAssets = manifest.primedAssets === Object.keys(manifest.segments).length;

const mergedAiTranscript = mergedManifestData.aiTranscript;
if (mergedAiTranscript?.segments) {
  for (const [segmentId, segment] of Object.entries(mergedAiTranscript.segments)) {
    segment.static = [...payloadById.values()].some(payload =>
      Boolean(payload.aiTranscript?.segments?.[segmentId]?.static)
    );
  }
  mergedAiTranscript.cloudEnabled = true;
  mergedAiTranscript.primedAssets = Object.values(mergedAiTranscript.segments).filter(segment => segment.static).length;
  mergedAiTranscript.staticAssets = mergedAiTranscript.primedAssets === Object.keys(mergedAiTranscript.segments).length;
}

function writeJsonAtomic(filePath, value) {
  const temporaryPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, JSON.stringify(value));
  fs.renameSync(temporaryPath, filePath);
}

writeJsonAtomic(mergedManifestPath, mergedManifestData);
for (const [subjectId, payload] of payloadById) {
  const payloadPath = path.join(rootDir, 'dist', 'reels', index.subjects.find(subject => subject.id === subjectId).payloadUrl);
  writeJsonAtomic(payloadPath, payload);
}

console.log(`✅ Narration prime complete: ${generated} generated, ${reused} reused.`);
if (aiGenerated > 0 || aiReused > 0) {
  console.log(`✅ AI transcript prime complete: ${aiGenerated} generated, ${aiReused} reused.`);
}
