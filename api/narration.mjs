import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { GoogleTtsError, synthesizeGoogleSpeech } from '../reels/google-tts.mjs';
import { narrationContentType, isValidNarrationAsset } from '../scripts/narration-assets.mjs';
import { synthesizePiperSpeech } from '../tools/piper/piper-tts.mjs';
import { cleanForTTS } from '../scripts/reel-adapter.mjs';

const SEGMENT_ID_RE = /^(?:seg|aiseg)-[a-z0-9]+$/;
const DEFAULT_DAILY_CHAR_BUDGET = 100000;
const DEFAULT_MONTHLY_CHAR_BUDGET = 900000;
const DEFAULT_REQUESTS_PER_MINUTE = 60;

const localQuota = {
  dayKey: '',
  monthKey: '',
  dayChars: 0,
  monthChars: 0,
  minuteKey: '',
  requests: 0
};

function utcKeys(now = new Date()) {
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return {
    dayKey: `${year}-${month}-${day}`,
    monthKey: `${year}-${month}`,
    minuteKey: `${year}-${month}-${day}-${Math.floor(now.getUTCMinutes() / 5)}`
  };
}

function numberFromEnv(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

// Groq transcript cache lookup for AI narration segments.
// Cache keys mirror scripts/reel-adapter.mjs: sha256(v3\0<model>\0<note>).slice(0,32)
const PROMPT_VERSION = 'v3';
const GROQ_MODELS = ['qwen/qwen3.8-27b', 'openai/gpt-oss-20b', 'openai/gpt-oss-120b'];

function groqCacheKey(note, modelId) {
  const h = createHash('sha256');
  h.update(PROMPT_VERSION);
  h.update('\0');
  h.update(modelId);
  h.update('\0');
  h.update(note.trim());
  return h.digest('hex').slice(0, 32);
}

function findGroqTranscript(note, cacheDir) {
  for (const modelId of GROQ_MODELS) {
    const key = groqCacheKey(note, modelId);
    const cp = path.join(cacheDir, `${key}.json`);
    if (fs.existsSync(cp)) {
      try {
        const cached = JSON.parse(fs.readFileSync(cp, 'utf8'));
        if (cached.transcript) return cached.transcript;
      } catch {}
    }
  }
  return null;
}

function quotaStoreUnavailable(message, cause) {
  const error = new Error(message, { cause });
  error.code = 'quota_store_unavailable';
  return error;
}

async function reserveWithUpstash({ env, fetchImpl, chars }) {
  const url = String(env.UPSTASH_REDIS_REST_URL || '').trim();
  const token = String(env.UPSTASH_REDIS_REST_TOKEN || '').trim();
  if (!url && !token) return null;
  if (!url || !token) {
    throw quotaStoreUnavailable('The durable narration quota store is only partly configured.');
  }

  const now = new Date();
  const { dayKey, monthKey, minuteKey } = utcKeys(now);
  const dailyBudget = numberFromEnv(env.GOOGLE_TTS_DAILY_CHAR_BUDGET, DEFAULT_DAILY_CHAR_BUDGET);
  const monthlyBudget = numberFromEnv(env.GOOGLE_TTS_MONTHLY_CHAR_BUDGET, DEFAULT_MONTHLY_CHAR_BUDGET);
  const requestBudget = numberFromEnv(
    env.GOOGLE_TTS_REQUESTS_PER_FIVE_MINUTES,
    DEFAULT_REQUESTS_PER_MINUTE * 5
  );
  const script = `
    local daily = tonumber(redis.call('GET', KEYS[1]) or '0')
    local monthly = tonumber(redis.call('GET', KEYS[2]) or '0')
    local amount = tonumber(ARGV[1])
    local requestBudget = tonumber(ARGV[2])
    local dailyBudget = tonumber(ARGV[3])
    local monthlyBudget = tonumber(ARGV[4])
    local requests = redis.call('INCR', KEYS[3])
    if redis.call('TTL', KEYS[3]) < 0 then redis.call('EXPIRE', KEYS[3], ARGV[7]) end
    if requests > requestBudget then return {0, daily, monthly, requests} end
    if daily + amount > dailyBudget then return {0, daily, monthly, requests} end
    if monthly + amount > monthlyBudget then return {0, daily, monthly, requests} end
    daily = redis.call('INCRBY', KEYS[1], amount)
    monthly = redis.call('INCRBY', KEYS[2], amount)
    if redis.call('TTL', KEYS[1]) < 0 then redis.call('EXPIRE', KEYS[1], ARGV[5]) end
    if redis.call('TTL', KEYS[2]) < 0 then redis.call('EXPIRE', KEYS[2], ARGV[6]) end
    return {1, daily, monthly, requests}
  `;

  let response;
  try {
    response = await fetchImpl(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify([
        'EVAL',
        script,
        '3',
        `quick-reels:tts:day:${dayKey}`,
        `quick-reels:tts:month:${monthKey}`,
        `quick-reels:tts:window:${minuteKey}`,
        String(chars),
        String(requestBudget),
        String(dailyBudget),
        String(monthlyBudget),
        String(60 * 60 * 48),
        String(60 * 60 * 24 * 35),
        String(60 * 10)
      ])
    });
  } catch (error) {
    throw quotaStoreUnavailable('The durable narration quota store could not be reached.', error);
  }

  if (!response.ok) {
    throw quotaStoreUnavailable(`The durable narration quota store returned ${response.status}.`);
  }

  let payload;
  try {
    payload = await response.json();
  } catch (error) {
    throw quotaStoreUnavailable('The durable narration quota store returned an invalid response.', error);
  }
  if (payload?.error) {
    throw quotaStoreUnavailable(`The durable narration quota store rejected the quota check: ${payload.error}.`);
  }

  const result = Array.isArray(payload?.result) ? payload.result : [];
  if (result.length < 4) {
    throw quotaStoreUnavailable('The durable narration quota store returned an invalid result.');
  }
  if (Number(result[0]) !== 1) {
    const requests = Number(result[3] || 0);
    const error = new Error(requests > requestBudget
      ? 'The Google narration request rate is too high.'
      : 'The Google narration character budget is exhausted.');
    error.code = requests > requestBudget ? 'rate_limited' : 'quota_exhausted';
    error.daily = Number(result[1] || 0);
    error.monthly = Number(result[2] || 0);
    error.requests = requests;
    throw error;
  }

  return {
    daily: Number(result[1] || 0),
    monthly: Number(result[2] || 0),
    requests: Number(result[3] || 0)
  };
}

