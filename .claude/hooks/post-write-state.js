#!/usr/bin/env node
// PostToolUse (Write) — keeps trips/<run>/workflow-state.json in step/version
// sync with every tracked artifact written under trips/<run>/, so a restart
// can resume from disk instead of conversation memory.
const fs = require("fs");
const path = require("path");
const { parseFrontmatter, documentStatus } = require("./lib/frontmatter");
const { readPayload } = require("./lib/hook-io");

const TRACKED_ARTIFACTS = new Set([
  "requirements",
  "execution-plan",
  "weather",
  "transport",
  "accommodation",
  "activities",
  "food",
  "packing",
  "budget",
  "validation",
  "daily-plan",
  "iteration-plan",
  "travel-guide",
]);

readPayload((payload) => {
  // Write creates an artifact; Edit is used to flip the daily plan's
  // documentStatus (draft → approved/rejected) in place — both must re-sync.
  if (payload.tool_name !== "Write" && payload.tool_name !== "Edit") {
    process.exit(0);
  }

  const filePath = payload.tool_input && payload.tool_input.file_path;
  if (!filePath) process.exit(0);

  const norm = filePath.replace(/\\/g, "/");
  const m = norm.match(
    /trips\/([^/]+)\/([a-z]+(?:-[a-z]+)*)(?:-v(\d+))?\.(md|html)$/i,
  );
  if (!m) process.exit(0);

  const [, , artifact, versionStr] = m;
  if (!TRACKED_ARTIFACTS.has(artifact.toLowerCase())) process.exit(0);

  const runDir = path.dirname(filePath);
  const statePath = path.join(runDir, "workflow-state.json");

  let state = {
    run: path.basename(runDir),
    steps: {},
    iteration_count: 0,
    retry_limit: 3,
  };
  if (fs.existsSync(statePath)) {
    try {
      state = JSON.parse(fs.readFileSync(statePath, "utf8"));
    } catch {
      // fall through with the fresh default state
    }
  }

  // Write payloads carry the full content; Edit payloads don't, so read the
  // just-written file from disk (it's the authoritative post-edit state).
  let content = payload.tool_input && payload.tool_input.content;
  if (typeof content !== "string") {
    try {
      content = fs.readFileSync(filePath, "utf8");
    } catch {
      content = "";
    }
  }
  const fields = parseFrontmatter(content);
  const version =
    Number(fields.version) || (versionStr ? Number(versionStr) : 1);

  const ds = documentStatus(fields);
  let status = ds === "approved" || ds === "rejected" ? ds : "completed";
  if (artifact === "validation") {
    if (/Validation Result:\s*FAIL/i.test(content)) status = "failed";
    else if (/Validation Result:\s*PASS/i.test(content)) status = "passed";
  }

  state.steps = state.steps || {};
  const prior = state.steps[artifact];
  if (!prior || version >= (prior.version || 0)) {
    state.steps[artifact] = {
      status,
      artifact: path.basename(filePath),
      version,
    };
  }
  state.updated_at = new Date().toISOString();

  fs.mkdirSync(runDir, { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  process.exit(0);
});
