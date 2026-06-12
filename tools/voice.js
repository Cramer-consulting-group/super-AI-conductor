// tools/voice.js
// xAI TTS - POST https://api.x.ai/v1/audio/speech

const fetch = require("node-fetch");

const XAI_API_KEY = process.env.XAI_API_KEY;
const TTS_URL     = "https://api.x.ai/v1/audio/speech";

/**
 * synthesize(text) - calls xAI TTS and returns an audio Buffer
 */
async function synthesize(text, voice = "shimmer") {
  if (!XAI_API_KEY) throw new Error("XAI_API_KEY is not set");

  const res = await fetch(TTS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization:  `Bearer ${XAI_API_KEY}`,
    },
    body: JSON.stringify({
      model:           "grok-tts-1",
      input:           text,
      voice:           voice,
      response_format: "mp3",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`xAI TTS error ${res.status}: ${err}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

module.exports = { synthesize };