async function reserveLocalQuota({ env, chars, now = new Date() }) {
  const { dayKey, monthKey, minuteKey } = utcKeys(now);
  if (localQuota.dayKey !== dayKey) {
    localQuota.dayKey = dayKey;
    localQuota.dayChars = 0;
  }
  if (localQuota.monthKey !== monthKey) {
    localQuota.monthKey = monthKey;
    localQuota.monthChars = 0;
  }
  if (localQuota.minuteKey !== minuteKey) {
    localQuota.minuteKey = minuteKey;
    localQuota.requests = 0;
  }

  const dailyBudget = numberFromEnv(env.GOOGLE_TTS_DAILY_CHAR_BUDGET, DEFAULT_DAILY_CHAR_BUDGET);
  const monthlyBudget = numberFromEnv(env.GOOGLE_TTS_MONTHLY_CHAR_BUDGET, DEFAULT_MONTHLY_CHAR_BUDGET);
  const requestBudget = numberFromEnv(
    env.GOOGLE_TTS_REQUESTS_PER_FIVE_MINUTES,
    DEFAULT_REQUESTS_PER_MINUTE * 5
  );

  localQuota.requests += 1;
  if (localQuota.requests > requestBudget) {
    const error = new Error('The Google narration request rate is too high.');
    error.code = 'rate_limited';
    throw error;
  }
  if (localQuota.dayChars + chars > dailyBudget) {
    const error = new Error('The Google narration daily character budget is exhausted.');
    error.code = 'quota_exhausted';
    throw error;
  }
  if (localQuota.monthChars + chars > monthlyBudget) {
    const error = new Error('The Google narration monthly character budget is exhausted.');
    error.code = 'quota_exhausted';
    throw error;
  }

  localQuota.dayChars += chars;
  localQuota.monthChars += chars;
  return { daily: localQuota.dayChars, monthly: localQuota.monthChars };
}

export async function reserveNarrationQuota({
  env = process.env,
  fetchImpl = globalThis.fetch,
  chars
}) {
  const amount = Math.max(1, Number(chars) || 1);
  const durable = await reserveWithUpstash({ env, fetchImpl, chars: amount });
  if (durable) return durable;

  const serverless = Boolean(String(env.VERCEL || '').trim() || env.VERCEL_ENV);
  const allowLocal = String(env.GOOGLE_TTS_ALLOW_LOCAL_QUOTA || '').toLowerCase() === 'true';
  if (serverless && !allowLocal) {
    const error = new Error('Durable narration quota storage is not configured.');
    error.code = 'quota_store_unavailable';
    throw error;
  }

  return reserveLocalQuota({ env, chars: amount });
}

