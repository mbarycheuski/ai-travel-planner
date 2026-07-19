#!/usr/bin/env node
// PostToolUse (Write|Edit) — keeps trips/<run>/workflow-state.json in
// step/version sync with every tracked artifact, so a restart can resume
// from disk instead of conversation memory.
import fs from "fs";
import path from "path";
import { parseFrontmatter, documentStatus } from "./lib/frontmatter.js";
import { readPayload, withFileLock } from "./lib/hook-io.js";
import {
  ARTIFACT_NAMES,
  VALIDATION_ARTIFACT,
  WORKFLOW_STATE_FILENAME,
  StepStatus,
  DocumentStatus,
} from "./lib/workflow-artifacts.js";

const TRIP_ARTIFACT_PATH_REGEX =
  /trips\/([^/]+)\/([a-z]+(?:-[a-z]+)*)(?:-v(\d+))?\.(md|html)$/i;
const VALIDATION_FAIL_REGEX = /Validation Result:\s*FAIL/i;
const VALIDATION_PASS_REGEX = /Validation Result:\s*PASS/i;
const DEFAULT_VERSION = 1;
const DEFAULT_RETRY_LIMIT = 3;

readPayload((payload) => {
  if (payload.tool_name !== "Write" && payload.tool_name !== "Edit") {
    process.exit(0);
  }

  const filePath = payload.tool_input && payload.tool_input.file_path;
  if (!filePath) process.exit(0);

  const normalizedPath = filePath.replace(/\\/g, "/");
  const match = TRIP_ARTIFACT_PATH_REGEX.exec(normalizedPath);
  if (!match) process.exit(0);

  const [, , artifact, versionStr] = match;
  if (!ARTIFACT_NAMES.has(artifact.toLowerCase())) process.exit(0);

  const runDir = path.dirname(filePath);
  const statePath = path.join(runDir, WORKFLOW_STATE_FILENAME);

  // Edit payloads (documentStatus flips) carry no content; read the
  // just-written file from disk instead — it's the authoritative post-edit state.
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
    Number(fields.version) ||
    (versionStr ? Number(versionStr) : DEFAULT_VERSION);

  const ds = documentStatus(fields);
  let status =
    ds === DocumentStatus.APPROVED || ds === DocumentStatus.REJECTED
      ? ds
      : StepStatus.COMPLETED;
  if (artifact === VALIDATION_ARTIFACT) {
    if (VALIDATION_FAIL_REGEX.test(content)) status = StepStatus.FAILED;
    else if (VALIDATION_PASS_REGEX.test(content)) status = StepStatus.PASSED;
  }

  fs.mkdirSync(runDir, { recursive: true });

  // Parallel-stage agents write distinct artifacts at the same time, each
  // triggering this hook; without a lock, concurrent read-modify-write
  // passes on the shared state file would race and drop each other's step.
  withFileLock(path.join(runDir, `${WORKFLOW_STATE_FILENAME}.lock`), () => {
    let state = {
      run: path.basename(runDir),
      steps: {},
      iteration_count: 0,
      retry_limit: DEFAULT_RETRY_LIMIT,
    };
    if (fs.existsSync(statePath)) {
      try {
        state = JSON.parse(fs.readFileSync(statePath, "utf8"));
      } catch {
        // fall through with the fresh default state
      }
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

    fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  });

  process.exit(0);
});
