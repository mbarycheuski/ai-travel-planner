#!/usr/bin/env node
// PreToolUse (Write) — SINGLE RESPONSIBILITY: the human-approval gate.
//
// travel-guide.html may be written only after the traveler has approved the
// plan. Approval is recorded as `documentStatus: approved` in the frontmatter
// of the LATEST daily-plan artifact in the same run directory (daily-plan.md,
// or daily-plan-vN.md after a CHANGES_REQUESTED loop). This is the
// deterministic enforcement point — it does not trust the orchestrator to
// remember to check.
const fs = require('fs');
const path = require('path');
const { readFrontmatter, documentStatus } = require('./lib/frontmatter');

function latestDailyPlanStatus(dir) {
  let best = 0;
  let status = null;
  let name = null;
  let entries;
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return { status, name };
  }
  for (const f of entries) {
    const m = /^daily-plan(?:-v(\d+))?\.md$/i.exec(f);
    if (!m) continue;
    const v = m[1] ? Number(m[1]) : 1;
    if (v >= best) {
      best = v;
      name = f;
      status = documentStatus(readFrontmatter(path.join(dir, f)));
    }
  }
  return { status, name };
}

let input = '';
process.stdin.on('data', (d) => (input += d));
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    // Malformed payload — fail open (allow) rather than block the workflow
    // on a harness bug; this gate only needs to catch real violations.
    process.exit(0);
  }

  // Assumes html-builder only ever Writes travel-guide.html once (per
  // CLAUDE.md); if that ever becomes an in-place Edit, this gate needs
  // Edit coverage too or it would be silently bypassed.
  if (payload.tool_name !== 'Write') process.exit(0);

  const filePath = payload.tool_input && payload.tool_input.file_path;
  if (!filePath) process.exit(0);
  if (!/^travel-guide\.html$/i.test(path.basename(filePath))) process.exit(0);

  const { status, name } = latestDailyPlanStatus(path.dirname(filePath));
  if (status !== 'approved') {
    process.stderr.write(
      `Blocked: cannot write "travel-guide.html" — publishing requires a deterministic ` +
        `human-approval gate. The latest daily plan (${name || 'daily-plan.md'}) ` +
        `${status ? `records documentStatus: ${status}` : 'has no documentStatus'}, not "approved". ` +
        'Record traveler approval by setting documentStatus: approved on the daily plan first.'
    );
    process.exit(2);
  }
  process.exit(0);
});
