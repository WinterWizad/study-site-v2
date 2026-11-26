import { Buffer } from 'node:buffer';

export const GOOGLE_TTS_ENDPOINT = 'https://texttospeech.googleapis.com/v1/text:synthesize';

export class GoogleTtsError extends Error {
  constructor(message, { status = 502, code = 'tts_failed', cause } = {}) {
    super(message, { cause });
    this.name = 'GoogleTtsError';
    this.status = status;
    this.code = code;
  }
}

export async function synthesizeGoogleSpeech({
  text,
  profile,
  env = process.env,
  fetchImpl = globalThis.fetch,
  timeoutMs = 20000
}) {
  const apiKey = String(env.GOOGLE_CLOUD_TTS_API_KEY || '').trim();
  if (!apiKey) {
    throw new GoogleTtsError('Google Cloud Text-to-Speech is not configured.', {
      status: 503,
      code: 'tts_not_configured'
    });
  }

  const input = String(text || '').trim();
  if (!input) {
    throw new GoogleTtsError('The narration segment is empty.', {
      status: 400,
      code: 'empty_segment'
    });
  }

  const maxChars = Math.max(100, Number(env.GOOGLE_TTS_MAX_SEGMENT_CHARS) || 5000);
  if (input.length > maxChars) {
    throw new GoogleTtsError(`The narration segment exceeds ${maxChars} characters.`, {
      status: 413,
      code: 'segment_too_long'
    });
  }

  const audioConfig = {
    audioEncoding: 'MP3'
  };
  const pace = Number(profile?.pace);
  if (Number.isFinite(pace) && pace >= 0.25 && pace <= 2 && pace !== 1) {
    audioConfig.speakingRate = pace;
  }

  const requestAudio = async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetchImpl(GOOGLE_TTS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          input: { text: input },
          voice: {
            languageCode: profile?.languageCode || 'en-US',
            name: profile?.voice
          },
          audioConfig
        }),
        signal: controller.signal
      });
    } catch (error) {
      throw new GoogleTtsError('Google Cloud Text-to-Speech could not be reached.', {
        status: 502,
        code: 'tts_network_error',
        cause: error
      });
    } finally {
      clearTimeout(timeout);
    }
  };

  let response;
  try {
    response = await requestAudio();
  } catch (error) {
    throw error;
  }

  let errorDetail = '';
  if (!response.ok) {
    try {
      const payload = await response.json();
      errorDetail = payload?.error?.message || '';
    } catch {
      errorDetail = '';
    }

    // Google currently documents Chirp 3 HD pace controls, while another
    // voice overview still says the parameter is unsupported. Retry once
    // without pace if the API rejects that field. Plain text remains the
    // portable baseline until the provider documentation converges.
    if (response.status === 400 && audioConfig.speakingRate && /speaking[_ ]?rate/i.test(errorDetail)) {
      delete audioConfig.speakingRate;
      response = await requestAudio();
      if (!response.ok) {
        try {
          const payload = await response.json();
          errorDetail = payload?.error?.message || '';
        } catch {
          errorDetail = '';
        }
      }
    }
  }

  if (!response.ok) {
    const status = response.status === 429 ? 429 : response.status === 400 ? 400 : 502;
    const code = response.status === 429 ? 'tts_rate_limited' : 'tts_failed';
    throw new GoogleTtsError(errorDetail || `Google Cloud Text-to-Speech returned ${response.status}.`, {
      status,
      code
    });
  }

  const payload = await response.json();
  if (!payload?.audioContent) {
    throw new GoogleTtsError('Google Cloud Text-to-Speech returned no audio.', {
      status: 502,
      code: 'tts_empty_audio'
    });
  }

  return Buffer.from(payload.audioContent, 'base64');
}
