// tools/stt.js
// xAI STT - POST https://api.x.ai/v1/audio/transcriptions

const fetch    = require("node-fetch");
const FormData = require("form-data");
const fs       = require("fs");
const path     = require("path");

const XAI_API_KEY = process.env.XAI_API_KEY;
const STT_URL     = "https://api.x.ai/v1/audio/transcriptions";

/**
 * transcribeFile(filePath, mimeType)
 * filePath - absolute path to temp audio file on disk
 * mimeType - e.g. "audio/webm", "audio/mp4", "audio/wav"
 * Returns  - { text: "..." }
 */
async function transcribeFile(filePath, mimeType = "audio/webm") {
  if (!XAI_API_KEY) throw new Error("XAI_API_KEY is not set");

  const form = new FormData();
  form.append("file", fs.createReadStream(filePath), {
    contentType: mimeType,
    filename:    path.basename(filePath),
  });
  form.append("model", "grok-stt-1");

  const res = await fetch(STT_URL, {
    method:  "POST",
    headers: {
      Authorization: `Bearer ${XAI_API_KEY}`,
      ...form.getHeaders(),
    },
    body: form,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`xAI STT error ${res.status}: ${err}`);
  }

  return res.json(); // { text: "..." }
}

module.exports = { transcribeFile };