function requestQuery(request) {
  const raw = request?.query || {};
  if (raw && typeof raw.get === 'function') {
    return {
      segment: raw.get('segment') || '',
      version: raw.get('v') || '',
      voice: raw.get('voice') || ''
    };
  }

  const url = new URL(request?.url || request?.originalUrl || '/', 'https://narration.invalid');
  return {
    segment: url.searchParams.get('segment') || '',
    version: url.searchParams.get('v') || '',
    voice: url.searchParams.get('voice') || ''
  };
}

function sendJson(response, status, payload, headers = {}) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers
  });
  response.end(JSON.stringify(payload));
}

export function createNarrationHandler({
  manifest,
  aiTranscriptManifest,
  env = process.env,
  fetchImpl = globalThis.fetch,
  reserveQuota = reserveNarrationQuota
}) {
  const inFlightAudio = new Map();

  function findSegment(segmentId) {
    const seg = manifest?.segments?.[segmentId];
    if (seg) return seg;
    return aiTranscriptManifest?.segments?.[segmentId] || null;
  }

  function findProfile(segmentId) {
    if (manifest?.segments?.[segmentId]) return manifest.profile;
    if (aiTranscriptManifest?.segments?.[segmentId]) return aiTranscriptManifest.profile;
    return manifest?.profile;
  }

  return async function narrationHandler(request, response) {
    if (!['GET', 'HEAD'].includes(request.method)) {
      sendJson(response, 405, { error: 'method_not_allowed', message: 'Use GET or HEAD.' }, {
        Allow: 'GET, HEAD'
      });
      return;
    }

    const { segment: segmentId, version, voice: requestedVoice } = requestQuery(request);
    if (!SEGMENT_ID_RE.test(segmentId)) {
      sendJson(response, 400, {
        error: 'invalid_segment',
        message: 'A known narration segment id is required.'
      });
      return;
    }

    const segment = findSegment(segmentId);
    if (!segment || segment.version !== version) {
      sendJson(response, 404, {
        error: 'unknown_segment',
        message: 'This narration segment is not in the published manifest.'
      });
      return;
    }

    const etag = `"${segment.id}-${segment.version}"`;
    if (request.headers?.['if-none-match'] === etag) {
      response.writeHead(304, {
        'Cache-Control': 'public, max-age=31536000, immutable, s-maxage=31536000',
        ETag: etag
      });
      response.end();
      return;
    }

    if (request.method === 'HEAD') {
      response.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=31536000, immutable, s-maxage=31536000',
        ETag: etag,
        'X-Content-Type-Options': 'nosniff'
      });
      response.end();
      return;
    }

    try {
      const cacheKey = `${segment.id}-${segment.version}`;
      const apiKey = String(env.GOOGLE_CLOUD_TTS_API_KEY || '').trim();
      let audio;
      let contentType = 'audio/mpeg';

      if (apiKey) {
        let audioPromise = inFlightAudio.get(cacheKey);
        if (!audioPromise) {
          audioPromise = (async () => {
            await reserveQuota({ env, fetchImpl, chars: segment.chars });
            return synthesizeGoogleSpeech({
              text: segment.text,
              profile: findProfile(segmentId),
              env,
              fetchImpl
            });
          })();
          inFlightAudio.set(cacheKey, audioPromise);
        }

        try {
          audio = await audioPromise;
        } finally {
          if (inFlightAudio.get(cacheKey) === audioPromise) {
            inFlightAudio.delete(cacheKey);
          }
        }
      } else {
        // Local Piper narration: generate WAV on-demand, cache to disk, serve.
        const rootDir = process.cwd();
        const audioFileName = `${segment.id}-${segment.version}.wav`;
        const audioFilePath = path.join(rootDir, 'dist', 'reels', 'audio', audioFileName);

        // Determine TTS input text: AI segments use the Groq transcript (not the plain note)
        let ttsText = segment.text;
        if (segment.id.startsWith('aiseg-')) {
          const cacheDir = path.join(rootDir, '.cache', 'reels-ai');
          const groqTranscript = findGroqTranscript(segment.text, cacheDir);
          if (groqTranscript) {
            ttsText = cleanForTTS(groqTranscript);
          }
        }

        if (!fs.existsSync(audioFilePath) || !isValidNarrationAsset(audioFilePath)) {
          // Generate on first request
          // Use requested voice from query param (piper-amy, piper-ljspeech, piper-ryan)
          // Map frontend values to Piper model names
          const voiceMap = {
            'amy': 'en_US-amy-medium',
            'ljspeech': 'en_US-ljspeech-medium',
            'ryan': 'en_US-ryan-medium'
          };
          const piperVoice = requestedVoice && voiceMap[requestedVoice]
            ? voiceMap[requestedVoice]
            : (segment.voice || 'en_US-amy-medium');
          const result = await synthesizePiperSpeech({
            text: ttsText,
            voice: piperVoice,
            outputPath: audioFilePath
          });
          audio = fs.readFileSync(result.path);
          contentType = narrationContentType(result.path);
        } else {
          audio = fs.readFileSync(audioFilePath);
          contentType = narrationContentType(audioFilePath);
        }
      }

      response.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': audio.length,
        'Cache-Control': 'public, max-age=31536000, immutable, s-maxage=31536000',
        ETag: etag,
        'X-Content-Type-Options': 'nosniff',
        'X-Narration-Segment': segment.id
      });
      response.end(audio);
    } catch (error) {
      if (error?.code === 'quota_exhausted') {
        sendJson(response, 429, {
          error: 'quota_exhausted',
          message: 'Narration is temporarily paused to protect the free-tier quota.'
        });
        return;
      }
      if (error?.code === 'rate_limited') {
        sendJson(response, 429, {
          error: 'rate_limited',
          message: 'Too many narration requests. Try again shortly.'
        }, {
          'Retry-After': '60'
        });
        return;
      }
      if (error?.code === 'quota_store_unavailable') {
        sendJson(response, 503, {
          error: 'quota_store_unavailable',
          message: 'Narration is temporarily unavailable. The transcript remains available.'
        });
        return;
      }
      if (error instanceof GoogleTtsError) {
        sendJson(response, error.status, {
          error: error.code,
          message: error.message
        });
        return;
      }

      console.error('Quick Reels narration failed.', error);
      sendJson(response, 503, {
        error: 'narration_unavailable',
        message: 'Narration is temporarily unavailable. The transcript remains available.'
      });
    }
  };
}

