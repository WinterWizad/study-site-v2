import { synthesizePiperSegments } from './piper-tts.mjs';
import fs from 'node:fs';
import path from 'node:path';

const contentPath = path.resolve(process.cwd(), 'dist', 'reels', 'content.json');
const payload = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
const segments = Object.values(payload.narration.segments || {});

const piperSegments = segments.filter(s => s.text && s.text.trim());
console.log(`Total segments: ${segments.length}`);
console.log(`Segments with text: ${piperSegments.length}`);

if (!piperSegments.length) {
  console.log('No segments to generate.');
  process.exit(0);
}

const voice = payload.narration.profile.voice || 'en_US-amy-medium';
console.log(`Voice: ${voice}`);
console.log(`Generating ${piperSegments.length} WAV files...`);

const results = await synthesizePiperSegments({
  segments: piperSegments,
  voice,
  concurrency: 2
});

const succeeded = results.filter(r => r.ok);
const failed = results.filter(r => !r.ok);

// Mark succeeded segments as static in the manifest
const narration = payload.narration;
for (const r of succeeded) {
  const seg = narration.segments[r.segmentId];
  if (seg) seg.static = true;
}
narration.primedAssets = succeeded.length;
narration.staticAssets = succeeded.length === piperSegments.length;
narration.cloudEnabled = false;

fs.writeFileSync(contentPath, JSON.stringify(payload));

console.log(`\n✅ Piper generation complete: ${succeeded.length} generated, ${failed.length} failed.`);
if (failed.length) {
  failed.forEach(r => console.log(`  ❌ ${r.segmentId}: ${r.error}`));
}
