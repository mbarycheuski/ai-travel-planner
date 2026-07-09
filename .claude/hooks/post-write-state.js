#!/usr/bin/env node
// PostToolUse hook: after any workflow artifact is written under trips/<run>/,
// updates trips/<run>/workflow-state.json so progress is persisted to disk
// (not only in conversation memory) and a restart can resume from it.
const fs = require('fs');
const path = require('path');

let input = '';
process.stdin.on('data', (d) => (input += d));
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  if (payload.tool_name !== 'Write') process.exit(0);

  const filePath = payload.tool_input && payload.tool_input.file_path;
  if (!filePath) process.exit(0);

  const norm = filePath.replace(/\\/g, '/');
  const m = norm.match(/trips\/([^/]+)\/([a-z0-9]+(?:-[a-z0-9]+)*?)(?:-v(\d+))?\.(md|html)$/i);
  if (!m) process.exit(0);

  const [, , artifact, versionStr] = m;
  if (artifact === 'workflow-state') process.exit(0);

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

  const version = versionStr ? Number(versionStr) : 1;
  const content = (payload.tool_input && payload.tool_input.content) || '';
  let status = 'completed';
  if (artifact === 'validation') {
    if (/Validation Result:\s*FAIL/i.test(content)) status = 'failed';
    else if (/Validation Result:\s*PASS/i.test(content)) status = 'passed';
  } else if (artifact === 'approval') {
    if (/status:\s*APPROVED/i.test(content)) status = 'approved';
    else if (/CHANGES_REQUESTED/i.test(content)) status = 'changes_requested';
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
