import fs from 'node:fs';
import path from 'node:path';

const MIN_NARRATION_AUDIO_BYTES = 128;
const HEADER_BYTES = 4096;

export function hasMp3Signature(bytes) {
  const data = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes || []);
  if (data.length < 4) return false;

  if (data.subarray(0, 3).toString('ascii') === 'ID3') {
    return data.length >= MIN_NARRATION_AUDIO_BYTES;
  }

  const limit = Math.min(data.length - 1, HEADER_BYTES);
  for (let index = 0; index < limit; index += 1) {
    const first = data[index];
    const second = data[index + 1];
    const isFrameSync = first === 0xff && (second & 0xe0) === 0xe0;
    const hasAudioLayer = (second & 0x06) !== 0;
    const hasKnownVersion = (second & 0x18) !== 0x08;
    if (isFrameSync && hasAudioLayer && hasKnownVersion) return true;
  }

  return false;
}

export function hasWavSignature(bytes) {
  const data = Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes || []);
  if (data.length < 12) return false;
  const chunkId = data.subarray(0, 4).toString('ascii');
  if (chunkId !== 'RIFF') return false;
  const format = data.subarray(8, 12).toString('ascii');
  if (format !== 'WAVE') return false;
  return data.length >= MIN_NARRATION_AUDIO_BYTES;
}

export function isValidNarrationAsset(filePath) {
  try {
    const stats = fs.statSync(filePath);
    if (!stats.isFile() || stats.size < MIN_NARRATION_AUDIO_BYTES) return false;

    const handle = fs.openSync(filePath, 'r');
    try {
      const header = Buffer.alloc(Math.min(HEADER_BYTES, stats.size));
      const bytesRead = fs.readSync(handle, header, 0, header.length, 0);
      return hasMp3Signature(header.subarray(0, bytesRead))
        || hasWavSignature(header.subarray(0, bytesRead));
    } finally {
      fs.closeSync(handle);
    }
  } catch {
    return false;
  }
}

export function narrationContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.wav') return 'audio/wav';
  return 'audio/mpeg';
}

export function writeNarrationAsset(outputPath, audio) {
  const bytes = Buffer.isBuffer(audio) ? audio : Buffer.from(audio || []);
  if (!hasMp3Signature(bytes) && !hasWavSignature(bytes)) {
    // Never leave an unusable file where a learner expects valid narration.
    fs.rmSync(outputPath, { force: true });
    throw new Error(`Narration did not return valid audio: ${path.basename(outputPath)}`);
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  const temporaryPath = `${outputPath}.${process.pid}.tmp`;
  fs.writeFileSync(temporaryPath, bytes);
  try {
    // Windows does not replace an existing file with rename. Only a previously
    // invalid asset reaches this path, so removing it is safe.
    fs.rmSync(outputPath, { force: true });
    fs.renameSync(temporaryPath, outputPath);
  } catch (error) {
    fs.rmSync(temporaryPath, { force: true });
    throw error;
  }
}
