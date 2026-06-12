// tools/workflow-planner.js
// Sends a goal to Grok and returns a structured task plan.

const fetch = require("node-fetch");

const XAI_API_KEY = process.env.XAI_API_KEY;
const CHAT_URL    = "https://api.x.ai/v1/chat/completions";
const MODEL       = "grok-3";

async function planGoal(goal) {
  if (!XAI_API_KEY) throw new Error("XAI_API_KEY is not set");

  const res = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      Authorization:   `Bearer ${XAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are an operational planning assistant. " +
            "Given a goal, return a JSON object with keys: " +
            "goal (string), tasks (array of {id, title, status, priority}). " +
            "status is always 'pending' initially. priority is high/medium/low. " +
            "Return ONLY valid JSON, no markdown.",
        },
        { role: "user", content: goal },
      ],
      temperature: 0.3,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`xAI chat error ${res.status}: ${err}`);
  }

  const data = await res.json();
  const raw  = data.choices[0].message.content.trim();

  try {
    return JSON.parse(raw);
  } catch {
    return { goal, raw };
  }
}

module.exports = { planGoal };