let runtimeManifestPromise = null;
let runtimeHandlerPromise = null;

export function loadRuntimeNarrationManifest(rootDir = process.cwd()) {
  if (!runtimeManifestPromise) {
    runtimeManifestPromise = (async () => {
      const mergedPath = path.join(rootDir, 'dist', 'reels', 'narration-manifest.json');
      if (fs.existsSync(mergedPath)) {
        const merged = JSON.parse(fs.readFileSync(mergedPath, 'utf8'));
        if (!merged?.narration?.segments || !merged?.narration?.profile) {
          throw new Error('The built Quick Reels narration manifest is missing.');
        }
        return {
          manifest: merged.narration,
          aiTranscriptManifest: merged.aiTranscript || null
        };
      }

      // Backward compatibility with the pre-multi-subject build output.
      const contentPath = path.join(rootDir, 'dist', 'reels', 'content.json');
      const payload = JSON.parse(fs.readFileSync(contentPath, 'utf8'));
      if (!payload?.narration?.segments || !payload?.narration?.profile) {
        throw new Error('The built Quick Reels narration manifest is missing.');
      }
      return {
        manifest: payload.narration,
        aiTranscriptManifest: payload.aiTranscript || null
      };
    })();
  }
  return runtimeManifestPromise;
}

function loadRuntimeNarrationHandler(rootDir = process.cwd()) {
  if (!runtimeHandlerPromise) {
    runtimeHandlerPromise = loadRuntimeNarrationManifest(rootDir)
      .then(({ manifest, aiTranscriptManifest }) => createNarrationHandler({ manifest, aiTranscriptManifest }));
  }
  return runtimeHandlerPromise;
}

export default async function handler(request, response) {
  try {
    const narrationHandler = await loadRuntimeNarrationHandler();
    return narrationHandler(request, response);
  } catch (error) {
    console.error('Quick Reels narration manifest could not be loaded.', error);
    sendJson(response, 503, {
      error: 'manifest_unavailable',
      message: 'Narration is temporarily unavailable. The transcript remains available.'
    });
  }
}
