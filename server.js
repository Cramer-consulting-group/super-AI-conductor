require("dotenv").config();
const express = require("express");
const path    = require("path");
const routes  = require("./routes/index");

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/health", (req, res) => res.json({ status: "ok", ts: new Date().toISOString() }));

app.use("/api", routes);

app.listen(PORT, () => console.log(`super-AI-conductor running on http://localhost:${PORT}`));
