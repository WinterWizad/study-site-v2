import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const PIPER_DIR = path.resolve(process.cwd(), 'tools', 'piper', 'piper');
const PIPER_EXE = path.join(PIPER_DIR, 'piper.exe');
const VOICES_DIR = path.resolve(process.cwd(), 'tools', 'piper', 'voices');
const OUTPUT_DIR = path.resolve(process.cwd(), 'dist', 'reels', 'audio');

export const PIPER_VOICES = {
  'en_US-amy-medium': {
    model: 'en_US-amy-medium.onnx',
    gender: 'female',
    style: 'warm, conversational',
    bestFor: 'peer-to-peer explanation, casual tone'
  },
  'en_US-ljspeech-medium': {
    model: 'en_US-ljspeech-medium.onnx',
    gender: 'female',
    style: 'clear, articulate, classic',
    bestFor: 'educational content, technical terms'
  },
  'en_US-ryan-medium': {
    model: 'en_US-ryan-medium.onnx',
    gender: 'male',
    style: 'steady, neutral, professional',
    bestFor: 'formal presentations, definitions'
  }
};

const DEFAULT_VOICE = 'en_US-amy-medium';

function voiceModelPath(voiceName) {
  const voice = PIPER_VOICES[voiceName];
  if (!voice) throw new Error(`Unknown Piper voice: ${voiceName}`);
  return path.join(VOICES_DIR, voice.model);
}

function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

function runPiper({ modelPath, text, outputWavPath, noiseScale, lengthScale, noiseW, sentenceSilence }) {
  return new Promise((resolve, reject) => {
    const tmpText = path.join(OUTPUT_DIR, `piper-input-${process.pid}-${Date.now()}.txt`);
    fs.writeFileSync(tmpText, text, 'utf8');

    const child = spawn(PIPER_EXE, [
      '-m', modelPath,
      '-f', outputWavPath,
      '--noise_scale', String(noiseScale),
      '--length_scale', String(lengthScale),
      '--noise_w', String(noiseW),
      '--sentence_silence', String(sentenceSilence)
    ], {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stderr = '';
    child.stderr.on('data', (data) => { stderr += data.toString(); });

    // Pipe the text file content to piper's stdin
    const textStream = fs.createReadStream(tmpText);
    textStream.pipe(child.stdin);

    child.on('close', (code) => {
      try { fs.rmSync(tmpText, { force: true }); } catch {}
      if (code === 0) {
        resolve({ wavPath: outputWavPath, stderr });
      } else {
        try { fs.rmSync(outputWavPath, { force: true }); } catch {}
        reject(new Error(`Piper exited with code ${code}. stderr: ${stderr}`));
      }
    });

    child.on('error', (error) => {
      try { fs.rmSync(outputWavPath, { force: true }); } catch {}
      try { fs.rmSync(tmpText, { force: true }); } catch {}
      reject(error);
    });
  });
}

export async function synthesizePiperSpeech({
  text,
  voice = DEFAULT_VOICE,
  outputPath = null,
  noiseScale = 0.667,
  lengthScale = 1.0,
  noiseW = 0.8,
  sentenceSilence = 0.2
}) {
  const modelPath = voiceModelPath(voice);
  if (!fs.existsSync(modelPath)) {
    throw new Error(`Piper model not found: ${modelPath}`);
  }

  ensureOutputDir();

  const outFile = outputPath || path.join(OUTPUT_DIR, `piper-${Date.now()}.wav`);

  await runPiper({
    modelPath,
    text,
    outputWavPath: outFile,
    noiseScale,
    lengthScale,
    noiseW,
    sentenceSilence
  });

  if (!fs.existsSync(outFile) || fs.statSync(outFile).size < 1000) {
    throw new Error(`Piper produced no usable audio at ${outFile}`);
  }

  const stats = fs.statSync(outFile);
  return {
    path: outFile,
    bytes: stats.size,
    voice,
    format: 'wav',
    sampleRate: 22050
  };
}

export async function synthesizePiperSegments({
  segments,
  voice = DEFAULT_VOICE,
  concurrency = 2
}) {
  ensureOutputDir();
  const results = [];
  let cursor = 0;

  async function worker() {
    while (cursor < segments.length) {
      const index = cursor;
      cursor += 1;
      const segment = segments[index];
      try {
        const outFile = path.join(
          OUTPUT_DIR,
          `${segment.id}-${segment.version}.wav`
        );
        const result = await synthesizePiperSpeech({
          text: segment.text,
          voice,
          outputPath: outFile
        });
        results.push({ segmentId: segment.id, ...result, ok: true });
      } catch (error) {
        results.push({ segmentId: segment.id, ok: false, error: error.message });
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, segments.length) }, () => worker())
  );

  return results;
}

export function listPiperVoices() {
  return Object.entries(PIPER_VOICES).map(([name, info]) => ({
    name,
    ...info,
    modelPath: path.join(VOICES_DIR, info.model),
    modelExists: fs.existsSync(path.join(VOICES_DIR, info.model))
  }));
}
