#!/usr/bin/env node
// PreToolUse (Write|Edit) — SINGLE RESPONSIBILITY: freeze finished documents.
//
// A workflow artifact whose on-disk frontmatter records
// `documentStatus: approved` or `documentStatus: finished` is done and must not
// be modified. Any further change goes into a NEW version (e.g. daily-plan-v2.md
// with `documentStatus: draft`) — never a silent edit of a finished artifact.
//
// The check reads the CURRENT on-disk status, so the write that first flips a
// document to `approved`/`finished` is itself allowed (on disk it is still a
// draft at that moment); only subsequent edits are blocked. Brand-new files and
// the published travel-guide.html (no frontmatter) are naturally exempt.
const path = require('path');
const { readFrontmatter, documentStatus } = require('./lib/frontmatter');

const FROZEN = new Set(['approved', 'finished']);

let input = '';
process.stdin.on('data', (d) => (input += d));
process.stdin.on('end', () => {
  let payload;
  try {
    payload = JSON.parse(input);
  } catch {
    process.exit(0);
  }

  if (payload.tool_name !== 'Write' && payload.tool_name !== 'Edit') process.exit(0);

  const filePath = payload.tool_input && payload.tool_input.file_path;
  if (!filePath) process.exit(0);

  const status = documentStatus(readFrontmatter(filePath));
  if (FROZEN.has(status)) {
    process.stderr.write(
      `Blocked: "${path.basename(filePath)}" is frozen (documentStatus: ${status}). ` +
        'A finished document must not be modified. Create a new version instead ' +
        '(e.g. daily-plan-v2.md) with documentStatus: draft and carry the change forward there.'
    );
    process.exit(2);
  }
  process.exit(0);
});
