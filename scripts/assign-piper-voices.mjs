/**
 * Assign Piper TTS voices to all narration segments and fix version hashes.
 * 
 * Architecture:
 * - Deterministic narration (seg-*): profile = Piper (TTS provider), voice = per-segment Piper voice
 * - AI transcript narration (aiseg-*): profile = Groq/qwen (TEXT generation provider), voice = per-segment Piper voice
 *   - The Groq transcript text is looked up from cache at narration time
 *   - Piper TTS's that transcript text using the segment's assigned voice
 * - Version hashes computed per manifest using each manifest's own profileHash
 */

import fs from 'node:fs';
import path from 'node:path';

const contentPath = path.resolve(process.cwd(), 'dist', 'reels', 'content.json');
const payload = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

const PIPER_VOICES = [
  'en_US-amy-medium',      // warm, conversational female
  'en_US-ljspeech-medium', // clear, articulate female
  'en_US-ryan-medium',     // steady, neutral male
];

function hashString(value = '') {
  let hash = 2166136261;
  const text = String(value);
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function profileSignature(profile) {
  return [
    profile.provider,
    profile.modelVersion,
    profile.voice,
    profile.languageCode,
    Number(profile.pace).toFixed(2),
    profile.encoding,
    profile.ssmlProfile,
    Number(profile.pronunciationVersion || 1)
  ].join('|');
}

const piperProfile = {
  provider: 'piper',
  modelVersion: 'piper-v1',
  voice: 'en_US-amy-medium',
  languageCode: 'en-US',
  pace: 1.0,
  encoding: 'wav',
  ssmlProfile: 'plain-v1',
  pronunciationVersion: 2
};

const groqProfile = {
  provider: 'groq',
  modelVersion: 'qwen/qwen3.8-27b',
  voice: 'qwen',
  languageCode: 'en-US',
  pace: 1.0,
  encoding: 'mp3',
  ssmlProfile: 'plain-v1',
  pronunciationVersion: 2
};

const piperProfileHash = hashString(profileSignature(piperProfile));
const groqProfileHash = hashString(profileSignature(groqProfile));

console.log('Piper profileHash:', piperProfileHash);
console.log('Groq profileHash:', groqProfileHash);

function assignVoiceToSegment(segment, profileHash) {
  // Pick a voice deterministically based on segment id
  const hashNum = parseInt(hashString(segment.id), 36);
  const voiceIndex = hashNum % PIPER_VOICES.length;
  const voice = PIPER_VOICES[voiceIndex];
  segment.voice = voice;
  const version = hashString(`${profileHash}|${segment.textHash}`);
  segment.version = version;
  return { voice, version };
}

// Process deterministic narration segments -> Piper profile
const narration = payload.narration;
if (narration && narration.segments) {
  narration.profile = piperProfile;
  narration.profileHash = piperProfileHash;
  narration.cloudEnabled = false;
  narration.staticAssets = false;
  narration.primedAssets = 0;

  let detCount = 0;
  for (const [id, seg] of Object.entries(narration.segments)) {
    assignVoiceToSegment(seg, piperProfileHash);
    detCount++;
  }
  console.log(`Deterministic segments: ${detCount} voices assigned (Piper profile)`);
}

// Process AI transcript segments -> Groq profile (text gen), Piper voice (TTS)
const aiTranscript = payload.aiTranscript;
if (aiTranscript && aiTranscript.segments) {
  // Keep Groq profile for text generation; only change voice per segment for TTS
  aiTranscript.profile = groqProfile;
  aiTranscript.profileHash = groqProfileHash;
  aiTranscript.cloudEnabled = false;
  aiTranscript.staticAssets = false;
  aiTranscript.primedAssets = 0;

  let aiCount = 0;
  for (const [id, seg] of Object.entries(aiTranscript.segments)) {
    assignVoiceToSegment(seg, groqProfileHash);
    aiCount++;
  }
  console.log(`AI transcript segments: ${aiCount} voices assigned (Groq profile, Piper TTS voice)`);
}

fs.writeFileSync(contentPath, JSON.stringify(payload));
console.log('\n✅ content.json updated with Piper TTS voices and correct version hashes');
