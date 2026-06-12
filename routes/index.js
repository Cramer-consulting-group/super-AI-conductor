const express  = require("express");
const router   = express.Router();
const os       = require("os");
const multer   = require("multer");

const { planGoal }       = require("../tools/workflow-planner");
const { listIssues, postComment } = require("../tools/github");
const { synthesize }     = require("../tools/voice");
const { transcribeFile } = require("../tools/stt");

// ── Skills ───────────────────────────────────────────────────────────────────
router.get("/skills", (req, res) => {
  res.json({ skills: ["plan", "github-issues", "github-comment", "tts", "stt"] });
});

// ── Workflow Planner ──────────────────────────────────────────────────────────
router.post("/plan", async (req, res) => {
  try {
    const { goal } = req.body;
    if (!goal) return res.status(400).json({ error: "goal is required" });
    const plan = await planGoal(goal);
    res.json(plan);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// ── GitHub ────────────────────────────────────────────────────────────────────
router.get("/github/issues", async (req, res) => {
  try {
    const issues = await listIssues();
    res.json({ issues });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

router.post("/github/comment", async (req, res) => {
  try {
    const { issue_number, body } = req.body;
    if (!issue_number || !body) return res.status(400).json({ error: "issue_number and body required" });
    const result = await postComment(issue_number, body);
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// ── TTS ───────────────────────────────────────────────────────────────────────
router.post("/voice/tts", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: "text is required" });
    const audioBuffer = await synthesize(text);
    res.set("Content-Type", "audio/mpeg");
    res.send(audioBuffer);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// ── STT ───────────────────────────────────────────────────────────────────────
const upload = multer({ dest: os.tmpdir() });

router.post("/voice/stt", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No audio file uploaded" });
    const result = await transcribeFile(req.file.path, req.file.mimetype || "audio/webm");
    res.json({ transcript: result.text });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
