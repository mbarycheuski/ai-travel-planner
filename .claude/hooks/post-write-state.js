#!/usr/bin/env node
// PostToolUse hook — SINGLE RESPONSIBILITY: keep trips/<run>/workflow-state.json
// in sync. After any workflow artifact is written under trips/<run>/, record
// its status/version so progress is persisted to disk (not only in
// conversation memory) and a restart can resume from it.
const fs = require('fs');
const path = require('path');
const { parseFrontmatter, documentStatus } = require('./lib/frontmatter');

// Only these track as workflow steps (per CLAUDE.md's agent roster + pipeline
// coordination artifacts). Anything else dropped under trips/<run>/ — stray
// notes, scratch files — is ignored rather than recorded as bogus state.
const TRACKED_ARTIFACTS = new Set([
  'requirements',
  'execution-plan',
  'weather',
  'transport',
  'accommodation',
  'activities',
  'food',
  'packing',
  'budget',
  'validation',
  'daily-plan',
  'iteration-plan',
  'travel-guide',
]);

let input = '';
process.stdin.on('data', (d) => (input += d));
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    // Malformed payload — fail open (allow) rather than block the workflow
    // on a harness bug; state sync just skips this write if unparseable.
    process.exit(0);
  }

  if (payload.tool_name !== 'Write') process.exit(0);

  const filePath = payload.tool_input && payload.tool_input.file_path;
  if (!filePath) process.exit(0);

  const norm = filePath.replace(/\\/g, '/');
  const m = norm.match(/trips\/([^/]+)\/([a-z]+(?:-[a-z]+)*)(?:-v(\d+))?\.(md|html)$/i);
  if (!m) process.exit(0);

  const [, , artifact, versionStr] = m;
  if (!TRACKED_ARTIFACTS.has(artifact.toLowerCase())) process.exit(0);

  const runDir = path.dirname(filePath);
  const statePath = path.join(runDir, 'workflow-state.json');

  let state = { run: path.basename(runDir), steps: {}, iteration_count: 0, retry_limit: 3 };
  if (fs.existsSync(statePath)) {
    try {
      state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
    } catch {
      // corrupt/partial state file — start fresh rather than block the workflow
    }
  }

  const content = (payload.tool_input && payload.tool_input.content) || '';
  const fields = parseFrontmatter(content);
  // Prefer the artifact's own frontmatter version; fall back to the -vN suffix.
  const version = Number(fields.version) || (versionStr ? Number(versionStr) : 1);

  // Lifecycle status comes from the daily plan's documentStatus frontmatter
  // ("approved"/"rejected"); every other artifact has no documentStatus, so it
  // (and a "draft" daily plan) is recorded as "completed" for resume.
  const ds = documentStatus(fields);
  let status = ds === 'approved' || ds === 'rejected' ? ds : 'completed';
  if (artifact === 'validation') {
    if (/Validation Result:\s*FAIL/i.test(content)) status = 'failed';
    else if (/Validation Result:\s*PASS/i.test(content)) status = 'passed';
  }

  state.steps = state.steps || {};
  const prior = state.steps[artifact];
  if (!prior || version >= (prior.version || 0)) {
    state.steps[artifact] = { status, artifact: path.basename(filePath), version };
  }
  state.updated_at = new Date().toISOString();

  fs.mkdirSync(runDir, { recursive: true });
  fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
  process.exit(0);
});
