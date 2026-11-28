import { synthesizePiperSegments, listPiperVoices } from './piper-tts.mjs';
import fs from 'node:fs';
import path from 'node:path';

const contentPath = path.resolve(process.cwd(), 'dist', 'reels', 'content.json');
const payload = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
const segments = Object.values(payload.narration.segments);

// Pick 5 representative segments for voice testing
const testSegments = segments.filter(s =>
  s.text && s.text.length > 20 && s.text.length < 200
).slice(0, 5);

console.log('Available Piper voices:');
for (const v of listPiperVoices()) {
  console.log(`  ${v.name.padEnd(22)} ${v.gender.padEnd(8)} ${v.style} — ${v.bestFor}`);
  console.log(`    Model: ${v.modelExists ? '✅ present' : '❌ missing'}`);
}

console.log(`\nTesting ${testSegments.length} segments with each voice...\n`);

for (const voice of ['en_US-amy-medium', 'en_US-ljspeech-medium', 'en_US-ryan-medium']) {
  console.log(`\n=== Voice: ${voice} ===`);
  const results = await synthesizePiperSegments({
    segments: testSegments,
    voice,
    concurrency: 1
  });
  for (const r of results) {
    if (r.ok) {
      const seg = testSegments.find(s => s.id === r.segmentId);
      console.log(`  ✅ ${seg.id} (${seg.chars} chars): ${r.bytes.toLocaleString()} bytes — "${seg.text.substring(0, 50)}..."`);
    } else {
      console.log(`  ❌ ${r.segmentId}: ${r.error}`);
    }
  }
}

console.log('\nDone. WAV files are in dist/reels/audio/');
